/**
 * GestionSupabaseContext - Contexte React pour le module Gestion (Supabase)
 * 
 * PHASE 6 : Combine useFinanceSupabase, useWaterSupabase et useMonthlyBudget.
 * Fournit les données Budget, Comptes, Opérations, Eau et Monthly aux composants enfants.
 */
import { createContext, useContext, useMemo, useState } from 'react';
import { useFinanceSupabase } from '../hooks/useFinanceSupabase';
import { useWaterSupabase } from '../hooks/useWaterSupabase';
import { useMonthlyBudget } from '../hooks/useMonthlyBudget';

const GestionSupabaseContext = createContext(null);

/**
 * Provider pour les données Gestion Supabase
 * Combine Finance, Water et Monthly Budget, expose un loading/error global
 */
export function GestionSupabaseProvider({ children }) {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const finance = useFinanceSupabase();
    const water = useWaterSupabase();
    const monthly = useMonthlyBudget(selectedYear);

    // Combine loading and error states
    const value = useMemo(() => ({
        // Finance data
        budgetItems: finance.budgetItems,
        accounts: finance.accounts,
        operations: finance.operations,
        categories: finance.categories,
        // Water data
        waterRows: water.waterRows,
        waterSettings: water.settings,
        activeQuarter: water.activeQuarter,
        currentYear: water.currentYear,
        lots: water.lots,
        owners: water.owners,
        previsions: water.previsions,
        // Monthly Budget data
        monthlyExpenses: monthly.expenses,
        monthlyIncome: monthly.income,
        selectedYear,
        // Status
        loading: finance.loading || water.loading || monthly.loading,
        saving: finance.saving || water.saving || monthly.saving,
        error: finance.error || water.error || monthly.error,
        // Finance actions
        addOperation: finance.addOperation,
        updateOperation: finance.updateOperation,
        deleteOperation: finance.deleteOperation,
        addBudgetItem: finance.addBudgetItem,
        updateBudgetItem: finance.updateBudgetItem,
        deleteBudgetItem: finance.deleteBudgetItem,
        // Accounts actions
        addAccount: finance.addAccount,
        updateAccount: finance.updateAccount,
        deleteAccount: finance.deleteAccount,
        // Categories actions
        addCategory: finance.addCategory,
        addCategories: finance.addCategories,
        deleteCategory: finance.deleteCategory,
        // Water actions
        setActiveQuarter: water.setActiveQuarter,
        saveReading: water.saveReading,
        updateMeterNumber: water.updateMeterNumber,
        updateWaterSettings: water.updateSettings,
        savePrevision: water.savePrevision,
        // Monthly Budget actions
        setSelectedYear,
        saveMonthlyExpense: monthly.saveExpense,
        saveMonthlyIncome: monthly.saveIncome,
        clearMonthlyExpenseLine: monthly.clearExpenseLine,
        fillMonthlyExpenseLine: monthly.fillExpenseLine,
        // Combined refresh
        refresh: async () => {
            await Promise.all([finance.refresh(), water.refresh(), monthly.refresh()]);
        }
    }), [finance, water, monthly, selectedYear]);

    return (
        <GestionSupabaseContext.Provider value={value}>
            {children}
        </GestionSupabaseContext.Provider>
    );
}

/**
 * Hook pour accéder aux données Gestion Supabase
 * @returns {Object} État et fonctions combinées finance + eau
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useGestionData() {
    const context = useContext(GestionSupabaseContext);
    if (!context) {
        throw new Error('useGestionData must be used within GestionSupabaseProvider');
    }
    return context;
}
