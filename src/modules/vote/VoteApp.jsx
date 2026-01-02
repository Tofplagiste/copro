/**
 * VoteApp - Calculateur Vote AG Copropriété
 * Page d'accueil : liste avec inline editing
 * Mode session : header avec changement facile
 */
import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    RotateCcw, Loader2, AlertCircle, Plus, ArrowLeft,
    Trash2, Pencil, FolderOpen, Save, X, RefreshCw,
    Vote, FileText, Search, Calendar, ChevronRight, Check
} from 'lucide-react';
import { ConfirmModal } from '../../components/Modal';
import Toast from '../../components/Toast';
import { useVoteSupabase } from './hooks/useVoteSupabase';
import { exportVotePdf } from './utils/pdfVote';
import VotePresenceSection from './components/VotePresenceSection';
import VotePointsList from './components/VotePointsList';

export default function VoteApp() {
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const vote = useVoteSupabase(selectedSessionId);

    // Search & filter
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [resetConfirm, setResetConfirm] = useState(false);
    const [showAddPoint, setShowAddPoint] = useState(false);
    const [showSessionPicker, setShowSessionPicker] = useState(false);

    // Inline editing state (for home page)
    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState('');
    const editInputRef = useRef(null);

    // Delete from home page
    const [deletingSession, setDeletingSession] = useState(null);

    // Form states
    const [newTitle, setNewTitle] = useState('');
    const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
    const [renameTitle, setRenameTitle] = useState('');
    const [newPointTitle, setNewPointTitle] = useState('');
    const [newPointArticle, setNewPointArticle] = useState('24');

    // Toast
    const [toast, setToast] = useState(null);

    const showToast = (message, variant = 'success') => {
        setToast({ message, variant });
    };

    // Filtered sessions for search
    const filteredSessions = useMemo(() => {
        if (!searchTerm.trim()) return vote.sessions;
        const term = searchTerm.toLowerCase();
        return vote.sessions.filter(s => s.title.toLowerCase().includes(term));
    }, [vote.sessions, searchTerm]);



    // Focus input when inline editing
    useEffect(() => {
        if (editingId && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.select();
        }
    }, [editingId]);

    const handleExportPdf = () => {
        if (!vote.session) return;
        exportVotePdf({
            title: vote.session.title,
            date: vote.session.session_date,
            copros: vote.copros,
            points: vote.points,
            presenceStats: vote.presenceStats,
            getPointResult: vote.getPointResult
        });
        showToast('PDF exporté');
    };

    const handleCreateSession = async () => {
        if (!newTitle.trim()) return;
        const result = await vote.createSession(newTitle.trim(), newDate);
        if (result.success) {
            setSelectedSessionId(result.sessionId);
            setShowCreateModal(false);
            setNewTitle('');
            showToast('Session créée');
        } else {
            showToast(result.error || 'Erreur', 'error');
        }
    };

    // Delete from home page
    const handleDeleteFromHome = async () => {
        if (!deletingSession) return;
        const result = await vote.deleteSession(deletingSession.id);
        if (result.success) {
            setDeletingSession(null);
            showToast('Session supprimée');
        }
    };

    // Delete from inside session
    const handleDeleteSession = async () => {
        if (!vote.session) return;
        const result = await vote.deleteSession(vote.session.id);
        if (result.success) {
            setSelectedSessionId(null);
            setShowDeleteConfirm(false);
            showToast('Session supprimée');
        }
    };

    // Inline rename from home page
    const startEditing = (session) => {
        setEditingId(session.id);
        setEditingTitle(session.title);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditingTitle('');
    };

    const saveInlineEdit = async () => {
        if (!editingId || !editingTitle.trim()) return;
        const result = await vote.renameSession(editingId, editingTitle.trim());
        if (result.success) {
            showToast('Renommé');
        }
        setEditingId(null);
        setEditingTitle('');
    };

    // Rename from inside session
    const handleRenameSession = async () => {
        if (!vote.session || !renameTitle.trim()) return;
        const result = await vote.renameSession(vote.session.id, renameTitle.trim());
        if (result.success) {
            setShowRenameModal(false);
            showToast('Session renommée');
        }
    };

    const handleAddPoint = async () => {
        if (!newPointTitle.trim()) return;
        const result = await vote.addPoint(newPointTitle.trim(), newPointArticle);
        if (result.success) {
            setShowAddPoint(false);
            setNewPointTitle('');
            setNewPointArticle('24');
            showToast('Point ajouté');
        }
    };

    const handleSelectSession = (id) => {
        setSelectedSessionId(id);
        setShowSessionPicker(false);
    };

    const handleResetAllVotes = async () => {
        await vote.resetAllVotes();
        setResetConfirm(false);
        showToast('Votes réinitialisés');
    };

    // Loading state
    if (vote.loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mx-auto mb-4" />
                    <p className="text-slate-400">Chargement...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (vote.error && !vote.sessions.length) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="bg-slate-800 rounded-xl p-8 max-w-md text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Erreur</h2>
                    <p className="text-slate-400 mb-6">{vote.error}</p>
                    <div className="flex gap-3 justify-center">
                        <Link to="/" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition flex items-center gap-2">
                            <ArrowLeft size={16} /> Hub
                        </Link>
                        <button onClick={() => vote.loadSessionsList()} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition flex items-center gap-2">
                            <RefreshCw size={16} /> Réessayer
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ========================================
    // HOME PAGE - No session selected
    // ========================================
    if (!selectedSessionId) {
        return (
            <div className="min-h-screen bg-slate-900">
                {/* Toast */}
                {toast && <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />}

                {/* Simple header */}
                <header className="bg-slate-800 border-b border-slate-700">
                    <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link to="/" className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition text-sm">
                                <ArrowLeft size={16} /> Hub
                            </Link>
                            <div className="flex items-center gap-2 text-white">
                                <Vote size={22} className="text-indigo-400" />
                                <span className="font-bold">Vote AG</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main content - centered list */}
                <div className="max-w-2xl mx-auto px-4 py-12">
                    {/* Title & action */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">Sessions de vote</h2>
                        {vote.sessions.length > 0 && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition"
                            >
                                <Plus size={18} />
                                Nouvelle
                            </button>
                        )}
                    </div>

                    {/* Search bar */}
                    {vote.sessions.length > 0 && (
                        <div className="relative mb-6">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Rechercher une session..."
                                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    )}

                    {/* Sessions list or empty state */}
                    {vote.sessions.length === 0 ? (
                        <div className="bg-slate-800/50 rounded-xl p-12 text-center">
                            <FolderOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">Aucune session</h3>
                            <p className="text-slate-400 mb-6">Créez votre première session de vote pour commencer.</p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
                            >
                                <Plus size={18} />
                                Nouvelle Session
                            </button>
                        </div>
                    ) : filteredSessions.length === 0 ? (
                        <div className="bg-slate-800/50 rounded-xl p-8 text-center">
                            <p className="text-slate-400">Aucun résultat pour "{searchTerm}"</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredSessions.map(session => (
                                <div
                                    key={session.id}
                                    className="bg-slate-800 border border-slate-700 hover:border-indigo-500 rounded-xl p-4 transition group"
                                >
                                    <div className="flex items-center justify-between gap-3 h-14">
                                        {/* Title area - inline edit or display */}
                                        <div className="flex-1 min-w-0">
                                            {editingId === session.id ? (
                                                <div className="flex flex-col">
                                                    <input
                                                        ref={editInputRef}
                                                        type="text"
                                                        value={editingTitle}
                                                        onChange={(e) => setEditingTitle(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') saveInlineEdit();
                                                            if (e.key === 'Escape') cancelEditing();
                                                        }}
                                                        className="w-full max-w-[300px] bg-slate-900/50 border border-indigo-500/50 rounded-md text-white font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-2 py-1"
                                                        placeholder="Nom de la session"
                                                    />
                                                    <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                                                        <Calendar size={14} />
                                                        {new Date(session.session_date).toLocaleDateString('fr-FR', {
                                                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                                        })}
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleSelectSession(session.id)}
                                                    className="text-left w-full group"
                                                >
                                                    <h3 className="font-semibold text-white group-hover:text-indigo-400 transition truncate">{session.title}</h3>
                                                    <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                                                        <Calendar size={14} />
                                                        {new Date(session.session_date).toLocaleDateString('fr-FR', {
                                                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                                        })}
                                                    </div>
                                                </button>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1">
                                            {editingId === session.id ? (
                                                <>
                                                    <button onClick={saveInlineEdit} className="p-2 text-green-400 hover:text-green-300 hover:bg-slate-700 rounded-lg transition" title="Valider">
                                                        <Check size={18} />
                                                    </button>
                                                    <button onClick={cancelEditing} className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded-lg transition" title="Annuler">
                                                        <X size={18} />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => startEditing(session)}
                                                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition opacity-0 group-hover:opacity-100"
                                                        title="Renommer"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletingSession({ id: session.id, title: session.title })}
                                                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition opacity-0 group-hover:opacity-100"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleSelectSession(session.id)}
                                                        className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-700 rounded-lg transition"
                                                        title="Ouvrir"
                                                    >
                                                        <ChevronRight size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Create Modal */}
                {showCreateModal && (
                    <CreateSessionModal
                        title={newTitle}
                        setTitle={setNewTitle}
                        date={newDate}
                        setDate={setNewDate}
                        onClose={() => setShowCreateModal(false)}
                        onCreate={handleCreateSession}
                        saving={vote.saving}
                    />
                )}

                {/* Delete Modal from home */}
                <ConfirmModal
                    isOpen={!!deletingSession}
                    onClose={() => setDeletingSession(null)}
                    onConfirm={handleDeleteFromHome}
                    title="Supprimer la session ?"
                    message={`"${deletingSession?.title}" sera définitivement supprimée.`}
                    confirmText="Supprimer"
                    variant="danger"
                />
            </div>
        );
    }

    // ========================================
    // SESSION VIEW - Session selected
    // ========================================
    return (
        <div className="min-h-screen bg-slate-900">
            {/* Toast */}
            {toast && <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />}

            {/* Saving indicator */}
            {vote.saving && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-indigo-900 text-white rounded-lg shadow-lg">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sauvegarde...
                </div>
            )}

            {/* Header with session switcher */}
            <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
                    <Link to="/" className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition text-sm">
                        <ArrowLeft size={16} /> Hub
                    </Link>

                    {/* Session selector dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowSessionPicker(!showSessionPicker)}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                        >
                            <Vote size={18} className="text-indigo-400" />
                            <span className="font-medium max-w-[200px] truncate">{vote.session?.title}</span>
                            <ChevronRight size={16} className={`transition ${showSessionPicker ? 'rotate-90' : ''}`} />
                        </button>

                        {showSessionPicker && (
                            <div className="absolute top-full left-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
                                {vote.sessions.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => handleSelectSession(s.id)}
                                        className={`w-full text-left px-4 py-3 hover:bg-slate-700 transition ${s.id === selectedSessionId ? 'bg-indigo-600/20 border-l-2 border-indigo-500' : ''
                                            }`}
                                    >
                                        <div className="font-medium text-white">{s.title}</div>
                                        <div className="text-xs text-slate-500">{new Date(s.session_date).toLocaleDateString('fr-FR')}</div>
                                    </button>
                                ))}
                                <button
                                    onClick={() => { setShowSessionPicker(false); setShowCreateModal(true); }}
                                    className="w-full text-left px-4 py-3 hover:bg-slate-700 text-indigo-400 border-t border-slate-700 flex items-center gap-2"
                                >
                                    <Plus size={16} /> Nouvelle session
                                </button>
                            </div>
                        )}
                    </div>

                    <span className="text-slate-500 text-sm">
                        {vote.copros.length} copropriétaires
                    </span>

                    <div className="flex items-center gap-2 ml-auto">
                        <button onClick={() => {
                            setRenameTitle(vote.session?.title || '');
                            setShowRenameModal(true);
                        }} className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg" title="Renommer">
                            <Pencil size={16} />
                        </button>
                        <button onClick={() => setShowDeleteConfirm(true)} className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg" title="Supprimer">
                            <Trash2 size={16} />
                        </button>
                        <button onClick={handleExportPdf} className="flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium">
                            <FileText size={16} /> PDF
                        </button>
                    </div>
                </div>
            </header>

            {/* Main content */}
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
                        onClick={() => setShowAddPoint(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Ajouter un point
                    </button>
                    <button
                        onClick={() => setResetConfirm(true)}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold flex items-center gap-2"
                    >
                        <RotateCcw size={18} />
                        Reset Votes
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
                    updatePointArticle={vote.updatePointArticle}
                    deletePoint={vote.deletePoint}
                />
            </div>

            {/* Modals */}
            {showCreateModal && (
                <CreateSessionModal
                    title={newTitle}
                    setTitle={setNewTitle}
                    date={newDate}
                    setDate={setNewDate}
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreateSession}
                    saving={vote.saving}
                />
            )}

            {showRenameModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 shadow-2xl w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Renommer</h3>
                            <button onClick={() => setShowRenameModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <input
                            type="text"
                            value={renameTitle}
                            onChange={(e) => setRenameTitle(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleRenameSession()}
                        />
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowRenameModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
                            <button onClick={handleRenameSession} disabled={!renameTitle.trim() || vote.saving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 flex items-center gap-2">
                                {vote.saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />} Sauvegarder
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAddPoint && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 shadow-2xl w-full max-w-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Nouveau point de vote</h3>
                            <button onClick={() => setShowAddPoint(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                                <input type="text" value={newPointTitle} onChange={(e) => setNewPointTitle(e.target.value)} placeholder="Ex: Élection du Bureau de Séance" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500" autoFocus onKeyDown={(e) => e.key === 'Enter' && handleAddPoint()} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Article</label>
                                <select value={newPointArticle} onChange={(e) => setNewPointArticle(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500">
                                    <option value="24">Art. 24 - Majorité simple</option>
                                    <option value="25">Art. 25 - Majorité absolue</option>
                                    <option value="26">Art. 26 - Double majorité (2/3)</option>
                                    <option value="unanimite">Unanimité</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowAddPoint(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
                            <button onClick={handleAddPoint} disabled={!newPointTitle.trim() || vote.saving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 flex items-center gap-2">
                                {vote.saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus size={16} />} Ajouter
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={handleDeleteSession} title="Supprimer ?" message={`"${vote.session?.title}" sera supprimée.`} confirmText="Supprimer" variant="danger" />
            <ConfirmModal isOpen={resetConfirm} onClose={() => setResetConfirm(false)} onConfirm={handleResetAllVotes} title="Reset votes ?" message="Tous les votes seront effacés." confirmText="Effacer" variant="danger" />
        </div>
    );
}

// Reusable Create Modal
function CreateSessionModal({ title, setTitle, date, setDate, onClose, onCreate, saving }) {
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Nouvelle Session</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: AG Ordinaire 2024" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500" autoFocus onKeyDown={(e) => e.key === 'Enter' && onCreate()} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500" />
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
                    <button onClick={onCreate} disabled={!title.trim() || saving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 flex items-center gap-2">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus size={16} />} Créer
                    </button>
                </div>
            </div>
        </div>
    );
}
