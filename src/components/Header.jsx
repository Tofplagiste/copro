/**
 * Header - En-tête de l'application
 */
import { Building2, Check, Save, Trash2 } from 'lucide-react';
import { useCopro } from '../context/CoproContext';

export default function Header() {
    const { resetAll } = useCopro();

    const handleExport = () => {
        // TODO: Export HTML complet
        alert('Export en cours de développement...');
    };

    return (
        <header className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-5 py-4 shadow-lg">
            <div className="flex justify-between items-center max-w-screen-2xl mx-auto">
                {/* Logo & Titre */}
                <div className="flex items-center gap-4">
                    <div className="bg-white text-slate-800 rounded-full w-12 h-12 flex items-center justify-center">
                        <Building2 size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold m-0">LES PYRÉNÉES</h1>
                        <p className="text-sm text-white/70 m-0">Syndic Bénévole - React v1.0</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    {/* Save Indicator */}
                    <span className="text-sm text-white/60 italic flex items-center gap-1">
                        <Check size={14} />
                        Sauvegardé
                    </span>

                    {/* Export Button */}
                    <button
                        onClick={handleExport}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Save size={18} />
                        SAUVEGARDER
                    </button>

                    {/* Reset Button */}
                    <button
                        onClick={resetAll}
                        className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg transition-colors"
                        title="Tout effacer"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </header>
    );
}
