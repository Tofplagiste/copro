/**
 * FinanceTab - Onglet Comptabilité
 */
import { useState } from 'react';
import { Plus, Calculator, Trash2, Pencil, Check } from 'lucide-react';
import { useCopro } from '../../context/CoproContext';
import { fmtMoney, fmtDateFR, getTodayISO } from '../../utils/formatters';

export default function FinanceTab() {
    const { state, updateState } = useCopro();
    const [showForm, setShowForm] = useState(false);
    const [editingOp, setEditingOp] = useState(null);
    const [filterAccount, setFilterAccount] = useState(null);

    const accounts = state.accounts || [];
    const operations = state.finance?.operations || [];
    const categories = state.categories || [];

    // Calcul solde par compte
    const getAccountBalance = (accId) => {
        const acc = accounts.find(a => a.id === accId);
        let bal = acc?.initial || 0;
        operations.forEach(op => {
            if (op.account === accId) {
                bal += op.type === 'recette' ? op.amount : -op.amount;
            }
        });
        return bal;
    };

    // Ajout/modification opération
    const handleSaveOp = (op) => {
        const newOp = {
            ...op,
            id: op.id || Date.now() + Math.random(),
            amount: parseFloat(op.amount) || 0,
            pointed: op.pointed || false
        };

        let newOps;
        if (editingOp) {
            newOps = operations.map(o => o.id === op.id ? newOp : o);
        } else {
            newOps = [...operations, newOp];
        }

        updateState({ finance: { ...state.finance, operations: newOps } });
        setShowForm(false);
        setEditingOp(null);
    };

    // Suppression opération
    const handleDeleteOp = (id) => {
        if (window.confirm('Supprimer cette opération ?')) {
            const newOps = operations.filter(o => o.id !== id);
            updateState({ finance: { ...state.finance, operations: newOps } });
        }
    };

    // Toggle pointage
    const togglePointed = (id) => {
        const newOps = operations.map(o =>
            o.id === id ? { ...o, pointed: !o.pointed } : o
        );
        updateState({ finance: { ...state.finance, operations: newOps } });
    };

    // Filtrage par compte
    const filteredOps = filterAccount
        ? operations.filter(op => op.account === filterAccount)
        : operations;

    // Tri par date décroissante
    const sortedOps = [...filteredOps].sort((a, b) =>
        new Date(b.date) - new Date(a.date)
    );

    return (
        <div className="p-6 space-y-4">
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
                bg-white p-4 rounded-xl shadow-sm border-2 cursor-pointer transition-all hover:shadow-md
                ${isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}
              `}
                        >
                            <div className="font-bold text-gray-700 border-b pb-2 mb-2">{acc.name}</div>
                            <div className="text-2xl font-bold text-blue-600">{fmtMoney(balance)} €</div>
                        </div>
                    );
                })}
            </div>

            {/* Journal Card */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <span className="font-bold text-gray-700">📋 Journal des Opérations</span>
                        {filterAccount && (
                            <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                Filtre: {accounts.find(a => a.id === filterAccount)?.name}
                                <button className="ml-2 text-blue-500" onClick={() => setFilterAccount(null)}>✕</button>
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => { setShowForm(!showForm); setEditingOp(null); }}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg flex items-center gap-1 text-sm hover:bg-blue-500"
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
                <div className="overflow-x-auto" style={{ maxHeight: 500 }}>
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 sticky top-0">
                            <tr>
                                <th className="px-3 py-2 text-center" style={{ width: 40 }}>Pt.</th>
                                <th className="px-3 py-2 text-left">Date</th>
                                <th className="px-3 py-2 text-left">Compte</th>
                                <th className="px-3 py-2 text-left">Poste</th>
                                <th className="px-3 py-2 text-left">Libellé</th>
                                <th className="px-3 py-2 text-right">Recette</th>
                                <th className="px-3 py-2 text-right">Dépense</th>
                                <th className="px-3 py-2" style={{ width: 60 }}></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {sortedOps.map(op => (
                                <tr key={op.id} className={`hover:bg-gray-50 ${op.pointed ? 'bg-green-50' : ''}`}>
                                    <td className="px-3 py-2 text-center">
                                        <button
                                            onClick={() => togglePointed(op.id)}
                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                        ${op.pointed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}
                                        >
                                            {op.pointed && <Check size={12} />}
                                        </button>
                                    </td>
                                    <td className="px-3 py-2">{fmtDateFR(op.date)}</td>
                                    <td className="px-3 py-2 text-gray-500">{op.account}</td>
                                    <td className="px-3 py-2 text-gray-500">{op.category}</td>
                                    <td className="px-3 py-2">{op.label}</td>
                                    <td className="px-3 py-2 text-right font-bold text-green-600">
                                        {op.type === 'recette' ? fmtMoney(op.amount) : ''}
                                    </td>
                                    <td className="px-3 py-2 text-right font-bold text-red-600">
                                        {op.type === 'depense' ? fmtMoney(op.amount) : ''}
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => { setEditingOp(op); setShowForm(true); }}
                                                className="p-1 text-blue-500 hover:text-blue-700"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteOp(op.id)}
                                                className="p-1 text-red-400 hover:text-red-600"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {sortedOps.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                                        Aucune opération enregistrée
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

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 border-b">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
                <div>
                    <label className="text-xs font-bold text-gray-500">Date</label>
                    <input
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        className="w-full px-2 py-1.5 border rounded"
                        required
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500">Compte</label>
                    <select
                        value={form.account}
                        onChange={(e) => setForm({ ...form, account: e.target.value })}
                        className="w-full px-2 py-1.5 border rounded"
                    >
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500">Type</label>
                    <select
                        value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                        className="w-full px-2 py-1.5 border rounded"
                    >
                        <option value="depense">Dépense (-)</option>
                        <option value="recette">Recette (+)</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500">Poste</label>
                    <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full px-2 py-1.5 border rounded"
                    >
                        {categories.map(c => <option key={c.code} value={c.code}>{c.code} - {c.label}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500">Montant</label>
                    <input
                        type="number"
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                        className="w-full px-2 py-1.5 border rounded text-right"
                        step="0.01"
                        required
                    />
                </div>
                <div className="flex gap-2">
                    <button type="submit" className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-500">
                        <Check size={18} />
                    </button>
                    <button type="button" onClick={onCancel} className="px-3 py-1.5 bg-gray-400 text-white rounded hover:bg-gray-500">
                        Annuler
                    </button>
                </div>
            </div>
            <div className="mt-2">
                <input
                    type="text"
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    placeholder="Libellé..."
                    className="w-full px-2 py-1.5 border rounded"
                />
            </div>
        </form>
    );
}
