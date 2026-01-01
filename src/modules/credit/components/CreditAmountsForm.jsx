/**
 * CreditAmountsForm - Formulaire des montants globaux
 * Parties communes, balcons, celliers
 */
import { Settings } from 'lucide-react';

/**
 * @param {Object} props
 * @param {number} props.partiesCommunes
 * @param {Function} props.setPartiesCommunes
 * @param {number} props.grandBalcon
 * @param {Function} props.setGrandBalcon
 * @param {number} props.petitsBalcons
 * @param {Function} props.setPetitsBalcons
 * @param {number} props.celliers
 * @param {Function} props.setCelliers
 */
export default function CreditAmountsForm({
    partiesCommunes, setPartiesCommunes,
    grandBalcon, setGrandBalcon,
    petitsBalcons, setPetitsBalcons,
    celliers, setCelliers
}) {
    return (
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Settings size={20} />
                Montants Globaux
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Parties Communes (€)</label>
                    <input
                        type="number" value={partiesCommunes} onChange={e => setPartiesCommunes(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">Répartition sur 1000 tantièmes</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Grand Balcon (€)</label>
                    <input
                        type="number" value={grandBalcon} onChange={e => setGrandBalcon(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">Répartition aux tantièmes</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Petits Balcons (€)</label>
                    <input
                        type="number" value={petitsBalcons} onChange={e => setPetitsBalcons(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">Parts égales</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Celliers (€)</label>
                    <input
                        type="number" value={celliers} onChange={e => setCelliers(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">22 tantièmes celliers</p>
                </div>
            </div>
        </div>
    );
}
