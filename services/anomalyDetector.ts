import { Transaction, Budgets, Alert, AlertSeverity, TransactionType } from '../types';

const DUPLICATE_THRESHOLD_MINUTES = 5;
const UNUSUAL_HOUR_START = 1; // 1 AM
const UNUSUAL_HOUR_END = 5; // 5 AM

const HIGH_SPENDING_MULTIPLIER = 3; // 300% of average
const VERY_HIGH_SPENDING_MULTIPLIER = 5; // 500% of average

function detectHighSpending(transaction: Transaction, history: Transaction[]): Alert | null {
    if (transaction.tipo !== TransactionType.Gasto && transaction.tipo !== TransactionType.Retiro) {
        return null;
    }

    const categoryHistory = history.filter(
        tx => tx.categoria === transaction.categoria && (tx.tipo === TransactionType.Gasto || tx.tipo === TransactionType.Retiro)
    );

    if (categoryHistory.length < 3) {
        return null; // Not enough data for a meaningful average
    }

    const total = categoryHistory.reduce((sum, tx) => sum + tx.monto, 0);
    const average = total / categoryHistory.length;

    if (transaction.monto > average * VERY_HIGH_SPENDING_MULTIPLIER) {
        return {
            id: `alert_${Date.now()}_high_spending`,
            timestamp: new Date().toISOString(),
            transactionId: transaction.id,
            message: `Alerta crítica: Gasto de ${transaction.monto.toLocaleString()} en ${transaction.entidad} es 500% superior al promedio en esta categoría.`,
            severity: 'Alto',
            alertType: 'anomaly'
        };
    }
    
    if (transaction.monto > average * HIGH_SPENDING_MULTIPLIER) {
        return {
            id: `alert_${Date.now()}_high_spending`,
            timestamp: new Date().toISOString(),
            transactionId: transaction.id,
            message: `Gasto inusual de ${transaction.monto.toLocaleString()} en ${transaction.entidad}, muy por encima de tu promedio para '${transaction.categoria}'.`,
            severity: 'Medio',
            alertType: 'anomaly'
        };
    }

    return null;
}


function detectDuplicate(transaction: Transaction, history: Transaction[]): Alert | null {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - DUPLICATE_THRESHOLD_MINUTES * 60 * 1000);

    const recentSimilar = history.find(tx => 
        tx.id !== transaction.id &&
        tx.monto === transaction.monto &&
        tx.entidad === transaction.entidad &&
        new Date(tx.fecha) >= fiveMinutesAgo // Assuming tx.fecha can be parsed
    );

    if (recentSimilar) {
        return {
            id: `alert_${Date.now()}_duplicate`,
            timestamp: new Date().toISOString(),
            transactionId: transaction.id,
            message: `Alerta crítica: Transacción duplicada detectada por ${transaction.monto.toLocaleString()} en ${transaction.entidad}.`,
            severity: 'Alto',
            alertType: 'anomaly'
        };
    }

    return null;
}

function detectUnusualHour(transaction: Transaction): Alert | null {
     if (transaction.tipo !== TransactionType.Gasto && transaction.tipo !== TransactionType.Retiro) {
        return null;
    }

    const transactionHour = new Date().getHours(); // Use current hour for simplicity in this demo
    
    if (transactionHour >= UNUSUAL_HOUR_START && transactionHour <= UNUSUAL_HOUR_END && transaction.monto > 50000) {
        return {
            id: `alert_${Date.now()}_unusual_hour`,
            timestamp: new Date().toISOString(),
            transactionId: transaction.id,
            message: `Alerta: Transacción de ${transaction.monto.toLocaleString()} realizada en un horario inusual (${transactionHour}:00).`,
            severity: 'Medio',
            alertType: 'anomaly'
        };
    }

    return null;
}

export function detectBudgetAnomalies(transaction: Transaction, budgets: Budgets | null, spentByCategory: Record<string, number>): Alert[] {
    const alerts: Alert[] = [];
    if (!budgets || (transaction.tipo !== TransactionType.Gasto && transaction.tipo !== TransactionType.Retiro)) {
        return alerts;
    }

    const budgetForCategory = budgets[transaction.categoria];
    const spent = (spentByCategory[transaction.categoria] || 0) + transaction.monto;

    if (budgetForCategory) {
        const usage = (spent / budgetForCategory) * 100;
        
        // Check if the previous state was already over 80/100 to avoid repeated alerts
        const previouslySpent = spent - transaction.monto;
        const previousUsage = (previouslySpent / budgetForCategory) * 100;

        if (usage >= 100 && previousUsage < 100) {
            alerts.push({
                id: `alert_${Date.now()}_budget_over`,
                timestamp: new Date().toISOString(),
                transactionId: transaction.id,
                message: `Límite excedido: Has superado el 100% de tu presupuesto para '${transaction.categoria}'.`,
                severity: 'Alto',
                alertType: 'budget'
            });
        } else if (usage >= 80 && previousUsage < 80) {
            alerts.push({
                id: `alert_${Date.now()}_budget_warning`,
                timestamp: new Date().toISOString(),
                transactionId: transaction.id,
                message: `Alerta de presupuesto: Has gastado más del 80% de tu límite para '${transaction.categoria}'.`,
                severity: 'Medio',
                alertType: 'budget'
            });
        }
    }
    return alerts;
}


export const detectAnomalies = (transaction: Transaction, history: Transaction[], budgets: Budgets | null): Alert[] => {
    const alerts: (Alert | null)[] = [];
    
    // Transactional Anomalies
    alerts.push(detectHighSpending(transaction, history));
    alerts.push(detectDuplicate(transaction, history));
    alerts.push(detectUnusualHour(transaction));

    // Budget Anomalies
    if (budgets) {
        const spentByCategory = history
            .filter(tx => tx.tipo === TransactionType.Gasto || tx.tipo === TransactionType.Retiro)
            .reduce((acc, tx) => {
                acc[tx.categoria] = (acc[tx.categoria] || 0) + tx.monto;
                return acc;
            }, {} as Record<string, number>);
        
        const budgetAlerts = detectBudgetAnomalies(transaction, budgets, spentByCategory);
        alerts.push(...budgetAlerts);
    }
    
    return alerts.filter((alert): alert is Alert => alert !== null);
};
