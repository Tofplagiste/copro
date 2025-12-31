/**
 * App.jsx - Composant principal avec React Router
 * Routes vers le Dashboard et les 4 modules
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CoproProvider } from './context/CoproContext';
import { ToastProvider } from './components/ToastProvider';

// Pages
import Dashboard from './pages/Dashboard';

// Modules
import GestionApp from './modules/gestion/GestionApp';
import CarnetApp from './modules/carnet/CarnetApp';
import CreditApp from './modules/credit/CreditApp';
import VoteApp from './modules/vote/VoteApp';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <CoproProvider>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/gestion/*" element={<GestionApp />} />
            <Route path="/carnet/*" element={<CarnetApp />} />
            <Route path="/credit/*" element={<CreditApp />} />
            <Route path="/vote/*" element={<VoteApp />} />
          </Routes>
        </CoproProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
