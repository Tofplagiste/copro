/**
 * WaterReadingRow - Ligne de tableau pour un relevé d'eau (V6)
 * 
 * Composant extrait pour respecter la limite de 150 lignes.
 */
import { useState, useCallback, useEffect } from 'react';

/**
 * Ligne individuelle du tableau de relevés.
 * @param {Object} props
 * @param {Object} props.row - Données de la ligne (lot, owner, meter, readings)
 * @param {string} props.quarter - Trimestre actif
 * @param {Function} props.onReadingChange - Callback pour modification relevé
 * @param {Function} props.onMeterChange - Callback pour modification compteur
 */
export default function WaterReadingRow({ row, quarter, onReadingChange, onMeterChange }) {
    const reading = row.readings?.[quarter] || { old: 0, new: 0 };
    const conso = Math.max(0, (reading.new || 0) - (reading.old || 0));

    // Local state for input values (controlled inputs)
    const [localOld, setLocalOld] = useState(reading.old || '');
    const [localNew, setLocalNew] = useState(reading.new || '');
    const [localMeter, setLocalMeter] = useState(row.meter_number || '');

    // Sync state with props (intentional prop-to-state sync pattern)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { setLocalOld(reading.old || ''); }, [reading.old]);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { setLocalNew(reading.new || ''); }, [reading.new]);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { setLocalMeter(row.meter_number || ''); }, [row.meter_number]);

    // Save on blur
    const handleOldBlur = useCallback(() => {
        const numVal = parseFloat(String(localOld).replace(',', '.')) || 0;
        if (numVal !== (reading.old || 0)) {
            onReadingChange(row.lot_id, 'old', numVal);
        }
    }, [localOld, reading.old, row.lot_id, onReadingChange]);

    const handleNewBlur = useCallback(() => {
        const numVal = parseFloat(String(localNew).replace(',', '.')) || 0;
        if (numVal !== (reading.new || 0)) {
            onReadingChange(row.lot_id, 'new', numVal);
        }
    }, [localNew, reading.new, row.lot_id, onReadingChange]);

    const handleMeterBlur = useCallback(() => {
        if (localMeter !== (row.meter_number || '')) {
            // Pass lot_id to allow creating meter if meter_id is null
            onMeterChange(row.meter_id, localMeter, row.lot_id);
        }
    }, [localMeter, row.meter_number, row.meter_id, row.lot_id, onMeterChange]);

    // ALLOW EDITING EVEN IF NO METER (To create one)
    // if (!row.has_meter) { ... } -> Removed to allow adding meter number

    return (
        <tr className="hover:bg-gray-50">
            <td className="px-4 py-3">
                <div className="font-semibold text-gray-800">{row.owner_name}</div>
                <span className="text-xs text-green-600 italic">Lot {row.lot_numero} / {row.lot_nom}</span>
            </td>
            <td className="px-3 py-2">
                <input
                    type="text"
                    value={localMeter}
                    onChange={(e) => setLocalMeter(e.target.value)}
                    onBlur={handleMeterBlur}
                    className="w-full px-2 py-1 text-center border rounded focus:ring-2 focus:ring-blue-500"
                />
            </td>
            <td className="px-3 py-2">
                <input
                    type="number"
                    value={localOld}
                    onChange={(e) => setLocalOld(e.target.value)}
                    onBlur={handleOldBlur}
                    className="w-full px-2 py-1 text-right font-mono bg-blue-50 border rounded focus:ring-2 focus:ring-blue-500"
                    step="0.001"
                />
            </td>
            <td className="px-3 py-2">
                <input
                    type="number"
                    value={localNew}
                    onChange={(e) => setLocalNew(e.target.value)}
                    onBlur={handleNewBlur}
                    className="w-full px-2 py-1 text-right font-mono bg-green-50 border rounded focus:ring-2 focus:ring-green-500"
                    step="0.001"
                />
            </td>
            <td className="px-3 py-2 text-center font-bold text-blue-600">{conso.toFixed(3)}</td>
        </tr>
    );
}
