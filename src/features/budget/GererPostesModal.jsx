/**
 * GererPostesModal - Gérer les Postes Budgétaires
 * Design premium avec blur complet, anti-scroll propagation, et confirmation modale
 */
import { useState, useEffect } from 'react';
import { X, Trash2, Plus, AlertTriangle } from 'lucide-react';

const CATEGORIES = [
    { id: 'general', label: 'Charges Générales', color: 'bg-blue-500', textColor: 'text-blue-600' },
    { id: 'special', label: 'Charges Syndic/Entretien', color: 'bg-amber-500', textColor: 'text-amber-600' },
    { id: 'menage', label: 'Ménage', color: 'bg-cyan-500', textColor: 'text-cyan-600' },
    { id: 'travaux', label: 'Travaux', color: 'bg-red-500', textColor: 'text-red-600' }
];

// Mini composant de confirmation modale
function ConfirmModal({ isOpen, onConfirm, onCancel, itemName }) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[70] flex items-center justify-center"
            onClick={onCancel}
            style={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)'
            }}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-[scaleIn_0.2s_ease-out]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                        <AlertTriangle size={24} className="text-red-500" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800">Supprimer ce poste ?</h4>
                        <p className="text-sm text-gray-500">Cette action est irréversible</p>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-600 font-medium">"{itemName}"</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
                    >
                        Supprimer
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function GererPostesModal({ isOpen, onClose, budget, onAdd, onDelete }) {
    const [newItemName, setNewItemName] = useState('');
    const [newItemCategory, setNewItemCategory] = useState('general');
    const [confirmDelete, setConfirmDelete] = useState(null);

    // Bloquer le scroll du body quand la modale est ouverte
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleAdd = () => {
        if (!newItemName.trim()) return;
        onAdd(newItemCategory, newItemName);
        setNewItemName('');
    };

    const handleDeleteClick = (category, index, name) => {
        setConfirmDelete({ category, index, name });
    };

    const handleConfirmDelete = () => {
        if (confirmDelete) {
            onDelete(confirmDelete.category, confirmDelete.index);
            setConfirmDelete(null);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop PLEIN ÉCRAN avec blur */}
            <div
                className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen z-50 flex items-center justify-center"
                onClick={handleBackdropClick}
                style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)'
                }}
            >
                {/* Modal Container - avec overscroll-contain pour bloquer la propagation */}
                <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col max-h-[85vh] animate-[slideUp_0.3s_ease-out]"
                    onClick={(e) => e.stopPropagation()}
                    style={{ overscrollBehavior: 'contain' }}
                >
                    {/* Header Gradient */}
                    <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 text-white flex justify-between items-center shrink-0 rounded-t-2xl">
                        <div>
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                📋 Gérer les Postes Budgétaires
                            </h3>
                            <p className="text-slate-300 text-xs mt-0.5">Ajoutez ou supprimez des postes de dépenses</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Add New Item */}
                    <div className="p-5 bg-gradient-to-b from-gray-50 to-white border-b shrink-0">
                        <div className="flex gap-3">
                            <select
                                value={newItemCategory}
                                onChange={(e) => setNewItemCategory(e.target.value)}
                                className="px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm bg-white font-medium focus:border-blue-400 focus:outline-none transition-colors"
                            >
                                {CATEGORIES.map(c => (
                                    <option key={c.id} value={c.id}>{c.label}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                placeholder="Nom du poste (ex: Assurance, Eau...)"
                                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-400 focus:outline-none transition-colors"
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                            />
                            <button
                                onClick={handleAdd}
                                disabled={!newItemName.trim()}
                                className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 text-sm shadow-lg shadow-green-500/25 transition-all"
                            >
                                <Plus size={18} /> Ajouter
                            </button>
                        </div>
                    </div>

                    {/* List Items - avec overscroll-contain */}
                    <div
                        className="flex-1 overflow-y-auto p-5 space-y-5"
                        style={{ overscrollBehavior: 'contain' }}
                    >
                        {CATEGORIES.map(cat => {
                            const items = budget[cat.id] || [];
                            if (items.length === 0) return null;

                            return (
                                <div key={cat.id} className="bg-gray-50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className={`w-3 h-3 rounded-full ${cat.color}`}></div>
                                        <h4 className={`text-sm uppercase font-bold ${cat.textColor}`}>
                                            {cat.label}
                                        </h4>
                                        <span className="text-xs text-gray-400 ml-auto">{items.length} poste(s)</span>
                                    </div>
                                    <div className="space-y-2">
                                        {items.map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
                                            >
                                                <span className="text-sm text-gray-700 font-medium">
                                                    {item.name}
                                                </span>
                                                <button
                                                    onClick={() => handleDeleteClick(cat.id, index, item.name)}
                                                    className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Empty State */}
                        {CATEGORIES.every(cat => (budget[cat.id] || []).length === 0) && (
                            <div className="text-center py-12 text-gray-400">
                                <p className="text-lg mb-1">Aucun poste défini</p>
                                <p className="text-sm">Commencez par ajouter un poste ci-dessus</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t bg-gray-50/80 shrink-0 flex justify-end rounded-b-2xl">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-xl font-semibold hover:from-slate-800 hover:to-slate-900 transition-all shadow-lg shadow-slate-800/25"
                        >
                            Terminé
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={confirmDelete !== null}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDelete(null)}
                itemName={confirmDelete?.name || ''}
            />
        </>
    );
}
