/**
 * useVoteSupabase - Hook Vote migré sur Supabase
 * 
 * Gestion complète des sessions de vote avec:
 * - Liste des sessions existantes
 * - Création avec import des owners
 * - Suppression / Renommage
 * - Gestion des points de vote
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { TOTAL_TANTIEMES } from '../data/voteConstants';

/**
 * Hook principal du module Vote (version Supabase)
 * @param {number} [sessionId] - ID de session existante (optionnel)
 * @returns {Object} État et fonctions pour le calculateur de vote
 */
export function useVoteSupabase(sessionId = null) {
    // =====================================================
    // STATE
    // =====================================================
    const [sessions, setSessions] = useState([]);       // Liste des sessions
    const [session, setSession] = useState(null);
    const [copros, setCopros] = useState([]);
    const [points, setPoints] = useState([]);
    const [votes, setVotes] = useState({});

    // Loading & Error states
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // =====================================================
    // DATA FETCHING
    // =====================================================

    /**
     * Charge la liste des sessions existantes
     */
    const loadSessionsList = useCallback(async () => {
        try {
            const { data, error: listError } = await supabase
                .from('vote_sessions')
                .select('id, title, session_date, status, created_at')
                .order('session_date', { ascending: false });

            if (listError) throw listError;
            setSessions(data || []);
        } catch (err) {
            console.error('[useVoteSupabase] Erreur liste sessions:', err);
        }
    }, []);

    /**
     * Charge une session existante depuis Supabase
     */
    const loadSession = useCallback(async (id) => {
        if (!id) {
            setSession(null);
            setCopros([]);
            setPoints([]);
            setVotes({});
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

            // 4. Charger les votes (seulement si des points existent)
            if (pointsData.length > 0) {
                const { data: votesData, error: votesError } = await supabase
                    .from('vote_participations')
                    .select('*')
                    .in('point_id', pointsData.map(p => p.id));

                if (votesError) throw votesError;

                const votesMap = {};
                (votesData || []).forEach(v => {
                    if (!votesMap[v.point_id]) votesMap[v.point_id] = {};
                    votesMap[v.point_id][v.copro_id] = v.vote_type;
                });
                setVotes(votesMap);
            } else {
                setVotes({});
            }

        } catch (err) {
            console.error('[useVoteSupabase] Erreur chargement:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Charger au montage
    useEffect(() => {
        const init = async () => {
            await loadSessionsList();
            if (sessionId) {
                await loadSession(sessionId);
            } else {
                setLoading(false);
            }
        };
        init();
    }, [sessionId, loadSession, loadSessionsList]);

    // =====================================================
    // SESSION MUTATIONS
    // =====================================================

    /**
     * Crée une nouvelle session de vote et importe les owners
     */
    const createSession = async (title, date) => {
        setSaving(true);
        setError(null);

        try {
            // 1. Créer la session
            const { data: sessionData, error: createError } = await supabase
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

            // 2. Importer les owners depuis la table owners
            const { data: ownersData, error: ownersError } = await supabase
                .from('owners')
                .select('id, name, tantiemes')
                .eq('is_common', false)
                .order('name');

            if (ownersError) throw ownersError;

            // 3. Créer les vote_copros
            if (ownersData && ownersData.length > 0) {
                const coprosPayload = ownersData.map(o => ({
                    session_id: sessionData.id,
                    owner_id: o.id,
                    name: o.name,
                    tantiemes: o.tantiemes,
                    presence: null
                }));

                const { error: coprosError } = await supabase
                    .from('vote_copros')
                    .insert(coprosPayload);

                if (coprosError) throw coprosError;
            }

            await loadSessionsList();
            return { success: true, sessionId: sessionData.id };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    };

    /**
     * Supprime une session
     */
    const deleteSession = async (id) => {
        setSaving(true);
        try {
            // CASCADE supprime vote_copros, vote_points, vote_participations
            const { error: deleteError } = await supabase
                .from('vote_sessions')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            if (session?.id === id) {
                setSession(null);
                setCopros([]);
                setPoints([]);
                setVotes({});
            }

            await loadSessionsList();
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    };

    /**
     * Renomme une session
     */
    const renameSession = async (id, newTitle) => {
        setSaving(true);
        try {
            const { error: updateError } = await supabase
                .from('vote_sessions')
                .update({ title: newTitle })
                .eq('id', id);

            if (updateError) throw updateError;

            if (session?.id === id) {
                setSession(prev => ({ ...prev, title: newTitle }));
            }

            await loadSessionsList();
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // POINTS DE VOTE MUTATIONS
    // =====================================================

    /**
     * Ajoute un point de vote
     */
    const addPoint = async (titre, article = '24') => {
        if (!session) return { success: false, error: 'No session' };

        setSaving(true);
        try {
            const sortOrder = points.length + 1;

            const { data, error: insertError } = await supabase
                .from('vote_points')
                .insert({
                    session_id: session.id,
                    title: titre,
                    article,
                    sort_order: sortOrder
                })
                .select()
                .single();

            if (insertError) throw insertError;

            setPoints(prev => [...prev, {
                id: data.id,
                titre: data.title,
                article: data.article
            }]);

            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    };

    /**
     * Supprime un point de vote
     */
    const deletePoint = async (pointId) => {
        setSaving(true);
        try {
            const { error: deleteError } = await supabase
                .from('vote_points')
                .delete()
                .eq('id', pointId);

            if (deleteError) throw deleteError;

            setPoints(prev => prev.filter(p => p.id !== pointId));
            setVotes(prev => {
                const newVotes = { ...prev };
                delete newVotes[pointId];
                return newVotes;
            });

            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    };

    /**
     * Met à jour l'article d'un point
     */
    const updatePointArticle = async (pointId, article) => {
        // Optimistic update
        setPoints(prev => prev.map(p =>
            p.id === pointId ? { ...p, article } : p
        ));

        try {
            const { error: updateError } = await supabase
                .from('vote_points')
                .update({ article })
                .eq('id', pointId);

            if (updateError) throw updateError;
        } catch (err) {
            setError(err.message);
        }
    };

    // =====================================================
    // COPROS / PRESENCE MUTATIONS
    // =====================================================

    const updatePresence = async (coproId, presence) => {
        setCopros(prev => prev.map(c =>
            c.id === coproId
                ? { ...c, presence, procurationDonneeA: presence !== 'procuration' ? null : c.procurationDonneeA }
                : c
        ));

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
        }
    };

    const updateProcuration = async (coproId, mandataireId) => {
        setCopros(prev => prev.map(c =>
            c.id === coproId ? { ...c, procurationDonneeA: mandataireId } : c
        ));

        try {
            await supabase
                .from('vote_copros')
                .update({ procuration_to: mandataireId })
                .eq('id', coproId);
        } catch (err) {
            setError(err.message);
        }
    };

    // =====================================================
    // VOTES MUTATIONS
    // =====================================================

    const updateVote = async (pointId, coproId, voteType) => {
        setVotes(prev => ({
            ...prev,
            [pointId]: {
                ...prev[pointId],
                [coproId]: voteType
            }
        }));

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

    const setAllVotes = async (pointId, voteType) => {
        const votantsIds = copros
            .filter(c => c.presence === 'present' || c.presence === 'correspondance' ||
                (c.presence === 'procuration' && c.procurationDonneeA))
            .map(c => c.id);

        const newVotes = {};
        votantsIds.forEach(id => { newVotes[id] = voteType; });

        setVotes(prev => ({
            ...prev,
            [pointId]: newVotes
        }));

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

    const resetPointVotes = async (pointId) => {
        setVotes(prev => ({
            ...prev,
            [pointId]: {}
        }));

        try {
            const { error: deleteError } = await supabase
                .from('vote_participations')
                .delete()
                .eq('point_id', pointId);

            if (deleteError) throw deleteError;
        } catch (err) {
            setError(err.message);
        }
    };

    const resetAllVotes = async () => {
        if (!session) return;

        setVotes({});

        try {
            const pointIds = points.map(p => p.id);
            if (pointIds.length > 0) {
                const { error: deleteError } = await supabase
                    .from('vote_participations')
                    .delete()
                    .in('point_id', pointIds);

                if (deleteError) throw deleteError;
            }
        } catch (err) {
            setError(err.message);
        }
    };

    // =====================================================
    // COMPUTED VALUES
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
        sessions,
        session,
        copros,
        points,
        votes,

        // Loading / Error
        loading,
        saving,
        error,

        // Computed
        presenceStats,
        procurationCounts,
        TOTAL_TANTIEMES,

        // Session Actions
        loadSession,
        loadSessionsList,
        createSession,
        deleteSession,
        renameSession,

        // Points Actions
        addPoint,
        deletePoint,
        updatePointArticle,

        // Presence Actions
        updatePresence,
        updateProcuration,

        // Vote Actions
        updateVote,
        setAllVotes,
        resetPointVotes,
        resetAllVotes,

        // Helpers
        getPointResult,
        getVotants,
        getMandataires,
        canAcceptProcuration
    };
}
