
/**
 * FinanceTab - Onglet Comptabilité
 */
import { useState } from 'react';
import { Plus, Calculator, Trash2, Pencil, Check, Filter } from 'lucide-react';

import { useFinanceSupabaseAdapter } from '../hooks/useFinanceSupabaseAdapter';
import { fmtMoney, fmtDateFR, getTodayISO } from '../../../utils/formatters';
import FinancialCharts from '../components/finance/FinancialCharts';
import VentilationModal from '../components/finance/VentilationModal';
import { ConfirmModal } from '../../../components/Modal';

export default function FinanceTab() {
    // Phase 4 : Migration Supabase (via Adapter)
    const {
        accounts,
        operations,
        categories,
        addOperation,
        updateOperation,
        deleteOperation,
        updateAccount // Pour le pointage (real_balance)
    } = useFinanceSupabaseAdapter();

    const [showForm, setShowForm] = useState(false);
    const [editingOp, setEditingOp] = useState(null);
    const [filterAccount, setFilterAccount] = useState(null);

    // Deletion Modal State
    const [deleteModal, setDeleteModal] = useState({ open: false, opId: null });

    // New States
    const [dateFrom, setDateFrom] = useState(''); // Par défaut : tout afficher
    const [dateTo, setDateTo] = useState('');
    const [showVentilation, setShowVentilation] = useState(false);

    // Calcul solde par compte (Global)
    const getAccountBalance = (accId) => {
        const acc = accounts.find(a => a.id === accId);
        let bal = parseFloat(acc?.initial_balance || 0); // Utiliser initial_balance de Supabase
        operations.forEach(op => {
            if (op.account === accId) {
                bal += op.type === 'recette' ? op.amount : -op.amount;
            }
        });
        return bal;
    };

    // Update Real Balance (Pointage)
    const handleUpdateRealBalance = (accId, val) => {
        const newVal = parseFloat(val);
        // Update via Supabase Context
        updateAccount(accId, { real_balance: isNaN(newVal) ? 0 : newVal });
    };

    // Ajout/modification opération
    const handleSaveOp = (op) => {
        const opData = {
            ...op,
            amount: parseFloat(op.amount) || 0
        };

        if (editingOp) {
            updateOperation(op.id, opData);
        } else {
            addOperation(opData);
        }

        setShowForm(false);
        setEditingOp(null);
    };

    // Suppression opération (Confirmée par Modal)
    const confirmDeleteOp = () => {
        if (deleteModal.opId) {
            deleteOperation(deleteModal.opId);
            setDeleteModal({ open: false, opId: null });

            // If deleting the currently edited op, reset form
            if (editingOp && editingOp.id === deleteModal.opId) {
                setEditingOp(null);
                setShowForm(false);
            }
        }
    };

    // Save Ventilation (Multi-ops)
    const handleSaveVentilation = (data) => {
        data.parts.forEach((part) => {
            if (part.amount > 0) {
                addOperation({
                    date: data.date,
                    account: data.account,
                    type: 'depense',
                    category: part.category,
                    label: part.label,
                    amount: part.amount
                });
            }
        });
    };

    // Filtrage
    const getFilteredOperations = () => {
        let ops = operations;

        // 1. Account Filter
        if (filterAccount) {
            ops = ops.filter(op => op.account === filterAccount);
        }

        // 2. Date Filter
        if (dateFrom) {
            ops = ops.filter(op => op.date >= dateFrom);
        }
        if (dateTo) {
            ops = ops.filter(op => op.date <= dateTo);
        }

        return ops;
    };

    const filteredOps = getFilteredOperations();

    // Tri par date décroissante
    const sortedOps = [...filteredOps].sort((a, b) =>
        new Date(b.date) - new Date(a.date)
    );

    // Selected Account Data for Pointage
    const selectedAccountData = filterAccount ? accounts.find(a => a.id === filterAccount) : null;
    const selectedBalance = selectedAccountData ? getAccountBalance(filterAccount) : 0;
    const realBalance = selectedAccountData ? (selectedAccountData.real_balance !== undefined ? selectedAccountData.real_balance : '') : '';
    const ecart = selectedAccountData && realBalance !== '' ? (selectedBalance - realBalance) : 0;

    return (
        <div className="p-6 space-y-6">
            <VentilationModal
                isOpen={showVentilation}
                onClose={() => setShowVentilation(false)}
                onSave={handleSaveVentilation}
                accounts={accounts}
            />

            <ConfirmModal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, opId: null })}
                onConfirm={confirmDeleteOp}
                title="Supprimer l'opération"
                message="Êtes-vous sûr de vouloir supprimer cette opération définitivement ?"
                confirmText="Supprimer"
                variant="danger"
            />

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {accounts.map(acc => {
                    const balance = getAccountBalance(acc.id);
                    const isActive = filterAccount === acc.id;
                    return (
                        <div
                            key={acc.id}
                            onClick={() => setFilterAccount(isActive ? null : acc.id)}
                            className={`
                                p-4 rounded-xl shadow-sm border-2 cursor-pointer transition-all hover:shadow-md
                                ${isActive
                                    ? 'border-blue-600 bg-white ring-2 ring-blue-600'
                                    : 'border-blue-200 bg-white hover:border-blue-400'
                                }
                            `}
                        >
                            <div className={`${isActive ? 'text-blue-800' : 'text-gray-700'} font-bold border-b pb-2 mb-2`}>{acc.name}</div>
                            <div className={`text-2xl font-bold ${isActive ? 'text-blue-600' : 'text-blue-500'}`}>{fmtMoney(balance)} €</div>
                        </div>
                    );
                })}
            </div>

            {/* Pointage Section (Only if account selected) */}
            {selectedAccountData && (
                <div className="bg-orange-50 rounded-xl border border-orange-200 p-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-fadeIn">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                            <Check size={20} strokeWidth={3} />
                        </div>
                        <div>
                            <span className="font-bold text-gray-800 text-lg">Pointage : {selectedAccountData.name}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-white p-2 rounded-lg shadow-sm border border-orange-100">
                        <div className="text-right px-4 border-r">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Solde Calculé</div>
                            <div className="text-xl font-bold text-blue-600">{fmtMoney(selectedBalance)} €</div>
                        </div>

                        <div className="text-right px-2">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Solde Réel</div>
                            <input
                                type="number"
                                value={realBalance}
                                onChange={e => handleUpdateRealBalance(filterAccount, e.target.value)}
                                className="w-32 text-right font-bold text-gray-800 border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                                placeholder="0.00"
                                step="0.01"
                            />
                        </div>

                        <div className="text-right px-4 border-l">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Écart</div>
                            <div className={`text-xl font-bold ${Math.abs(ecart) < 0.01 ? 'text-green-500' : 'text-red-500'}`}>
                                {fmtMoney(ecart)} €
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Analyse Visuelle */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4 px-2 border-l-4 border-amber-500">Analyse Visuelle</h3>
                <FinancialCharts operations={filteredOps} />
            </div>

            {/* Journal Card */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b flex flex-wrap justify-between items-center gap-3">
                    <div className="flex items-center gap-4 flex-wrap">
                        <span className="font-bold text-gray-700 flex items-center gap-2">
                            <ListOrderedIcon /> Journal des Opérations
                        </span>

                        {/* Date Filter */}
                        <div className="flex items-center gap-2 bg-white px-2 py-1 rounded border shadow-sm text-sm">
                            <span className="text-gray-500 font-medium">Du</span>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={e => setDateFrom(e.target.value)}
                                className="border-none p-0 text-gray-700 font-bold focus:ring-0 cursor-pointer w-28"
                            />
                            <span className="text-gray-500 font-medium border-l pl-2">Au</span>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={e => setDateTo(e.target.value)}
                                className="border-none p-0 text-gray-700 font-bold focus:ring-0 cursor-pointer w-28"
                            />
                        </div>

                        {filterAccount && (
                            <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center gap-1 font-bold border border-blue-200">
                                🏦 {accounts.find(a => a.id === filterAccount)?.name}
                                <button className="ml-2 w-5 h-5 flex items-center justify-center bg-blue-200 rounded-full text-blue-800 hover:bg-blue-300 transition-colors" onClick={() => setFilterAccount(null)}>✕</button>
                            </span>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowVentilation(true)}
                            className="px-3 py-1.5 bg-white border border-blue-600 text-blue-600 rounded-lg flex items-center gap-1 text-sm hover:bg-blue-50 font-bold transition-colors"
                        >
                            <Calculator size={16} /> Ventiler
                        </button>
                        <button
                            onClick={() => { setShowForm(!showForm); setEditingOp(null); }}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg flex items-center gap-1 text-sm hover:bg-blue-500 font-bold shadow-sm transition-colors"
                        >
                            <Plus size={16} /> Ajouter
                        </button>
                    </div>
                </div>

                {/* Add/Edit Form */}
                {showForm && (
                    <OperationForm
                        accounts={accounts}
                        categories={categories}
                        initialData={editingOp}
                        onSave={handleSaveOp}
                        onCancel={() => { setShowForm(false); setEditingOp(null); }}
                    />
                )}

                {/* Operations Table */}
                <div className="overflow-x-auto" style={{ maxHeight: 600 }}>
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                            <tr>
                                {/* Pointage Column Removed */}
                                <th className="px-3 py-2 text-left pl-4">Date</th>
                                <th className="px-3 py-2 text-left">Compte</th>
                                <th className="px-3 py-2 text-left">Poste</th>
                                <th className="px-3 py-2 text-left">Libellé</th>
                                <th className="px-3 py-2 text-right">Recette</th>
                                <th className="px-3 py-2 text-right">Dépense</th>
                                <th className="px-3 py-2" style={{ width: 60 }}></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {sortedOps.map(op => {
                                const isEditing = editingOp && editingOp.id === op.id;
                                return (
                                    <tr
                                        key={op.id}
                                        className={`
                                            transition-colors group
                                            ${isEditing ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50 border-l-4 border-transparent'}
                                        `}
                                    >
                                        <td className="px-3 py-2 text-gray-600 font-mono pl-4">{fmtDateFR(op.date)}</td>
                                        <td className="px-3 py-2 text-gray-500 text-xs">{op.account}</td>
                                        <td className="px-3 py-2 text-gray-500 text-xs bg-gray-50 rounded px-1">{op.category}</td>
                                        <td className={`px-3 py-2 font-medium ${isEditing ? 'text-blue-800' : 'text-gray-800'}`}>
                                            {op.label}
                                            {isEditing && <span className="ml-2 text-[10px] text-blue-500 uppercase font-bold bg-blue-100 px-1 rounded">En cours...</span>}
                                        </td>
                                        <td className="px-3 py-2 text-right font-bold text-green-600">
                                            {op.type === 'recette' ? fmtMoney(op.amount) : ''}
                                        </td>
                                        <td className="px-3 py-2 text-right font-bold text-red-600">
                                            {op.type === 'depense' ? fmtMoney(op.amount) : ''}
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            <div className="flex gap-1 justify-end opacity-100">
                                                <button
                                                    onClick={() => { setEditingOp(op); setShowForm(true); }}
                                                    className={`p-1.5 rounded transition-colors ${isEditing ? 'bg-blue-200 text-blue-700' : 'text-blue-500 hover:bg-blue-100'}`}
                                                    title="Modifier"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteModal({ open: true, opId: op.id })}
                                                    className="p-1.5 text-red-400 hover:bg-red-100 rounded transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {sortedOps.length === 0 && (
                                <tr className="h-64">
                                    <td colSpan={7}>
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                                            <Filter size={48} className="text-gray-300" />
                                            <span className="text-lg font-medium">Aucune opération sur cette période</span>
                                            {filterAccount || dateFrom || dateTo ? (
                                                <button
                                                    onClick={() => { setFilterAccount(null); setDateFrom(''); setDateTo(''); }}
                                                    className="text-sm text-blue-500 hover:underline"
                                                >
                                                    Effacer les filtres
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => { setShowForm(true); }}
                                                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                                >
                                                    + Ajouter une opération
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// Icon helper
const ListOrderedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" x2="21" y1="6" y2="6" /><line x1="10" x2="21" y1="12" y2="12" /><line x1="10" x2="21" y1="18" y2="18" /><path d="M4 6h1v4" /><path d="M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" /></svg>
);

// Sub-component: Operation Form
function OperationForm({ accounts, categories, initialData, onSave, onCancel }) {
    const [form, setForm] = useState(initialData || {
        date: getTodayISO(),
        account: accounts[0]?.id || '',
        type: 'depense',
        category: categories[0]?.code || '',
        label: '',
        amount: ''
    });

    const isEditMode = !!initialData;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
    };

    return (
        <form onSubmit={handleSubmit} className={`p-4 border-b border-blue-100 animate-slideDown ${isEditMode ? 'bg-amber-50 border-l-4 border-l-amber-500' : 'bg-blue-50 border-l-4 border-l-blue-500'}`}>
            <div className="flex items-center justify-between mb-3">
                <h4 className={`text-sm font-bold flex items-center gap-2 ${isEditMode ? 'text-amber-700' : 'text-blue-700'}`}>
                    {isEditMode ? <><Pencil size={16} /> Modifier l'opération</> : <><Plus size={16} /> Nouvelle opération</>}
                </h4>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
                <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Date</label>
                    <input
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Compte</label>
                    <select
                        value={form.account}
                        onChange={(e) => setForm({ ...form, account: e.target.value })}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Type</label>
                    <select
                        value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="depense">Dépense (-)</option>
                        <option value="recette">Recette (+)</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Poste</label>
                    <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        {categories.map(c => <option key={c.code} value={c.code}>{c.code} - {c.label}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Montant</label>
                    <input
                        type="number"
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                        step="0.01"
                        required
                    />
                </div>
                <div className="flex gap-2">
                    <button type="submit" className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-500 shadow-sm transition-colors" title="Valider">
                        <Check size={18} />
                    </button>
                    <button type="button" onClick={onCancel} className="px-3 py-1.5 bg-gray-400 text-white rounded hover:bg-gray-500 shadow-sm transition-colors" title="Annuler">
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
            <div className="mt-2">
                <input
                    type="text"
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    placeholder="Libellé..."
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>
        </form>
    );
}
