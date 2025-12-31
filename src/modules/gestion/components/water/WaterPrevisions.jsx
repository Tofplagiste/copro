/**
 * WaterPrevisions - Saisie des prévisions eau
 */
import { useCopro } from '../../../../context/CoproContext';
import { fmtMoney } from '../../../../utils/formatters';

export default function WaterPrevisions() {
    const { state, updateState } = useCopro();

    // Initialisation si nécessaire
    const waterPrevi = state.waterPrevi || { subs: {}, charges: {}, reguls: {} };

    const handleUpdate = (ownerId, type, value) => {
        const updated = {
            ...waterPrevi,
            [type]: {
                ...waterPrevi[type],
                [ownerId]: parseFloat(value) || 0
            }
        };
        updateState({ waterPrevi: updated });
    };

    // Calcul des totaux
    let totalSub = 0, totalConso = 0, totalRegul = 0, totalTotal = 0;

    const rows = state.owners
        .filter(o => !o.isCommon)
        .map(owner => {
            const sub = parseFloat(waterPrevi.subs?.[owner.id]) || 0;
            const chg = parseFloat(waterPrevi.charges?.[owner.id]) || 0;
            const reg = parseFloat(waterPrevi.reguls?.[owner.id]) || 0;
            const tot = sub + chg + reg;

            totalSub += sub;
            totalConso += chg;
            totalRegul += reg;
            totalTotal += tot;

            return { owner, sub, chg, reg, tot };
        });

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-blue-600 flex items-center gap-2">
                    💧 Saisie des Prévisions Eau (Trimestriel)
                </h3>
                <div className="text-sm text-gray-500 bg-white px-3 py-2 rounded-lg shadow-sm border">
                    📋 Compatible copier-coller (Excel)
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-800 text-white text-xs uppercase">
                            <tr>
                                <th className="text-left px-4 py-3">Propriétaire</th>
                                <th className="px-4 py-3 bg-gray-600" style={{ width: '15%' }}>Abonnement (€)</th>
                                <th className="px-4 py-3 bg-blue-600" style={{ width: '15%' }}>Conso (€)</th>
                                <th className="px-4 py-3 bg-amber-500 text-gray-900" style={{ width: '15%' }}>Régul. N-1 (€)</th>
                                <th className="px-4 py-3 bg-green-600 font-bold" style={{ width: '15%' }}>Total Trim. (€)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rows.map(({ owner, sub, chg, reg, tot }) => (
                                <tr key={owner.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <span className="font-bold text-gray-800">{owner.name}</span>
                                        <span className="text-xs text-green-600 italic ml-2">{owner.lot}</span>
                                    </td>
                                    <td className="px-3 py-2">
                                        <input
                                            type="number"
                                            value={sub || ''}
                                            onChange={(e) => handleUpdate(owner.id, 'subs', e.target.value)}
                                            className="w-full px-2 py-1 text-right font-mono border rounded focus:ring-2 focus:ring-blue-500"
                                            step="0.01"
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <input
                                            type="number"
                                            value={chg || ''}
                                            onChange={(e) => handleUpdate(owner.id, 'charges', e.target.value)}
                                            className="w-full px-2 py-1 text-right font-mono border rounded focus:ring-2 focus:ring-blue-500"
                                            step="0.01"
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <input
                                            type="number"
                                            value={reg || ''}
                                            onChange={(e) => handleUpdate(owner.id, 'reguls', e.target.value)}
                                            className="w-full px-2 py-1 text-right font-mono border rounded focus:ring-2 focus:ring-blue-500"
                                            step="0.01"
                                        />
                                    </td>
                                    <td className="px-4 py-3 font-bold text-green-600 text-center">{fmtMoney(tot)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-100 font-bold border-t-2">
                            <tr>
                                <td className="px-4 py-3 text-right">TOTAUX :</td>
                                <td className="px-4 py-3 text-center">{fmtMoney(totalSub)}</td>
                                <td className="px-4 py-3 text-center">{fmtMoney(totalConso)}</td>
                                <td className="px-4 py-3 text-center">{fmtMoney(totalRegul)}</td>
                                <td className="px-4 py-3 text-center text-lg bg-green-600 text-white">{fmtMoney(totalTotal)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}
