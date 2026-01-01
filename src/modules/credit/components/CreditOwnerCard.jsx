/**
 * CreditOwnerCard - Carte d'un copropriétaire
 * Affiche les infos et permet de modifier l'apport
 */
import { TOTAL_TANTIEMES } from '../data/coproprietaires';

/**
 * @param {Object} props
 * @param {Object} props.copro - Données du copropriétaire
 * @param {Function} props.onUpdate - Callback pour mise à jour
 */
export default function CreditOwnerCard({ copro, onUpdate }) {
    return (
        <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center text-sm">
                <div className="md:col-span-2">
                    <div className="font-semibold text-slate-800">{copro.nom}</div>
                    <div className="text-xs text-slate-500">{copro.commune} - {copro.lot}</div>
                </div>
                <div className="text-center">
                    <div className="text-xs text-slate-500">Tantièmes</div>
                    <div className="font-bold text-indigo-600">
                        {copro.tantiemes + copro.tantCellier}
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-xs text-slate-500">Quote-part</div>
                    <div className="font-semibold">{((copro.tantiemes + copro.tantCellier) / TOTAL_TANTIEMES * 100).toFixed(2)}%</div>
                </div>
                <div>
                    <label className="text-xs text-slate-500">Apport perso (€)</label>
                    <input
                        type="number"
                        value={copro.apportPersonnel}
                        onChange={e => onUpdate(copro.id, 'apportPersonnel', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 border rounded text-sm"
                    />
                </div>
                <div className="flex items-center justify-center gap-2">
                    <input
                        type="checkbox"
                        checked={copro.paiementComptant}
                        onChange={e => onUpdate(copro.id, 'paiementComptant', e.target.checked)}
                        className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Comptant</span>
                </div>
            </div>
        </div>
    );
}
