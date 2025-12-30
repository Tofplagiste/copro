/**
 * WaterTab - Onglet Gestion Eau avec sous-onglets
 */
import { useState } from 'react';
import { Droplets, PenLine, TrendingDown, BarChart3 } from 'lucide-react';
import WaterConfig from './WaterConfig';
import WaterReadings from './WaterReadings';
import WaterPrevisions from './WaterPrevisions';
import WaterProjection from './WaterProjection';

const SUB_TABS = [
    { id: 'readings', label: 'Saisie Relevés', icon: PenLine },
    { id: 'previ', label: 'Saisie Prévisions', icon: TrendingDown },
    { id: 'proj', label: 'Bilan & Projection', icon: BarChart3 }
];

export default function WaterTab() {
    const [activeSubTab, setActiveSubTab] = useState('readings');

    return (
        <div className="p-6 space-y-4">
            {/* Sub-navigation */}
            <div className="flex justify-center">
                <div className="inline-flex bg-gray-200 p-1 rounded-lg gap-1">
                    {SUB_TABS.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeSubTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveSubTab(tab.id)}
                                className={`
                  px-4 py-2 rounded-md font-semibold text-sm flex items-center gap-2 transition-all
                  ${isActive
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-blue-500 hover:bg-white/50'
                                    }
                `}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Readings sub-tab */}
            {activeSubTab === 'readings' && (
                <div className="animate-fadeIn">
                    {/* Info tip */}
                    <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-r-lg shadow-sm mb-4 text-sm text-gray-600">
                        <strong>💡 Astuce :</strong> Le changement de trimestre remplit automatiquement l'ancien index avec le nouveau du trimestre précédent.
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
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
