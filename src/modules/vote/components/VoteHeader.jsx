/**
 * VoteHeader - En-tête du calculateur de vote
 * Contient le titre, la date et les boutons d'action
 */
import { Link } from 'react-router-dom';
import { ArrowLeft, Vote, Download, FileText } from 'lucide-react';

/**
 * @param {Object} props
 * @param {string} props.date - Date de l'AG
 * @param {Function} props.setDate - Setter pour la date
 * @param {Function} props.onExportPdf - Callback export PDF
 * @param {number} props.totalTantiemes - Total des tantièmes
 * @param {number} props.coproCount - Nombre de copropriétaires
 */
export default function VoteHeader({ date, setDate, onExportPdf, totalTantiemes, coproCount }) {
    return (
        <header className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white sticky top-0 z-50 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm"
                        >
                            <ArrowLeft size={16} />
                            Hub
                        </Link>
                        <div className="flex items-center gap-2">
                            <Vote size={28} />
                            <div>
                                <h1 className="font-bold text-xl">Calculateur Vote AG</h1>
                                <p className="text-purple-200 text-xs">{totalTantiemes} tantièmes - {coproCount} copropriétaires</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="px-3 py-1.5 rounded-lg bg-white/20 text-white border border-white/30 text-sm"
                        />
                        <button className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-lg text-sm font-semibold flex items-center gap-2">
                            <Download size={16} />
                            Sauvegarder
                        </button>
                        <button onClick={onExportPdf} className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-lg text-sm font-semibold flex items-center gap-2">
                            <FileText size={16} />
                            PDF
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
