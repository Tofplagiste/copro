
/**
 * Header - En-tête de l'application (Responsive)
 */
import { Building2 } from 'lucide-react';

export default function Header() {
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

                {/* Actions - Removed as requested */}
                <div className="flex items-center gap-2 sm:gap-3">

                </div>
            </div>
        </header>
    );
}
