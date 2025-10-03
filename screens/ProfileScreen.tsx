import React, { useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { EditIcon } from '../components/icons/EditIcon';
import { CheckBadgeIcon } from '../components/icons/CheckBadgeIcon';
import { SettingsIcon } from '../components/icons/SettingsIcon';
import { LanguageIcon } from '../components/icons/LanguageIcon';
import { ThemeIcon } from '../components/icons/ThemeIcon';
import { CurrencyIcon } from '../components/icons/CurrencyIcon';
import { ChevronDownIcon } from '../components/icons/ChevronDownIcon';


const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
};

const ProfileScreen: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
    
    const stats = useMemo(() => {
        const totalSaved = transactions.reduce((acc, tx) => {
            if (tx.tipo === TransactionType.Ingreso) return acc + tx.monto;
            if (tx.tipo === TransactionType.Gasto || tx.tipo === TransactionType.Retiro) return acc - tx.monto;
            return acc;
        }, 0);

        const categories = new Set(transactions.map(tx => tx.categoria)).size;
        
        const firstDate = transactions.length > 0 ? new Date(transactions[transactions.length - 1].fecha) : new Date();
        const daysActive = Math.ceil((new Date().getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));

        return {
            totalSaved,
            monthlyGoal: 72, // Mock data
            categories,
            daysActive: transactions.length > 0 ? daysActive : 0
        };
    }, [transactions]);

    return (
        <div className="p-4 space-y-6">
            <header className="flex justify-between items-center pt-4">
                <div className="w-6"></div>
                <h1 className="text-xl font-bold text-white flex-1 text-center">FinAicer</h1>
                <div className="w-6 text-right">
                    <button><BellIcon className="w-6 h-6"/></button>
                </div>
            </header>

            {/* User Info */}
            <div className="bg-gray-800 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-2xl font-bold">MG</div>
                    <div>
                        <p className="font-bold text-lg text-white">Maria González</p>
                        <p className="text-sm text-gray-400">maria.gonzalez@email.com</p>
                         <p className="text-xs text-yellow-400 mt-1 font-semibold">Usuario Premium</p>
                    </div>
                </div>
                <button className="flex items-center gap-2 text-sm bg-gray-700 px-3 py-1.5 rounded-lg"><EditIcon className="w-4 h-4" /> Editar</button>
            </div>
            
            {/* Stats */}
            <div>
                 <h2 className="font-semibold text-white mb-2 text-lg">Tus Estadísticas</h2>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800 p-4 rounded-xl text-center">
                        <p className="text-2xl font-bold text-green-400">{formatCurrency(stats.totalSaved)}</p>
                        <p className="text-sm text-gray-400">Total Ahorrado</p>
                    </div>
                     <div className="bg-gray-800 p-4 rounded-xl text-center">
                        <p className="text-2xl font-bold text-blue-400">{stats.monthlyGoal}%</p>
                        <p className="text-sm text-gray-400">Meta Mensual</p>
                    </div>
                     <div className="bg-gray-800 p-4 rounded-xl text-center">
                        <p className="text-2xl font-bold text-purple-400">{stats.categories}</p>
                        <p className="text-sm text-gray-400">Categorías</p>
                    </div>
                     <div className="bg-gray-800 p-4 rounded-xl text-center">
                        <p className="text-2xl font-bold text-gray-300">{stats.daysActive}</p>
                        <p className="text-sm text-gray-400">Días Activo</p>
                    </div>
                 </div>
            </div>

            {/* Achievements */}
            <div>
                <h2 className="font-semibold text-white mb-2 text-lg">Logros Recientes</h2>
                <div className="bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/30">
                    <ul className="space-y-2 text-sm text-yellow-200 list-disc list-inside">
                        <li>Meta de ahorro alcanzada 3 meses consecutivos</li>
                        <li>12 tips de ahorro implementados</li>
                        <li>89% precisión en presupuestos</li>
                    </ul>
                </div>
            </div>

            {/* Settings */}
             <div>
                <h2 className="font-semibold text-white mb-2 text-lg flex items-center gap-2"><SettingsIcon /> Configuración de la App</h2>
                <div className="bg-gray-800 p-4 rounded-xl space-y-1">
                    <div className="flex justify-between items-center py-2">
                        <div className="flex items-center gap-3">
                           <ThemeIcon className="w-5 h-5 text-gray-400"/>
                           <p className="text-white">Tema</p>
                        </div>
                        <button className="bg-gray-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">Sistema <ChevronDownIcon className="w-4 h-4" /></button>
                    </div>
                     <div className="flex justify-between items-center py-2">
                        <div className="flex items-center gap-3">
                            <LanguageIcon className="w-5 h-5 text-gray-400"/>
                            <p className="text-white">Idioma</p>
                        </div>
                        <button className="bg-gray-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">Español <ChevronDownIcon className="w-4 h-4" /></button>
                    </div>
                      <div className="flex justify-between items-center py-2">
                        <div className="flex items-center gap-3">
                            <CurrencyIcon className="w-5 h-5 text-gray-400" />
                            <p className="text-white">Moneda</p>
                        </div>
                        <button className="bg-gray-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">USD <ChevronDownIcon className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>

        </div>
    );
};

const BellIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
);


export default ProfileScreen;