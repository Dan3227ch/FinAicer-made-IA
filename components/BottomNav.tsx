import React from 'react';
import { Screen } from '../App';
import { HomeIcon } from './icons/HomeIcon';
import { BudgetIcon } from './icons/BudgetIcon';
import { ChatNavIcon } from './icons/ChatNavIcon';
import { SmsIcon } from './icons/SmsIcon';
import { ProfileIcon } from './icons/ProfileIcon';

interface BottomNavProps {
    activeScreen: Screen;
    setActiveScreen: (screen: Screen) => void;
}

const NavItem: React.FC<{
    screen: Screen;
    label: string;
    Icon: React.FC<React.SVGProps<SVGSVGElement>>;
    isActive: boolean;
    onClick: () => void;
}> = ({ screen, label, Icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ${isActive ? 'text-cyan-400' : 'text-gray-400 hover:text-white'}`}
    >
        <Icon className="w-6 h-6 mb-1" />
        <span className="text-xs font-medium">{label}</span>
    </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, setActiveScreen }) => {
    const navItems = [
        { screen: 'inicio' as Screen, label: 'Inicio', Icon: HomeIcon },
        { screen: 'presupuesto' as Screen, label: 'Presupuesto', Icon: BudgetIcon },
        { screen: 'chat' as Screen, label: 'Chat IA', Icon: ChatNavIcon },
        { screen: 'sms' as Screen, label: 'SMS', Icon: SmsIcon },
        { screen: 'perfil' as Screen, label: 'Perfil', Icon: ProfileIcon },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto h-16 bg-gray-800/90 backdrop-blur-sm border-t border-gray-700 flex justify-around items-center">
            {navItems.map(item => (
                <NavItem
                    key={item.screen}
                    {...item}
                    isActive={activeScreen === item.screen}
                    onClick={() => setActiveScreen(item.screen)}
                />
            ))}
        </div>
    );
};

export default BottomNav;
