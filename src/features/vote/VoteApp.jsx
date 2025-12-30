/**
 * VoteApp - Calculateur Vote AG Copropriété
 * Migré depuis vote ag V2.html
 */
import { useState, useMemo } from 'react';
import { ArrowLeft, Users, Check, X, MessageSquare, UserX, Vote, FileText, Download, RotateCcw, Plus, Trash2 } from 'lucide-react';
import Modal, { ConfirmModal } from '../../components/Modal';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Copropriétaires pour le vote
const COPROS_INITIAL = [
    { id: 1, nom: 'CARSOULE', tantiemes: 117, presence: null, procurationDonneeA: null },
    { id: 2, nom: 'TROPAMER', tantiemes: 66, presence: null, procurationDonneeA: null },
    { id: 3, nom: 'PIRAS', tantiemes: 69, presence: null, procurationDonneeA: null },
    { id: 4, nom: 'GABRIEL', tantiemes: 62, presence: null, procurationDonneeA: null },
    { id: 5, nom: 'PALMARO', tantiemes: 41, presence: null, procurationDonneeA: null },
    { id: 6, nom: 'SALAHUN', tantiemes: 37, presence: null, procurationDonneeA: null },
    { id: 7, nom: 'SCI Clot', tantiemes: 86, presence: null, procurationDonneeA: null },
    { id: 8, nom: 'LE MERLE', tantiemes: 96, presence: null, procurationDonneeA: null },
    { id: 9, nom: 'LAMBARD', tantiemes: 125, presence: null, procurationDonneeA: null },
    { id: 10, nom: 'BELLIARD', tantiemes: 102, presence: null, procurationDonneeA: null },
    { id: 11, nom: 'CAUPENE', tantiemes: 199, presence: null, procurationDonneeA: null }
];

const POINTS_INITIAL = [
    { id: 1, titre: "Élection du Bureau de Séance", article: "24" },
    { id: 2, titre: "Renouvellement du Conseil Syndical", article: "25" },
    { id: 3, titre: "Renouvellement du Syndic Bénévole", article: "25" },
    { id: 4, titre: "Validation du Procès-Verbal AG 2024", article: "24" },
    { id: 5, titre: "Rapport Moral de l'Année 2025", article: "24" },
    { id: 6, titre: "Validation des Comptes au 31 déc 2025", article: "24" },
    { id: 7, titre: "Obligations Légales 2026 DPE PPT", article: "25" },
    { id: 8, titre: "Budget Prévisionnel 2026", article: "24" }
];

const ARTICLES = {
    '24': { nom: 'Majorité simple', description: 'Majorité des tantièmes des votants', seuil: 0.5 },
    '25': { nom: 'Majorité absolue', description: 'Majorité de tous les tantièmes', seuil: 0.5 },
    '26': { nom: 'Double majorité', description: '2/3 des tantièmes de tous', seuil: 0.667 }
};

const PRESENCE_TYPES = [
    { key: 'present', label: 'Présent', icon: Check, color: 'bg-green-100 text-green-700 border-green-500' },
    { key: 'procuration', label: 'Procuration', icon: MessageSquare, color: 'bg-amber-100 text-amber-700 border-amber-500' },
    { key: 'correspondance', label: 'Corresp.', icon: Users, color: 'bg-blue-100 text-blue-700 border-blue-500' },
    { key: 'absent', label: 'Absent', icon: UserX, color: 'bg-red-100 text-red-700 border-red-500' }
];

