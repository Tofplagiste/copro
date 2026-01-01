/**
 * VotePointCard - Carte d'un point de vote
 * Affiche le résultat et permet de voter
 */
import { ARTICLES } from '../data/voteConstants';
import VoteResultBadge from './VoteResultBadge';

/**
 * @param {Object} props
 * @param {Object} props.point - Point de vote
 * @param {Array} props.votants - Liste des votants
 * @param {Object} props.votes - Votes pour ce point
 * @param {Object} props.result - Résultat calculé
 * @param {Function} props.onUpdateVote - Callback pour voter
 * @param {Function} props.onSetAllVotes - Callback pour voter tous
 * @param {Function} props.onResetVotes - Callback pour reset
 */
export default function VotePointCard({
    point,
    votants,
    votes,
    result,
    onUpdateVote,
    onSetAllVotes,
    onResetVotes,
    onUpdateArticle
}) {
    const articleInfo = ARTICLES[point.article];

    return (
        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-indigo-500">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">{point.id}. {point.titre}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <label className="text-sm font-medium text-slate-600">Article:</label>
                        <select
                            value={point.article}
                            onChange={(e) => onUpdateArticle(point.id, e.target.value)}
                            className="text-sm border-slate-300 rounded shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-1 pl-2 pr-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {Object.entries(ARTICLES).map(([key, info]) => (
                                <option key={key} value={key}>
                                    {key === 'unanimite' ? 'Unanimité' : `Art ${key} - ${info.nom}`}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 italic">
                        {articleInfo.description}
                    </div>
                </div>

                {result.hasVotes && <VoteResultBadge adopte={result.adopte} />}
            </div>

            {/* Grille de votes */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
                {votants.map(copro => {
                    const currentVote = votes?.[copro.id];
                    return (
                        <div key={copro.id} className="bg-slate-50 rounded-lg p-3">
                            <div className="font-semibold text-sm text-slate-700 mb-2">{copro.nom}</div>
                            <div className="flex gap-1">
                                {['pour', 'contre', 'abstention'].map(voteType => {
                                    const isSelected = currentVote === voteType;
                                    const colors = {
                                        pour: 'bg-green-100 text-green-700 border-green-500',
                                        contre: 'bg-red-100 text-red-700 border-red-500',
                                        abstention: 'bg-amber-100 text-amber-700 border-amber-500'
                                    };
                                    return (
                                        <button
                                            key={voteType}
                                            onClick={() => onUpdateVote(point.id, copro.id, voteType)}
                                            className={`
                                                flex-1 px-1 py-1 rounded text-xs font-semibold border-2 transition-all
                                                ${colors[voteType]}
                                                ${isSelected ? 'ring-2 ring-offset-1 ring-slate-400 scale-105' : 'opacity-50 hover:opacity-100'}
                                            `}
                                        >
                                            {voteType === 'pour' ? '✓' : voteType === 'contre' ? '✗' : '○'}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Actions et résultat */}
            <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex gap-2">
                    <button
                        onClick={() => onSetAllVotes(point.id, 'pour')}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded text-sm font-semibold"
                    >
                        Tous Pour
                    </button>
                    <button
                        onClick={() => onSetAllVotes(point.id, 'contre')}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-sm font-semibold"
                    >
                        Tous Contre
                    </button>
                    <button
                        onClick={() => onResetVotes(point.id)}
                        className="px-3 py-1.5 bg-slate-500 hover:bg-slate-400 text-white rounded text-sm font-semibold"
                    >
                        Reset
                    </button>
                </div>

                <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                        <div className="font-bold text-green-600 text-lg">{result.pour}</div>
                        <div className="text-slate-500">Pour</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-red-600 text-lg">{result.contre}</div>
                        <div className="text-slate-500">Contre</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-amber-600 text-lg">{result.abstention}</div>
                        <div className="text-slate-500">Abstention</div>
                    </div>
                    <div className="text-center border-l pl-4">
                        <div className="font-bold text-indigo-600 text-lg">{result.baseCalc}</div>
                        <div className="text-slate-500">Base calcul</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
