/**
 * DashboardCard - Composant réutilisable pour les cartes du Dashboard
 * @param {Object} props
 * @param {string} props.id - ID unique de l'application
 * @param {string} props.name - Nom de l'application
 * @param {string} props.subtitle - Sous-titre
 * @param {string} props.description - Description
 * @param {React.ComponentType} props.icon - Icône Lucide
 * @param {string} props.color - Classes Tailwind pour le gradient
 * @param {string[]} props.features - Liste des fonctionnalités
 * @param {string} props.to - Route de destination
 * @param {boolean} props.isReady - Application prête ou non
 */
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function DashboardCard({
    name,
    subtitle,
    description,
    // eslint-disable-next-line no-unused-vars
    icon: IconComponent,
    color,
    features,
    to,
    isReady = true
}) {
    const CardWrapper = isReady ? Link : 'div';
    const cardProps = isReady ? { to } : {};

    return (
        <CardWrapper
            {...cardProps}
            className={`
        relative group rounded-2xl overflow-hidden transition-all duration-300 block
        ${isReady
                    ? 'cursor-pointer hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20'
                    : 'opacity-60 cursor-not-allowed'}
      `}
        >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-90`} />

            {/* Pattern Overlay */}
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '24px 24px'
                }}
            />

            {/* Content */}
            <div className="relative p-8">
                <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <IconComponent size={32} className="text-white" />
                    </div>
                    {!isReady && (
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-bold">
                            Bientôt
                        </span>
                    )}
                </div>

                <h3 className="text-2xl font-bold text-white mb-1">{name}</h3>
                <p className="text-white/80 text-sm mb-3">{subtitle}</p>
                <p className="text-white/60 text-sm mb-6">{description}</p>

                {/* Features Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {features.map((feature, i) => (
                        <span
                            key={i}
                            className="px-2 py-1 bg-white/10 backdrop-blur-sm rounded text-white/80 text-xs"
                        >
                            {feature}
                        </span>
                    ))}
                </div>

                {/* Action */}
                {isReady && (
                    <div className="flex items-center gap-2 text-white font-semibold group-hover:gap-4 transition-all">
                        <span>Accéder</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                )}
            </div>
        </CardWrapper>
    );
}
