/**
 * WaterReadings - Table des relevés de compteurs
 */
import { useCopro } from '../../context/CoproContext';
import { fmtMoney } from '../../utils/formatters';

export default function WaterReadings() {
    const { state, updateState } = useCopro();
    const water = state.water;
    const q = water.activeQuarter;

    // Calcul du prix au m³
    const computePrice = () => {
        if (water.priceMode === 'manual') return water.manualPrice || 0;
        if (water.priceMode === 'annual') {
            const conso = water.annualTotal - water.annualSub;
            return water.annualVol > 0 ? conso / water.annualVol : 0;
        }
        return water.manualPrice || 4.5;
    };
    const pricePerM3 = computePrice();

    // Calcul tantièmes valides (propriétaires avec compteur)
    const validTantiemes = state.owners
        .filter(o => !o.isCommon && o.hasMeter)
        .reduce((sum, o) => sum + (o.tantiemes || 0), 0);

    // Mise à jour d'un relevé
    const handleReadingChange = (ownerId, field, value) => {
        const readings = { ...water.readings };
        if (!readings[q]) readings[q] = {};
        if (!readings[q][ownerId]) readings[q][ownerId] = { old: 0, new: 0 };
        readings[q][ownerId][field] = parseFloat(value) || 0;
        updateState({ water: { ...water, readings } });
    };

    // Mise à jour numéro compteur
    const handleMeterChange = (ownerId, value) => {
        const meters = { ...water.meters, [ownerId]: value };
        updateState({ water: { ...water, meters } });
    };

    // Calcul des totaux
    let totalVol = 0, totalFix = 0, totalVar = 0, totalFinal = 0;

    // Préparation des données
    const rows = state.owners.map(owner => {
        if (!water.readings[q]) water.readings[q] = {};
        if (!water.readings[q][owner.id]) water.readings[q][owner.id] = { old: 0, new: 0 };

        const r = water.readings[q][owner.id];
        let cFix = 0, cVar = 0, conso = 0;

        if (owner.hasMeter) {
            cFix = validTantiemes > 0 ? (water.subAmount || 0) * (owner.tantiemes / validTantiemes) : 0;
            conso = Math.max(0, (r.new || 0) - (r.old || 0));
            cVar = conso * pricePerM3;
            totalVol += conso;
            totalFix += cFix;
            totalVar += cVar;
            totalFinal += cFix + cVar;
        }

        return { owner, r, cFix, cVar, conso, total: cFix + cVar };
    });

    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                <span className="font-bold text-gray-700">
                    Relevés (<span className="text-blue-600">{q}</span>)
                </span>
                <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                    📄 Fiche Relevés
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                        <tr>
                            <th className="text-left px-4 py-3">Propriétaire / Lot</th>
                            <th className="px-3 py-3 bg-amber-50 text-amber-700" style={{ width: 120 }}>N° Compteur</th>
                            <th className="px-3 py-3 bg-blue-50 text-blue-700" style={{ width: 90 }}>Ancien</th>
                            <th className="px-3 py-3 bg-green-50 text-green-700" style={{ width: 90 }}>Nouveau</th>
                            <th className="px-3 py-3 text-blue-600 font-bold">Conso</th>
                            <th className="px-3 py-3">Abo. (€)</th>
                            <th className="px-3 py-3">Conso (€)</th>
                            <th className="px-3 py-3 bg-gray-100 font-bold border-l">TOTAL (€)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {rows.map(({ owner, r, cFix, cVar, conso, total }) => (
                            <tr key={owner.id} className={`hover:bg-gray-50 ${owner.isCommon ? 'bg-gray-100 font-bold' : ''}`}>
                                <td className="px-4 py-3">
                                    <div className="font-semibold text-gray-800">{owner.name}</div>
                                    <span className="text-xs text-green-600 italic">{owner.lot}</span>
                                </td>
                                {owner.hasMeter ? (
                                    <>
                                        <td className="px-3 py-2">
                                            <input
                                                type="text"
                                                value={water.meters[owner.id] || ''}
                                                onChange={(e) => handleMeterChange(owner.id, e.target.value)}
                                                className="w-full px-2 py-1 text-center border rounded focus:ring-2 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="px-3 py-2">
                                            <input
                                                type="number"
                                                value={r.old || ''}
                                                onChange={(e) => handleReadingChange(owner.id, 'old', e.target.value)}
                                                className="w-full px-2 py-1 text-right font-mono bg-blue-50 border rounded focus:ring-2 focus:ring-blue-500"
                                                step="0.001"
                                            />
                                        </td>
                                        <td className="px-3 py-2">
                                            <input
                                                type="number"
                                                value={r.new || ''}
                                                onChange={(e) => handleReadingChange(owner.id, 'new', e.target.value)}
                                                className="w-full px-2 py-1 text-right font-mono bg-green-50 border rounded focus:ring-2 focus:ring-green-500"
                                                step="0.001"
                                            />
                                        </td>
                                        <td className="px-3 py-2 text-center font-bold text-blue-600">{conso.toFixed(3)}</td>
                                        <td className="px-3 py-2 text-center text-gray-500">{fmtMoney(cFix)}</td>
                                        <td className="px-3 py-2 text-center text-gray-500">{fmtMoney(cVar)}</td>
                                        <td className="px-3 py-2 text-center font-bold bg-gray-50 border-l">{fmtMoney(total)}</td>
                                    </>
                                ) : (
                                    <>
                                        <td className="px-3 py-2"><div className="h-8 bg-gray-200 rounded opacity-50" /></td>
                                        <td className="px-3 py-2"><div className="h-8 bg-gray-200 rounded opacity-50" /></td>
                                        <td className="px-3 py-2"><div className="h-8 bg-gray-200 rounded opacity-50" /></td>
                                        <td className="px-3 py-2 text-center text-gray-400">-</td>
                                        <td className="px-3 py-2 text-center text-gray-400">-</td>
                                        <td className="px-3 py-2 text-center text-gray-400">-</td>
                                        <td className="px-3 py-2 text-center text-gray-400 border-l">-</td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-100 font-bold border-t-2">
                        <tr>
                            <td colSpan={4} className="px-4 py-3 text-right">TOTAUX :</td>
                            <td className="px-3 py-3 text-center text-blue-600">{totalVol.toFixed(3)}</td>
                            <td className="px-3 py-3 text-center">{fmtMoney(totalFix)}</td>
                            <td className="px-3 py-3 text-center">{fmtMoney(totalVar)}</td>
                            <td className="px-3 py-3 text-center text-lg text-blue-600 border-l">{fmtMoney(totalFinal)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
