/**
 * VotePointsList - Liste des points de vote
 * Container pour les cartes de points
 */
import VotePointCard from './VotePointCard';

/**
 * @param {Object} props
 * @param {Array} props.points - Points de vote
 * @param {Object} props.votes - Tous les votes
 * @param {Function} props.getVotants - Fonction pour obtenir les votants
 * @param {Function} props.getPointResult - Fonction pour calculer résultat
 * @param {Function} props.updateVote - Callback pour voter
 * @param {Function} props.setAllVotes - Callback pour voter tous
 * @param {Function} props.resetPointVotes - Callback pour reset
 * @param {Function} props.updatePointArticle - Callback pour changer l'article
 * @param {Function} props.deletePoint - Callback pour supprimer un point
 */
export default function VotePointsList({
    points,
    votes,
    getVotants,
    getPointResult,
    updateVote,
    setAllVotes,
    resetPointVotes,
    updatePointArticle,
    deletePoint
}) {
    const votants = getVotants();

    if (points.length === 0) {
        return (
            <div className="bg-white/10 backdrop-blur rounded-xl p-8 text-center">
                <p className="text-white/60">Aucun point de vote. Ajoutez-en un ci-dessus.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {points.map((point, index) => (
                <VotePointCard
                    key={point.id}
                    point={point}
                    index={index + 1}
                    votants={votants}
                    votes={votes[point.id]}
                    result={getPointResult(point.id)}
                    onUpdateVote={updateVote}
                    onSetAllVotes={setAllVotes}
                    onResetVotes={resetPointVotes}
                    onUpdateArticle={updatePointArticle}
                    onDeletePoint={deletePoint}
                />
            ))}
        </div>
    );
}
