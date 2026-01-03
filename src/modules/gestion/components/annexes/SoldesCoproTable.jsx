/**
 * SoldesCoproTable - Tableau des soldes copropriétaires
 * Extrait de AnnexesTab pour respecter la limite de 150 lignes
 */
import { Users } from 'lucide-react';
import { fmtMoney } from '../../../../utils/formatters';

/**
 * @param {Object} props
 * @param {Array} props.owners
 * @param {Array} props.operations
 */
export default function SoldesCoproTable({ owners, operations }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="bg-slate-700 text-white px-4 py-3 flex items-center gap-2 sticky top-0 z-20">
                <Users size={18} />
                <span className="font-bold">Annexe 3 : Soldes Copropriétaires</span>
            </div>
            <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 sticky top-0 z-10">
                        <tr>
                            <th className="text-left px-3 py-2 bg-gray-100">Nom</th>
                            <th className="text-right px-3 py-2 bg-gray-100">Solde (Estimé)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(owners || []).filter(o => !o.isCommon).map(owner => {
                            const ownerRecettes = operations
                                .filter(op => op.type === 'recette' && op.owner_id === owner.id)
                                .reduce((sum, op) => sum + (op.amount || 0), 0);
                            const ownerDepenses = operations
                                .filter(op => op.type === 'depense' && op.owner_id === owner.id)
                                .reduce((sum, op) => sum + (op.amount || 0), 0);
                            const solde = ownerRecettes - ownerDepenses;

                            return (
                                <tr key={owner.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="px-3 py-2">{owner.name}</td>
                                    <td className={`px-3 py-2 text-right font-mono ${solde >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {fmtMoney(solde)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
