/**
 * WaterProjection - Bilan annuel et projection N+1
 * Utilise le hook useWater pour la logique métier (Phase 4)
 */
import { useCopro } from '../../../../context/CoproContext';
import { useWater } from '../../hooks/useWater';
import { useToast } from '../../../../components/ToastProvider';
import { fmtMoney } from '../../../../utils/formatters';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function WaterProjection() {
    const { state } = useCopro();
    const toast = useToast();
    const {
        water,
        owners,
        validTantiemes,
        getAnnualConsumption,
        getProjectedBudget,
        updateWaterParam,
        updateProjection
    } = useWater();

    // Paramètres de projection
    const projPrice = water.projPrice || 5.08;
    const projSub = water.projSub || 92.21;

    // Préparation des données
    const rows = owners.map(owner => {
        const annual = getAnnualConsumption(owner.id);
        const projM3 = water.projections?.[owner.id] !== undefined
            ? water.projections[owner.id]
            : annual.total;
        const budgetN1 = getProjectedBudget(owner);

        return { owner, quarters: annual.quarters, totalN: annual.total, projM3, budgetN1 };
    });

    // Exporter PDF
    const handleExportPDF = () => {
        const doc = new jsPDF('landscape');
        doc.text("Bilan & Projection Eau", 14, 15);
        doc.autoTable({
            startY: 20,
            theme: 'grid',
            styles: { fontSize: 10 },
            headStyles: { fillColor: [44, 62, 80], textColor: 255 },
            body: rows.map(r => [
                r.owner.name,
                ...r.quarters.map(q => q.toFixed(3)),
                r.totalN.toFixed(3),
                r.projM3.toFixed(3),
                fmtMoney(r.budgetN1)
            ]),
            head: [[
                'Propriétaire', 'T1', 'T2', 'T3', 'T4', 'Total N (m³)', 'Prévision N+1', 'Budget N+1'
            ]]
        });
        doc.save('Projections_Eau.pdf');
        toast.success('PDF exporté avec succès !');
    };

    // Copier Tableau (Excel Style)
    const handleCopyTable = async () => {
        try {
            let html = `
                <table border="1" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
                    <thead>
                        <tr style="background-color: #1e293b; color: white;">
                            <th rowspan="2" style="padding: 10px; border: 1px solid #000;">Propriétaire</th>
                            <th colspan="4" style="padding: 10px; border: 1px solid #000; background-color: #4b5563; text-align: center;">Consommation Réelle (m³) Année N</th>
                            <th rowspan="2" style="padding: 10px; border: 1px solid #000; background-color: #2563eb;">Total N (m³)</th>
                            <th rowspan="2" style="padding: 10px; border: 1px solid #000; background-color: #f59e0b; color: black;">Prévision N+1 (m³)</th>
                            <th rowspan="2" style="padding: 10px; border: 1px solid #000; background-color: #16a34a;">Budget N+1 (€)</th>
                        </tr>
                        <tr style="background-color: #1e293b; color: white;">
                            <th style="padding: 5px; border: 1px solid #000; text-align: center;">T1</th>
                            <th style="padding: 5px; border: 1px solid #000; text-align: center;">T2</th>
                            <th style="padding: 5px; border: 1px solid #000; text-align: center;">T3</th>
                            <th style="padding: 5px; border: 1px solid #000; text-align: center;">T4</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            rows.forEach(r => {
                html += `
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ccc; font-weight: bold;">${r.owner.name}</td>
                        ${r.quarters.map(q => `<td style="padding: 8px; border: 1px solid #ccc; text-align: center;">${q.toFixed(3).replace('.', ',')}</td>`).join('')}
                        <td style="padding: 8px; border: 1px solid #ccc; text-align: center; font-weight: bold; color: #2563eb;">${r.totalN.toFixed(3).replace('.', ',')}</td>
                        <td style="padding: 8px; border: 1px solid #ccc; text-align: center; background-color: #fffbeb;">${r.projM3.toFixed(3).replace('.', ',')}</td>
                        <td style="padding: 8px; border: 1px solid #ccc; text-align: center; font-weight: bold; color: #16a34a;">${fmtMoney(r.budgetN1)}</td>
                    </tr>
                `;
            });

            html += `
                    </tbody>
                </table>
            `;

            const blob = new Blob([html], { type: 'text/html' });
            const item = new ClipboardItem({ 'text/html': blob });
            await navigator.clipboard.write([item]);

            toast.success('Tableau copié avec style (compatible Excel) !');
        } catch (err) {
            console.error('Copy failed', err);
            toast.error('Erreur lors de la copie.');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-blue-600 flex items-center gap-2">
                    📈 Bilan Annuel & Projection N+1
                </h3>
                <div className="flex gap-2">
                    <button
                        onClick={handleExportPDF}
                        className="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2"
                    >
                        📄 Exporter PDF
                    </button>
                    <button
                        onClick={handleCopyTable}
                        className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-500 flex items-center gap-2"
                    >
                        📋 Copier Tableau
                    </button>
                </div>
            </div>

            {/* Paramètres de projection */}
            <div className="bg-white rounded-xl shadow-sm border mb-4 overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b font-bold text-gray-700">
                    Paramètres de Projection (Budget Futur)
                </div>
                <div className="p-4 bg-white flex gap-6 items-end flex-wrap">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Prix Estimé N+1 (€/m³)</label>
                        <div className="relative mt-1">
                            <input
                                type="number"
                                value={projPrice}
                                onChange={(e) => updateWaterParam('projPrice', e.target.value)}
                                className="block w-40 pl-3 pr-8 py-2 font-bold text-blue-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                step="0.01"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Abonnement Annuel Est. (€)</label>
                        <div className="relative mt-1">
                            <input
                                type="number"
                                value={projSub}
                                onChange={(e) => updateWaterParam('projSub', e.target.value)}
                                className="block w-40 pl-3 pr-8 py-2 font-bold text-blue-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                step="0.01"
                            />
                        </div>
                    </div>
                    <div className="flex-1 text-sm text-gray-400 italic self-center">
                        La colonne <strong>"Prévision N+1"</strong> est modifiable pour ajuster vos appels.
                    </div>
                </div>
            </div>

            {/* Tableau de projection */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table id="table-water-proj" className="w-full text-sm">
                        <thead className="bg-slate-800 text-white">
                            <tr>
                                <th rowSpan={2} className="text-left px-4 py-3 align-middle">Propriétaire</th>
                                <th colSpan={4} className="px-4 py-2 bg-gray-600 text-xs text-center border-l border-gray-500">Consommation Réelle (m³) Année N</th>
                                <th rowSpan={2} className="px-4 py-3 bg-blue-600 border-l border-blue-500 align-middle text-center">Total N (m³)</th>
                                <th rowSpan={2} className="px-4 py-3 bg-amber-500 text-gray-900 border-l border-amber-400 align-middle text-center" style={{ width: 120 }}>Prévision N+1 (m³)</th>
                                <th rowSpan={2} className="px-4 py-3 bg-green-600 border-l border-green-500 align-middle text-center">Budget N+1 (€)</th>
                            </tr>
                            <tr className="text-xs">
                                <th className="px-2 py-2 bg-gray-500 text-center border-t border-gray-400 border-l border-gray-600">T1</th>
                                <th className="px-2 py-2 bg-gray-500 text-center border-t border-gray-400 border-l border-gray-400">T2</th>
                                <th className="px-2 py-2 bg-gray-500 text-center border-t border-gray-400 border-l border-gray-400">T3</th>
                                <th className="px-2 py-2 bg-gray-500 text-center border-t border-gray-400 border-l border-gray-400">T4</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rows.map(({ owner, quarters, totalN, projM3, budgetN1 }) => (
                                <tr key={owner.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-800">{owner.name}</span>
                                            <span className="text-xs text-green-600 italic">{owner.lot}</span>
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
                                    <td className="px-3 py-2 border-l border-gray-100 bg-amber-50/30">
                                        <input
                                            type="number"
                                            value={projM3 || ''}
                                            onChange={(e) => updateProjection(owner.id, e.target.value)}
                                            className="w-full px-2 py-1 text-right font-mono text-sm border-b border-gray-300 focus:border-amber-500 bg-transparent outline-none transition-colors"
                                            step="0.001"
                                        />
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
        </div>
    );
}
