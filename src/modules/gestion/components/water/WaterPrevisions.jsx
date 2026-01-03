/**
 * WaterPrevisions - Saisie des prévisions eau (V6)
 * 
 * Migration Phase 6 : Utilise useGestionData() via le contexte Supabase.
 * Note: Cette fonctionnalité reste en localStorage car pas de table water_previsions en DB.
 */
import { useState, useMemo } from 'react';
import { useGestionData } from '../../context/GestionSupabaseContext';
import { useToast } from '../../../../components/ToastProvider';
import { fmtMoney } from '../../../../utils/formatters';

export default function WaterPrevisions() {
    const { waterRows } = useGestionData();
    const toast = useToast();

    // Local state for previsions (pas encore en Supabase)
    const [previsions, setPrevisions] = useState({ subs: {}, charges: {}, reguls: {} });

    const handleUpdate = (lotId, type, value) => {
        setPrevisions(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [lotId]: parseFloat(value) || 0
            }
        }));
    };

    // Préparer les données à partir des waterRows (V6)
    const rows = useMemo(() => {
        return waterRows.map(row => {
            const sub = parseFloat(previsions.subs?.[row.lot_id]) || 0;
            const chg = parseFloat(previsions.charges?.[row.lot_id]) || 0;
            const reg = parseFloat(previsions.reguls?.[row.lot_id]) || 0;
            const tot = sub + chg + reg;

            return { row, sub, chg, reg, tot };
        });
    }, [waterRows, previsions]);

    const totalSub = rows.reduce((acc, r) => acc + r.sub, 0);
    const totalConso = rows.reduce((acc, r) => acc + r.chg, 0);
    const totalRegul = rows.reduce((acc, r) => acc + r.reg, 0);
    const totalTotal = rows.reduce((acc, r) => acc + r.tot, 0);

    // Copier vers Excel
    const handleCopyToExcel = async () => {
        try {
            const html = generateExcelHTML(rows, { totalSub, totalConso, totalRegul, totalTotal });
            const blob = new Blob([html], { type: 'text/html' });
            const item = new ClipboardItem({ 'text/html': blob });
            await navigator.clipboard.write([item]);
            toast.success('Tableau copié ! Collez dans Excel (Ctrl+V)');
        } catch (err) {
            console.error('Erreur copie:', err);
            toast.error('Erreur lors de la copie');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-blue-600 flex items-center gap-2">
                    💧 Saisie des Prévisions Eau (Trimestriel)
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
                            {rows.map(({ row, sub, chg, reg, tot }) => (
                                <tr key={row.lot_id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <span className="font-bold text-gray-800">{row.owner_name}</span>
                                        <span className="text-xs text-green-600 italic ml-2">{row.lot_numero}</span>
                                    </td>
                                    <td className="px-3 py-2">
                                        <input
                                            type="number"
                                            value={sub || ''}
                                            onChange={(e) => handleUpdate(row.lot_id, 'subs', e.target.value)}
                                            className="w-full px-2 py-1 text-right font-mono border rounded focus:ring-2 focus:ring-blue-500"
                                            step="0.01"
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <input
                                            type="number"
                                            value={chg || ''}
                                            onChange={(e) => handleUpdate(row.lot_id, 'charges', e.target.value)}
                                            className="w-full px-2 py-1 text-right font-mono border rounded focus:ring-2 focus:ring-blue-500"
                                            step="0.01"
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <input
                                            type="number"
                                            value={reg || ''}
                                            onChange={(e) => handleUpdate(row.lot_id, 'reguls', e.target.value)}
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
