/**
 * WaterProjection - Bilan annuel et projection N+1
 */
import { useCopro } from '../../context/CoproContext';
import { fmtMoney } from '../../utils/formatters';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function WaterProjection() {
    const { state, updateState } = useCopro();
    const water = state.water;

    // Paramètres de projection
    const projPrice = water.projPrice || 5.08;
    const projSub = water.projSub || 92.21;

    const handleParamChange = (field, value) => {
        updateState({
            water: {
                ...water,
                [field]: parseFloat(value) || 0
            }
        });
    };

    const handleProjectionChange = (ownerId, value) => {
        const projections = { ...water.projections, [ownerId]: parseFloat(value) || 0 };
        updateState({ water: { ...water, projections } });
    };

    // Calcul tantièmes valides
    const validTantiemes = state.owners
        .filter(o => !o.isCommon && o.hasMeter)
        .reduce((sum, o) => sum + (o.tantiemes || 0), 0);

    // Préparation des données
    const rows = state.owners
        .filter(o => !o.isCommon && o.hasMeter)
        .map(owner => {
            // Consommation par trimestre
            const quarters = ['T1', 'T2', 'T3', 'T4'].map(q => {
                const r = water.readings[q]?.[owner.id] || { old: 0, new: 0 };
                return Math.max(0, (r.new || 0) - (r.old || 0));
            });

            const totalN = quarters.reduce((s, v) => s + v, 0);

            // Projection N+1
            const projM3 = water.projections?.[owner.id] !== undefined
                ? water.projections[owner.id]
                : totalN;

            // Budget estimé N+1
            const subPart = validTantiemes > 0 ? projSub * (owner.tantiemes / validTantiemes) : 0;
            const consoPart = projM3 * projPrice;
            const budgetN1 = subPart + consoPart;

            return { owner, quarters, totalN, projM3, budgetN1 };
        });

    // Export PDF projection eau
    const exportPDF = () => {
        const doc = new jsPDF('landscape');

        // En-tête
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('PROJECTION EAU - BILAN ANNUEL & BUDGET N+1', 148, 15, { align: 'center' });
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Copropriété 9 Rue André Leroux - 33780 SOULAC-SUR-MER', 148, 22, { align: 'center' });

        // Paramètres
        doc.setFontSize(10);
        doc.text(`Prix estimé N+1: ${projPrice} €/m³ | Abonnement annuel estimé: ${projSub} €`, 14, 35);

        // Tableau
        const tableHeaders = ['Propriétaire', 'Lot', 'T1 (m³)', 'T2 (m³)', 'T3 (m³)', 'T4 (m³)', 'Total N (m³)', 'Prévision N+1 (m³)', 'Budget N+1 (€)'];
        const tableRows = rows.map(({ owner, quarters, totalN, projM3, budgetN1 }) => [
            owner.name,
            owner.lot,
            quarters[0].toFixed(3),
            quarters[1].toFixed(3),
            quarters[2].toFixed(3),
            quarters[3].toFixed(3),
            totalN.toFixed(3),
            projM3.toFixed(3),
            fmtMoney(budgetN1) + ' €'
        ]);

        doc.autoTable({
            startY: 42,
            head: [tableHeaders],
            body: tableRows,
            headStyles: { fillColor: [30, 64, 175], fontSize: 8 },
            bodyStyles: { fontSize: 8 },
            columnStyles: {
                2: { halign: 'right' },
                3: { halign: 'right' },
                4: { halign: 'right' },
                5: { halign: 'right' },
                6: { halign: 'right' },
                7: { halign: 'right' },
                8: { halign: 'right' }
            }
        });

        // Totaux
        const totalConso = rows.reduce((s, r) => s + r.totalN, 0);
        const totalProj = rows.reduce((s, r) => s + r.projM3, 0);
        const totalBudget = rows.reduce((s, r) => s + r.budgetN1, 0);

        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`TOTAUX: Consommation N = ${totalConso.toFixed(3)} m³ | Prévision N+1 = ${totalProj.toFixed(3)} m³ | Budget N+1 = ${fmtMoney(totalBudget)} €`, 14, finalY);

        doc.save('Projection_Eau_N+1.pdf');
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-blue-600 flex items-center gap-2">
                    📈 Bilan Annuel & Projection N+1
                </h3>
                <div className="flex gap-2">
                    <button onClick={exportPDF} className="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
                        📄 Exporter PDF
                    </button>
                    <button className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-500">
                        📋 Copier Tableau
                    </button>
                </div>
            </div>

            {/* Paramètres de projection */}
            <div className="bg-white rounded-xl shadow-sm border mb-4">
                <div className="bg-gray-50 px-4 py-2 border-b font-bold text-gray-700">
                    Paramètres de Projection (Budget Futur)
                </div>
                <div className="p-4 bg-gray-50 flex gap-6 items-end flex-wrap">
                    <div>
                        <label className="text-xs font-bold text-gray-500">Prix Estimé N+1 (€/m³)</label>
                        <input
                            type="number"
                            value={projPrice}
                            onChange={(e) => handleParamChange('projPrice', e.target.value)}
                            className="block w-40 mt-1 px-3 py-2 font-bold border border-blue-500 rounded-lg"
                            step="0.01"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">Abonnement Annuel Est. (€)</label>
                        <input
                            type="number"
                            value={projSub}
                            onChange={(e) => handleParamChange('projSub', e.target.value)}
                            className="block w-40 mt-1 px-3 py-2 font-bold border border-blue-500 rounded-lg"
                            step="0.01"
                        />
                    </div>
                    <div className="text-sm text-gray-500">
                        La colonne <strong>"Prévision N+1 (m³)"</strong> est modifiable pour ajuster vos appels futurs.
                    </div>
                </div>
            </div>

            {/* Tableau de projection */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-800 text-white">
                            <tr>
                                <th rowSpan={2} className="text-left px-4 py-3 align-middle">Propriétaire</th>
                                <th colSpan={4} className="px-4 py-2 bg-gray-600 text-xs">Consommation Réelle (m³) Année N</th>
                                <th rowSpan={2} className="px-4 py-3 bg-blue-600 border-l align-middle">Total N (m³)</th>
                                <th rowSpan={2} className="px-4 py-3 bg-amber-500 text-gray-900 border-l align-middle" style={{ width: 120 }}>Prévision N+1 (m³)</th>
                                <th rowSpan={2} className="px-4 py-3 bg-green-600 border-l align-middle">Budget N+1 (€)</th>
                            </tr>
                            <tr className="text-xs">
                                <th className="px-2 py-2 bg-gray-500">T1</th>
                                <th className="px-2 py-2 bg-gray-500">T2</th>
                                <th className="px-2 py-2 bg-gray-500">T3</th>
                                <th className="px-2 py-2 bg-gray-500">T4</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rows.map(({ owner, quarters, totalN, projM3, budgetN1 }) => (
                                <tr key={owner.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <span className="font-bold text-gray-800">{owner.name}</span>
                                        <span className="text-xs text-green-600 italic ml-2">{owner.lot}</span>
                                    </td>
                                    {quarters.map((q, i) => (
                                        <td key={i} className="px-2 py-2 text-center font-mono text-gray-600">
                                            {q.toFixed(3)}
                                        </td>
                                    ))}
                                    <td className="px-4 py-2 text-center font-bold text-blue-600 border-l">
                                        {totalN.toFixed(3)}
                                    </td>
                                    <td className="px-3 py-2 border-l">
                                        <input
                                            type="number"
                                            value={projM3 || ''}
                                            onChange={(e) => handleProjectionChange(owner.id, e.target.value)}
                                            className="w-full px-2 py-1 text-right font-mono bg-amber-50 border border-amber-400 rounded focus:ring-2 focus:ring-amber-500"
                                            step="0.001"
                                        />
                                    </td>
                                    <td className="px-4 py-2 text-center font-bold text-green-600 border-l">
                                        {fmtMoney(budgetN1)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
