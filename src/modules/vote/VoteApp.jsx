/**
 * VoteApp - Calculateur Vote AG Copropriété
 * Chef d'orchestre qui connecte le Hook aux Composants UI
 * Refactorisé depuis le fichier monolithique (563 → ~70 lignes)
 */
import { RotateCcw } from 'lucide-react';
import { ConfirmModal } from '../../components/Modal';
import { useVote } from './hooks/useVote';
import { exportVotePdf } from './utils/pdfVote';
import VoteHeader from './components/VoteHeader';
import VotePresenceSection from './components/VotePresenceSection';
import VotePointsList from './components/VotePointsList';

export default function VoteApp() {
    const vote = useVote();

    const handleExportPdf = () => {
        exportVotePdf({
            date: vote.date,
            copros: vote.copros,
            points: vote.points,
            presenceStats: vote.presenceStats,
            getPointResult: vote.getPointResult
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-700 to-purple-800">
            <VoteHeader
                date={vote.date}
                setDate={vote.setDate}
                onExportPdf={handleExportPdf}
                totalTantiemes={vote.TOTAL_TANTIEMES}
                coproCount={vote.copros.length}
            />

            <div className="max-w-7xl mx-auto p-6 space-y-6">
                <VotePresenceSection
                    copros={vote.copros}
                    presenceStats={vote.presenceStats}
                    updatePresence={vote.updatePresence}
                    updateProcuration={vote.updateProcuration}
                    getMandataires={vote.getMandataires}
                    procurationCounts={vote.procurationCounts}
                />

                {/* Actions */}
                <div className="flex gap-3 flex-wrap">
                    <button
                        onClick={() => vote.setResetConfirm(true)}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-lg font-semibold flex items-center gap-2"
                    >
                        <RotateCcw size={18} />
                        Reset Tous les Votes
                    </button>
                </div>

                <VotePointsList
                    points={vote.points}
                    votes={vote.votes}
                    getVotants={vote.getVotants}
                    getPointResult={vote.getPointResult}
                    updateVote={vote.updateVote}
                    setAllVotes={vote.setAllVotes}
                    resetPointVotes={vote.resetPointVotes}
                />
            </div>

            {/* Confirm reset modal */}
            <ConfirmModal
                isOpen={vote.resetConfirm}
                onClose={() => vote.setResetConfirm(false)}
                onConfirm={vote.resetAllVotes}
                title="Reset tous les votes ?"
                message="Cette action effacera tous les votes enregistrés."
                confirmText="Effacer"
                variant="danger"
            />
        </div>
    );
}
