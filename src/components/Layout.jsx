/**
 * Layout - Wrapper avec navigation retour vers le Hub
 * Utilisé par les pages de modules (Gestion, Carnet, etc.)
 */
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * @param {Object} props
 * @param {string} props.title - Titre affiché dans le header
 * @param {React.ReactNode} props.children - Contenu de la page
 */
export default function Layout({ title, children }) {
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header with Back to Hub button */}
            <div className="sticky top-0 z-50 bg-slate-800 text-white px-4 py-2 flex items-center gap-4">
                <Link
                    to="/"
                    className="flex items-center gap-2 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-sm"
                >
                    <ArrowLeft size={16} />
                    <span>Hub</span>
                </Link>
                <span className="text-slate-400">|</span>
                <span className="font-semibold">{title}</span>
            </div>

            {children}
        </div>
    );
}
