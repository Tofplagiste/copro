/**
 * PostesComptablesPanel - Gestion des Postes Comptables
 * Permet d'ajouter/supprimer des codes comptables avec leurs libellés
 */
import { useState } from 'react';
import { FileText, Plus, X } from 'lucide-react';
import { useCopro } from '../../context/CoproContext';

// Postes comptables par défaut
const DEFAULT_POSTES = [
    { code: '601', libelle: 'Eau' },
    { code: '602', libelle: 'Électricité' },
    { code: '615-MEN', libelle: 'Ménage' },
    { code: '615-POU', libelle: 'Poubelles' },
    { code: '615-SEC', libelle: 'Sécurité Incendie' },
];

export default function PostesComptablesPanel() {
    const { state, updateState } = useCopro();

    // Récupérer les postes comptables depuis l'état ou utiliser les valeurs par défaut
    const postesComptables = state.postesComptables || DEFAULT_POSTES;

    const [newCode, setNewCode] = useState('');
    const [newLibelle, setNewLibelle] = useState('');

    const handleAdd = () => {
        if (!newCode.trim() || !newLibelle.trim()) return;

        const newPoste = { code: newCode.trim(), libelle: newLibelle.trim() };
        const updatedPostes = [...postesComptables, newPoste];
        updateState({ postesComptables: updatedPostes });

        setNewCode('');
        setNewLibelle('');
    };

    const handleDelete = (index) => {
        const updatedPostes = postesComptables.filter((_, i) => i !== index);
        updateState({ postesComptables: updatedPostes });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 px-4 py-3 text-white flex items-center gap-2">
                <FileText size={18} />
                <h3 className="font-bold">Gestion des Postes Comptables</h3>
            </div>

            {/* Add Form */}
            <div className="p-3 border-b bg-gray-50">
                <div className="grid grid-cols-[1fr_2fr_auto] gap-2 items-center">
                    <input
                        type="text"
                        value={newCode}
                        onChange={(e) => setNewCode(e.target.value)}
                        placeholder="Code (ex: 605)"
                        className="px-3 py-2 border rounded-lg text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    />
                    <input
                        type="text"
                        value={newLibelle}
                        onChange={(e) => setNewLibelle(e.target.value)}
                        placeholder="Libellé"
                        className="px-3 py-2 border rounded-lg text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    />
                    <button
                        onClick={handleAdd}
                        disabled={!newCode.trim() || !newLibelle.trim()}
                        className="px-4 py-2 bg-cyan-600 text-white rounded-lg font-bold hover:bg-cyan-500 disabled:opacity-50 text-sm flex items-center gap-1"
                    >
                        <Plus size={16} /> Ajouter
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 text-gray-600 text-xs uppercase sticky top-0">
                        <tr>
                            <th className="text-left px-4 py-2">Code (ex: 605)</th>
                            <th className="text-left px-4 py-2">Libellé</th>
                            <th className="w-12"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {postesComptables.map((poste, index) => (
                            <tr key={index} className="hover:bg-gray-50 group">
                                <td className="px-4 py-2 font-mono text-gray-700">{poste.code}</td>
                                <td className="px-4 py-2 text-gray-600">{poste.libelle}</td>
                                <td className="px-2 py-2 text-center">
                                    <button
                                        onClick={() => handleDelete(index)}
                                        className="text-red-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Supprimer"
                                    >
                                        <X size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {postesComptables.length === 0 && (
                <div className="p-4 text-center text-gray-400 text-sm italic">
                    Aucun poste comptable défini
                </div>
            )}
        </div>
    );
}
