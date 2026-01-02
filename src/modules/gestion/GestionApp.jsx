/**
 * GestionApp - Application Gestion Copropriété
 * Regroupe les onglets Water, Budget, Finance, Annexes, BudgetDetail, Params
 * 
 * MIGRATION PHASE 6 : Wrappé avec GestionSupabaseProvider pour charger les données Supabase.
 * Les tabs peuvent accéder aux données via useGestionData() ou l'ancien useCopro().
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { TABS_CONFIG } from '../../data/initialState';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import TabNavigation from '../../components/TabNavigation';

// Supabase Context Provider
import { GestionSupabaseProvider, useGestionData } from './context/GestionSupabaseContext';

// Feature tabs - Gestion Copro
import WaterTab from './tabs/WaterTab';
import BudgetTab from './tabs/BudgetTab';
import FinanceTab from './tabs/FinanceTab';
import AnnexesTab from './tabs/AnnexesTab';
import BudgetDetailTab from './tabs/BudgetDetailTab';
import ParamsTab from './tabs/ParamsTab';

// Map tab ID to component
const TAB_COMPONENTS = {
    'water': WaterTab,
    'budget': BudgetTab,
    'finance': FinanceTab,
    'annexes': AnnexesTab,
    'budget-detail': BudgetDetailTab,
    'params': ParamsTab
};

/**
 * Contenu principal de l'app Gestion (enfant du Provider)
 */
function GestionContent() {
    const { loading, error, refresh } = useGestionData();

    const [activeTab, setActiveTab] = useState(() => {
        const saved = sessionStorage.getItem('coproActiveTab');
        return saved || 'water';
    });

    const handleTabChange = (tab) => {
        sessionStorage.setItem('coproActiveTab', tab);
        setActiveTab(tab);
    };

    const ActiveTabComponent = TAB_COMPONENTS[activeTab] || WaterTab;

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white rounded-xl p-8 shadow-lg flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    <p className="text-gray-600 font-medium">Chargement des données...</p>
                    <p className="text-gray-400 text-sm">Budget, Comptes, Opérations...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white rounded-xl p-8 shadow-lg flex flex-col items-center gap-4 max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                    <p className="text-red-600 text-center font-medium">Erreur de chargement</p>
                    <p className="text-gray-500 text-sm text-center">{error}</p>
                    <button
                        onClick={refresh}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Sticky container for both headers */}
            <div className="sticky top-0 z-50">
                {/* Header with Back to Hub button */}
                <div className="bg-slate-800 text-white px-4 py-2 flex items-center gap-4">
                    <Link
                        to="/"
                        className="flex items-center gap-2 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-sm"
                    >
                        <ArrowLeft size={16} />
                        <span>Hub</span>
                    </Link>
                    <span className="text-slate-400">|</span>
                    <span className="font-semibold">Gestion Copro</span>
                    <div className="ml-auto flex items-center gap-2">
                        <span className="text-xs text-emerald-400 bg-emerald-900/30 px-2 py-0.5 rounded">
                            ☁️ Supabase
                        </span>
                    </div>
                </div>

                <Header />
                <TabNavigation
                    tabs={TABS_CONFIG}
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                />
            </div>

            <main className="animate-fadeIn flex-1">
                <ActiveTabComponent />
            </main>

            <Footer />
        </div>
    );
}

/**
 * GestionApp - Point d'entrée avec Provider
 */
export default function GestionApp() {
    return (
        <GestionSupabaseProvider>
            <GestionContent />
        </GestionSupabaseProvider>
    );
}
