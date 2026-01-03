/**
 * useBudgetSupabaseAdapter.js
 * Pont entre le Context Supabase (Data) et l'onglet Budget (Logique métier).
 * Remplace l'ancien useBudget qui utilisait le Context local.
 */
import { useState, useMemo, useCallback } from 'react';
import { useGestionData } from '../context/GestionSupabaseContext';
import { calculateDivisors, calculateCategoryTotal, calculateOwnerCall } from '../utils/calculations';

// Constant for stable reference
const DEFAULT_WATER_PREVI = { subs: {}, charges: {}, reguls: {} };

export function useBudgetSupabaseAdapter() {
    // 1. Récupérer les données brutes depuis Supabase
    const {
        budgetItems: budget, // Mapping: budgetItems -> budget
        owners,
        lots,
        previsions,
        waterSettings,
        updateBudgetItem: updateItemDb, // Renamed to avoid key clash
        addBudgetItem: addItemDb,
        deleteBudgetItem: deleteItemDb,
        loading,
        error
    } = useGestionData();

    // 2. État local UI (non persisté en DB)
    const [budgetMode, setBudgetMode] = useState('previ');

    // 4. Mapping des Propriétaires (DB snake_case -> UI camelCase)
    //    Now using lot_ids array from owner_lots junction table
    const mappedOwners = useMemo(() => {
        if (!owners) return [];

        return owners.map(o => {
            // Get all lots owned by this owner via lot_ids
            const ownerLots = (o.lot_ids || [])
                .map(lid => (lots || []).find(l => l.id === lid))
                .filter(Boolean);
            const totalTantiemes = ownerLots.reduce((sum, l) => sum + (l.tantiemes || 0), 0);
            const lotDisplay = ownerLots.map(l => `Lot ${l.numero}`).join(', ') || '-';
            const firstLot = ownerLots[0];

            return {
                ...o,
                lot: lotDisplay,
                lotNumero: firstLot?.numero,
                lotNom: firstLot?.nom,
                typeBalcon: firstLot?.type_balcon || 'aucun',
                typeLot: firstLot?.type || 'appart',
                exoGest: o.exo_gest,
                exoMen: o.exo_men,
                tantiemes: totalTantiemes
            };
        });
    }, [owners, lots]);

    // 5. Logique métier (identique à l'ancien hook)

    // Calcul des diviseurs
    const divisors = useMemo(() => {
        return calculateDivisors(mappedOwners);
    }, [mappedOwners]);

    // Calcul du total par catégorie
    const getTotalByCategory = useCallback((category) => {
        return calculateCategoryTotal(budget[category], budgetMode);
    }, [budget, budgetMode]);

    // Calcul de l'appel pour un propriétaire
    const computeOwnerCall = useCallback((owner, quarter = 'T1') => {
        // Construct waterPrevi object for this specific owner/quarter
        const prevs = previsions || [];
        let wSubs = 0, wCharges = 0, wReguls = 0;

        const ownerLotIds = owner.lot_ids || [];
        ownerLotIds.forEach(lid => {
            const p = prevs.find(x => x.lot_id === lid && x.quarter === quarter);
            if (p) {
                wSubs += (p.amount_sub || 0);
                wCharges += (p.amount_conso || 0);
                wReguls += (p.amount_regul || 0);
            }
        });

        const dynamicWaterPrevi = {
            subs: { [owner.id]: wSubs },
            charges: { [owner.id]: wCharges },
            reguls: { [owner.id]: wReguls }
        };

        return calculateOwnerCall(owner, budget, divisors, dynamicWaterPrevi, budgetMode);
    }, [budget, divisors, previsions, budgetMode]);

    // Better implementation of getWaterPrevisions
    const getWaterPrevisionsByOwner = useCallback((quarter) => {
        const result = {
            subs: {},
            charges: {},
            reguls: {},
            annualTotal: waterSettings?.proj_sub && waterSettings?.proj_price // Approx or legacy field
                ? (waterSettings.proj_sub + (1000 * waterSettings.proj_price)) // Placeholder 
                : 316.20
        };
        if (!owners) return result;

        const prevs = previsions || [];

        owners.forEach(owner => {
            let wSubs = 0, wCharges = 0, wReguls = 0;
            const ownerLotIds = owner.lot_ids || [];

            ownerLotIds.forEach(lid => {
                const p = prevs.find(x => x.lot_id === lid && x.quarter === quarter);
                if (p) {
                    wSubs += (p.amount_sub || 0);
                    wCharges += (p.amount_conso || 0);
                    wReguls += (p.amount_regul || 0);
                }
            });

            result.subs[owner.id] = wSubs;
            result.charges[owner.id] = wCharges;
            result.reguls[owner.id] = wReguls;
        });

        return result;
    }, [owners, previsions, waterSettings]);

    // Wrapper pour updateBudgetItem
    const updateBudgetItem = useCallback((category, index, field, value) => {
        // Besoin de l'ID pour l'update Supabase
        // L'item à cet index :
        const item = budget[category]?.[index];
        if (!item) return;

        // Appel à la fonction du context Supabase
        updateItemDb(item.id, { [field]: parseFloat(value) || 0 });
    }, [budget, updateItemDb]);

    // Wrapper pour changeBudgetMode
    const changeBudgetMode = useCallback((mode) => {
        setBudgetMode(mode);
    }, []);

    // Wrapper pour addBudgetItem
    const addBudgetItem = useCallback((category, name) => {
        // Appeler le context avec les valeurs par défaut
        addItemDb({
            category,
            name,
            reel: 0,
            previ: 0,
            previ_n1: 0,
            sort_order: (budget[category]?.length || 0) + 1
        });
    }, [addItemDb, budget]);

    // Wrapper pour deleteBudgetItem
    const deleteBudgetItem = useCallback((category, index) => {
        const item = budget[category]?.[index];
        if (item) {
            deleteItemDb(item.id);
        }
    }, [budget, deleteItemDb]);

    return {
        // Données
        budget,
        owners: mappedOwners,
        getWaterPrevisions: getWaterPrevisionsByOwner,
        divisors,
        budgetMode,
        loading,
        error,

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
