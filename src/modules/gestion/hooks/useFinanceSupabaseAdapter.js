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
            id: op.id,
            account: op.account_id,       // UI attend 'account' (ID)
            label: op.description,        // UI attend 'label'
            category: op.category_code,   // UI attend 'category' (Code)
            // Gestion du signe pour Type/Montant
            type: op.amount < 0 ? 'depense' : 'recette',
            amount: Math.abs(op.amount)
        }));
    }, [rawOperations]);

    // Wrappers pour convertir UI -> DB
    const addOperationWrapped = (data) => {
        const dbData = {
            account_id: data.account,
            description: data.label,
            category_code: data.category,
            date: data.date,
            // Convertir en signé selon le type
            amount: data.type === 'depense' ? -Math.abs(data.amount) : Math.abs(data.amount)
        };
        addOperation(dbData);
    };

    const updateOperationWrapped = (id, data) => {
        const dbData = {
            account_id: data.account,
            description: data.label,
            category_code: data.category,
            date: data.date,
            amount: data.type === 'depense' ? -Math.abs(data.amount) : Math.abs(data.amount)
        };
        updateOperation(id, dbData);
    };

    return {
        accounts,
        operations,
        categories,
        addOperation: addOperationWrapped,
        updateOperation: updateOperationWrapped,
        deleteOperation,
        updateAccount,
        loading,
        error
    };
}
