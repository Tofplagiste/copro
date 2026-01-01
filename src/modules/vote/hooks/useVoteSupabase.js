/**
 * useVoteSupabase - Hook Vote migré sur Supabase
 * 
 * EXEMPLE DE PATTERN MIGRATION
 * Démontre la gestion du loading, des erreurs, et des appels async.
 * 
 * NOTE: Ce hook est une VERSION ALTERNATIVE de useVote.
 * Il montre le pattern à suivre pour migrer les autres hooks.
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { ARTICLES, TOTAL_TANTIEMES } from '../data/voteConstants';

/**
 * Hook principal du module Vote (version Supabase)
 * @param {number} [sessionId] - ID de session existante (optionnel)
 * @returns {Object} État et fonctions pour le calculateur de vote
 */
export function useVoteSupabase(sessionId = null) {
    // =====================================================
    // STATE
    // =====================================================
    const [session, setSession] = useState(null);
    const [copros, setCopros] = useState([]);
    const [points, setPoints] = useState([]);
    const [votes, setVotes] = useState({});

    // Loading & Error states (PATTERN CLEF)
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // =====================================================
    // DATA FETCHING
    // =====================================================

    /**
     * Charge une session existante depuis Supabase
     */
    const loadSession = useCallback(async (id) => {
        if (!id) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Charger la session
            const { data: sessionData, error: sessionError } = await supabase
                .from('vote_sessions')
                .select('*')
                .eq('id', id)
                .single();

            if (sessionError) throw sessionError;
            setSession(sessionData);

            // 2. Charger les copropriétaires
            const { data: coprosData, error: coprosError } = await supabase
                .from('vote_copros')
                .select('*')
                .eq('session_id', id)
                .order('id');

            if (coprosError) throw coprosError;

            // Transformer vers le format attendu par l'UI
            const formattedCopros = coprosData.map(c => ({
                id: c.id,
                nom: c.name,
                tantiemes: c.tantiemes,
                presence: c.presence,
                procurationDonneeA: c.procuration_to
            }));
            setCopros(formattedCopros);

            // 3. Charger les points de vote
            const { data: pointsData, error: pointsError } = await supabase
                .from('vote_points')
                .select('*')
                .eq('session_id', id)
                .order('sort_order');

            if (pointsError) throw pointsError;

            const formattedPoints = pointsData.map(p => ({
                id: p.id,
                titre: p.title,
                article: p.article
            }));
            setPoints(formattedPoints);

            // 4. Charger les votes
            const { data: votesData, error: votesError } = await supabase
                .from('vote_participations')
                .select('*')
                .in('point_id', pointsData.map(p => p.id));

            if (votesError) throw votesError;

            // Transformer en format { pointId: { coproId: voteType } }
            const votesMap = {};
            votesData.forEach(v => {
                if (!votesMap[v.point_id]) votesMap[v.point_id] = {};
                votesMap[v.point_id][v.copro_id] = v.vote_type;
            });
            setVotes(votesMap);

        } catch (err) {
            console.error('[useVoteSupabase] Erreur chargement:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Charger au montage si sessionId fourni
    useEffect(() => {
        if (sessionId) {
            loadSession(sessionId);
        } else {
            setLoading(false);
        }
    }, [sessionId, loadSession]);

    // =====================================================
    // DATA MUTATIONS
    // =====================================================

    /**
     * Crée une nouvelle session de vote
     * @param {string} title - Titre de la session
     * @param {string} date - Date de la session
     * @returns {Promise<{success: boolean, sessionId?: number, error?: string}>}
     */
    const createSession = async (title, date) => {
        setSaving(true);
        setError(null);

        try {
            const { data, error: createError } = await supabase
                .from('vote_sessions')
                .insert({
                    title,
                    session_date: date,
                    status: 'draft',
                    total_tantiemes: TOTAL_TANTIEMES
                })
                .select()
                .single();

            if (createError) throw createError;

            setSession(data);
            return { success: true, sessionId: data.id };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    };

    /**
     * Met à jour la présence d'un copropriétaire
     * PATTERN: Update local + sync to Supabase
     */
    const updatePresence = async (coproId, presence) => {
        // 1. Update local immédiatement (optimistic update)
        setCopros(prev => prev.map(c =>
            c.id === coproId
                ? { ...c, presence, procurationDonneeA: presence !== 'procuration' ? null : c.procurationDonneeA }
                : c
        ));

        // 2. Sync to Supabase
        try {
            const { error: updateError } = await supabase
                .from('vote_copros')
                .update({
                    presence,
                    procuration_to: presence !== 'procuration' ? null : undefined
                })
                .eq('id', coproId);

            if (updateError) throw updateError;
        } catch (err) {
            console.error('[useVoteSupabase] Erreur update présence:', err);
            setError(err.message);
            // Optionnel: rollback en cas d'erreur
        }
    };

    /**
     * Met à jour le mandataire d'une procuration
     */
    const updateProcuration = async (coproId, mandataireId) => {
        // Optimistic update
        setCopros(prev => prev.map(c =>
            c.id === coproId ? { ...c, procurationDonneeA: mandataireId } : c
        ));

        // Sync
        try {
            await supabase
                .from('vote_copros')
                .update({ procuration_to: mandataireId })
                .eq('id', coproId);
        } catch (err) {
            setError(err.message);
        }
    };

    /**
     * Met à jour un vote
     */
    const updateVote = async (pointId, coproId, voteType) => {
        // Optimistic update
        setVotes(prev => ({
            ...prev,
            [pointId]: {
                ...prev[pointId],
                [coproId]: voteType
            }
        }));

        // Sync (upsert)
        try {
            const { error: voteError } = await supabase
                .from('vote_participations')
                .upsert({
                    point_id: pointId,
                    copro_id: coproId,
                    vote_type: voteType
                }, {
                    onConflict: 'point_id,copro_id'
                });

            if (voteError) throw voteError;
        } catch (err) {
            console.error('[useVoteSupabase] Erreur update vote:', err);
            setError(err.message);
        }
    };

    /**
     * Met tous les votants sur un type de vote
     */
    const setAllVotes = async (pointId, voteType) => {
        const votantsIds = copros
            .filter(c => c.presence === 'present' || c.presence === 'correspondance' ||
                (c.presence === 'procuration' && c.procurationDonneeA))
            .map(c => c.id);

        const newVotes = {};
        votantsIds.forEach(id => { newVotes[id] = voteType; });

        // Optimistic update
        setVotes(prev => ({
            ...prev,
            [pointId]: newVotes
        }));

        // Sync all votes
        try {
            const payload = votantsIds.map(coproId => ({
                point_id: pointId,
                copro_id: coproId,
                vote_type: voteType
            }));

            const { error: batchError } = await supabase
                .from('vote_participations')
                .upsert(payload, { onConflict: 'point_id,copro_id' });

            if (batchError) throw batchError;
        } catch (err) {
            setError(err.message);
        }
    };

    // =====================================================
    // COMPUTED VALUES (same as original)
    // =====================================================

    const presenceStats = useMemo(() => {
        const presents = copros.filter(c => c.presence === 'present');
        const procurations = copros.filter(c => c.presence === 'procuration');
        const correspondance = copros.filter(c => c.presence === 'correspondance');
        const absents = copros.filter(c => !c.presence || c.presence === 'absent');

        let tantiemesVotants = 0;
        presents.forEach(c => tantiemesVotants += c.tantiemes);
        correspondance.forEach(c => tantiemesVotants += c.tantiemes);
        procurations.forEach(c => {
            if (c.procurationDonneeA) tantiemesVotants += c.tantiemes;
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

    const procurationCounts = useMemo(() => {
        const counts = {};
        copros.forEach(c => {
            if (c.presence === 'procuration' && c.procurationDonneeA) {
                counts[c.procurationDonneeA] = (counts[c.procurationDonneeA] || 0) + 1;
            }
        });
        return counts;
    }, [copros]);

    /** Calcule le résultat d'un point de vote */
    const getPointResult = useCallback((pointId) => {
        const pointVotes = votes[pointId] || {};
        const article = points.find(p => p.id === pointId)?.article || '24';

        let pour = 0, contre = 0, abstention = 0;

        copros.forEach(copro => {
            const vote = pointVotes[copro.id];
            if (!vote) return;
            if (vote === 'pour') pour += copro.tantiemes;
            else if (vote === 'contre') contre += copro.tantiemes;
            else if (vote === 'abstention') abstention += copro.tantiemes;
        });

        const exprimes = pour + contre;
        let adopte = false;
        let baseCalc = presenceStats.tantiemesVotants;

        if (article === '24') {
            adopte = exprimes > 0 && pour > (exprimes / 2);
        } else if (article === '25') {
            baseCalc = TOTAL_TANTIEMES;
            adopte = pour > (TOTAL_TANTIEMES * 0.5);
        } else if (article === '26') {
            baseCalc = TOTAL_TANTIEMES;
            adopte = pour > (TOTAL_TANTIEMES * (2 / 3));
        } else if (article === 'unanimite') {
            baseCalc = TOTAL_TANTIEMES;
            adopte = pour === TOTAL_TANTIEMES && contre === 0;
        }

        return { pour, contre, abstention, adopte, hasVotes: pour + contre + abstention > 0, baseCalc };
    }, [votes, points, copros, presenceStats.tantiemesVotants]);

    const getVotants = useCallback(() => {
        return copros.filter(c =>
            c.presence === 'present' ||
            c.presence === 'correspondance' ||
            (c.presence === 'procuration' && c.procurationDonneeA)
        );
    }, [copros]);

    const getMandataires = useCallback((excludeId) => {
        return copros.filter(c => c.id !== excludeId && c.presence === 'present');
    }, [copros]);

    const canAcceptProcuration = useCallback((mandataireId) => {
        return (procurationCounts[mandataireId] || 0) < 3;
    }, [procurationCounts]);

    // =====================================================
    // RETURN
    // =====================================================

    return {
        // État
        session,
        copros,
        points,
        votes,

        // Loading / Error (NOUVEAU)
        loading,
        saving,
        error,

        // Computed
        presenceStats,
        procurationCounts,
        TOTAL_TANTIEMES,

        // Actions
        loadSession,
        createSession,
        updatePresence,
        updateProcuration,
        updateVote,
        setAllVotes,

        // Helpers
        getPointResult,
        getVotants,
        getMandataires,
        canAcceptProcuration
    };
}
