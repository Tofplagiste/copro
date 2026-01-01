/**
 * CreditStatCard - Carte statistique colorée avec icône
 * Composant UI réutilisable pour afficher une métrique
 */

/**
 * @param {Object} props
 * @param {import('lucide-react').LucideIcon} props.icon - Icône Lucide
 * @param {string} props.label - Libellé de la statistique
 * @param {string} props.value - Valeur à afficher
 * @param {'blue'|'green'|'purple'|'orange'|'red'|'cyan'|'pink'} props.color - Couleur du gradient
 */
export default function CreditStatCard({ icon: Icon, label, value, color = 'blue' }) {
    const colors = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        purple: 'from-purple-500 to-purple-600',
        orange: 'from-orange-500 to-orange-600',
        red: 'from-red-500 to-red-600',
        cyan: 'from-cyan-500 to-cyan-600',
        pink: 'from-pink-500 to-pink-600'
    };

    return (
        <div className={`bg-gradient-to-br ${colors[color]} rounded-xl p-5 text-white shadow-lg`}>
            <div className="flex items-center gap-2 mb-1 opacity-90">
                <Icon size={16} />
                <span className="text-xs font-medium">{label}</span>
            </div>
            <div className="text-2xl font-bold">{value}</div>
        </div>
    );
}
