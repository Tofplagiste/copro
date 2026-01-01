/**
 * VotePresenceCard - Carte de présence d'un copropriétaire
 * Permet de définir le statut de présence et le mandataire
 */
import { PRESENCE_TYPES } from '../data/voteConstants';

/**
 * @param {Object} props
 * @param {Object} props.copro - Copropriétaire
 * @param {Function} props.onUpdatePresence - Callback pour changer présence
 * @param {Function} props.onUpdateProcuration - Callback pour changer mandataire
 * @param {Function} props.getMandataires - Fonction pour obtenir les mandataires
 * @param {Object} props.procurationCounts - Compte des procurations par mandataire
 */
export default function VotePresenceCard({
    copro,
    onUpdatePresence,
    onUpdateProcuration,
    getMandataires,
    procurationCounts
}) {
    const mandataires = getMandataires(copro.id);

    return (
        <div className="bg-white rounded-lg p-4 border-l-4 border-blue-400">
            <div className="font-bold text-slate-800 mb-2">{copro.nom}</div>
            <div className="text-xs text-slate-500 mb-3">{copro.tantiemes} tantièmes</div>

            <div className="flex gap-1 flex-wrap mb-2">
                {PRESENCE_TYPES.map(type => {
                    const isSelected = copro.presence === type.key;
                    return (
                        <button
                            key={type.key}
                            onClick={() => onUpdatePresence(copro.id, type.key)}
                            className={`
                                flex-1 min-w-[60px] px-2 py-1.5 rounded text-xs font-semibold border-2 transition-all
                                ${type.color}
                                ${isSelected ? 'ring-2 ring-offset-1 ring-slate-400 scale-105' : 'opacity-60 hover:opacity-100'}
                            `}
                        >
                            {type.label}
                        </button>
                    );
                })}
            </div>

            {/* Sélecteur procuration */}
            {copro.presence === 'procuration' && (
                <div className="mt-2">
                    <select
                        value={copro.procurationDonneeA || ''}
                        onChange={e => onUpdateProcuration(copro.id, parseInt(e.target.value) || null)}
                        className="w-full px-2 py-1.5 border-2 border-amber-400 rounded text-sm bg-amber-50"
                    >
                        <option value="">-- Choisir mandataire --</option>
                        {mandataires.map(m => {
                            const count = procurationCounts[m.id] || 0;
                            const isMaxed = count >= 3;
                            const isCurrentlySelected = copro.procurationDonneeA === m.id;
                            return (
                                <option
                                    key={m.id}
                                    value={m.id}
                                    disabled={isMaxed && !isCurrentlySelected}
                                >
                                    {m.nom} ({count}/3){isMaxed && !isCurrentlySelected ? ' ⛔' : ''}
                                </option>
                            );
                        })}
                    </select>
                    {!copro.procurationDonneeA && mandataires.length === 0 && (
                        <p className="text-xs text-red-500 mt-1">Aucun présent pour mandataire</p>
                    )}
                    {!copro.procurationDonneeA && mandataires.every(m => (procurationCounts[m.id] || 0) >= 3) && mandataires.length > 0 && (
                        <p className="text-xs text-red-500 mt-1">Tous les présents ont atteint 3 procurations</p>
                    )}
                </div>
            )}
        </div>
    );
}
