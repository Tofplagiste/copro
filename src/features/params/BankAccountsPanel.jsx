/**
 * BankAccountsPanel - Gestion des comptes bancaires
 */
import { useState } from 'react';
import { CreditCard, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { useCopro } from '../../context/CoproContext';

export default function BankAccountsPanel() {
    const { state, updateState } = useCopro();
    const { accounts } = state;

    const [editingId, setEditingId] = useState(null);
    const [newItem, setNewItem] = useState({ id: '', name: '', initial: '' });

    // Mettre à jour un compte
    const handleUpdate = (id, field, value) => {
        const updatedAccounts = accounts.map(acc =>
            acc.id === id ? { ...acc, [field]: value } : acc
        );
        updateState({ accounts: updatedAccounts });
    };

    // Supprimer un compte
    const handleDelete = (id) => {
        if (window.confirm('Supprimer ce compte ?')) {
            const updatedAccounts = accounts.filter(acc => acc.id !== id);
            updateState({ accounts: updatedAccounts });
        }
    };

    // Ajouter un compte
    const handleAdd = () => {
        if (!newItem.id || !newItem.name) return;
        const newAccount = {
            id: newItem.id,
            name: newItem.name,
            initial: parseFloat(newItem.initial) || 0
        };
        updateState({ accounts: [...accounts, newAccount] });
        setNewItem({ id: '', name: '', initial: '' });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-amber-400 px-4 py-3 border-b border-amber-500/20 flex items-center gap-2">
                <CreditCard size={18} className="text-amber-900" />
                <h3 className="font-bold text-amber-900">Gestion des Comptes Bancaires</h3>
            </div>

            <div className="p-4 space-y-4">
                {/* Liste des comptes */}
                <div className="space-y-2">
                    {accounts.map(acc => (
                        <div key={acc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 group hover:border-amber-200 transition-colors">
                            <div>
                                <div className="font-bold text-slate-700">{acc.id}</div>
                                <div className="text-sm text-slate-500">{acc.name} ({acc.initial} €)</div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1 hover:bg-white rounded text-blue-600">
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(acc.id)}
                                    className="p-1 hover:bg-white rounded text-red-500">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Formulaire ajout */}
                <div className="border-t pt-4 mt-4">
                    <h4 className="text-sm font-semibold text-slate-600 mb-2">Ajouter / Modifier</h4>
                    <div className="space-y-2">
                        <input
                            type="text"
                            placeholder="ID (ex: 512-CIC)"
                            className="w-full text-sm border rounded px-3 py-2"
                            value={newItem.id}
                            onChange={e => setNewItem({ ...newItem, id: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Nom"
                            className="w-full text-sm border rounded px-3 py-2"
                            value={newItem.name}
                            onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Solde Initial"
                            className="w-full text-sm border rounded px-3 py-2"
                            value={newItem.initial}
                            onChange={e => setNewItem({ ...newItem, initial: e.target.value })}
                        />
                        <button
                            onClick={handleAdd}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium text-sm transition-colors">
                            Enregistrer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
