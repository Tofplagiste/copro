/**
 * VotePresenceStats - Statistiques de présence agrégées
 * Affiche les compteurs de présence
 */

/**
 * @param {Object} props
 * @param {Object} props.presenceStats - Statistiques calculées
 */
export default function VotePresenceStats({ presenceStats }) {
    return (
        <div className="bg-amber-50 rounded-lg p-4 border-2 border-amber-400">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div className="bg-white rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-600">{presenceStats.presents}</div>
                    <div className="text-xs text-slate-600">Présents</div>
                </div>
                <div className="bg-white rounded-lg p-3">
                    <div className="text-2xl font-bold text-amber-600">{presenceStats.procurations}</div>
                    <div className="text-xs text-slate-600">Procurations</div>
                </div>
                <div className="bg-white rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-600">{presenceStats.correspondance}</div>
                    <div className="text-xs text-slate-600">Correspondance</div>
                </div>
                <div className="bg-white rounded-lg p-3">
                    <div className="text-2xl font-bold text-red-600">{presenceStats.absents}</div>
                    <div className="text-xs text-slate-600">Absents</div>
                </div>
                <div className="bg-white rounded-lg p-3">
                    <div className="text-2xl font-bold text-indigo-600">{presenceStats.tantiemesVotants}</div>
                    <div className="text-xs text-slate-600">Tantièmes votants</div>
                </div>
            </div>
        </div>
    );
}
