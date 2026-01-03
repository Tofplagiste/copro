/**
 * WaterPrevisions - Saisie des prévisions eau (V6)
 * 
 * Utilise la table water_previsions via useGestionData.
 */
import { useMemo } from 'react';
import { useGestionData } from '../../context/GestionSupabaseContext';
import { useToast } from '../../../../components/ToastProvider';
import { fmtMoney } from '../../../../utils/formatters';
import WaterPrevisionRow from './WaterPrevisionRow';

export default function WaterPrevisions() {
    const { waterRows, previsions = [], savePrevision, activeQuarter, currentYear, saving } = useGestionData();
    const toast = useToast();
    const q = activeQuarter;

    // Fusionner les données (lots + previsions)
    const rows = useMemo(() => {
        return waterRows.map(row => {
            // Find prevision for this lot & quarter
            const prev = previsions.find(p => p.lot_id === row.lot_id && p.quarter === q) || {};

            const sub = prev.amount_sub || 0;
            const chg = prev.amount_conso || 0;
            const reg = prev.amount_regul || 0;
            const tot = sub + chg + reg;

            return { row, prevision: prev, sub, chg, reg, tot };
        });
    }, [waterRows, previsions, q]);

    // Totaux
    const totalSub = rows.reduce((acc, r) => acc + r.sub, 0);
    const totalConso = rows.reduce((acc, r) => acc + r.chg, 0);
    const totalRegul = rows.reduce((acc, r) => acc + r.reg, 0);
    const totalTotal = rows.reduce((acc, r) => acc + r.tot, 0);

    const handleSave = async (lotId, data) => {
        try {
            await savePrevision({
                lot_id: lotId,
                year: currentYear,
                quarter: q,
                ...data
            });
        } catch (err) {
            console.error("Save Error:", err);
            toast.error(`Erreur: ${err.message || "Sauvegarde"}`);
        }
    };

    // Copier vers Excel
    const handleCopyToExcel = async () => {
        try {
            const html = generateExcelHTML(rows, { totalSub, totalConso, totalRegul, totalTotal });
            const blob = new Blob([html], { type: 'text/html' });
            const item = new ClipboardItem({ 'text/html': blob });
            await navigator.clipboard.write([item]);
            toast.success('Tableau copié !');
        } catch (err) {
            console.error(err);
            toast.error('Erreur lors de la copie');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-blue-600 flex items-center gap-2">
                    💧 Saisie des Prévisions Eau ({q})
                    {saving && <span className="text-xs text-orange-500 font-normal">Enregistrement...</span>}
                </h3>
                <button
                    onClick={handleCopyToExcel}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all"
                >
                    📋 Copier pour Excel
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-800 text-white text-xs uppercase">
                            <tr>
                                <th className="text-left px-4 py-3">Propriétaire / Lot</th>
                                <th className="px-4 py-3 bg-gray-600" style={{ width: '15%' }}>Abonnement (€)</th>
                                <th className="px-4 py-3 bg-blue-600" style={{ width: '15%' }}>Conso (€)</th>
                                <th className="px-4 py-3 bg-amber-500 text-gray-900" style={{ width: '15%' }}>Régul. N-1 (€)</th>
                                <th className="px-4 py-3 bg-green-600 font-bold" style={{ width: '15%' }}>Total Trim. (€)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rows.map(({ row, prevision }) => (
                                <WaterPrevisionRow
                                    key={row.lot_id}
                                    row={row}
                                    prevision={prevision}
                                    onSave={handleSave}
                                />
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

// Helper: Génère le HTML pour copier dans Excel
function generateExcelHTML(rows, totals) {
    let html = `<table border="1" style="border-collapse: collapse; font-family: Calibri, Arial, sans-serif; font-size: 11pt;">
        <thead><tr style="background-color: #1e293b; color: white; font-weight: bold;">
            <th style="padding: 8px 12px; border: 1px solid #333;">Propriétaire</th>
            <th style="padding: 8px 12px; border: 1px solid #333; background-color: #4b5563;">Abonnement (€)</th>
            <th style="padding: 8px 12px; border: 1px solid #333; background-color: #2563eb;">Conso (€)</th>
            <th style="padding: 8px 12px; border: 1px solid #333; background-color: #f59e0b; color: #000;">Régul. N-1 (€)</th>
            <th style="padding: 8px 12px; border: 1px solid #333; background-color: #16a34a;">Total Trim. (€)</th>
        </tr></thead><tbody>`;

    rows.forEach(({ row, sub, chg, reg, tot }, idx) => {
        const bgColor = idx % 2 === 0 ? '#ffffff' : '#f1f5f9';
        html += `<tr style="background-color: ${bgColor};">
            <td style="padding: 6px 12px; border: 1px solid #ccc; font-weight: bold;">${row.owner_name}</td>
            <td style="padding: 6px 12px; border: 1px solid #ccc; text-align: right;">${sub.toFixed(2).replace('.', ',')}</td>
            <td style="padding: 6px 12px; border: 1px solid #ccc; text-align: right;">${chg.toFixed(2).replace('.', ',')}</td>
            <td style="padding: 6px 12px; border: 1px solid #ccc; text-align: right;">${reg.toFixed(2).replace('.', ',')}</td>
            <td style="padding: 6px 12px; border: 1px solid #ccc; text-align: right; font-weight: bold; color: #16a34a;">${tot.toFixed(2).replace('.', ',')} €</td>
        </tr>`;
    });

    html += `</tbody><tfoot><tr style="background-color: #e2e8f0; font-weight: bold;">
        <td style="padding: 8px 12px; border: 1px solid #333; text-align: right;">TOTAUX :</td>
        <td style="padding: 8px 12px; border: 1px solid #333; text-align: right;">${totals.totalSub.toFixed(2).replace('.', ',')} €</td>
        <td style="padding: 8px 12px; border: 1px solid #333; text-align: right;">${totals.totalConso.toFixed(2).replace('.', ',')} €</td>
        <td style="padding: 8px 12px; border: 1px solid #333; text-align: right;">${totals.totalRegul.toFixed(2).replace('.', ',')} €</td>
        <td style="padding: 8px 12px; border: 1px solid #333; text-align: right; background-color: #16a34a; color: white;">${totals.totalTotal.toFixed(2).replace('.', ',')} €</td>
    </tr></tfoot></table>`;

    return html;
}
