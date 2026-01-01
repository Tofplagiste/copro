/**
 * VotePresenceSection - Section complète de présence
 * Contient les cartes de présence et les statistiques
 */
import { Users } from 'lucide-react';
import VotePresenceCard from './VotePresenceCard';
import VotePresenceStats from './VotePresenceStats';

/**
 * @param {Object} props
 * @param {Array} props.copros - Liste des copropriétaires
 * @param {Object} props.presenceStats - Statistiques de présence
 * @param {Function} props.updatePresence - Callback pour changer présence
 * @param {Function} props.updateProcuration - Callback pour changer mandataire
 * @param {Function} props.getMandataires - Fonction pour obtenir les mandataires
 * @param {Object} props.procurationCounts - Compte des procurations par mandataire
 */
export default function VotePresenceSection({
    copros,
    presenceStats,
    updatePresence,
    updateProcuration,
    getMandataires,
    procurationCounts
}) {
    return (
        <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-400">
            <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                <Users size={24} />
                Configuration Présence / Procurations
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {copros.map(copro => (
                    <VotePresenceCard
                        key={copro.id}
                        copro={copro}
                        onUpdatePresence={updatePresence}
                        onUpdateProcuration={updateProcuration}
                        getMandataires={getMandataires}
                        procurationCounts={procurationCounts}
                    />
                ))}
            </div>

            <VotePresenceStats presenceStats={presenceStats} />
        </div>
    );
}
