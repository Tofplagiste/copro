/**
 * GestionSupabaseContext - Contexte React pour le module Gestion (Supabase)
 * 
 * PHASE 6 : Combine useFinanceSupabase et useWaterSupabase.
 * Fournit les données Budget, Comptes, Opérations, et Eau aux composants enfants.
 */
import { createContext, useContext, useMemo } from 'react';
import { useFinanceSupabase } from '../hooks/useFinanceSupabase';
import { useWaterSupabase } from '../hooks/useWaterSupabase';

const GestionSupabaseContext = createContext(null);

/**
 * Provider pour les données Gestion Supabase
 * Combine Finance et Water, expose un loading/error global
 */
export function GestionSupabaseProvider({ children }) {
    const finance = useFinanceSupabase();
    const water = useWaterSupabase();

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
        // Status
        loading: finance.loading || water.loading,
        saving: finance.saving || water.saving,
        error: finance.error || water.error,
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
        // Combined refresh
        refresh: async () => {
            await Promise.all([finance.refresh(), water.refresh()]);
        }
    }), [finance, water]);

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
