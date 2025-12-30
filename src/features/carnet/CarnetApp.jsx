/**
 * CarnetApp - Application Carnet de Copropriété
 * Migré depuis Gestion_Copro_Complet.html
 */
import { useState } from 'react';
import { ArrowLeft, Book, Calculator, Users, Briefcase, Map, Save, FileText } from 'lucide-react';
import { CarnetProvider, useCarnet } from '../../context/CarnetContext';
import { CARNET_TABS } from '../../data/carnetState';

// Import sub-tabs
import CarnetInfoTab from './tabs/CarnetInfoTab';
import RepartitionTab from './tabs/RepartitionTab';
import AnnuaireTab from './tabs/AnnuaireTab';
import PrestatairesTab from './tabs/PrestatairesTab';

const ICONS = { Book, Calculator, Users, Briefcase, Map };

function CarnetContent({ onBackToHub }) {
    const [activeTab, setActiveTab] = useState('carnet');
    const { state } = useCarnet();

    const renderTab = () => {
        switch (activeTab) {
            case 'carnet': return <CarnetInfoTab />;
            case 'repartition': return <RepartitionTab />;
            case 'annuaire': return <AnnuaireTab />;
            case 'prestataires': return <PrestatairesTab />;
            case 'plan': return <PlanPlaceholder />;
            default: return <CarnetInfoTab />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-slate-700 text-white sticky top-0 z-50">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBackToHub}
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors text-sm"
                        >
                            <ArrowLeft size={16} />
                            <span>Hub</span>
                        </button>
                        <div className="flex items-center gap-2">
                            <Book size={24} />
                            <div>
                                <h1 className="font-bold text-lg">Copro Les Pyrénées</h1>
                                <p className="text-slate-300 text-xs">Carnet d'Entretien</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-semibold transition-colors">
                            <FileText size={16} />
                            PDF
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <nav className="flex overflow-x-auto bg-slate-800">
                    {CARNET_TABS.map(tab => {
                        const Icon = ICONS[tab.icon] || Book;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                  flex-1 min-w-[100px] flex flex-col items-center gap-1 px-4 py-3 text-sm font-medium 
                  border-b-3 transition-colors
                  ${activeTab === tab.id
                                        ? 'text-white border-b-2 border-emerald-400 bg-slate-700/50'
                                        : 'text-slate-400 hover:text-white border-b-2 border-transparent'}
                `}
                            >
                                <Icon size={18} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </header>

            {/* Content */}
            <main className="animate-fadeIn">
                {renderTab()}
            </main>
        </div>
    );
}

function PlanPlaceholder() {
    return (
        <div className="p-6">
            <div className="bg-white rounded-lg shadow p-8 text-center">
                <Map size={64} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-700 mb-2">Plan de l'Immeuble</h3>
                <p className="text-slate-500">Module en cours de développement</p>
            </div>
        </div>
    );
}

export default function CarnetApp({ onBackToHub }) {
    return (
        <CarnetProvider>
            <CarnetContent onBackToHub={onBackToHub} />
        </CarnetProvider>
    );
}
