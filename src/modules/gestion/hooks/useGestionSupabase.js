/**
 * useGestionSupabase - Hook Gestion migré sur Supabase
 * Refactorisé pour respecter la limite de 150 lignes.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { groupBudgetItems } from '../utils/budgetAdapter';
import { useBudgetActions } from './useBudgetActions';
import { useAccountActions } from './useAccountActions';
import { useOperationActions } from './useOperationActions';

/**
 * Hook principal pour le module Gestion
 */
export function useGestionSupabase() {
    // =====================================================
    // STATE
    // =====================================================
    const [budgetItems, setBudgetItems] = useState({ general: [], special: [], menage: [], travaux: [] });
    const [accounts, setAccounts] = useState([]);
    const [operations, setOperations] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // =====================================================
    // ACTIONS (Hooks séparés)
    // =====================================================
    const budgetActions = useBudgetActions(setBudgetItems, setError);
    const accountActions = useAccountActions(setAccounts, setError);
    const opActions = useOperationActions(setOperations, setError);

    // =====================================================
    // DATA FETCHING (Promise.all)
    // =====================================================
    const loadAllData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
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

            if (budgetRes.error) throw budgetRes.error;
            if (accountsRes.error) throw accountsRes.error;
            if (opsRes.error) throw opsRes.error;

            setBudgetItems(groupBudgetItems(budgetRes.data));
            setAccounts(accountsRes.data || []);
            setOperations(opsRes.data || []);

        } catch (err) {
            console.error('[useGestionSupabase] Erreur loading:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAllData();
    }, [loadAllData]);

    const globalSaving = budgetActions.budgetSaving || accountActions.accountSaving || opActions.opSaving;

    return {
        // Data
        budgetItems,
        accounts,
        operations,

        // Status
        loading,
        saving: globalSaving,
        error,

        // Actions (Spread)
        ...budgetActions, // addBudgetItem, etc.
        ...accountActions, // addAccount, etc.
        ...opActions,      // addOperation, etc.

        refresh: loadAllData
    };
}
