/**
 * WaterProjectionTable - Tableau de projection eau (V6)
 * 
 * Composant extrait pour respecter la limite de 150 lignes.
 */
import { fmtMoney } from '../../../../utils/formatters';

/**
 * Tableau de projection annuelle.
 * @param {Object} props
 * @param {Array} props.rows - Données formatées avec quarters, totalN, budgetN1
 */
export default function WaterProjectionTable({ rows }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-800 text-white">
                        <tr>
                            <th rowSpan={2} className="text-left px-4 py-3 align-middle">Propriétaire / Lot</th>
                            <th colSpan={4} className="px-4 py-2 bg-gray-600 text-xs text-center border-l border-gray-500">
                                Consommation Réelle (m³) Année N
                            </th>
                            <th rowSpan={2} className="px-4 py-3 bg-blue-600 border-l border-blue-500 align-middle text-center">
                                Total N (m³)
                            </th>
                            <th rowSpan={2} className="px-4 py-3 bg-green-600 border-l border-green-500 align-middle text-center">
                                Budget N+1 (€)
                            </th>
                        </tr>
                        <tr className="text-xs">
                            <th className="px-2 py-2 bg-gray-500 text-center border-t border-gray-400 border-l border-gray-600">T1</th>
                            <th className="px-2 py-2 bg-gray-500 text-center border-t border-gray-400 border-l border-gray-400">T2</th>
                            <th className="px-2 py-2 bg-gray-500 text-center border-t border-gray-400 border-l border-gray-400">T3</th>
                            <th className="px-2 py-2 bg-gray-500 text-center border-t border-gray-400 border-l border-gray-400">T4</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {rows.map(({ row, quarters, totalN, budgetN1 }) => (
                            <tr key={row.lot_id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-800">{row.owner_name}</span>
                                        <span className="text-xs text-green-600 italic">Lot {row.lot_numero} / {row.lot_nom}</span>
                                    </div>
                                </td>
                                {quarters.map((q, i) => (
                                    <td key={i} className="px-2 py-2 text-center font-mono text-gray-600 border-l border-gray-100">
                                        {q.toFixed(3)}
                                    </td>
                                ))}
                                <td className="px-4 py-2 text-center font-bold text-blue-600 border-l border-gray-100 bg-blue-50/30">
                                    {totalN.toFixed(3)}
                                </td>
                                <td className="px-4 py-2 text-center font-bold text-green-600 border-l border-gray-100 bg-green-50/30">
                                    {fmtMoney(budgetN1)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
