import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage as ChatMessageType, ChatAction, ChatActionType } from '../types';
import { SendIcon } from '../components/icons/SendIcon';
import { BotIcon } from '../components/icons/BotIcon';

const ChatMessage: React.FC<{ message: ChatMessageType }> = ({ message }) => {
    const isUser = message.sender === 'user';

    if (message.isLoading) {
        return (
            <div className="flex items-center justify-start">
                <div className="bg-gray-700 rounded-lg px-4 py-3 max-w-sm flex items-center">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce ml-1.5" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce ml-1.5" style={{animationDelay: '0.4s'}}></div>
                </div>
            </div>
        );
    }
    
    // Check for list items in the AI response
    const isList = message.text.includes('\n•') || message.text.includes('\n-');
    const content = isList ? (
        <ul className="space-y-1 list-disc list-inside">
            {message.text.split('\n').map((line, index) => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
                    return <li key={index}>{trimmedLine.substring(1).trim()}</li>;
                }
                if(trimmedLine) return <p key={index} className={index === 0 ? 'mb-2' : ''}>{trimmedLine}</p>;
                return null;
            })}
        </ul>
    ) : (
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
    );

    return (
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
            <div className={`rounded-2xl px-4 py-3 max-w-sm w-fit ${isUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                {content}
                 {message.explainability && (
                    <div className="mt-2 pt-2 border-t border-white/10">
                        <p className="text-xs italic opacity-70">
                           <strong>Razón:</strong> {message.explainability}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

interface ChatScreenProps {
    messages: ChatMessageType[];
    onSendMessage: (message: string) => void;
    isLoading: boolean;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ messages, onSendMessage, isLoading }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = (e: React.FormEvent, message?: string) => {
        e.preventDefault();
        const messageToSend = message || input;
        if (messageToSend.trim()) {
            onSendMessage(messageToSend);
            setInput('');
        }
    };
    
    const quickReplies = ["¿Cómo puedo ahorrar más dinero este mes?", "Análisis Presupuesto", "Tips de Ahorro"];

    return (
        <div className="p-4 h-full flex flex-col">
            <header className="text-center pt-4 mb-4">
                <h1 className="text-2xl font-bold text-white">Asesor Financiero IA</h1>
            </header>

            <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} />
            </div>

            <footer className="pt-4">
                <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-2">
                    {quickReplies.map(reply => (
                        <button 
                            key={reply} 
                            onClick={(e) => handleSend(e, reply)}
                            className="text-sm px-3 py-1.5 border border-gray-600 bg-gray-800 rounded-full whitespace-nowrap"
                        >
                            {reply}
                        </button>
                    ))}
                </div>
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Pregúntame sobre tus finanzas..."
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 transition-shadow"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="p-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors"
                        aria-label="Send message"
                    >
                        <SendIcon className="w-6 h-6" />
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default ChatScreen;