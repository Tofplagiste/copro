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
    const [owners, setOwners] = useState([]);
    const [categories, setCategories] = useState([]);
    const [lots, setLots] = useState([]);

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
            const [budgetRes, accountsRes, opsRes, ownersRes, categoriesRes, lotsRes, ownerLotsRes] = await Promise.all([
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
                    .order('date', { ascending: false }),
                supabase
                    .from('owners')
                    .select('*')
                    .order('name'),
                supabase
                    .from('expense_categories')
                    .select('*')
                    .order('code'),
                supabase
                    .from('lots')
                    .select('*')
                    .order('numero'),
                supabase
                    .from('owner_lots')
                    .select('*')
            ]);

            if (budgetRes.error) throw budgetRes.error;
            if (accountsRes.error) throw accountsRes.error;
            if (opsRes.error) throw opsRes.error;
            if (ownersRes.error) throw ownersRes.error;
            if (categoriesRes.error) throw categoriesRes.error;
            if (lotsRes.error) throw lotsRes.error;
            if (ownerLotsRes.error) throw ownerLotsRes.error;

            // Build lot_ids array for each owner from junction table
            const ownerLotsMap = {};
            (ownerLotsRes.data || []).forEach(ol => {
                if (!ownerLotsMap[ol.owner_id]) ownerLotsMap[ol.owner_id] = [];
                ownerLotsMap[ol.owner_id].push(ol.lot_id);
            });

            const ownersWithLotIds = (ownersRes.data || []).map(o => ({
                ...o,
                lot_ids: ownerLotsMap[o.id] || []
            }));

            setBudgetItems(groupBudgetItems(budgetRes.data));
            setAccounts(accountsRes.data || []);
            setOperations(opsRes.data || []);
            setOwners(ownersWithLotIds);
            setCategories(categoriesRes.data || []);
            setLots(lotsRes.data || []);

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
        owners,
        categories,
        lots,

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
