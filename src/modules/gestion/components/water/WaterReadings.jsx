/**
 * WaterReadings - Table des relevés de compteurs
 * Utilise le hook useWater pour la logique métier (Phase 4)
 */
import { useCopro } from '../../../../context/CoproContext';
import { useWater } from '../../hooks/useWater';
import { fmtMoney } from '../../../../utils/formatters';
import { generateWaterReadingsPDF, savePDF } from '../../utils/pdfGestion';

export default function WaterReadings() {
    const { state } = useCopro();
    const {
        water,
        activeQuarter,
        getWaterCost,
        updateReading,
        updateMeter
    } = useWater();

    const q = activeQuarter;

    // Export PDF Fiche Relevés (via pdfExport)
    const handleExportFicheReleves = () => {
        const doc = generateWaterReadingsPDF(state.owners, water, q);
        savePDF(doc, `Fiche_Releves_${q}.pdf`);
    };

    // Préparation des données
    const rows = state.owners.map(owner => {
        // Read-only access with safeguards
        const qReadings = water.readings[q] || {};
        const r = qReadings[owner.id] || { old: 0, new: 0 };
        const cost = getWaterCost(owner, q);

        return { owner, r, ...cost };
    });

    const totalVol = rows.reduce((acc, row) => acc + (row.owner.hasMeter ? row.conso : 0), 0);
    const totalFix = rows.reduce((acc, row) => acc + (row.owner.hasMeter ? row.fixedCost : 0), 0);
    const totalVar = rows.reduce((acc, row) => acc + (row.owner.hasMeter ? row.variableCost : 0), 0);
    const totalFinal = rows.reduce((acc, row) => acc + (row.owner.hasMeter ? row.total : 0), 0);

    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                <span className="font-bold text-gray-700">
                    Relevés (<span className="text-blue-600">{q}</span>)
                </span>
                <button
                    onClick={handleExportFicheReleves}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
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
                        {rows.map(({ owner, r, conso, fixedCost, variableCost, total }) => (
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
                                                onChange={(e) => updateMeter(owner.id, e.target.value)}
                                                className="w-full px-2 py-1 text-center border rounded focus:ring-2 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="px-3 py-2">
                                            <input
                                                type="number"
                                                value={r.old || ''}
                                                onChange={(e) => updateReading(owner.id, q, 'old', e.target.value)}
                                                className="w-full px-2 py-1 text-right font-mono bg-blue-50 border rounded focus:ring-2 focus:ring-blue-500"
                                                step="0.001"
                                            />
                                        </td>
                                        <td className="px-3 py-2">
                                            <input
                                                type="number"
                                                value={r.new || ''}
                                                onChange={(e) => updateReading(owner.id, q, 'new', e.target.value)}
                                                className="w-full px-2 py-1 text-right font-mono bg-green-50 border rounded focus:ring-2 focus:ring-green-500"
                                                step="0.001"
                                            />
                                        </td>
                                        <td className="px-3 py-2 text-center font-bold text-blue-600">{conso.toFixed(3)}</td>
                                        <td className="px-3 py-2 text-center text-gray-500">{fmtMoney(fixedCost)}</td>
                                        <td className="px-3 py-2 text-center text-gray-500">{fmtMoney(variableCost)}</td>
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
