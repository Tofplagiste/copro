/**
 * CompteGestionTable - Tableau du compte de gestion (Résultat)
 * Extrait de AnnexesTab pour respecter la limite de 150 lignes
 */
import { fmtMoney } from '../../../../utils/formatters';

/**
 * @param {Object} props
 * @param {Object} props.resultByCategory - Résultat par catégorie
 * @param {number} props.netResult - Résultat net
 */
export default function CompteGestionTable({ resultByCategory, netResult }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="bg-slate-700 text-white px-4 py-3 flex justify-between items-center">
                <span className="font-bold">Annexe 2 : Compte de Gestion</span>
                <span className="text-sm">RÉSULTAT</span>
            </div>
            <div className="p-4">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="text-left px-3 py-2">Poste</th>
                            <th className="text-right px-3 py-2" style={{ width: 100 }}>Montant</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(resultByCategory)
                            .sort((a, b) => a[0].localeCompare(b[0]))
                            .map(([code, amount]) => (
                                <tr key={code} className="border-b border-gray-100">
                                    <td className="px-3 py-2">{code}</td>
                                    <td className="px-3 py-2 text-right font-mono">{fmtMoney(amount)}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                    <tfoot className="bg-gray-100 font-bold">
                        <tr>
                            <td className="px-3 py-2">RÉSULTAT DE L'EXERCICE</td>
                            <td className={`px-3 py-2 text-right ${netResult >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {fmtMoney(netResult)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
