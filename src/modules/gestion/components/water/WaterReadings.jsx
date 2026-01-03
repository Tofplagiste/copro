/**
 * WaterReadings - Table des relevés de compteurs (V6)
 * 
 * Migration Phase 6 : Utilise useGestionData() au lieu de useCopro/useWater.
 * Les données sont déjà formatées par waterAdapter.
 */
import { useMemo } from 'react';
import { useGestionData } from '../../context/GestionSupabaseContext';
import WaterReadingRow from './WaterReadingRow';

/**
 * Calcule les totaux pour le tableau de relevés.
 * @param {Array} rows - Lignes de données eau
 * @param {string} quarter - Trimestre actif
 * @returns {{ totalVol: number, totalCost: number }}
 */
function calculateTotals(rows, quarter) {
    return rows.reduce((acc, row) => {
        const reading = row.readings?.[quarter];
        const conso = reading ? Math.max(0, (reading.new || 0) - (reading.old || 0)) : 0;
        return {
            totalVol: acc.totalVol + conso,
            totalCost: acc.totalCost + conso * 4.5 // TODO: Use actual price
        };
    }, { totalVol: 0, totalCost: 0 });
}

export default function WaterReadings() {
    const {
        waterRows,
        activeQuarter,
        currentYear,
        saveReading,
        updateMeterNumber,
        saving
    } = useGestionData();

    const q = activeQuarter;

    // Handle reading change (debounced save)
    const handleReadingChange = (lotId, field, value) => {
        const numValue = parseFloat(value) || 0;
        const row = waterRows.find(r => r.lot_id === lotId);
        const currentReading = row?.readings?.[q] || { old: 0, new: 0 };

        // Save to Supabase
        saveReading({
            lot_id: lotId,
            year: currentYear,
            quarter: q,
            old_value: field === 'old' ? numValue : currentReading.old,
            new_value: field === 'new' ? numValue : currentReading.new
        });
    };

    // Handle meter number change
    const handleMeterChange = (meterId, value, lotId) => {
        updateMeterNumber(meterId, value, lotId);
    };

    // Filter visible rows (only apartments per user request)
    const filteredRows = useMemo(() => {
        return waterRows.filter(r => (r.lot_type || '').toLowerCase().includes('appart'));
    }, [waterRows]);

    // Calculate totals
    const totals = useMemo(() => calculateTotals(filteredRows, q), [filteredRows, q]);

    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                <span className="font-bold text-gray-700">
                    Relevés (<span className="text-blue-600">{q}</span>)
                    {saving && <span className="ml-2 text-xs text-orange-500">Sauvegarde...</span>}
                </span>
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
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredRows.map(row => (
                            <WaterReadingRow
                                key={row.lot_id}
                                row={row}
                                quarter={q}
                                onReadingChange={handleReadingChange}
                                onMeterChange={handleMeterChange}
                            />
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-100 font-bold border-t-2">
                        <tr>
                            <td colSpan={4} className="px-4 py-3 text-right">TOTAUX :</td>
                            <td className="px-3 py-3 text-center text-blue-600">{totals.totalVol.toFixed(3)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
