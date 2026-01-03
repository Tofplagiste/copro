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
    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const [lotsRes, settingsRes] = await Promise.all([
                supabase.from('lots').select(`
                    id, numero, type, tantiemes,
                    water_meters (id, meter_number),
                    water_readings (id, year, quarter, old_value, new_value),
                    owner_lots (
                        owners (id, name, is_current_owner)
                    )
                `).order('numero', { ascending: true }),
                supabase.from('water_settings').select('*').eq('year', currentYear).single()
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
            setLoading(false);
        }
    }, [currentYear]);

    useEffect(() => { loadData(); }, [loadData]);

    // ===== DONNÉES TRANSFORMÉES =====
    const waterRows = useMemo(() => {
        return transformWaterData(rawLots, currentYear);
    }, [rawLots, currentYear]);

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
            await loadData();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }, [loadData]);

    /**
     * Met à jour le numéro de compteur.
     * @param {number} meterId - ID du compteur
     * @param {string} number - Nouveau numéro
     */
    const updateMeterNumber = useCallback(async (meterId, number) => {
        setSaving(true);
        try {
            const { error: err } = await supabase
                .from('water_meters')
                .update({ meter_number: number })
                .eq('id', meterId);
            if (err) throw err;
            await loadData();
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
            const { error: err } = await supabase
                .from('water_settings')
                .upsert({ ...settings, ...data, year: currentYear });
            if (err) throw err;
            setSettings(prev => ({ ...prev, ...data }));
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }, [settings, currentYear]);

    return {
        waterRows, settings, activeQuarter, currentYear,
        loading, saving, error,
        setActiveQuarter, saveReading, updateMeterNumber, updateSettings,
        refresh: loadData
    };
}
