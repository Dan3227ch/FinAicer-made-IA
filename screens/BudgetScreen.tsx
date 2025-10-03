import React, { useState, useMemo, useEffect } from 'react';
import { Transaction, TransactionType, Budgets } from '../types';

interface BudgetScreenProps {
    transactions: Transaction[];
    budgets: Budgets | null;
    smartSuggestion: Budgets | null;
    onGenerateBudget: () => void;
    onUpdateBudgets: (newBudgets: Budgets) => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

const BudgetCategory: React.FC<{
    category: string;
    spent: number;
    goal: number;
    color: string;
}> = ({ category, spent, goal, color }) => {
    const progress = goal > 0 ? (spent / goal) * 100 : 0;
    const remaining = goal - spent;
    let progressBarColor = color;
    if (progress > 100) progressBarColor = '#f87171'; // red-400

    return (
        <div className="bg-gray-800 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-white">{category}</span>
                <span className="text-sm text-gray-300">{formatCurrency(spent)} / {formatCurrency(goal)}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="h-2 rounded-full" style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: progressBarColor }}></div>
            </div>
            <p className="text-xs text-left mt-1 text-gray-400">
                {progress > 100 ? `Excedido por ${formatCurrency(Math.abs(remaining))}` : `${formatCurrency(remaining)} restantes`}
            </p>
        </div>
    );
};


const BudgetScreen: React.FC<BudgetScreenProps> = ({ transactions, budgets, onGenerateBudget, onUpdateBudgets }) => {
    
    const { totalSpent, totalBudget, overallProgress } = useMemo(() => {
        if (!budgets) return { totalSpent: 0, totalBudget: 0, overallProgress: 0 };
        
        const totalBudget = Object.values(budgets).reduce((sum, goal) => sum + goal, 0);
        
        const currentMonth = new Date().toISOString().slice(0, 7);
        const totalSpent = transactions
            .filter(tx => (tx.tipo === TransactionType.Gasto || tx.tipo === TransactionType.Retiro) && budgets[tx.categoria] && tx.fecha.startsWith(currentMonth))
            .reduce((sum, tx) => sum + tx.monto, 0);
            
        const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

        return { totalSpent, totalBudget, overallProgress };
    }, [transactions, budgets]);

    const spentByCategory = useMemo(() => {
        const currentMonth = new Date().toISOString().slice(0, 7);
        return transactions
            .filter(tx => (tx.tipo === TransactionType.Gasto || tx.tipo === TransactionType.Retiro) && tx.fecha.startsWith(currentMonth))
            .reduce((acc, tx) => {
                acc[tx.categoria] = (acc[tx.categoria] || 0) + tx.monto;
                return acc;
            }, {} as Record<string, number>);
    }, [transactions]);
    
    const COLORS = ['#60a5fa', '#34d399', '#f87171', '#fbbf24', '#a78bfa'];

    if (!budgets) {
        return (
             <div className="p-4 text-center mt-20">
                <h1 className="text-2xl font-bold text-white mb-4">Seguimiento Presupuesto</h1>
                <div className="bg-gray-800 p-6 rounded-2xl text-center">
                    <p className="text-gray-400 mb-4">Genera un presupuesto inteligente para empezar a hacer seguimiento.</p>
                    <button
                        onClick={onGenerateBudget}
                        disabled={transactions.filter(t => t.tipo === TransactionType.Ingreso).length === 0}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {transactions.filter(t => t.tipo === TransactionType.Ingreso).length === 0 ? "Agrega un ingreso primero" : "Generar Presupuesto"}
                    </button>
                </div>
             </div>
        );
    }

    return (
        <div className="p-4 space-y-6">
            <header className="flex justify-between items-center pt-4">
                <h1 className="text-2xl font-bold text-white">Seguimiento Presupuesto</h1>
                <button className="px-3 py-2 text-sm bg-gray-700 rounded-lg font-semibold">+ Agregar Categoria</button>
            </header>

            <div className="bg-gray-800 p-4 rounded-xl">
                 <p className="text-sm text-gray-400 mb-1">Resumen de Este Mes</p>
                 <div className="flex justify-between items-baseline mb-2">
                    <span className="text-2xl font-bold text-white">{formatCurrency(totalSpent)}</span>
                    <span className="text-gray-400">/ {formatCurrency(totalBudget)}</span>
                 </div>
                 <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div className="bg-cyan-400 h-2.5 rounded-full" style={{ width: `${Math.min(overallProgress, 100)}%` }}></div>
                </div>
                <p className="text-xs text-gray-400 mt-1">{overallProgress.toFixed(1)}% del presupuesto usado • {formatCurrency(totalBudget - totalSpent)} restantes</p>
            </div>

            <div className="space-y-4">
                {Object.entries(budgets).sort(([catA], [catB]) => catA.localeCompare(catB)).map(([category, goal], index) => (
                    <BudgetCategory
                        key={category}
                        category={category}
                        spent={spentByCategory[category] || 0}
                        goal={goal}
                        color={COLORS[index % COLORS.length]}
                    />
                ))}
            </div>
        </div>
    );
};

export default BudgetScreen;