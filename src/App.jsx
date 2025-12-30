/**
 * App.jsx - Composant principal avec Hub et navigation multi-apps
 * Hub = Page d'accueil par défaut
 */
import { useState } from 'react';
import { CoproProvider } from './context/CoproContext';
import { TABS_CONFIG } from './data/initialState';
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import HubPage from './features/hub/HubPage';
import CarnetApp from './features/carnet/CarnetApp';
import CreditApp from './features/credit/CreditApp';
import VoteApp from './features/vote/VoteApp';
import { ArrowLeft } from 'lucide-react';

// Feature components - Gestion Copro
import WaterTab from './features/water/WaterTab';
import BudgetTab from './features/budget/BudgetTab';
import FinanceTab from './features/finance/FinanceTab';
import AnnexesTab from './features/annexes/AnnexesTab';
import BudgetDetailTab from './features/budget-detail/BudgetDetailTab';
import ParamsTab from './features/params/ParamsTab';

// Map tab ID to component
const TAB_COMPONENTS = {
  'water': WaterTab,
  'budget': BudgetTab,
  'finance': FinanceTab,
  'annexes': AnnexesTab,
  'budget-detail': BudgetDetailTab,
  'params': ParamsTab
};


function CoproApp({ onBackToHub }) {
  const [activeTab, setActiveTab] = useState('water');
  const ActiveTabComponent = TAB_COMPONENTS[activeTab] || WaterTab;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with Back to Hub button */}
      <div className="bg-slate-800 text-white px-4 py-2 flex items-center gap-4">
        <button
          onClick={onBackToHub}
          className="flex items-center gap-2 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          <span>Hub</span>
        </button>
        <span className="text-slate-400">|</span>
        <span className="font-semibold">Gestion Copro</span>
      </div>

      <Header />
      <TabNavigation
        tabs={TABS_CONFIG}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="animate-fadeIn">
        <ActiveTabComponent />
      </main>
    </div>
  );
}

// Placeholder for apps not yet migrated
function ComingSoonApp({ name, onBackToHub }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-6">🚧</div>
        <h2 className="text-3xl font-bold text-white mb-4">{name}</h2>
        <p className="text-slate-400 mb-8">Cette application est en cours de migration vers React.</p>
        <button
          onClick={onBackToHub}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold flex items-center gap-2 mx-auto transition-colors"
        >
          <ArrowLeft size={18} />
          Retour au Hub
        </button>
      </div>
    </div>
  );
}

function AppContent() {
  // null = Hub, 'copro' = Gestion Copro, 'carnet' = Carnet, etc.
  // Persist to sessionStorage so refresh keeps you on same app
  const [currentApp, setCurrentApp] = useState(() => {
    const saved = sessionStorage.getItem('currentApp');
    return saved || null;
  });

  const handleSelectApp = (appId) => {
    sessionStorage.setItem('currentApp', appId);
    setCurrentApp(appId);
  };

  const handleBackToHub = () => {
    sessionStorage.removeItem('currentApp');
    setCurrentApp(null);
  };

  // Render current app or Hub
  if (currentApp === null) {
    return <HubPage onSelectApp={handleSelectApp} />;
  }

  if (currentApp === 'copro') {
    return <CoproApp onBackToHub={handleBackToHub} />;
  }

  if (currentApp === 'carnet') {
    return <CarnetApp onBackToHub={handleBackToHub} />;
  }

  if (currentApp === 'credit') {
    return <CreditApp onBackToHub={handleBackToHub} />;
  }

  if (currentApp === 'vote') {
    return <VoteApp onBackToHub={handleBackToHub} />;
  }

  return <HubPage onSelectApp={handleSelectApp} />;
}

export default function App() {
  return (
    <CoproProvider>
      <AppContent />
    </CoproProvider>
  );
}
