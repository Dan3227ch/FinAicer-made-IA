import { Transaction, TransactionType, Budgets } from '../types';

export const generateSmartBudget = (transactions: Transaction[]): Budgets => {
    if (transactions.length === 0) {
        return {};
    }

    // A simple heuristic: find average monthly income
    const incomeByMonth: Record<string, number> = {};
    transactions.forEach(tx => {
        if (tx.tipo === TransactionType.Ingreso) {
            const month = tx.fecha.substring(0, 7); // YYYY-MM
            incomeByMonth[month] = (incomeByMonth[month] || 0) + tx.monto;
        }
    });

    const monthsOfIncome = Object.keys(incomeByMonth).length;
    const totalIncome = Object.values(incomeByMonth).reduce((sum, monthlyIncome) => sum + monthlyIncome, 0);
    const averageMonthlyIncome = monthsOfIncome > 0 ? totalIncome / monthsOfIncome : 2000000; // Default if no income

    // Target 80% of income for spending (20% savings rule)
    const totalBudgetable = averageMonthlyIncome * 0.8;

    // Distribute budget based on historical spending patterns
    const expensesByCategory: Record<string, number> = {};
    let totalHistoricalExpenses = 0;
    transactions.forEach(tx => {
        if (tx.tipo === TransactionType.Gasto || tx.tipo === TransactionType.Retiro) {
            expensesByCategory[tx.categoria] = (expensesByCategory[tx.categoria] || 0) + tx.monto;
            totalHistoricalExpenses += tx.monto;
        }
    });

    const smartBudget: Budgets = {};
    if (totalHistoricalExpenses === 0) {
        // If no expenses, just create a few default categories
        smartBudget['Alimentación'] = totalBudgetable * 0.3;
        smartBudget['Transporte'] = totalBudgetable * 0.2;
        smartBudget['Servicios'] = totalBudgetable * 0.2;
        smartBudget['Compras'] = totalBudgetable * 0.3;
        return smartBudget;
    }

    for (const category in expensesByCategory) {
        const categoryPercentage = expensesByCategory[category] / totalHistoricalExpenses;
        const budgetAmount = Math.round((totalBudgetable * categoryPercentage) / 1000) * 1000; // Round to nearest 1000
        smartBudget[category] = budgetAmount;
    }

    return smartBudget;
};
