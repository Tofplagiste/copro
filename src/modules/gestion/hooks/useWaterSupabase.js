/**
 * useWaterSupabase.js - Hook pour la gestion de l'eau (Architecture V6)
 * 
 * Les compteurs d'eau sont liés aux LOTS (water_meters.lot_id).
 * Les propriétaires sont récupérés via owner_lots.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { transformWaterData } from '../utils/waterAdapter';

/**
 * Hook principal pour la gestion de l'eau.
 * @returns {Object} État et actions eau
 */
export function useWaterSupabase() {
    const [rawLots, setRawLots] = useState([]);
    const [previsions, setPrevisions] = useState([]);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const currentYear = useMemo(() => new Date().getFullYear(), []);
    const [activeQuarter, setActiveQuarter] = useState('T1');

    // ===== CHARGEMENT INITIAL =====
    // ===== CHARGEMENT INITIAL =====
    // silent = true pour ne pas déclencher le loading global
    const loadData = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        setError(null);

        try {
            const [lotsRes, settingsRes, previsionsRes] = await Promise.all([
                supabase.from('lots').select(`
                    id, numero, type, tantiemes, nom,
                    water_meters (id, meter_number),
                    water_readings (id, year, quarter, old_value, new_value),
                    owner_lots (
                        owners (*)
                    )
                `).order('numero', { ascending: true }),
                supabase.from('water_settings').select('*').eq('year', currentYear).maybeSingle(),
                supabase.from('water_previsions').select('*').eq('year', currentYear)
            ]);

            if (lotsRes.error) throw lotsRes.error;
            // Settings may not exist for current year
            if (settingsRes.error && settingsRes.error.code !== 'PGRST116') {
                throw settingsRes.error;
            }
            if (previsionsRes.error) throw previsionsRes.error;

            setRawLots(lotsRes.data || []);
            setSettings(settingsRes.data || { year: currentYear, active_quarter: 'T1' });
            setPrevisions(previsionsRes.data || []);
            if (settingsRes.data?.active_quarter) {
                setActiveQuarter(settingsRes.data.active_quarter);
            }
        } catch (err) {
            console.error('[useWaterSupabase] Load error:', err);
            setError(err.message);
        } finally {
            if (!silent) setLoading(false);
        }
    }, [currentYear]);

    useEffect(() => { loadData(); }, [loadData]);

    // ===== DONNÉES TRANSFORMÉES =====
    const waterRows = useMemo(() => {
        return transformWaterData(rawLots, currentYear);
    }, [rawLots, currentYear]);

    // Extraction des propriétaires uniques et de leurs lots
    const owners = useMemo(() => {
        const ownerMap = new Map();
        rawLots.forEach(lot => {
            // Check owner_lots relation
            const relations = lot.owner_lots || [];
            relations.forEach(rel => {
                const owner = rel.owners;
                if (owner) {
                    if (!ownerMap.has(owner.id)) {
                        ownerMap.set(owner.id, {
                            ...owner,
                            lot_ids: []
                        });
                    }
                    // Add lot ID if not already present
                    const ownerEntry = ownerMap.get(owner.id);
                    if (!ownerEntry.lot_ids.includes(lot.id)) {
                        ownerEntry.lot_ids.push(lot.id);
                    }
                }
            });
        });
        return Array.from(ownerMap.values());
    }, [rawLots]);

    // ===== ACTIONS =====
    /**
     * Sauvegarde un relevé (upsert) et synchronise (Nouveau T1 -> Ancien T2).
     * @param {Object} data - { lot_id, year, quarter, old_value, new_value }
     */
    const saveReading = useCallback(async (data) => {
        setSaving(true);
        try {
            const { lot_id, year, quarter, old_value, new_value } = data;

            // 1. Sauvegarde du trimestre courant
            const { error: err } = await supabase.from('water_readings').upsert({
                lot_id, year, quarter, old_value, new_value
            }, { onConflict: 'lot_id,year,quarter' });

            if (err) throw err;

            // 2. Synchronisation
            const quarters = ['T1', 'T2', 'T3', 'T4'];
            const qIdx = quarters.indexOf(quarter);

            // Sync vers le SUIVANT (Nouveau actuel -> Ancien suivant)
            if (qIdx < 3 && new_value !== undefined && new_value !== null) {
                const nextQ = quarters[qIdx + 1];
                // Récupérer le "Nouveau" du suivant pour ne pas l'écraser
                const { data: nextRow } = await supabase.from('water_readings')
                    .select('new_value').eq('lot_id', lot_id).eq('year', year).eq('quarter', nextQ).maybeSingle();

                await supabase.from('water_readings').upsert({
                    lot_id, year, quarter: nextQ,
                    old_value: new_value, // Le nouveau devient l'ancien du suivant
                    new_value: nextRow?.new_value || 0
                }, { onConflict: 'lot_id,year,quarter' });
            }

            // Sync vers le PRÉCÉDENT (Ancien actuel -> Nouveau précédent)
            if (qIdx > 0 && old_value !== undefined && old_value !== null) {
                const prevQ = quarters[qIdx - 1];
                // Récupérer l' "Ancien" du précédent pour ne pas l'écraser
                const { data: prevRow } = await supabase.from('water_readings')
                    .select('old_value').eq('lot_id', lot_id).eq('year', year).eq('quarter', prevQ).maybeSingle();

                await supabase.from('water_readings').upsert({
                    lot_id, year, quarter: prevQ,
                    old_value: prevRow?.old_value || 0,
                    new_value: old_value // L'ancien devient le nouveau du précédent
                }, { onConflict: 'lot_id,year,quarter' });
            }

            await loadData(true);
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setSaving(false);
        }
    }, [loadData]);

    /**
     * Sauvegarde une prévision eau (upsert).
     * @param {Object} data - { lot_id, year, quarter, amount_sub, amount_conso, amount_regul }
     */
    const savePrevision = useCallback(async (data) => {
        setSaving(true);
        try {
            const { error: err } = await supabase
                .from('water_previsions')
                .upsert(data, { onConflict: 'lot_id,year,quarter' });
            if (err) throw err;
            await loadData(true);
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setSaving(false);
        }
    }, [loadData]);

    /**
     * Met à jour ou crée le numéro de compteur.
     * @param {number|null} meterId - ID du compteur (null si nouveau)
     * @param {string} number - Nouveau numéro
     * @param {number} [lotId] - ID du lot (requis pour création)
     */
    const updateMeterNumber = useCallback(async (meterId, number, lotId) => {
        setSaving(true);
        try {
            if (meterId) {
                // Update existing by ID
                const { error: err } = await supabase
                    .from('water_meters')
                    .update({ meter_number: number })
                    .eq('id', meterId);
                if (err) throw err;
            } else if (lotId && number) {
                // Create new or recover existing by Lot ID
                // Check if meter already exists for this lot (avoid duplicates)
                const { data: existing } = await supabase
                    .from('water_meters')
                    .select('id')
                    .eq('lot_id', lotId)
                    .maybeSingle();

                if (existing) {
                    // It exists but wasn't linked in UI (or refresh lagging) -> Update it
                    const { error: err } = await supabase
                        .from('water_meters')
                        .update({ meter_number: number })
                        .eq('id', existing.id);
                    if (err) throw err;
                } else {
                    // Really new -> Insert
                    const { error: err } = await supabase
                        .from('water_meters')
                        .insert([{ meter_number: number, lot_id: lotId }]);
                    if (err) throw err;
                }
            }
            await loadData(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }, [loadData]);

    /**
     * Met à jour les paramètres eau (année en cours).
     * @param {Object} data - Données à mettre à jour
     */
    const updateSettings = useCallback(async (data) => {
        setSaving(true);
        try {
            // Utiliser UPSERT sur l'année pour éviter les doublons
            const payload = { ...settings, ...data, year: currentYear };
            // Si settings n'a pas d'ID, on laisse Supabase gérer ou on utilise l'année comme clé unique si contrainte
            // Note: Assurez-vous d'avoir une contrainte UNIQUE sur (year) ou un ID
            const { error: err } = await supabase
                .from('water_settings')
                .upsert(payload, { onConflict: 'year' });
            if (err) throw err;
            setSettings(prev => ({ ...prev, ...data }));
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }, [settings, currentYear]);

    return {
        // Data
        waterRows,
        settings,
        activeQuarter,
        currentYear,
        lots: rawLots,
        owners,
        previsions,

        // Status
        loading,
        saving,
        error,

        // Actions
        setActiveQuarter,
        saveReading,
        savePrevision,
        updateMeterNumber,
        updateSettings,
        refresh: loadData
    };
}
