/**
 * useBudgetActions - Actions CRUD pour le Budget (Supabase)
 */
import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export function useBudgetActions(setBudgetItems, setError) {
    const [saving, setSaving] = useState(false);

    /**
     * Ajoute un poste budgétaire
     */
    const addBudgetItem = async (category, name) => {
        setSaving(true);
        try {
            // On calcule le tri coté client ou on laisse la DB gérer?
            // Ici on fait simple, on met à la fin.
            // Idéalement il faudrait lire le max sort_order actuel, mais on simplifie.
            const { data, error } = await supabase
                .from('budget_items')
                .insert({
                    category,
                    name,
                    reel: 0,
                    previ: 0,
                    previ_n1: 0,
                    sort_order: 999 // Temporaire en attendant mieux
                })
                .select()
                .single();

            if (error) throw error;

            // Update local state
            setBudgetItems(prev => ({
                ...prev,
                [category]: [...(prev[category] || []), {
                    id: data.id,
                    name: data.name,
                    reel: 0,
                    previ: 0,
                    previ_n1: 0,
                    sortOrder: data.sort_order
                }]
            }));

            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    };

    /**
     * Met à jour un poste
     */
    const updateBudgetItem = async (category, itemId, field, value) => {
        const val = parseFloat(value) || 0;

        // Optimistic Update
        setBudgetItems(prev => ({
            ...prev,
            [category]: prev[category].map(item =>
                item.id === itemId ? { ...item, [field]: val } : item
            )
        }));

        try {
            const { error } = await supabase
                .from('budget_items')
                .update({ [field]: val })
                .eq('id', itemId);

            if (error) throw error;
        } catch (err) {
            console.error('Update budget error:', err);
            setError(err.message);
            // Revert ? (Complexe, on laisse tel quel pour l'instant)
        }
    };

    /**
     * Supprime un poste
     */
    const deleteBudgetItem = async (category, itemId) => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('budget_items')
                .delete()
                .eq('id', itemId);

            if (error) throw error;

            setBudgetItems(prev => ({
                ...prev,
                [category]: prev[category].filter(item => item.id !== itemId)
            }));

            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    };

    return {
        budgetSaving: saving,
        addBudgetItem,
        updateBudgetItem,
        deleteBudgetItem
    };
}
