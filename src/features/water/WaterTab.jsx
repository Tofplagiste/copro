/**
 * WaterTab - Onglet Gestion Eau avec sous-onglets (Responsive)
 */
import { useState } from 'react';
import { Droplets, PenLine, TrendingDown, BarChart3 } from 'lucide-react';
import WaterConfig from './WaterConfig';
import WaterReadings from './WaterReadings';
import WaterPrevisions from './WaterPrevisions';
import WaterProjection from './WaterProjection';

const SUB_TABS = [
    { id: 'readings', label: 'Saisie Relevés', shortLabel: 'Relevés', icon: PenLine },
    { id: 'previ', label: 'Saisie Prévisions', shortLabel: 'Prévisions', icon: TrendingDown },
    { id: 'proj', label: 'Bilan & Projection', shortLabel: 'Bilan', icon: BarChart3 }
];

export default function WaterTab() {
    const [activeSubTab, setActiveSubTab] = useState('readings');

    return (
        <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
            {/* Sub-navigation */}
            <div className="flex justify-center overflow-x-auto">
                <div className="inline-flex bg-gray-200 p-1 rounded-lg gap-1">
                    {SUB_TABS.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeSubTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveSubTab(tab.id)}
                                className={`
                                    px-2 sm:px-4 py-1.5 sm:py-2 rounded-md font-semibold text-xs sm:text-sm flex items-center gap-1 sm:gap-2 transition-all whitespace-nowrap
                                    ${isActive
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-blue-500 hover:bg-white/50'
                                    }
                                `}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                <span className="hidden sm:inline">{tab.label}</span>
                                <span className="sm:hidden">{tab.shortLabel}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Readings sub-tab */}
            {activeSubTab === 'readings' && (
                <div className="animate-fadeIn">
                    {/* Info tip */}
                    <div className="bg-green-50 border-l-4 border-green-500 p-2 sm:p-3 rounded-r-lg shadow-sm mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600">
                        <strong>💡 Astuce :</strong> Le changement de trimestre remplit automatiquement l'ancien index avec le nouveau du trimestre précédent.
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4">
                        {/* Configuration panel */}
                        <div className="lg:col-span-1">
                            <WaterConfig />
                        </div>

                        {/* Readings table */}
                        <div className="lg:col-span-3">
                            <WaterReadings />
                        </div>
                    </div>
                </div>
            )}

            {/* Previsions sub-tab */}
            {activeSubTab === 'previ' && (
                <div className="animate-fadeIn">
                    <WaterPrevisions />
                </div>
            )}

            {/* Projection sub-tab */}
            {activeSubTab === 'proj' && (
                <div className="animate-fadeIn">
                    <WaterProjection />
                </div>
            )}
        </div>
    );
}
