/**
 * useBudget - Hook personnalisé pour la gestion du budget
 * 
 * Encapsule l'accès aux données budget et expose des fonctions de calcul.
 * Suit le pattern "logique dans hooks, pas dans UI" de rules.md.
 */
import { useState, useMemo, useCallback } from 'react';
import { useCopro } from '../../../context/CoproContext';
import { calculateDivisors, calculateCategoryTotal, calculateOwnerCall } from '../utils/calculations';

// Constant for stable reference
const DEFAULT_WATER_PREVI = { subs: {}, charges: {}, reguls: {} };

/**
 * Hook pour gérer le budget et les appels de fonds.
 * @returns {Object} État et actions du budget
 */
export function useBudget() {
    const { state, updateState } = useCopro();

    // État local pour le mode budget
    const [budgetMode, setBudgetMode] = useState(() => state.budgetMode || 'previ');

    // Extraction des données
    const budget = state.budget;
    const owners = state.owners;
    const waterPrevi = state.waterPrevi || DEFAULT_WATER_PREVI;

    // Calcul des diviseurs (mémoïsé)
    const divisors = useMemo(() => {
        return calculateDivisors(owners);
    }, [owners]);

    // Calcul du total par catégorie
    const getTotalByCategory = useCallback((category) => {
        return calculateCategoryTotal(budget[category], budgetMode);
    }, [budget, budgetMode]);

    // Calcul de l'appel pour un propriétaire
    const computeOwnerCall = useCallback((owner) => {
        return calculateOwnerCall(owner, budget, divisors, waterPrevi, budgetMode);
    }, [budget, divisors, waterPrevi, budgetMode]);

    // Mise à jour d'un poste budgétaire
    const updateBudgetItem = useCallback((category, index, field, value) => {
        const newBudget = { ...budget };
        newBudget[category] = [...budget[category]];
        newBudget[category][index] = {
            ...newBudget[category][index],
            [field]: parseFloat(value) || 0
        };
        updateState({ budget: newBudget, budgetMode });
    }, [budget, budgetMode, updateState]);

    // Changement de mode budget
    const changeBudgetMode = useCallback((mode) => {
        setBudgetMode(mode);
        updateState({ budgetMode: mode });
    }, [updateState]);

    // Ajout d'un poste budgétaire
    const addBudgetItem = useCallback((category, name) => {
        const newBudget = { ...budget };
        if (!newBudget[category]) newBudget[category] = [];
        newBudget[category].push({ name, reel: 0, previ: 0, previ_n1: 0 });
        updateState({ budget: newBudget });
    }, [budget, updateState]);

    // Suppression d'un poste budgétaire
    const deleteBudgetItem = useCallback((category, index) => {
        const newBudget = { ...budget };
        newBudget[category].splice(index, 1);
        updateState({ budget: newBudget });
    }, [budget, updateState]);

    // Propriétaires non-communs (pour affichage)
    const activeOwners = useMemo(() => {
        return owners.filter(o => !o.isCommon);
    }, [owners]);

    return {
        // État
        budget,
        budgetMode,
        divisors,
        owners: activeOwners,
        waterPrevi,

        // Calculs
        getTotalByCategory,
        computeOwnerCall,

        // Actions
        updateBudgetItem,
        changeBudgetMode,
        addBudgetItem,
        deleteBudgetItem
    };
}

export default useBudget;
