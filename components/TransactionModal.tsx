import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onClassify: (sms: string) => Promise<Transaction | null>;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onClassify }) => {
    const [smsText, setSmsText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<Transaction | null>(null);

    const handleClassify = async () => {
        if (!smsText.trim()) {
            setError("Por favor, ingresa un mensaje SMS para clasificar.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult(null);

        const classificationResult = await onClassify(smsText);
        setIsLoading(false);

        if (classificationResult) {
            setResult(classificationResult);
        } else {
            setError("No se pudo clasificar el SMS. Inténtalo de nuevo.");
        }
    };
    
    const resetAndClose = () => {
        setSmsText('');
        setResult(null);
        setError(null);
        setIsLoading(false);
        onClose();
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Agregar Transacción Manual</h2>
                    <button onClick={resetAndClose} className="text-gray-400 text-2xl">&times;</button>
                </div>
                
                {!result ? (
                    <>
                        <p className="text-gray-400 mb-4 text-sm">
                            Pega el mensaje SMS de tu banco para que la IA lo clasifique automáticamente.
                        </p>
                        <textarea
                            value={smsText}
                            onChange={(e) => setSmsText(e.target.value)}
                            placeholder="Ej: Compra aprobada por $55.000 en Starbucks..."
                            className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 transition-shadow duration-200 resize-none"
                            rows={5}
                        />
                        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                        <button
                            onClick={handleClassify}
                            disabled={isLoading}
                            className="w-full mt-4 py-3 px-6 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? 'Clasificando...' : 'Clasificar Mensaje'}
                        </button>
                    </>
                ) : (
                    <div>
                        <p className="text-center text-green-400 font-semibold mb-4">¡Transacción clasificada y agregada!</p>
                         <div className="bg-gray-900 p-4 rounded-lg space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-400">Entidad:</span> <span className="font-semibold">{result.entidad}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Monto:</span> <span className="font-semibold">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(result.monto)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Tipo:</span> <span className="font-semibold">{result.tipo}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Categoría:</span> <span className="font-semibold">{result.categoria}</span></div>
                         </div>
                         <button
                            onClick={resetAndClose}
                            className="w-full mt-4 py-3 px-6 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all"
                        >
                           Cerrar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionModal;
