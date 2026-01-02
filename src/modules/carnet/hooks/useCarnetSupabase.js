/**
 * useCarnetSupabase - Hook Carnet migré sur Supabase
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useCarnetActions } from './useCarnetActions';

export function useCarnetSupabase() {
    const [carnetData, setCarnetData] = useState({
        general: null,
        admin: null,
        technique: null,
        prestataires: [],
        travaux: [],
        owners: []
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const actions = useCarnetActions(carnetData, setCarnetData, setError);

    const loadCarnet = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [gen, adm, tech, prest, trav, own] = await Promise.all([
                supabase.from('carnet_general').select('*').limit(1).maybeSingle(),
                supabase.from('carnet_admin').select('*').limit(1).maybeSingle(),
                supabase.from('carnet_technique').select('*').limit(1).maybeSingle(),
                supabase.from('carnet_prestataires').select('*').order('name'),
                supabase.from('carnet_travaux').select('*').order('annee', { ascending: false }),
                supabase.from('owners').select('*').order('name')
            ]);

            setCarnetData({
                general: gen.data || {},
                admin: adm.data || {},
                technique: tech.data || {},
                prestataires: prest.data || [],
                travaux: trav.data || [],
                owners: own.data || []
            });

        } catch (err) {
            console.error('Error loading Carnet:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCarnet();
    }, [loadCarnet]);

    return {
        ...carnetData, // general, admin, technique, prestataires, travaux, owners
        loading,
        saving: actions.saving,
        error,

        // Single Configs
        updateGeneral: (d) => actions.updateSection('carnet_general', d),
        updateAdmin: (d) => actions.updateSection('carnet_admin', d),
        updateTechnique: (d) => actions.updateSection('carnet_technique', d),

        // Lists
        addPrestataire: (d) => actions.addListItem('carnet_prestataires', d, 'prestataires'),
        updatePrestataire: (id, d) => actions.updateListItem('carnet_prestataires', id, d, 'prestataires'),
        deletePrestataire: (id) => actions.deleteListItem('carnet_prestataires', id, 'prestataires'),

        addTravaux: (d) => actions.addListItem('carnet_travaux', d, 'travaux'),
        updateTravaux: (id, d) => actions.updateListItem('carnet_travaux', id, d, 'travaux'),
        deleteTravaux: (id) => actions.deleteListItem('carnet_travaux', id, 'travaux'),

        addProprietaire: (d) => actions.addListItem('owners', d, 'owners'),
        updateProprietaire: (id, d) => {
            // Sanitize payload: remove calculated fields
            // eslint-disable-next-line no-unused-vars
            const { gestion, menage, lots, infos, ...rest } = d;
            return actions.updateListItem('owners', id, rest, 'owners');
        },
        deleteProprietaire: (id) => actions.deleteListItem('owners', id, 'owners'),

        refresh: loadCarnet
    };
}
