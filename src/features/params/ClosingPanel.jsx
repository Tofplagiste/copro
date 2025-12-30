/**
 * ClosingPanel - Panneau de clôture d'exercice
 */
import { Archive, ArrowRight, AlertTriangle } from 'lucide-react';
import { useCopro } from '../../context/CoproContext';

export default function ClosingPanel() {
    const { resetAll } = useCopro();

    const handleCloseYear = () => {
        if (window.confirm('Voulez-vous vraiment clôturer l\'année et remettre les compteurs à zéro ? Cette action est irréversible (si non sauvegardé).')) {
            // Ici on pourrait ajouter une logique d'archivage plus complexe
            // Pour l'instant, on utilise le reset global qui remet à zéro pour le nouvel exercice
            // TODO: Implémenter une vraie sauvegarde d'archive si nécessaire
            resetAll();
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-red-500 px-4 py-3 border-b border-red-600 flex items-center gap-2">
                <Archive size={18} className="text-white" />
                <h3 className="font-bold text-white">Clôture & Nouvel Exercice</h3>
            </div>

            <div className="p-4 space-y-4">
                <p className="text-sm text-gray-600 italic">
                    Sauvegarde et remise à zéro.
                </p>

                <div className="border border-red-100 bg-red-50 rounded-lg p-3">
                    <button
                        onClick={handleCloseYear}
                        className="w-full flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-600 hover:text-white py-3 rounded-lg font-bold transition-all shadow-sm group">
                        <span className="group-hover:translate-x-1 transition-transform">CLÔTURER L'ANNÉE</span>
                        <ArrowRight size={18} />
                    </button>
                    <div className="mt-2 flex items-start gap-2 text-xs text-red-500">
                        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                        <p>Attention : Cette action efface les données courantes pour démarrer un nouvel exercice.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
