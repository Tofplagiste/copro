/**
 * CreditOwnersList - Liste des copropriétaires
 * Container pour les cartes copropriétaires
 */
import { Users } from 'lucide-react';
import CreditOwnerCard from './CreditOwnerCard';

/**
 * @param {Object} props
 * @param {Array} props.copros - Liste des copropriétaires
 * @param {Function} props.updateCopro - Callback pour mise à jour
 */
export default function CreditOwnersList({ copros, updateCopro }) {
    return (
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Users size={20} />
                Copropriétaires - Total: 1000 tantièmes
            </h2>
            <div className="space-y-3">
                {copros.map(copro => (
                    <CreditOwnerCard
                        key={copro.id}
                        copro={copro}
                        onUpdate={updateCopro}
                    />
                ))}
            </div>
        </div>
    );
}
