/**
 * useFinanceSupabaseAdapter.js
 * Adapte les données Supabase (snake_case) pour l'onglet Finance (format legacy).
 */
import { useMemo } from 'react';
import { useGestionData } from '../context/GestionSupabaseContext';

export function useFinanceSupabaseAdapter() {
    const {
        accounts,
        operations: rawOperations,
        categories,
        addOperation,
        updateOperation,
        deleteOperation,
        updateAccount,
        loading,
        error
    } = useGestionData();

    // Adapter les opérations (DB -> UI)
    const operations = useMemo(() => {
        return rawOperations.map(op => ({
            ...op,
            // Mapping Snake -> Camel/Legacy
            account: op.account_id,       // UI attend 'account' (ID)
            label: op.description,        // UI attend 'label'
            category: op.category_code,   // UI attend 'category' (Code)
            // Les champs date, amount, type sont identiques
        }));
    }, [rawOperations]);

    return {
        accounts,
        operations,
        categories,
        addOperation,
        updateOperation,
        deleteOperation,
        updateAccount,
        loading,
        error
    };
}
