/**
 * useVote - Hook principal pour le calculateur de vote AG
 * Gère tout l'état et la logique métier du module Vote
 */
import { useState, useMemo } from 'react';
import { COPROS_INITIAL, POINTS_INITIAL, ARTICLES, TOTAL_TANTIEMES } from '../data/voteConstants';

/**
 * Hook principal du module Vote
 * @returns {Object} État et fonctions pour le calculateur de vote
 */
export function useVote() {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [copros, setCopros] = useState(COPROS_INITIAL);
    const [points, setPoints] = useState(POINTS_INITIAL);
    const [votes, setVotes] = useState({}); // { pointId: { coproId: 'pour'|'contre'|'abstention' } }
    const [resetConfirm, setResetConfirm] = useState(false);

    /** Stats de présence calculées */
    const presenceStats = useMemo(() => {
        const presents = copros.filter(c => c.presence === 'present');
        const procurations = copros.filter(c => c.presence === 'procuration');
        const correspondance = copros.filter(c => c.presence === 'correspondance');
        const absents = copros.filter(c => !c.presence || c.presence === 'absent');

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

    /** Compte de procurations par mandataire */
    const procurationCounts = useMemo(() => {
        const counts = {};
        copros.forEach(c => {
            if (c.presence === 'procuration' && c.procurationDonneeA) {
                counts[c.procurationDonneeA] = (counts[c.procurationDonneeA] || 0) + 1;
            }
        });
        return counts;
    }, [copros]);

    /** Met à jour la présence d'un copropriétaire */
    const updatePresence = (coproId, presence) => {
        setCopros(prev => prev.map(c =>
            c.id === coproId ? { ...c, presence, procurationDonneeA: presence !== 'procuration' ? null : c.procurationDonneeA } : c
        ));
    };

    /** Met à jour le mandataire d'une procuration */
    const updateProcuration = (coproId, mandataireId) => {
        setCopros(prev => prev.map(c =>
            c.id === coproId ? { ...c, procurationDonneeA: mandataireId } : c
        ));
    };

    /** Met à jour le vote d'un copropriétaire sur un point */
    const updateVote = (pointId, coproId, voteType) => {
        setVotes(prev => ({
            ...prev,
            [pointId]: {
                ...prev[pointId],
                [coproId]: voteType
            }
        }));
    };

    /** Met tous les votants sur un type de vote */
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

    /** Reset votes d'un point */
    const resetPointVotes = (pointId) => {
        setVotes(prev => {
            const newVotes = { ...prev };
            delete newVotes[pointId];
            return newVotes;
        });
    };

    /** Reset tous les votes */
    const resetAllVotes = () => {
        setVotes({});
        setResetConfirm(false);
    };

    /** Calcule le résultat d'un point de vote */
    const getPointResult = (pointId) => {
        const pointVotes = votes[pointId] || {};
        const article = points.find(p => p.id === pointId)?.article || '24';
        const articleInfo = ARTICLES[article];

        let pour = 0, contre = 0, abstention = 0;

        copros.forEach(copro => {
            const vote = pointVotes[copro.id];
            if (!vote) return;
            const tantiemes = copro.tantiemes;
            if (vote === 'pour') pour += tantiemes;
            else if (vote === 'contre') contre += tantiemes;
            else if (vote === 'abstention') abstention += tantiemes;
        });

        const exprimes = pour + contre;
        let adopte = false;
        let baseCalc = presenceStats.tantiemesVotants;

        if (article === '24') {
            adopte = exprimes > 0 && pour > (exprimes / 2);
        } else if (article === '25' || article === '26') {
            baseCalc = TOTAL_TANTIEMES;
            const seuil = articleInfo.seuil * TOTAL_TANTIEMES;
            adopte = pour > seuil;
        }

        const totalVotes = pour + contre + abstention;
        const hasVotes = totalVotes > 0;

        return { pour, contre, abstention, adopte, hasVotes, baseCalc };
    };

    /** Retourne les copropriétaires pouvant voter */
    const getVotants = () => {
        return copros.filter(c =>
            c.presence === 'present' ||
            c.presence === 'correspondance' ||
            (c.presence === 'procuration' && c.procurationDonneeA)
        );
    };

    /** Retourne les mandataires potentiels */
    const getMandataires = (excludeId) => {
        return copros.filter(c => c.id !== excludeId && c.presence === 'present');
    };

    /** Vérifie si un mandataire peut accepter plus de procurations */
    const canAcceptProcuration = (mandataireId) => {
        return (procurationCounts[mandataireId] || 0) < 3;
    };

    return {
        date, setDate,
        copros,
        points,
        votes,
        resetConfirm, setResetConfirm,
        presenceStats,
        procurationCounts,
        updatePresence,
        updateProcuration,
        updateVote,
        setAllVotes,
        resetPointVotes,
        resetAllVotes,
        getPointResult,
        getVotants,
        getMandataires,
        canAcceptProcuration,
        TOTAL_TANTIEMES
    };
}
