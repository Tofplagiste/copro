/**
 * useGestionSupabase - Hook Gestion migré sur Supabase
 * 
 * MODULE CRITIQUE : Gère Budget, Comptes Bancaires et Opérations.
 * Charge les 3 tables en parallèle pour performance optimale.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabaseClient';

/**
 * Hook principal pour le module Gestion (version Supabase)
 * @returns {Object} État et fonctions pour la gestion copropriété
 */
export function useGestionSupabase() {
    // =====================================================
    // STATE
    // =====================================================
    const [budgetItems, setBudgetItems] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [operations, setOperations] = useState([]);

    // Loading & Error states
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // =====================================================
    // DATA FETCHING
    // =====================================================

    /**
     * Charge toutes les données en parallèle
     */
    const loadAllData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Chargement parallèle des 3 tables
            const [budgetRes, accountsRes, opsRes] = await Promise.all([
                supabase
                    .from('budget_items')
                    .select('*')
                    .order('category')
                    .order('sort_order'),
                supabase
                    .from('accounts')
                    .select('*')
                    .order('id'),
                supabase
                    .from('finance_operations')
                    .select('*')
                    .order('date', { ascending: false })
            ]);

            // Vérifier les erreurs
            if (budgetRes.error) throw budgetRes.error;
            if (accountsRes.error) throw accountsRes.error;
            if (opsRes.error) throw opsRes.error;

            // Transformer budget_items en format groupé par catégorie
            const grouped = { general: [], special: [], menage: [], travaux: [] };
            (budgetRes.data || []).forEach(item => {
                if (grouped[item.category]) {
                    grouped[item.category].push({
                        id: item.id,
                        name: item.name,
                        reel: parseFloat(item.reel) || 0,
                        previ: parseFloat(item.previ) || 0,
                        previ_n1: parseFloat(item.previ_n1) || 0,
                        sortOrder: item.sort_order
                    });
                }
            });

            setBudgetItems(grouped);
            setAccounts(accountsRes.data || []);
            setOperations(opsRes.data || []);

        } catch (err) {
            console.error('[useGestionSupabase] Erreur chargement:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Chargement initial
    useEffect(() => {
        loadAllData();
    }, [loadAllData]);

    // =====================================================
    // BUDGET MUTATIONS
    // =====================================================

    /**
     * Ajoute un poste budgétaire
     * @param {string} category - Catégorie (general, special, menage, travaux)
     * @param {string} name - Nom du poste
     */
    const addBudgetItem = async (category, name) => {
        setSaving(true);
        try {
            const sortOrder = (budgetItems[category]?.length || 0) + 1;

            const { data, error: insertError } = await supabase
                .from('budget_items')
                .insert({
                    category,
                    name,
                    reel: 0,
                    previ: 0,
                    previ_n1: 0,
                    sort_order: sortOrder
                })
                .select()
                .single();

            if (insertError) throw insertError;

            // Mise à jour locale
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
     * Met à jour un poste budgétaire
     * @param {string} category - Catégorie
     * @param {number} itemId - ID du poste
     * @param {string} field - Champ à modifier (reel, previ, previ_n1)
     * @param {number} value - Nouvelle valeur
     */
    const updateBudgetItem = async (category, itemId, field, value) => {
        // Optimistic update
        setBudgetItems(prev => ({
            ...prev,
            [category]: prev[category].map(item =>
                item.id === itemId ? { ...item, [field]: parseFloat(value) || 0 } : item
            )
        }));

        try {
            const { error: updateError } = await supabase
                .from('budget_items')
                .update({ [field]: parseFloat(value) || 0 })
                .eq('id', itemId);

            if (updateError) throw updateError;
        } catch (err) {
            console.error('[useGestionSupabase] Erreur update budget:', err);
            setError(err.message);
        }
    };

    /**
     * Supprime un poste budgétaire
     */
    const deleteBudgetItem = async (category, itemId) => {
        setSaving(true);
        try {
            const { error: deleteError } = await supabase
                .from('budget_items')
                .delete()
                .eq('id', itemId);

            if (deleteError) throw deleteError;

            // Mise à jour locale
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

    // =====================================================
    // ACCOUNTS MUTATIONS
    // =====================================================

    /**
     * Ajoute un compte bancaire
     * @param {string} id - ID du compte (ex: "512-CIC")
     * @param {string} name - Nom du compte
     * @param {number} initialBalance - Solde initial
     */
    const addAccount = async (id, name, initialBalance = 0) => {
        setSaving(true);
        try {
            const { data, error: insertError } = await supabase
                .from('accounts')
                .insert({
                    id,
                    name,
                    initial_balance: initialBalance
                })
                .select()
                .single();

            if (insertError) throw insertError;

            setAccounts(prev => [...prev, data]);
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    };

    /**
     * Met à jour un compte bancaire
     */
    const updateAccount = async (accountId, updates) => {
        // Optimistic update
        setAccounts(prev => prev.map(acc =>
            acc.id === accountId ? { ...acc, ...updates } : acc
        ));

        try {
            const { error: updateError } = await supabase
                .from('accounts')
                .update(updates)
                .eq('id', accountId);

            if (updateError) throw updateError;
        } catch (err) {
            console.error('[useGestionSupabase] Erreur update account:', err);
            setError(err.message);
        }
    };

    /**
     * Supprime un compte bancaire
     */
    const deleteAccount = async (accountId) => {
        setSaving(true);
        try {
            const { error: deleteError } = await supabase
                .from('accounts')
                .delete()
                .eq('id', accountId);

            if (deleteError) throw deleteError;

            setAccounts(prev => prev.filter(acc => acc.id !== accountId));
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // OPERATIONS MUTATIONS
    // =====================================================

    /**
     * Ajoute une opération financière
     * @param {Object} opData - Données de l'opération
     */
    const addOperation = async (opData) => {
        setSaving(true);
        try {
            const payload = {
                account_id: opData.accountId,
                date: opData.date,
                due_date: opData.dueDate || null,
                accounting_date: opData.accountingDate || null,
                description: opData.description,
                amount: parseFloat(opData.amount) || 0,
                category_code: opData.categoryCode || null,
                owner_id: opData.ownerId || null,
                is_reconciled: opData.isReconciled || false
            };

            const { data, error: insertError } = await supabase
                .from('finance_operations')
                .insert(payload)
                .select()
                .single();

            if (insertError) throw insertError;

            // Ajouter au début (plus récent)
            setOperations(prev => [data, ...prev]);
            return { success: true, operation: data };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    };

    /**
     * Met à jour une opération financière
     */
    const updateOperation = async (operationId, updates) => {
        // Transformer les noms de champs frontend -> backend
        const dbUpdates = {};
        if (updates.accountId !== undefined) dbUpdates.account_id = updates.accountId;
        if (updates.date !== undefined) dbUpdates.date = updates.date;
        if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
        if (updates.accountingDate !== undefined) dbUpdates.accounting_date = updates.accountingDate;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.amount !== undefined) dbUpdates.amount = parseFloat(updates.amount) || 0;
        if (updates.categoryCode !== undefined) dbUpdates.category_code = updates.categoryCode;
        if (updates.ownerId !== undefined) dbUpdates.owner_id = updates.ownerId;
        if (updates.isReconciled !== undefined) dbUpdates.is_reconciled = updates.isReconciled;

        // Optimistic update
        setOperations(prev => prev.map(op =>
            op.id === operationId ? { ...op, ...dbUpdates } : op
        ));

        try {
            const { error: updateError } = await supabase
                .from('finance_operations')
                .update(dbUpdates)
                .eq('id', operationId);

            if (updateError) throw updateError;
        } catch (err) {
            console.error('[useGestionSupabase] Erreur update operation:', err);
            setError(err.message);
        }
    };

    /**
     * Supprime une opération financière
     */
    const deleteOperation = async (operationId) => {
        setSaving(true);
        try {
            const { error: deleteError } = await supabase
                .from('finance_operations')
                .delete()
                .eq('id', operationId);

            if (deleteError) throw deleteError;

            setOperations(prev => prev.filter(op => op.id !== operationId));
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    };

    /**
     * Ajoute plusieurs opérations (pour ventilation)
     */
    const addBatchOperations = async (opsArray) => {
        setSaving(true);
        try {
            const payload = opsArray.map(op => ({
                account_id: op.accountId,
                date: op.date,
                due_date: op.dueDate || null,
                accounting_date: op.accountingDate || null,
                description: op.description,
                amount: parseFloat(op.amount) || 0,
                category_code: op.categoryCode || null,
                owner_id: op.ownerId || null,
                is_reconciled: false
            }));

            const { data, error: insertError } = await supabase
                .from('finance_operations')
                .insert(payload)
                .select();

            if (insertError) throw insertError;

            // Ajouter au début
            setOperations(prev => [...(data || []), ...prev]);
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // RETURN
    // =====================================================

    return {
        // État
        budgetItems,
        accounts,
        operations,

        // Loading / Error
        loading,
        saving,
        error,

        // Actions Budget
        addBudgetItem,
        updateBudgetItem,
        deleteBudgetItem,

        // Actions Comptes
        addAccount,
        updateAccount,
        deleteAccount,

        // Actions Opérations
        addOperation,
        updateOperation,
        deleteOperation,
        addBatchOperations,

        // Reload
        refresh: loadAllData
    };
}