export default function VoteApp({ onBackToHub }) {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [copros, setCopros] = useState(COPROS_INITIAL);
    const [points, setPoints] = useState(POINTS_INITIAL);
    const [votes, setVotes] = useState({}); // { pointId: { coproId: 'pour'|'contre'|'abstention' } }
    const [resetConfirm, setResetConfirm] = useState(false);

    const TOTAL_TANTIEMES = 1000;

    // Stats de présence
    const presenceStats = useMemo(() => {
        const presents = copros.filter(c => c.presence === 'present');
        const procurations = copros.filter(c => c.presence === 'procuration');
        const correspondance = copros.filter(c => c.presence === 'correspondance');
        const absents = copros.filter(c => !c.presence || c.presence === 'absent');

        // Calcul des tantièmes votants
        let tantiemesVotants = 0;
        presents.forEach(c => tantiemesVotants += c.tantiemes);
        correspondance.forEach(c => tantiemesVotants += c.tantiemes);
        procurations.forEach(c => {
            if (c.procurationDonneeA) {
                tantiemesVotants += c.tantiemes;
            }
        });

        return {
            presents: presents.length,
            procurations: procurations.length,
            correspondance: correspondance.length,
            absents: absents.length,
            tantiemesVotants,
            tantiemesPresentsPhysiques: presents.reduce((sum, c) => sum + c.tantiemes, 0)
        };
    }, [copros]);

    // Mettre à jour présence
    const updatePresence = (coproId, presence) => {
        setCopros(prev => prev.map(c =>
            c.id === coproId ? { ...c, presence, procurationDonneeA: presence !== 'procuration' ? null : c.procurationDonneeA } : c
        ));
    };

    // Mettre à jour procuration
    const updateProcuration = (coproId, mandataireId) => {
        setCopros(prev => prev.map(c =>
            c.id === coproId ? { ...c, procurationDonneeA: mandataireId } : c
        ));
    };

    // Mettre à jour vote
    const updateVote = (pointId, coproId, voteType) => {
        setVotes(prev => ({
            ...prev,
            [pointId]: {
                ...prev[pointId],
                [coproId]: voteType
            }
        }));
    };

    // Tous pour/contre sur un point
    const setAllVotes = (pointId, voteType) => {
        const votantsIds = copros
            .filter(c => c.presence === 'present' || c.presence === 'correspondance' || (c.presence === 'procuration' && c.procurationDonneeA))
            .map(c => c.id);

        const newVotes = {};
        votantsIds.forEach(id => { newVotes[id] = voteType; });

        setVotes(prev => ({
            ...prev,
            [pointId]: newVotes
        }));
    };

    // Reset votes d'un point
    const resetPointVotes = (pointId) => {
        setVotes(prev => {
            const newVotes = { ...prev };
            delete newVotes[pointId];
            return newVotes;
        });
    };

    // Reset tous les votes
    const resetAllVotes = () => {
        setVotes({});
        setResetConfirm(false);
    };

    // Calculer résultat d'un point
    const getPointResult = (pointId) => {
        const pointVotes = votes[pointId] || {};
        const article = points.find(p => p.id === pointId)?.article || '24';
        const articleInfo = ARTICLES[article];

        let pour = 0, contre = 0, abstention = 0;

        copros.forEach(copro => {
            const vote = pointVotes[copro.id];
            if (!vote) return;

            // Pour les procurations, on compte les tantièmes du mandant
            let tantiemes = copro.tantiemes;

            if (vote === 'pour') pour += tantiemes;
            else if (vote === 'contre') contre += tantiemes;
            else if (vote === 'abstention') abstention += tantiemes;
        });

        const exprimes = pour + contre;
        let adopte = false;
        let baseCalc = presenceStats.tantiemesVotants;

        if (article === '24') {
            // Majorité simple: majorité des exprimés
            adopte = exprimes > 0 && pour > (exprimes / 2);
        } else if (article === '25' || article === '26') {
            // Majorité absolue ou double: majorité de tous les tantièmes
            baseCalc = TOTAL_TANTIEMES;
            const seuil = articleInfo.seuil * TOTAL_TANTIEMES;
            adopte = pour > seuil;
        }

        const totalVotes = pour + contre + abstention;
        const hasVotes = totalVotes > 0;

        return { pour, contre, abstention, adopte, hasVotes, baseCalc };
    };

    // Copros pouvant voter (présents, correspondance, ou avec procuration valide)
    const getVotants = () => {
        return copros.filter(c =>
            c.presence === 'present' ||
            c.presence === 'correspondance' ||
            (c.presence === 'procuration' && c.procurationDonneeA)
        );
    };

    // Mandataires potentiels pour procurations
    const getMandataires = (excludeId) => {
        return copros.filter(c => c.id !== excludeId && c.presence === 'present');
    };

    // Export PDF procès-verbal
    const exportPDF = () => {
        const doc = new jsPDF();

        // En-tête
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('PROCÈS-VERBAL ASSEMBLÉE GÉNÉRALE', 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Copropriété 9 Rue André Leroux - 33780 SOULAC-SUR-MER', 105, 28, { align: 'center' });
        doc.text(`Date: ${new Date(date).toLocaleDateString('fr-FR')}`, 105, 35, { align: 'center' });

        // Feuille de présence
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Feuille de Présence', 14, 50);

        const presenceRows = copros.map(c => {
            let statut = 'Absent';
            if (c.presence === 'present') statut = 'Présent';
            else if (c.presence === 'correspondance') statut = 'Correspondance';
            else if (c.presence === 'procuration') {
                const mandataire = copros.find(m => m.id === c.procurationDonneeA);
                statut = mandataire ? `Procuration → ${mandataire.nom}` : 'Procuration (non assignée)';
            }
            return [c.nom, c.tantiemes, statut];
        });

        doc.autoTable({
            startY: 55,
            head: [['Copropriétaire', 'Tantièmes', 'Statut']],
            body: presenceRows,
            headStyles: { fillColor: [51, 65, 85] },
            styles: { fontSize: 9 }
        });

        // Stats présence
        let y = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total tantièmes votants: ${presenceStats.tantiemesVotants} / ${TOTAL_TANTIEMES}`, 14, y);

        // Points de vote
        y += 15;
        doc.setFontSize(12);
        doc.text('Résolutions', 14, y);

        points.forEach(point => {
            const result = getPointResult(point.id);
            if (!result.hasVotes) return;

            y += 10;
            if (y > 270) {
                doc.addPage();
                y = 20;
            }

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(`${point.id}. ${point.titre} (Art. ${point.article})`, 14, y);

            y += 6;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.text(`Pour: ${result.pour} | Contre: ${result.contre} | Abstention: ${result.abstention}`, 14, y);

            y += 5;
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(result.adopte ? 34 : 220, result.adopte ? 197 : 38, result.adopte ? 94 : 38);
            doc.text(result.adopte ? '→ ADOPTÉ' : '→ REJETÉ', 14, y);
            doc.setTextColor(0, 0, 0);
        });

        doc.save(`PV_AG_${date}.pdf`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-700 to-purple-800">
            {/* Header */}
            <header className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white sticky top-0 z-50 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onBackToHub}
                                className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm"
                            >
                                <ArrowLeft size={16} />
                                Hub
                            </button>
                            <div className="flex items-center gap-2">
                                <Vote size={28} />
                                <div>
                                    <h1 className="font-bold text-xl">Calculateur Vote AG</h1>
                                    <p className="text-purple-200 text-xs">{TOTAL_TANTIEMES} tantièmes - {copros.length} copropriétaires</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="px-3 py-1.5 rounded-lg bg-white/20 text-white border border-white/30 text-sm"
                            />
                            <button className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-lg text-sm font-semibold flex items-center gap-2">
                                <Download size={16} />
                                Sauvegarder
                            </button>
                            <button onClick={exportPDF} className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-lg text-sm font-semibold flex items-center gap-2">
                                <FileText size={16} />
                                PDF
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Section Présence */}
                <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-400">
                    <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                        <Users size={24} />
                        Configuration Présence / Procurations
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {copros.map(copro => (
                            <div key={copro.id} className="bg-white rounded-lg p-4 border-l-4 border-blue-400">
                                <div className="font-bold text-slate-800 mb-2">{copro.nom}</div>
                                <div className="text-xs text-slate-500 mb-3">{copro.tantiemes} tantièmes</div>

                                <div className="flex gap-1 flex-wrap mb-2">
                                    {PRESENCE_TYPES.map(type => {
                                        const Icon = type.icon;
                                        const isSelected = copro.presence === type.key;
                                        return (
                                            <button
                                                key={type.key}
                                                onClick={() => updatePresence(copro.id, type.key)}
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
                                            onChange={e => updateProcuration(copro.id, parseInt(e.target.value) || null)}
                                            className="w-full px-2 py-1.5 border-2 border-amber-400 rounded text-sm bg-amber-50"
                                        >
                                            <option value="">-- Choisir mandataire --</option>
                                            {getMandataires(copro.id).map(m => (
                                                <option key={m.id} value={m.id}>{m.nom}</option>
                                            ))}
                                        </select>
                                        {!copro.procurationDonneeA && getMandataires(copro.id).length === 0 && (
                                            <p className="text-xs text-red-500 mt-1">Aucun présent pour mandataire</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Stats présence */}
                    <div className="bg-amber-50 rounded-lg p-4 border-2 border-amber-400">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                            <div className="bg-white rounded-lg p-3">
                                <div className="text-2xl font-bold text-green-600">{presenceStats.presents}</div>
                                <div className="text-xs text-slate-600">Présents</div>
                            </div>
                            <div className="bg-white rounded-lg p-3">
                                <div className="text-2xl font-bold text-amber-600">{presenceStats.procurations}</div>
                                <div className="text-xs text-slate-600">Procurations</div>
                            </div>
                            <div className="bg-white rounded-lg p-3">
                                <div className="text-2xl font-bold text-blue-600">{presenceStats.correspondance}</div>
                                <div className="text-xs text-slate-600">Correspondance</div>
                            </div>
                            <div className="bg-white rounded-lg p-3">
                                <div className="text-2xl font-bold text-red-600">{presenceStats.absents}</div>
                                <div className="text-xs text-slate-600">Absents</div>
                            </div>
                            <div className="bg-white rounded-lg p-3">
                                <div className="text-2xl font-bold text-indigo-600">{presenceStats.tantiemesVotants}</div>
                                <div className="text-xs text-slate-600">Tantièmes votants</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 flex-wrap">
                    <button
                        onClick={() => setResetConfirm(true)}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-lg font-semibold flex items-center gap-2"
                    >
                        <RotateCcw size={18} />
                        Reset Tous les Votes
                    </button>
                </div>

                {/* Points de vote */}
                {points.map(point => {
                    const result = getPointResult(point.id);
                    const votants = getVotants();
                    const articleInfo = ARTICLES[point.article];

                    return (
                        <div key={point.id} className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-indigo-500">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">{point.id}. {point.titre}</h3>
                                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                                        Art. {point.article} - {articleInfo.nom}
                                    </span>
                                </div>

                                {result.hasVotes && (
                                    <div className={`
                    px-4 py-2 rounded-lg font-bold text-lg
                    ${result.adopte
                                            ? 'bg-green-100 text-green-700 border-2 border-green-500'
                                            : 'bg-red-100 text-red-700 border-2 border-red-500'}
                  `}>
                                        {result.adopte ? '✅ ADOPTÉ' : '❌ REJETÉ'}
                                    </div>
                                )}
                            </div>

                            {/* Grille de votes */}
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
                                {votants.map(copro => {
                                    const currentVote = votes[point.id]?.[copro.id];
                                    return (
                                        <div key={copro.id} className="bg-slate-50 rounded-lg p-3">
                                            <div className="font-semibold text-sm text-slate-700 mb-2">{copro.nom}</div>
                                            <div className="flex gap-1">
                                                {['pour', 'contre', 'abstention'].map(voteType => {
                                                    const isSelected = currentVote === voteType;
                                                    const colors = {
                                                        pour: 'bg-green-100 text-green-700 border-green-500',
                                                        contre: 'bg-red-100 text-red-700 border-red-500',
                                                        abstention: 'bg-amber-100 text-amber-700 border-amber-500'
                                                    };
                                                    return (
                                                        <button
                                                            key={voteType}
                                                            onClick={() => updateVote(point.id, copro.id, voteType)}
                                                            className={`
                                flex-1 px-1 py-1 rounded text-xs font-semibold border-2 transition-all
                                ${colors[voteType]}
                                ${isSelected ? 'ring-2 ring-offset-1 ring-slate-400 scale-105' : 'opacity-50 hover:opacity-100'}
                              `}
                                                        >
                                                            {voteType === 'pour' ? '✓' : voteType === 'contre' ? '✗' : '○'}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Actions et résultat */}
                            <div className="flex items-center justify-between pt-4 border-t">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setAllVotes(point.id, 'pour')}
                                        className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded text-sm font-semibold"
                                    >
                                        Tous Pour
                                    </button>
                                    <button
                                        onClick={() => setAllVotes(point.id, 'contre')}
                                        className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-sm font-semibold"
                                    >
                                        Tous Contre
                                    </button>
                                    <button
                                        onClick={() => resetPointVotes(point.id)}
                                        className="px-3 py-1.5 bg-slate-500 hover:bg-slate-400 text-white rounded text-sm font-semibold"
                                    >
                                        Reset
                                    </button>
                                </div>

                                <div className="flex items-center gap-6 text-sm">
                                    <div className="text-center">
                                        <div className="font-bold text-green-600 text-lg">{result.pour}</div>
                                        <div className="text-slate-500">Pour</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold text-red-600 text-lg">{result.contre}</div>
                                        <div className="text-slate-500">Contre</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold text-amber-600 text-lg">{result.abstention}</div>
                                        <div className="text-slate-500">Abstention</div>
                                    </div>
                                    <div className="text-center border-l pl-4">
                                        <div className="font-bold text-indigo-600 text-lg">{result.baseCalc}</div>
                                        <div className="text-slate-500">Base calcul</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Confirm reset modal */}
            <ConfirmModal
                isOpen={resetConfirm}
                onClose={() => setResetConfirm(false)}
                onConfirm={resetAllVotes}
                title="Reset tous les votes ?"
                message="Cette action effacera tous les votes enregistrés."
                confirmText="Effacer"
                variant="danger"
            />
        </div>
    );
}
