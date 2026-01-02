/**
 * ProtectedRoute - Composant de protection des routes
 * 
 * Vérifie l'authentification et l'approbation de l'utilisateur.
 * Redirige vers les pages appropriées selon l'état.
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * Wrapper pour protéger les routes
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenu à protéger
 * @param {boolean} props.requireApproval - Si true, nécessite is_approved (default: true)
 * @param {boolean} props.requireAdmin - Si true, nécessite role admin
 * @param {boolean} props.requireSyndic - Si true, nécessite role syndic ou admin
 */
export default function ProtectedRoute({
    children,
    requireApproval = true,
    requireAdmin = false,
    requireSyndic = false
}) {
    const { isAuthenticated, isApproved, isAdmin, isSyndic, loading } = useAuth();
    const location = useLocation();

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-slate-400">Chargement...</p>
                </div>
            </div>
        );
    }

    // Not authenticated -> Login
    if (!isAuthenticated) {
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }

    // Authenticated but not approved -> Pending
    if (requireApproval && !isApproved) {
        return <Navigate to="/auth/pending" replace />;
    }

    // Check admin requirement
    if (requireAdmin && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    // Check syndic requirement
    if (requireSyndic && !isSyndic) {
        return <Navigate to="/" replace />;
    }

    // All checks passed
    return children;
}
