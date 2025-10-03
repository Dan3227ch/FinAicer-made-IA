import React, { useState } from 'react';
import { Alert, Transaction } from '../types';
import { BellIcon } from '../components/icons/BellIcon';
import { FileWarningIcon } from '../components/icons/FileWarningIcon';
import { WarningIcon } from '../components/icons/WarningIcon';
import TransactionModal from '../components/TransactionModal';
import { PlusIcon } from '../components/icons/PlusIcon';
import { formatRelativeTime } from '../utils/timeFormatter';

const AlertCard: React.FC<{ alert: Alert }> = ({ alert }) => {
    const Icon = alert.alertType === 'budget' ? FileWarningIcon : WarningIcon;
    const colorClass = alert.severity === 'Alto' ? 'border-red-500/50' : 'border-yellow-500/50';
    const iconColor = alert.severity === 'Alto' ? 'text-red-400' : 'text-yellow-400';
    
    return (
        <div className={`bg-gray-800 p-4 rounded-xl border-l-4 ${colorClass} flex gap-4`}>
            <Icon className={`w-8 h-8 flex-shrink-0 mt-1 ${iconColor}`} />
            <div>
                <p className="font-semibold text-white">{alert.message}</p>
                <p className="text-xs text-gray-400">{formatRelativeTime(alert.timestamp)}</p>
            </div>
        </div>
    );
};

const ToggleSwitch: React.FC<{ label: string; enabled: boolean; }> = ({ label, enabled }) => (
    <div className="flex justify-between items-center">
        <p className="text-gray-300">{label}</p>
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" value="" className="sr-only peer" checked={enabled} readOnly />
            <div className={`w-11 h-6 bg-gray-600 rounded-full peer ${enabled ? 'peer-checked:after:translate-x-full peer-checked:after:border-white' : ''} after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${enabled ? 'peer-checked:bg-green-500' : ''}`}></div>
        </label>
    </div>
);


const SmsScreen: React.FC<{ alerts: Alert[], onClassifySms: (sms: string) => Promise<Transaction | null> }> = ({ alerts, onClassifySms }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    return (
        <div className="p-4 space-y-6 relative h-full">
            <header className="text-center pt-4 mb-4">
                <h1 className="text-2xl font-bold text-white">Asistente Financiero SMS</h1>
            </header>

            <div className="bg-gray-800 p-4 rounded-xl space-y-4">
                <ToggleSwitch label="Alertas de gastos diarios" enabled={true} />
                <ToggleSwitch label="Actualizaciones semanales" enabled={true} />
                <ToggleSwitch label="Recordatorios de pagos" enabled={false} />
            </div>

            <div>
                <h3 className="font-semibold text-white mb-2">Mensajes y Alertas Recientes</h3>
                <div className="space-y-3">
                    {alerts.length > 0 ? (
                        alerts.map(alert => <AlertCard key={alert.id} alert={alert} />)
                    ) : (
                        <div className="bg-gray-800 p-8 rounded-xl text-center text-gray-500">
                           <BellIcon className="w-12 h-12 mx-auto mb-2" />
                           <p>No hay alertas recientes.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="text-center mt-6">
                 <button className="w-full max-w-xs px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition">
                    Configurar Ajustes SMS
                </button>
            </div>
            
             <button 
                onClick={() => setIsModalOpen(true)}
                className="absolute bottom-24 right-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full p-4 shadow-lg transition transform hover:scale-110"
                aria-label="Agregar Transacción Manualmente"
            >
                <PlusIcon className="w-6 h-6" />
            </button>
            
            <TransactionModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onClassify={onClassifySms}
            />
        </div>
    );
};

export default SmsScreen;