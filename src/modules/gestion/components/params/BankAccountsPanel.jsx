/**
 * BankAccountsPanel - Gestion des comptes bancaires (V6)
 */
import { useState } from 'react';
import { CreditCard, Trash2, Edit2, Plus } from 'lucide-react';
import { useGestionData } from '../../context/GestionSupabaseContext';
import Modal from '../../../../components/Modal';
import { useToast } from '../../../../components/ToastProvider';

export default function BankAccountsPanel() {
    const { accounts, addAccount, updateAccount, deleteAccount } = useGestionData();
    const toast = useToast();

    const [newItem, setNewItem] = useState({ id: '', name: '', initial_balance: '' });
    const [isEditing, setIsEditing] = useState(false);

    // Delete Modal State
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Edit handler
    const handleEdit = (acc) => {
        setNewItem({
            id: acc.id,
            name: acc.name,
            initial_balance: acc.initial_balance !== undefined ? acc.initial_balance : ''
        });
        setIsEditing(true);
    };

    // Delete handler (Open Modal)
    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    // Confirm Delete
    const confirmDelete = async () => {
        if (deleteId) {
            await deleteAccount(deleteId);
            setIsDeleteModalOpen(false);
            setDeleteId(null);
        }
    };

    // Save handler
    const handleSave = async () => {
        if (!newItem.id || !newItem.name) return;

        // Validation ID unique
        if (!isEditing && accounts.some(a => a.id === newItem.id)) {
            toast.error("Cet ID de compte existe déjà !");
            return;
        }

        const data = {
            id: newItem.id,
            name: newItem.name,
            initial_balance: parseFloat(newItem.initial_balance) || 0
        };

        if (isEditing) {
            // Update
            await updateAccount(newItem.id, {
                name: data.name,
                initial_balance: data.initial_balance
            });
        } else {
            // Add
            await addAccount(data);
        }

        // Reset
        setNewItem({ id: '', name: '', initial_balance: '' });
        setIsEditing(false);
    };

    const handleReset = () => {
        setNewItem({ id: '', name: '', initial_balance: '' });
        setIsEditing(false);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-amber-400 px-4 py-3 border-b border-amber-500/20 flex items-center gap-2">
                <CreditCard size={18} className="text-amber-900" />
                <h3 className="font-bold text-amber-900">Gestion des Comptes Bancaires</h3>
            </div>

            <div className="p-4 space-y-4">
                {/* Liste des comptes */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {accounts.map(acc => {
                        const isRowEditing = isEditing && acc.id === newItem.id;
                        return (
                            <div key={acc.id} className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 transition-colors ${isRowEditing ? 'bg-amber-50 border-amber-200' : 'group hover:border-amber-200'}`}>
                                <div>
                                    <div className="font-bold text-slate-700">{acc.id}</div>
                                    <div className="text-sm text-slate-500">
                                        {acc.name} <span className="font-mono text-xs bg-gray-200 px-1 rounded ml-1">
                                            {parseFloat(acc.initial_balance || 0).toFixed(2)} €
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-100">
                                    <button
                                        onClick={() => handleEdit(acc)}
                                        disabled={isRowEditing}
                                        className={`p-1 rounded text-blue-600 transition-colors ${isRowEditing ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white'}`}>
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(acc.id)}
                                        disabled={isRowEditing}
                                        className={`p-1 rounded text-red-500 transition-colors ${isRowEditing ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white'}`}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {accounts.length === 0 && (
                        <p className="text-sm text-gray-400 text-center italic">Aucun compte configuré.</p>
                    )}
                </div>

                {/* Formulaire ajout/modif */}
                <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-semibold text-slate-600">
                            {isEditing ? 'Modifier le compte' : 'Ajouter un compte'}
                        </h4>
                    </div>

                    <div className="space-y-2">
                        <input
                            type="text"
                            placeholder="ID (ex: 512-CIC)"
                            className={`w-full text-sm border rounded px-3 py-2 ${isEditing ? 'bg-gray-100 text-gray-500' : ''}`}
                            value={newItem.id}
                            onChange={e => setNewItem({ ...newItem, id: e.target.value })}
                            disabled={isEditing}
                        />
                        <input
                            type="text"
                            placeholder="Nom du compte"
                            className="w-full text-sm border rounded px-3 py-2"
                            value={newItem.name}
                            onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                        />
                        <div className="relative">
                            <input
                                type="number"
                                placeholder="Solde Initial"
                                className="w-full text-sm border rounded px-3 py-2"
                                value={newItem.initial_balance}
                                onChange={e => setNewItem({ ...newItem, initial_balance: e.target.value })}
                                step="0.01"
                            />
                            <span className="absolute right-3 top-2 text-gray-400 text-sm">€</span>
                        </div>

                        <div className="flex gap-2">
                            {isEditing && (
                                <button
                                    onClick={handleReset}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded font-medium text-sm transition-colors"
                                >
                                    Annuler
                                </button>
                            )}
                            <button
                                onClick={handleSave}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium text-sm transition-colors">
                                {isEditing ? 'Mettre à jour' : 'Enregistrer'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Confirmation */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Supprimer ce compte ?"
                size="sm"
            >
                <div className="text-sm text-gray-600 mb-4">
                    Êtes-vous sur de vouloir supprimer le compte <strong>{deleteId}</strong> ?
                    <br />Cette action est irréversible.
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => setIsDeleteModalOpen(false)}
                        className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                        Annuler
                    </button>
                    <button
                        onClick={confirmDelete}
                        className="px-3 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">
                        Supprimer
                    </button>
                </div>
            </Modal>
        </div>
    );
}
