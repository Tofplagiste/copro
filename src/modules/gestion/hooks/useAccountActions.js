/**
 * useAccountActions - Actions CRUD pour les Comptes (Supabase)
 */
import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export function useAccountActions(setAccounts, setError) {
    const [saving, setSaving] = useState(false);

    const addAccount = async (id, name, initialBalance = 0) => {
        setSaving(true);
        try {
            const { data, error } = await supabase
                .from('accounts')
                .insert({ id, name, initial_balance: initialBalance })
                .select()
                .single();

            if (error) throw error;

            setAccounts(prev => [...prev, data]);
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    };

    const updateAccount = async (accountId, updates) => {
        // Optimistic
        setAccounts(prev => prev.map(acc =>
            acc.id === accountId ? { ...acc, ...updates } : acc
        ));

        try {
            const { error } = await supabase
                .from('accounts')
                .update(updates)
                .eq('id', accountId);

            if (error) throw error;
        } catch (err) {
            setError(err.message);
        }
    };

    const deleteAccount = async (accountId) => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('accounts')
                .delete()
                .eq('id', accountId);

            if (error) throw error;

            setAccounts(prev => prev.filter(acc => acc.id !== accountId));
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    };

    return {
        accountSaving: saving,
        addAccount,
        updateAccount,
        deleteAccount
    };
}
