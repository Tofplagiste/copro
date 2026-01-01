/**
 * CreditParametersForm - Formulaire des paramètres du crédit
 * Durée, TEG, Assurance, Fonds travaux
 */
import { CreditCard } from 'lucide-react';
import { formatMoney } from '../utils/creditCalculations';

/**
 * @param {Object} props
 * @param {number} props.duree - Durée en mois
 * @param {Function} props.setDuree
 * @param {number} props.tauxNominal - TEG (%)
 * @param {Function} props.setTauxNominal
 * @param {number} props.tauxAssurance - Taux assurance (%)
 * @param {Function} props.setTauxAssurance
 * @param {number} props.fondsTravaux - Fonds travaux Loi Alur
 * @param {Function} props.setFondsTravaux
 * @param {number} props.montantTotal - Montant total calculé
 */
export default function CreditParametersForm({
    duree, setDuree,
    tauxNominal, setTauxNominal,
    tauxAssurance, setTauxAssurance,
    fondsTravaux, setFondsTravaux,
    montantTotal
}) {
    return (
        <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <CreditCard size={20} />
                Paramètres du Crédit
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Durée (mois)</label>
                    <input
                        type="number" value={duree} onChange={e => setDuree(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">TEG (%)</label>
                    <input
                        type="number" step="0.01" value={tauxNominal} onChange={e => setTauxNominal(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Taux Assurance (%)</label>
                    <input
                        type="number" step="0.01" value={tauxAssurance} onChange={e => setTauxAssurance(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Fonds Travaux Loi Alur (€)</label>
                    <input
                        type="number" value={fondsTravaux} onChange={e => setFondsTravaux(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div className="flex flex-col justify-center">
                    <span className="text-sm text-slate-600">Montant total</span>
                    <span className="text-2xl font-bold text-indigo-600">{formatMoney(montantTotal)}</span>
                </div>
            </div>
        </div>
    );
}
