/**
 * VoteApp - Calculateur Vote AG Copropriété
 * Version migrée vers Supabase (useVoteSupabase)
 * Gère le temps de chargement et les erreurs
 */
import { useState } from 'react';
import { RotateCcw, Loader2, AlertCircle, Plus, Calendar } from 'lucide-react';
import { ConfirmModal } from '../../components/Modal';
import { useVoteSupabase } from './hooks/useVoteSupabase';
import { exportVotePdf } from './utils/pdfVote';
import VoteHeader from './components/VoteHeader';
import VotePresenceSection from './components/VotePresenceSection';
import VotePointsList from './components/VotePointsList';

export default function VoteApp() {
    // Pour cette version, on travaille sans session (mode local temporaire)
    // TODO: Ajouter liste de sessions et sélection
    const [sessionId] = useState(null);
    const vote = useVoteSupabase(sessionId);

    // État pour création de session
    const [showCreateSession, setShowCreateSession] = useState(false);
    const [newSessionTitle, setNewSessionTitle] = useState('');
    const [newSessionDate, setNewSessionDate] = useState(new Date().toISOString().split('T')[0]);
    const [resetConfirm, setResetConfirm] = useState(false);

    const handleExportPdf = () => {
        exportVotePdf({
            date: vote.session?.session_date || new Date().toISOString(),
            copros: vote.copros,
            points: vote.points,
            presenceStats: vote.presenceStats,
            getPointResult: vote.getPointResult
        });
    };

    const handleCreateSession = async () => {
        if (!newSessionTitle.trim()) return;

        const result = await vote.createSession(newSessionTitle, newSessionDate);
        if (result.success) {
            setShowCreateSession(false);
            setNewSessionTitle('');
            // Note: Dans une implémentation complète, on rechargerait la session
        }
    };

    // Loading state
    if (vote.loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-700 to-purple-800 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
                    <p className="text-white/80">Chargement de la session de vote...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (vote.error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-700 to-purple-800 flex items-center justify-center p-4">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md text-center">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Erreur</h2>
                    <p className="text-white/70 mb-6">{vote.error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    // No session state - show create option
    if (!vote.session && vote.copros.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-700 to-purple-800 flex items-center justify-center p-4">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md">
                    <h2 className="text-2xl font-bold text-white mb-4 text-center">Vote AG</h2>
                    <p className="text-white/70 mb-6 text-center">
                        Aucune session de vote active. Créez une nouvelle session pour commencer.
                    </p>

                    {showCreateSession ? (
                        <div className="space-y-4">
                            <input
                                type="text"
                                value={newSessionTitle}
                                onChange={(e) => setNewSessionTitle(e.target.value)}
                                placeholder="Titre de la session (ex: AG 2024)"
                                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                            />
                            <input
                                type="date"
                                value={newSessionDate}
                                onChange={(e) => setNewSessionDate(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCreateSession(false)}
                                    className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleCreateSession}
                                    disabled={vote.saving || !newSessionTitle.trim()}
                                    className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {vote.saving ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Plus className="w-4 h-4" />
                                    )}
                                    Créer
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowCreateSession(true)}
                            className="w-full px-6 py-3 bg-purple-500 hover:bg-purple-400 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                        >
                            <Calendar className="w-5 h-5" />
                            Nouvelle Session de Vote
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-700 to-purple-800">
            {/* Saving indicator */}
            {vote.saving && (
                <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-purple-900/90 backdrop-blur rounded-lg text-white text-sm shadow-lg">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sauvegarde...
                </div>
            )}

            <VoteHeader
                date={vote.session?.session_date || new Date().toISOString()}
                setDate={() => { }} // TODO: Implement date update
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
                        onClick={() => setResetConfirm(true)}
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
                    resetPointVotes={() => { }} // TODO: Implement
                    updatePointArticle={() => { }} // TODO: Implement
                />
            </div>

            {/* Confirm reset modal */}
            <ConfirmModal
                isOpen={resetConfirm}
                onClose={() => setResetConfirm(false)}
                onConfirm={() => {
                    // TODO: Implement reset all votes
                    setResetConfirm(false);
                }}
                title="Reset tous les votes ?"
                message="Cette action effacera tous les votes enregistrés."
                confirmText="Effacer"
                variant="danger"
            />
        </div>
    );
}
