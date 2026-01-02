/**
 * useCarnetActions.js
 * Generic actions for Carnet Supabase tables.
 */
import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export function useCarnetActions(carnetData, setCarnetData, setError) {
    const [saving, setSaving] = useState(false);

    const updateSection = async (table, data) => {
        setSaving(true);
        try {
            const key = table.replace('carnet_', '');
            const existingId = carnetData[key]?.id;

            let req;
            if (existingId) {
                req = supabase.from(table).update(data).eq('id', existingId);
            } else {
                req = supabase.from(table).insert(data);
            }

            const { data: resData, error } = await req.select().single();
            if (error) throw error;

            setCarnetData(prev => ({ ...prev, [key]: resData }));
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    };

    const addListItem = async (table, item, stateKey) => {
        setSaving(true);
        try {
            const { data, error } = await supabase.from(table).insert(item).select().single();
            if (error) throw error;

            setCarnetData(prev => ({ ...prev, [stateKey]: [...prev[stateKey], data] }));
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    };

    const updateListItem = async (table, id, updates, stateKey) => {
        setSaving(true);
        try {
            const { data, error } = await supabase.from(table).update(updates).eq('id', id).select().single();
            if (error) throw error;

            setCarnetData(prev => ({
                ...prev,
                [stateKey]: prev[stateKey].map(i => i.id === id ? data : i)
            }));
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    };

    const deleteListItem = async (table, id, stateKey) => {
        setSaving(true);
        try {
            const { error } = await supabase.from(table).delete().eq('id', id);
            if (error) throw error;

            setCarnetData(prev => ({ ...prev, [stateKey]: prev[stateKey].filter(i => i.id !== id) }));
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    };

    return {
        saving,
        updateSection,
        addListItem,
        updateListItem,
        deleteListItem
    };
}
