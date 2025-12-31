/**
 * useWater - Hook personnalisé pour la gestion de l'eau
 * 
 * Encapsule l'accès aux données eau et expose des fonctions de calcul.
 */
import { useMemo, useCallback } from 'react';
import { useCopro } from '../../../context/CoproContext';
import {
    calculatePricePerM3,
    calculateValidTantiemes,
    calculateWaterCost,
    calculateAnnualConsumption,
    calculateProjectedBudget,
    calculateReadingsTotals
} from '../utils/waterCalculations';

/**
 * Hook pour gérer les données eau et les calculs associés.
 * @returns {Object} État et actions eau
 */
export function useWater() {
    const { state, updateState } = useCopro();
    const water = state.water;
    const owners = state.owners;

    // Prix par m³ (mémoïsé)
    const pricePerM3 = useMemo(() => {
        return calculatePricePerM3(water);
    }, [water]);

    // Tantièmes valides (propriétaires avec compteur)
    const validTantiemes = useMemo(() => {
        return calculateValidTantiemes(owners);
    }, [owners]);

    // Propriétaires avec compteur
    const ownersWithMeter = useMemo(() => {
        return owners.filter(o => !o.isCommon && o.hasMeter);
    }, [owners]);

    // Calcul du coût eau pour un propriétaire
    const getWaterCost = useCallback((owner, quarter) => {
        const reading = water.readings[quarter]?.[owner.id] || { old: 0, new: 0 };
        return calculateWaterCost(owner, reading, pricePerM3, water.subAmount, validTantiemes);
    }, [water, pricePerM3, validTantiemes]);

    // Calcul de la consommation annuelle
    const getAnnualConsumption = useCallback((ownerId) => {
        return calculateAnnualConsumption(water.readings, ownerId);
    }, [water.readings]);

    // Calcul du budget prévisionnel
    const getProjectedBudget = useCallback((owner) => {
        const annual = calculateAnnualConsumption(water.readings, owner.id);
        const projM3 = water.projections?.[owner.id] !== undefined
            ? water.projections[owner.id]
            : annual.total;
        return calculateProjectedBudget(
            projM3,
            water.projPrice || 5.08,
            water.projSub || 92.21,
            owner.tantiemes,
            validTantiemes
        );
    }, [water, validTantiemes]);

    // Calcul des totaux pour un trimestre
    const getReadingsTotals = useCallback((quarter) => {
        return calculateReadingsTotals(
            owners,
            water.readings,
            quarter,
            pricePerM3,
            water.subAmount,
            validTantiemes
        );
    }, [owners, water, pricePerM3, validTantiemes]);

    // Mise à jour d'un relevé
    const updateReading = useCallback((ownerId, quarter, field, value) => {
        const readings = { ...water.readings };
        if (!readings[quarter]) readings[quarter] = {};
        if (!readings[quarter][ownerId]) readings[quarter][ownerId] = { old: 0, new: 0 };
        readings[quarter][ownerId][field] = parseFloat(value) || 0;
        updateState({ water: { ...water, readings } });
    }, [water, updateState]);

    // Mise à jour du numéro de compteur
    const updateMeter = useCallback((ownerId, value) => {
        const meters = { ...water.meters, [ownerId]: value };
        updateState({ water: { ...water, meters } });
    }, [water, updateState]);

    // Mise à jour d'un paramètre eau
    const updateWaterParam = useCallback((field, value) => {
        updateState({
            water: {
                ...water,
                [field]: parseFloat(value) || 0
            }
        });
    }, [water, updateState]);

    // Mise à jour d'une projection
    const updateProjection = useCallback((ownerId, value) => {
        const projections = { ...water.projections, [ownerId]: parseFloat(value) || 0 };
        updateState({ water: { ...water, projections } });
    }, [water, updateState]);

    return {
        // État
        water,
        owners: ownersWithMeter,
        activeQuarter: water.activeQuarter,
        pricePerM3,
        validTantiemes,

        // Calculs
        getWaterCost,
        getAnnualConsumption,
        getProjectedBudget,
        getReadingsTotals,

        // Actions
        updateReading,
        updateMeter,
        updateWaterParam,
        updateProjection
    };
}

export default useWater;
