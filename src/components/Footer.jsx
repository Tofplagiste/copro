/**
 * Footer - Pied de page avec version et informations
 */

export default function Footer() {
    const version = "1.0.0";
    const year = new Date().getFullYear();

    return (
        <footer className="bg-slate-800 text-white/70 text-xs py-4 px-4 mt-auto">
            <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
                {/* Infos Copropriété */}
                <div className="text-center sm:text-left">
                    <span className="font-semibold text-white">Copropriété Les Pyrénées</span>
                    <span className="mx-2">•</span>
                    <span>7-9 rue André Leroux, 33780 Soulac-sur-Mer</span>
                </div>

                {/* Version + Copyright */}
                <div className="flex items-center gap-4">
                    <span className="bg-slate-700 px-2 py-1 rounded text-white/80">
                        v{version}
                    </span>
                    <span>© {year} - Syndic Bénévole</span>
                </div>
            </div>
        </footer>
    );
}
