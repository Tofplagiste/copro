/**
 * useMonthlyBudget.js - Hook pour gérer les dépenses/recettes mensuelles (Supabase)
 * 
 * Gère : monthly_expenses (dépenses prévisionnelles) et monthly_income (recettes).
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabaseClient';

/**
 * Hook pour les données mensuelles du tableau de bord budgétaire.
 * @param {number} year - Année à charger
 * @returns {Object} État et actions pour les dépenses/recettes mensuelles
 */
export function useMonthlyBudget(year = new Date().getFullYear()) {
    const [expenses, setExpenses] = useState({});  // { [budgetItemId]: [0,0,0,...12 values] }
    const [income, setIncome] = useState({});      // { [monthIndex]: { calls, reguls, other } }
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // ===== CHARGEMENT DES DONNÉES =====
    const loadData = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        setError(null);

        try {
            const [expensesRes, incomeRes] = await Promise.all([
                supabase.from('monthly_expenses')
                    .select('*')
                    .eq('year', year),
                supabase.from('monthly_income')
                    .select('*')
                    .eq('year', year)
            ]);

            if (expensesRes.error) throw expensesRes.error;
            if (incomeRes.error) throw incomeRes.error;

            // Transformer les dépenses en format { budgetItemId: [12 valeurs] }
            const expenseMap = {};
            (expensesRes.data || []).forEach(row => {
                if (!expenseMap[row.budget_item_id]) {
                    expenseMap[row.budget_item_id] = new Array(12).fill(0);
                }
                expenseMap[row.budget_item_id][row.month - 1] = parseFloat(row.amount) || 0;
            });
            setExpenses(expenseMap);

            // Transformer les recettes en format { monthIndex: { calls, reguls, other } }
            const incomeMap = {};
            (incomeRes.data || []).forEach(row => {
                incomeMap[row.month - 1] = {
                    calls: parseFloat(row.calls_amount) || 0,
                    reguls: parseFloat(row.reguls_amount) || 0,
                    other: parseFloat(row.other_amount) || 0
                };
            });
            setIncome(incomeMap);
        } catch (err) {
            console.error('[useMonthlyBudget] Load error:', err);
            setError(err.message);
        } finally {
            if (!silent) setLoading(false);
        }
    }, [year]);

    useEffect(() => { loadData(); }, [loadData]);

    // ===== SAVE EXPENSE =====
    /**
     * Sauvegarde une dépense mensuelle (upsert).
     * @param {number} budgetItemId - ID du poste budgétaire
     * @param {number} month - Mois (1-12)
     * @param {number} amount - Montant
     */
    const saveExpense = useCallback(async (budgetItemId, month, amount) => {
        setSaving(true);
        try {
            const { error: err } = await supabase
                .from('monthly_expenses')
                .upsert({
                    budget_item_id: budgetItemId,
                    year,
                    month,
                    amount: amount || 0,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'budget_item_id,year,month' });

            if (err) throw err;

            // Update local state immediately
            setExpenses(prev => {
                const updated = { ...prev };
                if (!updated[budgetItemId]) {
                    updated[budgetItemId] = new Array(12).fill(0);
                }
                updated[budgetItemId] = [...updated[budgetItemId]];
                updated[budgetItemId][month - 1] = amount || 0;
                return updated;
            });
        } catch (err) {
            console.error('[useMonthlyBudget] Save expense error:', err);
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }, [year]);

    // ===== SAVE INCOME =====
    /**
     * Sauvegarde les recettes d'un mois (upsert).
     * @param {number} month - Mois (1-12)
     * @param {Object} data - { calls, reguls, other }
     */
    const saveIncome = useCallback(async (month, data) => {
        setSaving(true);
        try {
            const { error: err } = await supabase
                .from('monthly_income')
                .upsert({
                    year,
                    month,
                    calls_amount: data.calls || 0,
                    reguls_amount: data.reguls || 0,
                    other_amount: data.other || 0,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'year,month' });

            if (err) throw err;

            // Update local state immediately
            setIncome(prev => ({
                ...prev,
                [month - 1]: {
                    calls: data.calls || 0,
                    reguls: data.reguls || 0,
                    other: data.other || 0
                }
            }));
        } catch (err) {
            console.error('[useMonthlyBudget] Save income error:', err);
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }, [year]);

    // ===== CLEAR LINE =====
    /**
     * Efface toutes les valeurs d'un poste budgétaire pour l'année.
     * @param {number} budgetItemId - ID du poste
     */
    const clearExpenseLine = useCallback(async (budgetItemId) => {
        setSaving(true);
        try {
            const { error: err } = await supabase
                .from('monthly_expenses')
                .delete()
                .eq('budget_item_id', budgetItemId)
                .eq('year', year);

            if (err) throw err;

            setExpenses(prev => {
                const updated = { ...prev };
                updated[budgetItemId] = new Array(12).fill(0);
                return updated;
            });
        } catch (err) {
            console.error('[useMonthlyBudget] Clear line error:', err);
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }, [year]);

    // ===== FILL LINE =====
    /**
     * Remplit une ligne avec une valeur (tous les mois ou trimestriel).
     * @param {number} budgetItemId - ID du poste
     * @param {'all'|'quarter'} mode - Mode de remplissage
     * @param {number} value - Valeur à appliquer
     */
    const fillExpenseLine = useCallback(async (budgetItemId, mode, value) => {
        setSaving(true);
        try {
            const months = mode === 'quarter' ? [1, 4, 7, 10] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
            const val = parseFloat(value) || 0;

            // Build upsert data
            const upsertData = months.map(m => ({
                budget_item_id: budgetItemId,
                year,
                month: m,
                amount: val,
                updated_at: new Date().toISOString()
            }));

            const { error: err } = await supabase
                .from('monthly_expenses')
                .upsert(upsertData, { onConflict: 'budget_item_id,year,month' });

            if (err) throw err;

            // Update local state
            setExpenses(prev => {
                const arr = prev[budgetItemId] ? [...prev[budgetItemId]] : new Array(12).fill(0);
                months.forEach(m => { arr[m - 1] = val; });
                return { ...prev, [budgetItemId]: arr };
            });
        } catch (err) {
            console.error('[useMonthlyBudget] Fill line error:', err);
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }, [year]);

    return {
        expenses,
        income,
        loading,
        saving,
        error,
        saveExpense,
        saveIncome,
        clearExpenseLine,
        fillExpenseLine,
        refresh: loadData
    };
}
