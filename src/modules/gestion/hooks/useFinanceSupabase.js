/**
 * useFinanceSupabase.js - Hook pour la gestion comptable Supabase
 * 
 * Charge et gère : budget_items, accounts, finance_operations, expense_categories.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { groupBudgetItems } from '../utils/budgetAdapter';

/**
 * Hook principal pour la comptabilité/finance.
 * @returns {Object} État et actions comptables
 */
export function useFinanceSupabase() {
    const [budgetItems, setBudgetItems] = useState({ general: [], special: [], menage: [], travaux: [] });
    const [accounts, setAccounts] = useState([]);
    const [operations, setOperations] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // ===== CHARGEMENT INITIAL =====
    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const [budgetRes, accountsRes, opsRes, categoriesRes] = await Promise.all([
                supabase.from('budget_items').select('*').order('category').order('sort_order'),
                supabase.from('accounts').select('*').order('id'),
                supabase.from('finance_operations').select('*').order('date', { ascending: false }),
                supabase.from('expense_categories').select('*').order('code')
            ]);

            if (budgetRes.error) throw budgetRes.error;
            if (accountsRes.error) throw accountsRes.error;
            if (opsRes.error) throw opsRes.error;
            if (categoriesRes.error) throw categoriesRes.error;

            setBudgetItems(groupBudgetItems(budgetRes.data));
            setAccounts(accountsRes.data || []);
            setOperations(opsRes.data || []);
            setCategories(categoriesRes.data || []);
        } catch (err) {
            console.error('[useFinanceSupabase] Load error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // ===== OPÉRATIONS CRUD =====
    /**
     * Ajoute une nouvelle opération financière.
     * @param {Object} data - Données de l'opération
     */
    const addOperation = useCallback(async (data) => {
        setSaving(true);
        try {
            const { error: err } = await supabase.from('finance_operations').insert([data]);
            if (err) throw err;
            await loadData();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }, [loadData]);

    /**
     * Met à jour une opération existante.
     * @param {number} id - ID de l'opération
     * @param {Object} data - Nouvelles données
     */
    const updateOperation = useCallback(async (id, data) => {
        setSaving(true);
        try {
            const { error: err } = await supabase.from('finance_operations').update(data).eq('id', id);
            if (err) throw err;
            await loadData();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }, [loadData]);

    /**
     * Supprime une opération.
     * @param {number} id - ID de l'opération
     */
    const deleteOperation = useCallback(async (id) => {
        setSaving(true);
        try {
            const { error: err } = await supabase.from('finance_operations').delete().eq('id', id);
            if (err) throw err;
            await loadData();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }, [loadData]);

    // ===== BUDGET CRUD =====
    /**
     * Ajoute une ligne budgétaire.
     * @param {Object} data - Données de la ligne
     */
    const addBudgetItem = useCallback(async (data) => {
        setSaving(true);
        try {
            const { error: err } = await supabase.from('budget_items').insert([data]);
            if (err) throw err;
            await loadData();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }, [loadData]);

    /**
     * Met à jour une ligne budgétaire.
     * @param {number} id - ID de la ligne
     * @param {Object} data - Nouvelles données
     */
    const updateBudgetItem = useCallback(async (id, data) => {
        setSaving(true);
        try {
            const { error: err } = await supabase.from('budget_items').update(data).eq('id', id);
            if (err) throw err;
            await loadData();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }, [loadData]);

    /**
     * Supprime une ligne budgétaire.
     * @param {number} id - ID de la ligne
     */
    const deleteBudgetItem = useCallback(async (id) => {
        setSaving(true);
        try {
            const { error: err } = await supabase.from('budget_items').delete().eq('id', id);
            if (err) throw err;
            await loadData();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }, [loadData]);

    return {
        budgetItems, accounts, operations, categories,
        loading, saving, error,
        addOperation, updateOperation, deleteOperation,
        addBudgetItem, updateBudgetItem, deleteBudgetItem,
        refresh: loadData
    };
}
