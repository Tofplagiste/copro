/**
 * GestionApp - Application Gestion Copropriété
 * Regroupe les onglets Water, Budget, Finance, Annexes, BudgetDetail, Params
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { TABS_CONFIG } from '../../data/initialState';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import TabNavigation from '../../components/TabNavigation';

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

export default function GestionApp() {
    const [activeTab, setActiveTab] = useState(() => {
        const saved = sessionStorage.getItem('coproActiveTab');
        return saved || 'water';
    });

    const handleTabChange = (tab) => {
        sessionStorage.setItem('coproActiveTab', tab);
        setActiveTab(tab);
    };

    const ActiveTabComponent = TAB_COMPONENTS[activeTab] || WaterTab;

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
