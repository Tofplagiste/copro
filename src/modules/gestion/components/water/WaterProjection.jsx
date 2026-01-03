/**
 * WaterProjection - Bilan annuel et projection N+1 (V6)
 * 
 * Migration Phase 6 : Utilise useGestionData() au lieu de useWater.
 * Simplifié pour respecter la limite de 150 lignes.
 */
import { useMemo } from 'react';
import { useGestionData } from '../../context/GestionSupabaseContext';
import { useToast } from '../../../../components/ToastProvider';
import { fmtMoney } from '../../../../utils/formatters';
import WaterProjectionTable from './WaterProjectionTable';

export default function WaterProjection() {
    const toast = useToast();
    const {
        waterRows,
        waterSettings,
        updateWaterSettings
    } = useGestionData();

    // Paramètres de projection
    const projPrice = waterSettings?.proj_price || 5.08;
    const projSub = waterSettings?.proj_sub || 92.21;

    // Préparer les données (simplifié - sans calculs complexes pour l'instant)
    const rows = useMemo(() => {
        return waterRows.map(row => {
            // Calculer consommation par trimestre depuis les readings
            const quarters = ['T1', 'T2', 'T3', 'T4'].map(q => {
                const r = row.readings?.[q];
                return r ? Math.max(0, (r.new || 0) - (r.old || 0)) : 0;
            });
            const totalN = quarters.reduce((s, q) => s + q, 0);
            const projM3 = totalN; // Par défaut, projection = consommation réelle
            const budgetN1 = projM3 * projPrice + (projSub / 4); // Simplification

            return { row, quarters, totalN, projM3, budgetN1 };
        });
    }, [waterRows, projPrice, projSub]);

    const handleParamChange = (field, value) => {
        updateWaterSettings({ [field]: parseFloat(value) || 0 });
    };

    const handleExportPDF = () => {
        toast.info('Export PDF en cours de migration...');
    };

    const handleCopyTable = async () => {
        try {
            const html = generateProjectionHTML(rows);
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
                        <input
                            type="number"
                            value={projPrice}
                            onChange={(e) => handleParamChange('proj_price', e.target.value)}
                            className="block w-40 mt-1 pl-3 pr-8 py-2 font-bold text-blue-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            step="0.01"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Abonnement Annuel Est. (€)</label>
                        <input
                            type="number"
                            value={projSub}
                            onChange={(e) => handleParamChange('proj_sub', e.target.value)}
                            className="block w-40 mt-1 pl-3 pr-8 py-2 font-bold text-blue-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            step="0.01"
                        />
                    </div>
                </div>
            </div>

            <WaterProjectionTable rows={rows} />
        </div>
    );
}

// Helper: Génère le HTML pour copier dans Excel
function generateProjectionHTML(rows) {
    let html = `<table border="1" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
        <thead><tr style="background-color: #1e293b; color: white;">
            <th style="padding: 10px; border: 1px solid #000;">Propriétaire</th>
            <th style="padding: 10px; border: 1px solid #000;">T1</th>
            <th style="padding: 10px; border: 1px solid #000;">T2</th>
            <th style="padding: 10px; border: 1px solid #000;">T3</th>
            <th style="padding: 10px; border: 1px solid #000;">T4</th>
            <th style="padding: 10px; border: 1px solid #000; background-color: #2563eb;">Total N</th>
            <th style="padding: 10px; border: 1px solid #000; background-color: #16a34a;">Budget N+1</th>
        </tr></thead><tbody>`;

    rows.forEach(r => {
        html += `<tr>
            <td style="padding: 8px; border: 1px solid #ccc; font-weight: bold;">${r.row.owner_name}</td>
            ${r.quarters.map(q => `<td style="padding: 8px; border: 1px solid #ccc; text-align: center;">${q.toFixed(3).replace('.', ',')}</td>`).join('')}
            <td style="padding: 8px; border: 1px solid #ccc; text-align: center; font-weight: bold; color: #2563eb;">${r.totalN.toFixed(3).replace('.', ',')}</td>
            <td style="padding: 8px; border: 1px solid #ccc; text-align: center; font-weight: bold; color: #16a34a;">${fmtMoney(r.budgetN1)}</td>
        </tr>`;
    });

    html += `</tbody></table>`;
    return html;
}
