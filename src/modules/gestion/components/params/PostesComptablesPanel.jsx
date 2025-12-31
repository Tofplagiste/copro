/**
 * PostesComptablesPanel - Gestion des Postes Comptables (Responsive)
 * Permet d'ajouter/supprimer des codes comptables avec leurs libellés
 */
import { useState } from 'react';
import { FileText, Plus, X } from 'lucide-react';
import { useCopro } from '../../../../context/CoproContext';

// Postes comptables par défaut - COMPLETE LIST
const DEFAULT_POSTES = [
    { code: '601', libelle: 'Eau' },
    { code: '602', libelle: 'Électricité' },
    { code: '615-MEN', libelle: 'Ménage' },
    { code: '615-POU', libelle: 'Poubelles' },
    { code: '615-SEC', libelle: 'Sécurité Incendie' },
    { code: '616', libelle: 'Assurances' },
    { code: '622-SYN', libelle: 'Indem. Syndic' },
    { code: '622-RPTE', libelle: 'Indem. RPTE' },
    { code: '622-MNT', libelle: 'Gestion Maint.' },
    { code: '623', libelle: 'Frais Bancaires' },
    { code: '701', libelle: 'Appels de Fonds' },
    { code: '702', libelle: 'Travaux (Appel)' },
    { code: '580', libelle: 'Virement Interne' },
    { code: '105', libelle: 'Provision Fond Travaux' },
];

export default function PostesComptablesPanel() {
    const { state, updateState } = useCopro();

    // Récupérer les postes comptables depuis l'état ou utiliser les valeurs par défaut
    const postesComptables = state.postesComptables || DEFAULT_POSTES;

    const [newCode, setNewCode] = useState('');
    const [newLibelle, setNewLibelle] = useState('');

    const handleAdd = () => {
        if (!newCode.trim() || !newLibelle.trim()) return;

        // Check if code already exists
        if (postesComptables.some(p => p.code === newCode.trim())) {
            // Optional: You could set an error state here
            return;
        }

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
            <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 px-3 sm:px-4 py-2 sm:py-3 text-white flex items-center gap-2">
                <FileText className="w-4 h-4 sm:w-[18px] sm:h-[18px] shrink-0" />
                <h3 className="font-bold text-sm sm:text-base truncate">Gestion des Postes Comptables</h3>
            </div>

            {/* Add Form - Responsive */}
            <div className="p-2 sm:p-3 border-b bg-gray-50">
                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        value={newCode}
                        onChange={(e) => setNewCode(e.target.value)}
                        placeholder="Code (ex: 605)"
                        className={`px-2 sm:px-3 py-2 border rounded-lg text-xs sm:text-sm flex-1 min-w-0 ${postesComptables.some(p => p.code === newCode.trim() && newCode !== '') ? 'border-red-500 text-red-500' : ''}`}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    />
                    <input
                        type="text"
                        value={newLibelle}
                        onChange={(e) => setNewLibelle(e.target.value)}
                        placeholder="Libellé"
                        className="px-2 sm:px-3 py-2 border rounded-lg text-xs sm:text-sm flex-[2] min-w-0"
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    />
                    <button
                        onClick={handleAdd}
                        disabled={!newCode.trim() || !newLibelle.trim() || postesComptables.some(p => p.code === newCode.trim())}
                        className="px-3 sm:px-4 py-2 bg-cyan-600 text-white rounded-lg font-bold hover:bg-cyan-500 disabled:opacity-50 text-xs sm:text-sm flex items-center justify-center gap-1 shrink-0"
                    >
                        <Plus size={14} /> <span className="hidden xs:inline">Ajouter</span>
                    </button>
                </div>
            </div>

            {/* List - Max 10 items then scroll (approx 400px) */}
            <div className="max-h-[400px] overflow-y-auto overflow-x-auto">
                <table className="w-full text-xs sm:text-sm min-w-[280px]">
                    <thead className="bg-gray-100 text-gray-600 text-[10px] sm:text-xs uppercase sticky top-0">
                        <tr>
                            <th className="text-left px-2 sm:px-4 py-2">Code</th>
                            <th className="text-left px-2 sm:px-4 py-2">Libellé</th>
                            <th className="w-8 sm:w-12"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {postesComptables.map((poste, index) => (
                            <tr key={index} className="hover:bg-gray-50 group">
                                <td className="px-2 sm:px-4 py-1.5 sm:py-2 font-mono text-gray-700 text-xs">{poste.code}</td>
                                <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-gray-600 truncate max-w-[120px] sm:max-w-none">{poste.libelle}</td>
                                <td className="px-1 sm:px-2 py-1.5 sm:py-2 text-center">
                                    <button
                                        onClick={() => handleDelete(index)}
                                        className="text-red-400 hover:text-red-600 p-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Supprimer"
                                    >
                                        <X size={14} />
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
