/**
 * TabNavigation - Barre de navigation des onglets (Responsive)
 */
import { Droplets, FileText, PieChart, BookOpen, Calendar, Settings } from 'lucide-react';

const ICON_MAP = {
    Droplets,
    FileText,
    PieChart,
    BookOpen,
    Calendar,
    Settings
};

export default function TabNavigation({ tabs, activeTab, onTabChange }) {
    return (
        <nav className="bg-white px-2 sm:px-5 py-0 shadow-sm sticky top-[60px] sm:top-[76px] z-40 overflow-x-auto whitespace-nowrap border-b border-gray-100">
            <div className="max-w-screen-2xl mx-auto flex">
                {tabs.map((tab) => {
                    const IconComponent = ICON_MAP[tab.icon];
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`
                                px-3 sm:px-5 py-3 sm:py-4 font-semibold border-b-3 transition-all duration-200 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base
                                ${isActive
                                    ? 'text-blue-600 border-blue-600 bg-white'
                                    : 'text-gray-500 border-transparent hover:text-blue-500 hover:bg-gray-50'
                                }
                            `}
                            title={tab.label}
                        >
                            {IconComponent && <IconComponent className="w-4 h-4 sm:w-[18px] sm:h-[18px] shrink-0" />}
                            <span className="hidden sm:inline">{tab.label}</span>
                            <span className="sm:hidden text-xs">{tab.label.split('.')[0]}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
