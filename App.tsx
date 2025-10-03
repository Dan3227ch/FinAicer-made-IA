import React, { useState } from 'react';
import { Transaction, Budgets, ChatMessage, Alert } from './types';
import { classifySms } from './services/geminiService';
import { getChatResponse } from './services/chatService';
import { generateSmartBudget } from './services/budgetService';
import { detectAnomalies } from './services/anomalyDetector';
import BottomNav from './components/BottomNav';
import HomeScreen from './screens/HomeScreen';
import BudgetScreen from './screens/BudgetScreen';
import ChatScreen from './screens/ChatScreen';
import SmsScreen from './screens/SmsScreen';
import ProfileScreen from './screens/ProfileScreen';

export type Screen = 'inicio' | 'presupuesto' | 'chat' | 'sms' | 'perfil';

const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<Screen>('inicio');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customBudgets, setCustomBudgets] = useState<Budgets | null>(null);
  const [smartBudgetSuggestion, setSmartBudgetSuggestion] = useState<Budgets | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 'init', sender: 'ai', text: '¡Hola! Soy tu asesor financiero IA. Te puedo ayudar con presupuestos, estrategias de ahorro y análisis de gastos. ¿Qué te gustaría saber?' }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleClassify = async (smsText: string): Promise<Transaction | null> => {
    try {
      const classification = await classifySms(smsText);
      const newTransaction: Transaction = {
        ...classification,
        id: `tx_${Date.now()}_${Math.random()}`,
        rawSms: smsText,
      };
      
      const newAlerts = detectAnomalies(newTransaction, transactions, customBudgets);

      setTransactions(prev => [newTransaction, ...prev]);
      if(newAlerts.length > 0) {
        setAlerts(prev => [...newAlerts, ...prev]);
      }
      return newTransaction;
    } catch (err) {
      console.error(err);
      // Optionally, create an error alert
      setAlerts(prev => [{
        id: `alert_${Date.now()}`,
        severity: 'Alto',
        message: 'Error al clasificar el último SMS.',
        transactionId: '',
        timestamp: new Date().toISOString(),
        alertType: 'anomaly'
      }, ...prev]);
      return null;
    }
  };

  const handleGenerateBudget = () => {
    const generated = generateSmartBudget(transactions);
    setSmartBudgetSuggestion(generated);
    setCustomBudgets(generated);
  };

  const handleUpdateBudgets = (updatedBudgets: Budgets) => {
    setCustomBudgets(updatedBudgets);
  };
  
  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isChatLoading) return;

    const userMessage: ChatMessage = { id: `msg_${Date.now()}`, sender: 'user', text: message };
    setChatMessages(prev => [...prev, userMessage]);
    setIsChatLoading(true);

    const loadingMessageId = `msg_${Date.now()}_loading`;
    setChatMessages(prev => [...prev, { id: loadingMessageId, sender: 'ai', text: '', isLoading: true }]);

    try {
      const context = { transactions, budgets: customBudgets, alerts };
      const aiResponse = await getChatResponse(message, chatMessages.slice(-5), context);
      const aiMessage: ChatMessage = { id: `msg_${Date.now()}_ai`, sender: 'ai', ...aiResponse };
      setChatMessages(prev => prev.filter(m => m.id !== loadingMessageId).concat(aiMessage));
    } catch (err) {
      console.error("Chat error:", err);
      const errorMessage: ChatMessage = { id: `msg_${Date.now()}_err`, sender: 'ai', text: "Lo siento, tuve un problema al procesar tu solicitud." };
      setChatMessages(prev => prev.filter(m => m.id !== loadingMessageId).concat(errorMessage));
    } finally {
      setIsChatLoading(false);
    }
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'inicio':
        return <HomeScreen transactions={transactions} />;
      case 'presupuesto':
        return (
          <BudgetScreen
            transactions={transactions}
            budgets={customBudgets}
            smartSuggestion={smartBudgetSuggestion}
            onGenerateBudget={handleGenerateBudget}
            onUpdateBudgets={handleUpdateBudgets}
          />
        );
      case 'chat':
        return (
          <ChatScreen
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            isLoading={isChatLoading}
          />
        );
      case 'sms':
        return <SmsScreen alerts={alerts} onClassifySms={handleClassify} />;
      case 'perfil':
        return <ProfileScreen transactions={transactions} />;
      default:
        return <HomeScreen transactions={transactions} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans flex flex-col items-center">
      <div className="w-full max-w-md mx-auto bg-gray-900 flex flex-col h-screen">
        <main className="flex-grow overflow-y-auto pb-20">
          {renderScreen()}
        </main>
        <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
      </div>
    </div>
  );
};

export default App;
