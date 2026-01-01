/**
 * VoteResultBadge - Badge adopté/rejeté
 * Affiche le résultat d'un vote
 */

/**
 * @param {Object} props
 * @param {boolean} props.adopte - Si la résolution est adoptée
 */
export default function VoteResultBadge({ adopte }) {
    return (
        <div className={`
            px-4 py-2 rounded-lg font-bold text-lg
            ${adopte
                ? 'bg-green-100 text-green-700 border-2 border-green-500'
                : 'bg-red-100 text-red-700 border-2 border-red-500'}
        `}>
            {adopte ? '✅ ADOPTÉ' : '❌ REJETÉ'}
        </div>
    );
}
