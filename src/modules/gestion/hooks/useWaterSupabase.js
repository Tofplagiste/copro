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
            const [lotsRes, settingsRes] = await Promise.all([
                supabase.from('lots').select(`
                    id, numero, type, tantiemes, nom,
                    water_meters (id, meter_number),
                    water_readings (id, year, quarter, old_value, new_value),
                    owner_lots (
                        owners (*)
                    )
                `).order('numero', { ascending: true }),
                supabase.from('water_settings').select('*').eq('year', currentYear).maybeSingle()
            ]);

            if (lotsRes.error) throw lotsRes.error;
            // Settings may not exist for current year
            if (settingsRes.error && settingsRes.error.code !== 'PGRST116') {
                throw settingsRes.error;
            }

            setRawLots(lotsRes.data || []);
            setSettings(settingsRes.data || { year: currentYear, active_quarter: 'T1' });
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
     * Sauvegarde un relevé (upsert).
     * @param {Object} data - { lot_id, year, quarter, old_value, new_value }
     */
    const saveReading = useCallback(async (data) => {
        setSaving(true);
        try {
            const { lot_id, year, quarter, old_value, new_value } = data;

            // Check if reading exists
            const { data: existing } = await supabase
                .from('water_readings')
                .select('id')
                .eq('lot_id', lot_id)
                .eq('year', year)
                .eq('quarter', quarter)
                .single();

            if (existing) {
                // Update
                const { error: err } = await supabase
                    .from('water_readings')
                    .update({ old_value, new_value })
                    .eq('id', existing.id);
                if (err) throw err;
            } else {
                // Insert
                const { error: err } = await supabase
                    .from('water_readings')
                    .insert([{ lot_id, year, quarter, old_value, new_value }]);
                if (err) throw err;
            }
            await loadData(true);
        } catch (err) {
            setError(err.message);
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

        // Status
        loading,
        saving,
        error,

        // Actions
        setActiveQuarter,
        saveReading,
        updateMeterNumber,
        updateSettings,
        refresh: loadData
    };
}
