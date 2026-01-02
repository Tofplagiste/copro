/**
 * useOperationActions - Actions CRUD pour les Opérations (Supabase)
 */
import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export function useOperationActions(setOperations, setError) {
    const [saving, setSaving] = useState(false);

    const formatOpPayload = (op) => ({
        account_id: op.accountId || op.account, // UI sends 'account'
        date: op.date,
        due_date: op.dueDate || null,
        accounting_date: op.accountingDate || null,
        description: op.description || op.label, // UI sends 'label'
        amount: parseFloat(op.amount) || 0,
        category_code: op.categoryCode || op.category || null, // UI sends 'category'
        type: op.type, // UI sends 'type' (recette/depense)
        owner_id: op.ownerId || null,
        is_reconciled: op.isReconciled || false
    });

    const addOperation = async (opData) => {
        setSaving(true);
        try {
            const payload = formatOpPayload(opData);
            const { data, error } = await supabase
                .from('finance_operations')
                .insert(payload)
                .select()
                .single();

            if (error) throw error;

            setOperations(prev => [data, ...prev]);
            return { success: true, operation: data };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    };

    const updateOperation = async (operationId, updates) => {
        // Mapping simple pour update partiel
        const dbUpdates = {};
        const map = {
            accountId: 'account_id', account: 'account_id',
            date: 'date', dueDate: 'due_date',
            accountingDate: 'accounting_date',
            description: 'description', label: 'description',
            amount: 'amount',
            categoryCode: 'category_code', category: 'category_code',
            type: 'type',
            ownerId: 'owner_id', isReconciled: 'is_reconciled'
        };

        Object.keys(updates).forEach(key => {
            if (map[key] && updates[key] !== undefined) dbUpdates[map[key]] = updates[key];
        });

        // Optimistic (Merge UI keys for local state, but convert for DB)
        // Pour l'état local, on garde les clés telles qu'elles arrivent si besoin, ou on normalise ?
        // GestionApp semble utiliser les clés DB (snake_case) car ça vient du Supabase select * ?
        // => NON, Supabase retourne snake_case.
        // => MAIS FinanceTab attend quoi ? OpData ? 
        // => FinanceTab lit `op.account` (qui est l'ID) et `op.label`.
        // => ATTENTION: Le `select('*')` de Supabase renvoie `account_id`, `description`.
        // => IL FAUT UN ADAPTER EN SORTIE DE USEGESTIONSUPABASE AUSSI SI ON VEUT PAS TOUT CASSER !

        // FIX RAPIDE: Le context retourne `operations` brut de Supabase (snake_case).
        // MAIS FinanceTab utilise `op.account`, `op.label`, `op.category` (camel/custom).
        // => PROBLÈME IDENTIFIÉ : Lecture des données dans FinanceTab incorrecte pour Supabase.

        // On va d'abord corriger l'écriture ici.
        setOperations(prev => prev.map(op =>
            op.id === operationId ? { ...op, ...updates, ...dbUpdates } : op
        ));

        try {
            const { error } = await supabase
                .from('finance_operations')
                .update(dbUpdates)
                .eq('id', operationId);

            if (error) throw error;
        } catch (err) {
            setError(err.message);
        }
    };

    const deleteOperation = async (operationId) => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('finance_operations')
                .delete()
                .eq('id', operationId);

            if (error) throw error;

            setOperations(prev => prev.filter(op => op.id !== operationId));
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    };

    const addBatchOperations = async (opsArray) => {
        setSaving(true);
        try {
            const payload = opsArray.map(formatOpPayload);
            const { data, error } = await supabase
                .from('finance_operations')
                .insert(payload)
                .select();

            if (error) throw error;

            setOperations(prev => [...(data || []), ...prev]);
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    };

    return {
        opSaving: saving,
        addOperation,
        updateOperation,
        deleteOperation,
        addBatchOperations
    };
}
