/**
 * ClosingPanel - Panneau de clôture d'exercice avec Modal de confirmation
 */
import { useState } from 'react';
import { Archive, ArrowRight, AlertTriangle, X } from 'lucide-react';
import { useCopro } from '../../../../context/CoproContext';

// Modal de confirmation
function ConfirmCloseModal({ isOpen, onConfirm, onCancel }) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            onClick={onCancel}
            style={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)'
            }}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 max-w-md w-full animate-[scaleIn_0.2s_ease-out]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                        <AlertTriangle size={24} className="text-red-500" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800 text-lg">Clôturer l'année ?</h4>
                        <p className="text-sm text-gray-500 mt-1">
                            Cette action va remettre les compteurs à zéro pour démarrer un nouvel exercice.
                        </p>
                    </div>
                </div>

                <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-4">
                    <p className="text-sm text-red-600 font-medium flex items-center gap-2">
                        <AlertTriangle size={16} className="shrink-0" />
                        Cette action est irréversible (si non sauvegardé)
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <Archive size={18} />
                        Confirmer
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ClosingPanel() {
    const { resetAll } = useCopro();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const handleCloseYear = () => {
        setIsConfirmOpen(true);
    };

    const handleConfirm = () => {
        resetAll();
        setIsConfirmOpen(false);
    };

    return (
        <>
            <ConfirmCloseModal
                isOpen={isConfirmOpen}
                onConfirm={handleConfirm}
                onCancel={() => setIsConfirmOpen(false)}
            />

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
                <div className="bg-red-500 px-3 sm:px-4 py-2 sm:py-3 border-b border-red-600 flex items-center gap-2">
                    <Archive className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-white shrink-0" />
                    <h3 className="font-bold text-white text-sm sm:text-base truncate">Clôture & Nouvel Exercice</h3>
                </div>

                <div className="p-3 sm:p-4 flex flex-col justify-center flex-1">
                    <p className="text-xs sm:text-sm text-gray-600 italic text-center mb-3">
                        Sauvegarde et remise à zéro.
                    </p>

                    <button
                        onClick={handleCloseYear}
                        className="w-full flex items-center justify-center gap-2 bg-red-50 border-2 border-red-300 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 py-2.5 sm:py-3 rounded-lg font-bold transition-all shadow-sm group text-sm sm:text-base"
                    >
                        <span className="group-hover:translate-x-1 transition-transform">CLÔTURER L'ANNÉE</span>
                        <ArrowRight className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                    </button>
                    <p className="text-[10px] sm:text-xs text-red-500 text-center mt-2 flex items-center justify-center gap-1">
                        <AlertTriangle size={12} />
                        Cette action efface les données.
                    </p>
                </div>
            </div>
        </>
    );
}
