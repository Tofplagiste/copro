/**
 * Header - En-tête de l'application (Responsive)
 */
import { Building2, Check, Save, Trash2 } from 'lucide-react';
import { useCopro } from '../context/CoproContext';
import { useToast } from './ToastProvider';

export default function Header() {
    const { resetAll } = useCopro();
    const toast = useToast();

    const handleExport = () => {
        toast.info('Export en cours de développement...');
    };

    return (
        <header className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-3 sm:px-5 py-3 sm:py-4 shadow-lg">
            <div className="flex justify-between items-center max-w-screen-2xl mx-auto">
                {/* Logo & Titre */}
                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="bg-white text-slate-800 rounded-full w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                        <h1 className="text-base sm:text-xl font-bold m-0">LES PYRÉNÉES</h1>
                        <p className="text-xs sm:text-sm text-white/70 m-0 hidden xs:block">Syndic Bénévole</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Save Indicator - hidden on mobile */}
                    <span className="text-sm text-white/60 italic items-center gap-1 hidden md:flex">
                        <Check size={14} />
                        Sauvegardé
                    </span>

                    {/* Export Button */}
                    <button
                        onClick={handleExport}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-2 sm:px-4 py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base"
                    >
                        <Save className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                        <span className="hidden sm:inline">SAUVEGARDER</span>
                    </button>

                    {/* Reset Button */}
                    <button
                        onClick={resetAll}
                        className="bg-red-600 hover:bg-red-500 text-white px-2 sm:px-3 py-2 rounded-lg transition-colors"
                        title="Tout effacer"
                    >
                        <Trash2 className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                    </button>
                </div>
            </div>
        </header>
    );
}
