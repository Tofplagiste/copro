/**
 * CreditRepartitionTable - Tableau de répartition détaillée
 * Affiche la répartition par copropriétaire
 */
import { formatMoney } from '../utils/creditCalculations';

/**
 * @param {Object} props
 * @param {Array} props.repartition - Données de répartition calculées
 */
export default function CreditRepartitionTable({ repartition }) {
    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <h2 className="text-xl font-bold text-slate-800 p-6 bg-slate-50 border-b">
                Répartition Détaillée par Copropriétaire
            </h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="px-3 py-3 text-left font-semibold">Copropriétaire</th>
                            <th className="px-3 py-3 text-center font-semibold">Lot</th>
                            <th className="px-3 py-3 text-right font-semibold">Tant.</th>
                            <th className="px-3 py-3 text-right font-semibold">P. Communes</th>
                            <th className="px-3 py-3 text-right font-semibold">Balcons</th>
                            <th className="px-3 py-3 text-right font-semibold">Celliers</th>
                            <th className="px-3 py-3 text-right font-semibold">Total</th>
                            <th className="px-3 py-3 text-right font-semibold">Fonds Alur</th>
                            <th className="px-3 py-3 text-right font-semibold">Apport</th>
                            <th className="px-3 py-3 text-right font-semibold">À Financer</th>
                            <th className="px-3 py-3 text-right font-semibold">Mensualité</th>
                        </tr>
                    </thead>
                    <tbody>
                        {repartition.map(c => (
                            <tr key={c.id} className="border-b hover:bg-slate-50">
                                <td className="px-3 py-2 font-medium">{c.nom}</td>
                                <td className="px-3 py-2 text-center text-slate-600">{c.lot}</td>
                                <td className="px-3 py-2 text-right">{c.tantiemes + c.tantCellier}</td>
                                <td className="px-3 py-2 text-right">{formatMoney(c.partCommunes)}</td>
                                <td className="px-3 py-2 text-right">{c.partBalcon > 0 ? formatMoney(c.partBalcon) : '-'}</td>
                                <td className="px-3 py-2 text-right">{c.partCellier > 0 ? formatMoney(c.partCellier) : '-'}</td>
                                <td className="px-3 py-2 text-right font-semibold">{formatMoney(c.totalPart)}</td>
                                <td className="px-3 py-2 text-right text-blue-600">-{formatMoney(c.partFondsTravaux)}</td>
                                <td className="px-3 py-2 text-right text-green-600">{c.apportUtilise > 0 ? `-${formatMoney(c.apportUtilise)}` : '-'}</td>
                                <td className="px-3 py-2 text-right font-semibold text-indigo-600">
                                    {c.paiementComptant ? <span className="text-green-600">Comptant</span> : formatMoney(c.montantAFinancer)}
                                </td>
                                <td className="px-3 py-2 text-right font-bold text-indigo-700">
                                    {c.paiementComptant ? '-' : c.mensualite.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) + ' €'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
