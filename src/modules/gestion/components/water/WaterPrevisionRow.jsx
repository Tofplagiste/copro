import { useState, useCallback, useEffect } from 'react';
import { fmtMoney } from '../../../../utils/formatters';

export default function WaterPrevisionRow({ row, prevision, onSave }) {
    // Local state to manage inputs
    const [sub, setSub] = useState(prevision?.amount_sub || 0);
    const [conso, setConso] = useState(prevision?.amount_conso || 0);
    const [regul, setRegul] = useState(prevision?.amount_regul || 0);

    // Sync with props when they change (e.g. after reload)
    useEffect(() => {
        setSub(prevision?.amount_sub || 0);
        setConso(prevision?.amount_conso || 0);
        setRegul(prevision?.amount_regul || 0);
    }, [prevision]);

    // Calculate total for display
    const total = (parseFloat(sub) || 0) + (parseFloat(conso) || 0) + (parseFloat(regul) || 0);

    // Handle blur -> Save if changed
    const handleBlur = useCallback(() => {
        // Construct payload
        const data = {
            amount_sub: parseFloat(sub) || 0,
            amount_conso: parseFloat(conso) || 0,
            amount_regul: parseFloat(regul) || 0
        };

        // Check if different from props (avoid useless saves)
        const p = prevision || {};
        if (
            data.amount_sub !== (p.amount_sub || 0) ||
            data.amount_conso !== (p.amount_conso || 0) ||
            data.amount_regul !== (p.amount_regul || 0)
        ) {
            onSave(row.lot_id, data);
        }
    }, [sub, conso, regul, row.lot_id, prevision, onSave]);

    return (
        <tr className="hover:bg-gray-50">
            <td className="px-4 py-3">
                <span className="font-bold text-gray-800">{row.owner_name}</span>
                <span className="text-xs text-green-600 italic ml-2">Lot {row.lot_numero} / {row.lot_nom}</span>
            </td>
            <td className="px-3 py-2">
                <input
                    type="number"
                    value={sub || ''}
                    onChange={e => setSub(e.target.value)}
                    onBlur={handleBlur}
                    className="w-full px-2 py-1 text-right font-mono border rounded focus:ring-2 focus:ring-blue-500"
                    step="0.01"
                />
            </td>
            <td className="px-3 py-2">
                <input
                    type="number"
                    value={conso || ''}
                    onChange={e => setConso(e.target.value)}
                    onBlur={handleBlur}
                    className="w-full px-2 py-1 text-right font-mono border rounded focus:ring-2 focus:ring-blue-500"
                    step="0.01"
                />
            </td>
            <td className="px-3 py-2">
                <input
                    type="number"
                    value={regul || ''}
                    onChange={e => setRegul(e.target.value)}
                    onBlur={handleBlur}
                    className="w-full px-2 py-1 text-right font-mono border rounded focus:ring-2 focus:ring-blue-500"
                    step="0.01"
                />
            </td>
            <td className="px-4 py-3 font-bold text-green-600 text-center">
                {fmtMoney(total)}
            </td>
        </tr>
    );
}
