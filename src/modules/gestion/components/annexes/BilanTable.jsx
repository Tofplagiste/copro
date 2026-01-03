/**
 * BilanTable - Tableau du bilan (Actif / Passif)
 * Extrait de AnnexesTab pour respecter la limite de 150 lignes
 */
import { Trash2 } from 'lucide-react';
import { fmtMoney } from '../../../../utils/formatters';

/**
 * @param {Object} props
 * @param {Array} props.accounts
 * @param {Array} props.livrets
 * @param {Array} props.manualEntries
 * @param {Function} props.getAccountBalance
 * @param {Function} props.onRemoveEntry
 * @param {number} props.totalActif
 * @param {number} props.totalPassif
 * @param {number} props.netResult
 * @param {number} props.reportAN
 */
export default function BilanTable({
    accounts,
    livrets,
    manualEntries,
    getAccountBalance,
    onRemoveEntry,
    totalActif,
    totalPassif,
    netResult,
    reportAN
}) {
    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="bg-slate-700 text-white px-4 py-3 flex justify-between items-center">
                <span className="font-bold">Annexe 1 : État Financier</span>
                <span className="text-sm">BILAN</span>
            </div>

            <div className="p-4">
                {/* ACTIF */}
                <h4 className="text-xs uppercase font-bold text-gray-500 mb-2">Actif</h4>
                <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="text-left px-3 py-2">Comptes Bancaires & Créances</th>
                            <th className="text-right px-3 py-2" style={{ width: 100 }}>Montant</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.map(acc => (
                            <tr key={acc.id} className="border-b border-gray-100">
                                <td className="px-3 py-2">Banque: {acc.name}</td>
                                <td className="px-3 py-2 text-right font-mono">{fmtMoney(getAccountBalance(acc.id))}</td>
                            </tr>
                        ))}
                        {manualEntries.filter(e => e.type === 'actif').map(e => (
                            <tr key={e.id} className="border-b border-gray-100 bg-emerald-50/50 group">
                                <td className="px-3 py-2 flex items-center gap-2">
                                    {e.label}
                                    <button onClick={() => onRemoveEntry(e.id)} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 size={12} />
                                    </button>
                                </td>
                                <td className="px-3 py-2 text-right font-mono">{fmtMoney(e.amount)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-100 font-bold">
                        <tr>
                            <td className="px-3 py-2">TOTAL ACTIF</td>
                            <td className="px-3 py-2 text-right">{fmtMoney(totalActif)}</td>
                        </tr>
                    </tfoot>
                </table>

                {/* PASSIF */}
                <h4 className="text-xs uppercase font-bold text-gray-500 mt-4 mb-2">Passif</h4>
                <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="text-left px-3 py-2">Fonds, Réserves & Dettes</th>
                            <th className="text-right px-3 py-2" style={{ width: 100 }}>Montant</th>
                        </tr>
                    </thead>
                    <tbody>
                        {livrets.map(acc => (
                            <tr key={acc.id} className="border-b border-gray-100">
                                <td className="px-3 py-2">Fonds & Réserves ({acc.name})</td>
                                <td className="px-3 py-2 text-right font-mono">{fmtMoney(getAccountBalance(acc.id))}</td>
                            </tr>
                        ))}
                        {manualEntries.filter(e => e.type === 'passif').map(e => (
                            <tr key={e.id} className="border-b border-gray-100 bg-amber-50/50 group">
                                <td className="px-3 py-2 flex items-center gap-2">
                                    {e.label}
                                    <button onClick={() => onRemoveEntry(e.id)} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 size={12} />
                                    </button>
                                </td>
                                <td className="px-3 py-2 text-right font-mono">{fmtMoney(e.amount)}</td>
                            </tr>
                        ))}
                        <tr className="border-b border-gray-100">
                            <td className="px-3 py-2">Excédent Exercice</td>
                            <td className={`px-3 py-2 text-right font-mono ${netResult >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {fmtMoney(netResult)}
                            </td>
                        </tr>
                        <tr className="bg-amber-50 font-bold border-b border-gray-100">
                            <td className="px-3 py-2">Report à Nouveau (Solde N-1)</td>
                            <td className="px-3 py-2 text-right">{fmtMoney(reportAN)}</td>
                        </tr>
                    </tbody>
                    <tfoot className="bg-gray-100 font-bold">
                        <tr>
                            <td className="px-3 py-2">TOTAL PASSIF</td>
                            <td className="px-3 py-2 text-right">{fmtMoney(totalPassif)}</td>
                        </tr>
                    </tfoot>
                </table>

                <div className={`mt-3 py-2 px-3 text-center text-sm rounded ${Math.abs(totalActif - totalPassif) < 0.01 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {Math.abs(totalActif - totalPassif) < 0.01 ? 'Bilan Équilibré ✓' : `Déséquilibre : ${fmtMoney(totalActif - totalPassif)}`}
                </div>
            </div>
        </div>
    );
}
