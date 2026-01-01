/**
 * App.jsx - Composant principal avec React Router
 * Routes vers le Dashboard et les 4 modules
 * Intègre l'authentification Supabase
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CoproProvider } from './context/CoproContext';
import { ToastProvider } from './components/ToastProvider';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages Auth
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import PendingApprovalPage from './pages/auth/PendingApprovalPage';

// Pages Admin
import UserManagement from './pages/admin/UserManagement';

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
      <AuthProvider>
        <ToastProvider>
          <CoproProvider>
            <Routes>
              {/* Routes publiques (Auth) */}
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/signup" element={<SignupPage />} />
              <Route path="/auth/pending" element={<PendingApprovalPage />} />

              {/* Routes protégées */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gestion/*"
                element={
                  <ProtectedRoute>
                    <GestionApp />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/carnet/*"
                element={
                  <ProtectedRoute>
                    <CarnetApp />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/credit/*"
                element={
                  <ProtectedRoute>
                    <CreditApp />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vote/*"
                element={
                  <ProtectedRoute>
                    <VoteApp />
                  </ProtectedRoute>
                }
              />

              {/* Routes Admin (requireAdmin) */}
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute requireAdmin>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />

              {/* Route catch-all : redirige vers / (le ProtectedRoute gèrera) */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CoproProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

