import { useState } from 'react';
import { X, Trash2, Plus, ArrowRight } from 'lucide-react';

const CATEGORIES = [
    { id: 'general', label: 'Charges Générales' },
    { id: 'special', label: 'Charges Spéciales' },
    { id: 'menage', label: 'Ménage' },
    { id: 'travaux', label: 'Travaux' }
];

export default function GererPostesModal({ isOpen, onClose, budget, onAdd, onDelete }) {
    const [newItemName, setNewItemName] = useState('');
    const [newItemCategory, setNewItemCategory] = useState('general');

    const handleAdd = () => {
        if (!newItemName.trim()) return;
        onAdd(newItemCategory, newItemName);
        setNewItemName('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-slate-800 px-4 py-3 text-white flex justify-between items-center shrink-0">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        📋 Gérer les Postes Budgétaires
                    </h3>
                    <button onClick={onClose} className="hover:bg-slate-700 rounded p-1 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Add New Item */}
                <div className="p-4 bg-gray-50 border-b shrink-0">
                    <h4 className="text-sm font-bold text-gray-700 mb-2">Ajouter une ligne</h4>
                    <div className="flex gap-2">
                        <select
                            value={newItemCategory}
                            onChange={(e) => setNewItemCategory(e.target.value)}
                            className="px-3 py-2 border rounded-lg text-sm bg-white"
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
                            className="flex-1 px-3 py-2 border rounded-lg text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        />
                        <button
                            onClick={handleAdd}
                            disabled={!newItemName.trim()}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-500 disabled:opacity-50 flex items-center gap-2 text-sm"
                        >
                            <Plus size={16} /> Ajouter
                        </button>
                    </div>
                </div>

                {/* List Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {CATEGORIES.map(cat => {
                        const items = budget[cat.id] || [];
                        if (items.length === 0) return null;

                        return (
                            <div key={cat.id}>
                                <h4 className="text-xs uppercase font-bold text-gray-500 mb-2 border-b pb-1">
                                    {cat.label}
                                </h4>
                                <ul className="space-y-1">
                                    {items.map((item, index) => (
                                        <li key={index} className="flex justify-between items-center group hover:bg-gray-50 p-2 rounded">
                                            <span className="text-sm text-gray-700 font-medium">
                                                {item.name}
                                            </span>
                                            <button
                                                onClick={() => onDelete(cat.id, index)}
                                                className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 shrink-0 text-right">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 text-sm"
                    >
                        Terminé
                    </button>
                </div>
            </div>
        </div>
    );
}
