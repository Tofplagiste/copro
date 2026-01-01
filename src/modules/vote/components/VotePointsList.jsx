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
 */
export default function VotePointsList({
    points,
    votes,
    getVotants,
    getPointResult,
    updateVote,
    setAllVotes,
    resetPointVotes,
    updatePointArticle
}) {
    const votants = getVotants();

    return (
        <div className="space-y-6">
            {points.map(point => (
                <VotePointCard
                    key={point.id}
                    point={point}
                    votants={votants}
                    votes={votes[point.id]}
                    result={getPointResult(point.id)}
                    onUpdateVote={updateVote}
                    onSetAllVotes={setAllVotes}
                    onResetVotes={resetPointVotes}
                    onUpdateArticle={updatePointArticle}
                />
            ))}
        </div>
    );
}
