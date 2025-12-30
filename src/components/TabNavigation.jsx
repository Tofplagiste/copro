/**
 * TabNavigation - Barre de navigation des onglets
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
        <nav className="bg-white px-5 py-0 shadow-sm sticky top-[76px] z-40 overflow-x-auto whitespace-nowrap border-b border-gray-100">
            <div className="max-w-screen-2xl mx-auto flex">
                {tabs.map((tab) => {
                    const IconComponent = ICON_MAP[tab.icon];
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`
                px-5 py-4 font-semibold border-b-3 transition-all duration-200 flex items-center gap-2
                ${isActive
                                    ? 'text-blue-600 border-blue-600 bg-white'
                                    : 'text-gray-500 border-transparent hover:text-blue-500 hover:bg-gray-50'
                                }
              `}
                        >
                            {IconComponent && <IconComponent size={18} />}
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
