/**
 * CreditApp - Simulateur de Crédit Copropriété
 * Page d'accueil : liste avec inline editing
 * Mode simulation : header avec changement facile
 */
import { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCreditSupabase } from './hooks/useCreditSupabase';
import { COPROPRIETAIRES } from './data/coproprietaires';
import { exportCreditPdf } from './utils/pdfCredit';
import CreditParametersForm from './components/CreditParametersForm';
import CreditAmountsForm from './components/CreditAmountsForm';
import CreditOwnersList from './components/CreditOwnersList';
import CreditRepartitionTable from './components/CreditRepartitionTable';
import CreditSummary from './components/CreditSummary';
import Toast from '../../components/Toast';
import { ConfirmModal } from '../../components/Modal';
import {
    Plus, Save, Trash2, Loader2, FolderOpen, AlertCircle,
    ArrowLeft, Calculator, FileText, Pencil, X, Search, ChevronRight, RefreshCw, Check
} from 'lucide-react';

export default function CreditApp() {
    const [selectedSimulationId, setSelectedSimulationId] = useState(null);
    const credit = useCreditSupabase(selectedSimulationId);

    // Search & filter
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [showNewModal, setShowNewModal] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showSimPicker, setShowSimPicker] = useState(false);

    // Inline editing state (for home page)
    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState('');
    const editInputRef = useRef(null);

    // Delete from home page
    const [deletingSim, setDeletingSim] = useState(null); // { id, title }

    // Form states
    const [newTitle, setNewTitle] = useState('');
    const [renameTitle, setRenameTitle] = useState('');

    // Toast
    const [toast, setToast] = useState(null);

    const showToast = (message, variant = 'success') => {
        setToast({ message, variant });
    };

    // Filtered simulations
    const filteredSimulations = useMemo(() => {
        if (!searchTerm.trim()) return credit.simulations;
        const term = searchTerm.toLowerCase();
        return credit.simulations.filter(s => s.title.toLowerCase().includes(term));
    }, [credit.simulations, searchTerm]);

    // Sync rename title
    useEffect(() => {
        if (credit.simulation) {
            setRenameTitle(credit.simulation.title);
        }
    }, [credit.simulation?.title, credit.simulation?.id]);

    // Focus input when inline editing
    useEffect(() => {
        if (editingId && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.select();
        }
    }, [editingId]);

    const handleExportPdf = () => {
        if (!credit.simulation) return;
        exportCreditPdf({
            title: credit.simulation.title,
            duree: credit.duree,
            tauxNominal: credit.tauxNominal,
            tauxAssurance: credit.tauxAssurance,
            montantTotal: credit.montantTotal,
            fondsTravaux: credit.fondsTravaux,
            repartition: credit.repartition,
            totaux: credit.totaux
        });
        showToast('PDF exporté');
    };

    const handleCreateSimulation = async () => {
        if (!newTitle.trim()) return;
        const result = await credit.createSimulation(newTitle.trim(), COPROPRIETAIRES);
        if (result.success) {
            setSelectedSimulationId(result.simulationId);
            setShowNewModal(false);
            setNewTitle('');
            showToast('Simulation créée');
        } else {
            showToast(result.error || 'Erreur', 'error');
        }
    };

    const handleSave = async () => {
        const result = await credit.saveSimulationParams();
        if (result?.success !== false) {
            showToast('Paramètres sauvegardés');
        } else {
            showToast('Erreur de sauvegarde', 'error');
        }
    };

    // Inline rename from home page
    const startEditing = (sim) => {
        setEditingId(sim.id);
        setEditingTitle(sim.title);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditingTitle('');
    };

    const saveInlineEdit = async () => {
        if (!editingId || !editingTitle.trim()) return;
        // Use the new renameSimulation function
        const result = await credit.renameSimulation(editingId, editingTitle.trim());
        if (result.success) {
            showToast('Renommé');
        }
        setEditingId(null);
        setEditingTitle('');
    };

    // Rename from inside simulation
    const handleRenameSimulation = async () => {
        if (!credit.simulation || !renameTitle.trim()) return;
        const result = await credit.renameSimulation(credit.simulation.id, renameTitle.trim());
        if (result.success) {
            setShowRenameModal(false);
            showToast('Simualtion renommée');
        }
    };

    // Delete from home page
    const handleDeleteFromHome = async () => {
        if (!deletingSim) return;
        await credit.deleteSimulation(deletingSim.id);
        setDeletingSim(null);
        showToast('Simulation supprimée');
    };

    // Delete from inside simulation
    const handleDeleteSimulation = async () => {
        if (!credit.simulation) return;
        await credit.deleteSimulation(credit.simulation.id);
        setSelectedSimulationId(null);
        setShowDeleteConfirm(false);
        showToast('Simulation supprimée');
    };

    const handleSelectSimulation = (id) => {
        setSelectedSimulationId(id);
        setShowSimPicker(false);
    };

    // Loading state
    if (credit.loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-100 flex items-center justify-center">
                <div className="bg-white rounded-xl p-8 shadow-lg flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                    <p className="text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (credit.error && !credit.simulations.length) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-100 flex items-center justify-center">
                <div className="bg-white rounded-xl p-8 shadow-lg flex flex-col items-center gap-4 max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                    <p className="text-red-600 text-center">{credit.error}</p>
                    <div className="flex gap-3">
                        <Link to="/" className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg flex items-center gap-2">
                            <ArrowLeft size={16} /> Hub
                        </Link>
                        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                            <RefreshCw size={16} /> Réessayer
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ========================================
    // HOME PAGE - No simulation selected
    // ========================================
    if (!selectedSimulationId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-100">
                {/* Toast */}
                {toast && <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />}

                {/* Simple header */}
                <header className="bg-white shadow-sm border-b">
                    <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link to="/" className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition text-sm text-slate-600">
                                <ArrowLeft size={16} /> Hub
                            </Link>
                            <div className="flex items-center gap-2">
                                <Calculator size={22} className="text-indigo-600" />
                                <span className="font-bold text-slate-800">Simulateur Crédit</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main content - centered list */}
                <div className="max-w-2xl mx-auto px-4 py-12">
                    {/* Title & action - only show button if simulations exist */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">Mes simulations</h2>
                        {credit.simulations.length > 0 && (
                            <button
                                onClick={() => setShowNewModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition"
                            >
                                <Plus size={18} />
                                Nouvelle
                            </button>
                        )}
                    </div>

                    {/* Search bar */}
                    {credit.simulations.length > 0 && (
                        <div className="relative mb-6">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Rechercher une simulation..."
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    )}

                    {/* Simulations list or empty state */}
                    {credit.simulations.length === 0 ? (
                        <div className="bg-white rounded-xl p-12 text-center shadow-lg">
                            <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-700 mb-2">Aucune simulation</h3>
                            <p className="text-gray-500 mb-6">Créez votre première simulation de crédit.</p>
                            <button
                                onClick={() => setShowNewModal(true)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
                            >
                                <Plus size={18} />
                                Nouvelle Simulation
                            </button>
                        </div>
                    ) : filteredSimulations.length === 0 ? (
                        <div className="bg-white rounded-xl p-8 text-center shadow-lg">
                            <p className="text-gray-500">Aucun résultat pour "{searchTerm}"</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredSimulations.map(sim => (
                                <div
                                    key={sim.id}
                                    className="bg-white border border-gray-200 hover:border-indigo-300 rounded-xl p-4 shadow-sm transition group"
                                >
                                    <div className="flex items-center justify-between gap-3 h-14">
                                        {/* Title area - inline edit or display */}
                                        <div className="flex-1 min-w-0">
                                            {editingId === sim.id ? (
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
                                                        className="w-full max-w-[300px] bg-white border border-indigo-500/50 rounded-md text-slate-800 font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-2 py-1"
                                                        placeholder="Nom de la simulation"
                                                    />
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        Modifié le {new Date(sim.updated_at).toLocaleDateString('fr-FR')}
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleSelectSimulation(sim.id)}
                                                    className="text-left w-full group"
                                                >
                                                    <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition truncate">{sim.title}</h3>
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        Modifié le {new Date(sim.updated_at).toLocaleDateString('fr-FR')}
                                                    </div>
                                                </button>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            {editingId === sim.id ? (
                                                <>
                                                    <button onClick={saveInlineEdit} className="p-2 text-green-600 hover:text-green-500 hover:bg-gray-100 rounded-lg transition" title="Valider">
                                                        <Check size={18} />
                                                    </button>
                                                    <button onClick={cancelEditing} className="p-2 text-red-500 hover:text-red-400 hover:bg-gray-100 rounded-lg transition" title="Annuler">
                                                        <X size={18} />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => startEditing(sim)}
                                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition opacity-0 group-hover:opacity-100"
                                                        title="Renommer"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletingSim({ id: sim.id, title: sim.title })}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-lg transition opacity-0 group-hover:opacity-100"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleSelectSimulation(sim.id)}
                                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition"
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
                {showNewModal && (
                    <CreateSimulationModal
                        title={newTitle}
                        setTitle={setNewTitle}
                        onClose={() => setShowNewModal(false)}
                        onCreate={handleCreateSimulation}
                        saving={credit.saving}
                    />
                )}

                {/* Delete Modal from home */}
                <ConfirmModal
                    isOpen={!!deletingSim}
                    onClose={() => setDeletingSim(null)}
                    onConfirm={handleDeleteFromHome}
                    title="Supprimer la simulation ?"
                    message={`"${deletingSim?.title}" sera définitivement supprimée.`}
                    confirmText="Supprimer"
                    variant="danger"
                />
            </div>
        );
    }

    // ========================================
    // SIMULATION VIEW - Simulation selected
    // ========================================
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-100">
            {/* Toast */}
            {toast && <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />}

            {/* Saving indicator */}
            {credit.saving && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-indigo-900 text-white rounded-lg shadow-lg">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sauvegarde...
                </div>
            )}

            {/* Header with simulation switcher */}
            <header className="bg-white shadow-sm border-b sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
                    <Link to="/" className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition text-sm text-slate-600">
                        <ArrowLeft size={16} /> Hub
                    </Link>

                    {/* Simulation selector dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowSimPicker(!showSimPicker)}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                        >
                            <Calculator size={18} className="text-indigo-600" />
                            <span className="font-medium text-slate-800 max-w-[200px] truncate">{credit.simulation?.title}</span>
                            <ChevronRight size={16} className={`text-gray-500 transition ${showSimPicker ? 'rotate-90' : ''}`} />
                        </button>

                        {showSimPicker && (
                            <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
                                {credit.simulations.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => handleSelectSimulation(s.id)}
                                        className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition ${s.id === selectedSimulationId ? 'bg-indigo-50 border-l-2 border-indigo-500' : ''
                                            }`}
                                    >
                                        <div className="font-medium text-slate-800">{s.title}</div>
                                        <div className="text-xs text-gray-500">{new Date(s.updated_at).toLocaleDateString('fr-FR')}</div>
                                    </button>
                                ))}
                                <button
                                    onClick={() => { setShowSimPicker(false); setShowNewModal(true); }}
                                    className="w-full text-left px-4 py-3 hover:bg-slate-50 text-indigo-600 border-t border-gray-200 flex items-center gap-2"
                                >
                                    <Plus size={16} /> Nouvelle simulation
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                        <button
                            onClick={handleSave}
                            disabled={credit.saving}
                            className="flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                            title="Sauvegarder les paramètres"
                        >
                            <Save size={16} />
                        </button>
                        <button onClick={() => setShowRenameModal(true)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg" title="Renommer">
                            <Pencil size={16} className="text-gray-600" />
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

            {/* Main Content */}
            <div className="max-w-7xl mx-auto p-6 space-y-6">
                <CreditParametersForm
                    duree={credit.duree} setDuree={credit.setDuree}
                    tauxNominal={credit.tauxNominal} setTauxNominal={credit.setTauxNominal}
                    tauxAssurance={credit.tauxAssurance} setTauxAssurance={credit.setTauxAssurance}
                    fondsTravaux={credit.fondsTravaux} setFondsTravaux={credit.setFondsTravaux}
                    montantTotal={credit.montantTotal}
                />

                <CreditAmountsForm
                    partiesCommunes={credit.partiesCommunes} setPartiesCommunes={credit.setPartiesCommunes}
                    grandBalcon={credit.grandBalcon} setGrandBalcon={credit.setGrandBalcon}
                    petitsBalcons={credit.petitsBalcons} setPetitsBalcons={credit.setPetitsBalcons}
                    celliers={credit.celliers} setCelliers={credit.setCelliers}
                />

                <CreditOwnersList
                    copros={credit.copros}
                    updateCopro={credit.updateCopro}
                />

                <CreditRepartitionTable repartition={credit.repartition} />

                <CreditSummary totaux={credit.totaux} />
            </div>

            {/* Create Modal */}
            {showNewModal && (
                <CreateSimulationModal
                    title={newTitle}
                    setTitle={setNewTitle}
                    onClose={() => setShowNewModal(false)}
                    onCreate={handleCreateSimulation}
                    saving={credit.saving}
                />
            )}

            {/* Rename Modal */}
            {showRenameModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
                            onKeyDown={(e) => e.key === 'Enter' && handleRenameSimulation()}
                        />
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowRenameModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
                            <button onClick={handleRenameSimulation} disabled={!renameTitle.trim() || credit.saving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 flex items-center gap-2">
                                {credit.saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />} Sauvegarder
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteSimulation}
                title="Supprimer la simulation ?"
                message={`"${credit.simulation?.title}" sera définitivement supprimée.`}
                confirmText="Supprimer"
                variant="danger"
            />
        </div>
    );
}

// Reusable Create Modal
function CreateSimulationModal({ title, setTitle, onClose, onCreate, saving }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Nouvelle Simulation</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nom de la simulation..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && onCreate()}
                />
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
