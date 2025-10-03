import React, { useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { ArrowUpIcon } from '../components/icons/ArrowUpIcon';
import { ArrowDownIcon } from '../components/icons/ArrowDownIcon';
import { TrendingUpIcon } from '../components/icons/TrendingUpIcon';
import { ShoppingBagIcon } from '../components/icons/ShoppingBagIcon';
import { RestaurantIcon } from '../components/icons/RestaurantIcon';
import { TransportIcon } from '../components/icons/TransportIcon';
import { formatRelativeTime } from '../utils/timeFormatter';

const formatCurrency = (value: number, decimals = 2) => {
    // Figma uses USD formatting, so we'll match it.
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
};

const getCategoryIcon = (category: string) => {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('alimentación') || lowerCategory.includes('restaurante') || lowerCategory.includes('comestibles')) {
        return <RestaurantIcon className="w-6 h-6 text-gray-300" />;
    }
    if (lowerCategory.includes('transporte')) {
        return <TransportIcon className="w-6 h-6 text-gray-300" />;
    }
    if (lowerCategory.includes('compras')) {
        return <ShoppingBagIcon className="w-6 h-6 text-gray-300" />;
    }
    // Default Icon
    return <ShoppingBagIcon className="w-6 h-6 text-gray-300" />;
};


const TransactionRow: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
    const isIncome = transaction.tipo === TransactionType.Ingreso;
    
    return (
        <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                    {getCategoryIcon(transaction.categoria)}
                </div>
                <div>
                    <p className="font-semibold text-white">{transaction.entidad}</p>
                    <p className="text-sm text-gray-400">{transaction.categoria}</p>
                </div>
            </div>
            <div className="text-right">
                 <p className={`font-semibold text-base ${isIncome ? 'text-green-400' : 'text-white'}`}>
                    {isIncome ? '+' : ''}{formatCurrency(transaction.monto, 2)}
                </p>
                <p className="text-xs text-gray-400">{formatRelativeTime(transaction.fecha)}</p>
            </div>
        </div>
    );
};


const HomeScreen: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
    const { totalBalance, monthlyIncome, monthlyExpenses, savingsProgress, savingsGoal } = useMemo(() => {
        const now = new Date();
        const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        let monthlyIncome = 0;
        let monthlyExpenses = 0;
        let totalBalance = 0;

        transactions.forEach(tx => {
            const isCurrentMonth = tx.fecha.startsWith(currentMonthStr);
            if (tx.tipo === TransactionType.Ingreso) {
                totalBalance += tx.monto;
                if (isCurrentMonth) monthlyIncome += tx.monto;
            } else {
                totalBalance -= tx.monto;
                if (isCurrentMonth) monthlyExpenses += tx.monto;
            }
        });

        // Mock data from Figma design
        const savingsGoal = 5000;
        const savingsProgress = 2400;

        return { totalBalance, monthlyIncome, monthlyExpenses, savingsProgress, savingsGoal };
    }, [transactions]);

    const savingsPercentage = savingsGoal > 0 ? (savingsProgress / savingsGoal) * 100 : 0;
    const recentTransactions = transactions.slice(0, 3);
    
    return (
        <div className="p-4 space-y-6">
            <header className="text-left pt-4">
                <p className="text-sm text-gray-400">Saldo Total</p>
                <div className="flex items-center gap-2">
                    <p className="text-4xl font-bold text-white">{formatCurrency(totalBalance, 2)}</p>
                    <div className="flex items-center text-sm text-green-400">
                        <TrendingUpIcon className="w-4 h-4"/>
                        <span>+2.5%</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 p-4 rounded-xl flex items-start gap-2">
                    <div className="p-1.5 bg-green-500/10 rounded-full"><ArrowUpIcon className="w-4 h-4 text-green-400" /></div>
                    <div>
                        <p className="text-sm text-gray-400">Ingresos Mensuales</p>
                        <p className="font-bold text-lg text-white">{formatCurrency(monthlyIncome)}</p>
                    </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl flex items-start gap-2">
                    <div className="p-1.5 bg-red-500/10 rounded-full"><ArrowDownIcon className="w-4 h-4 text-red-400" /></div>
                    <div>
                        <p className="text-sm text-gray-400">Gastos Mensuales</p>
                        <p className="font-bold text-lg text-white">{formatCurrency(monthlyExpenses)}</p>
                    </div>
                </div>
            </div>

            <div>
                <div className="bg-gray-800 p-4 rounded-xl">
                     <h3 className="font-semibold text-white mb-2 text-base">Progreso Meta de Ahorro</h3>
                    <div className="flex justify-between items-baseline mb-1">
                        <p className="text-lg font-bold text-white">{formatCurrency(savingsProgress)}</p>
                        <p className="text-sm text-gray-400">/ {formatCurrency(savingsGoal)}</p>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div className="bg-cyan-400 h-2.5 rounded-full" style={{ width: `${Math.min(savingsPercentage, 100)}%` }}></div>
                    </div>
                     <p className="text-xs text-left mt-1 text-gray-400">{savingsPercentage.toFixed(0)}% completado • Faltan {formatCurrency(Math.max(0, savingsGoal-savingsProgress))}</p>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-white text-lg">Transacciones Recientes</h3>
                    <button className="text-sm text-cyan-400 font-semibold">Ver Todas</button>
                </div>
                <div className="bg-gray-800 px-4 rounded-xl">
                    {recentTransactions.length > 0 ? (
                        recentTransactions.map((tx, index) => (
                            <div key={tx.id} className={index !== recentTransactions.length - 1 ? "border-b border-gray-700" : ""}>
                                <TransactionRow transaction={tx} />
                            </div>
                        ))
                    ) : (
                        <p className="text-center py-8 text-gray-500">No hay transacciones todavía.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomeScreen;