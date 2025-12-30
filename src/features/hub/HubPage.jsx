/**
 * HubPage - Page d'accueil avec navigation vers les 4 applications
 */
import { Building2, Calculator, Vote, BookOpen, Droplets, ArrowRight } from 'lucide-react';

const APPS = [
    {
        id: 'copro',
        name: 'Gestion Copro',
        subtitle: 'Budget, Comptabilité, Eau',
        description: 'Gestion complète des charges, relevés d\'eau, budget prévisionnel et comptabilité',
        icon: Building2,
        color: 'from-blue-600 to-blue-800',
        status: 'ready',
        features: ['Gestion Eau', 'Budget & Appels', 'Comptabilité', 'Annexes Bilan']
    },
    {
        id: 'carnet',
        name: 'Carnet Copro',
        subtitle: 'Informations & Historique',
        description: 'Carnet d\'entretien, annuaire, prestataires et historique des travaux',
        icon: BookOpen,
        color: 'from-emerald-600 to-emerald-800',
        status: 'ready',
        features: ['Carnet Entretien', 'Répartition', 'Annuaire', 'Prestataires']
    },
    {
        id: 'credit',
        name: 'Simulateur Crédit',
        subtitle: 'Financement Travaux',
        description: 'Simulation de crédit collectif avec répartition par copropriétaire',
        icon: Calculator,
        color: 'from-purple-600 to-purple-800',
        status: 'ready',
        features: ['Calcul Mensualités', 'Répartition', 'Export PDF', 'Fonds Travaux']
    },
    {
        id: 'vote',
        name: 'Vote AG',
        subtitle: 'Assemblée Générale',
        description: 'Gestion des votes, présences, procurations et génération du PV',
        icon: Vote,
        color: 'from-amber-500 to-orange-600',
        status: 'ready',
        features: ['Présences', 'Procurations', 'Votes Multi-articles', 'Export PV']
    }
];

export default function HubPage({ onSelectApp }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            🏠
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Les Pyrénées</h1>
                            <p className="text-slate-400 text-sm">Syndic Bénévole - Suite de Gestion</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-white mb-4">
                        Bienvenue sur votre <span className="text-blue-400">Hub de Gestion</span>
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Accédez à tous vos outils de gestion de copropriété depuis un seul endroit.
                        Sélectionnez une application pour commencer.
                    </p>
                </div>

                {/* Apps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {APPS.map((app) => {
                        const Icon = app.icon;
                        const isReady = app.status === 'ready';

                        return (
                            <div
                                key={app.id}
                                onClick={() => isReady && onSelectApp(app.id)}
                                className={`
                  relative group rounded-2xl overflow-hidden transition-all duration-300
                  ${isReady
                                        ? 'cursor-pointer hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20'
                                        : 'opacity-60 cursor-not-allowed'}
                `}
                            >
                                {/* Background Gradient */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${app.color} opacity-90`} />

                                {/* Pattern Overlay */}
                                <div className="absolute inset-0 opacity-10" style={{
                                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                                    backgroundSize: '24px 24px'
                                }} />

                                {/* Content */}
                                <div className="relative p-8">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                            <Icon size={32} className="text-white" />
                                        </div>
                                        {!isReady && (
                                            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-bold">
                                                Bientôt
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-2xl font-bold text-white mb-1">{app.name}</h3>
                                    <p className="text-white/80 text-sm mb-3">{app.subtitle}</p>
                                    <p className="text-white/60 text-sm mb-6">{app.description}</p>

                                    {/* Features Tags */}
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {app.features.map((feature, i) => (
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
                            </div>
                        );
                    })}
                </div>

                {/* Footer Info */}
                <div className="mt-12 text-center">
                    <p className="text-slate-500 text-sm">
                        7-9 rue André Leroux, 33780 Soulac-sur-Mer •
                        <span className="text-slate-400 ml-2">Copropriété Les Pyrénées</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
