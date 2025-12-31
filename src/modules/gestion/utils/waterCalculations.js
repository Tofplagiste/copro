/**
 * waterCalculations.js - Fonctions pures de calcul pour le module Eau
 */

/**
 * Calcule le prix au m³ selon le mode de tarification.
 * @param {Object} water - Configuration eau { priceMode, manualPrice, annualTotal, annualSub, annualVol }
 * @returns {number} Prix par m³
 */
export function calculatePricePerM3(water) {
    if (water.priceMode === 'manual') {
        return water.manualPrice || 0;
    }
    if (water.priceMode === 'annual') {
        const conso = water.annualTotal - water.annualSub;
        return water.annualVol > 0 ? conso / water.annualVol : 0;
    }
    return water.manualPrice || 4.5;
}

/**
 * Calcule les tantièmes valides (propriétaires avec compteur).
 * @param {Array<Object>} owners - Liste des propriétaires
 * @returns {number} Total des tantièmes pour les propriétaires avec compteur
 */
export function calculateValidTantiemes(owners) {
    return owners
        .filter(o => !o.isCommon && o.hasMeter)
        .reduce((sum, o) => sum + (o.tantiemes || 0), 0);
}

/**
 * Calcule la consommation d'eau pour un propriétaire sur un trimestre.
 * @param {Object} reading - Relevé { old, new }
 * @returns {number} Consommation en m³
 */
export function calculateConsumption(reading) {
    if (!reading) return 0;
    return Math.max(0, (reading.new || 0) - (reading.old || 0));
}

/**
 * Calcule le coût eau pour un propriétaire sur un trimestre.
 * @param {Object} owner - Propriétaire { tantiemes, hasMeter }
 * @param {Object} reading - Relevé { old, new }
 * @param {number} pricePerM3 - Prix par m³
 * @param {number} subAmount - Montant abonnement total à répartir
 * @param {number} validTantiemes - Total tantièmes valides
 * @returns {Object} { conso, fixedCost, variableCost, total }
 */
export function calculateWaterCost(owner, reading, pricePerM3, subAmount, validTantiemes) {
    if (!owner.hasMeter) {
        return { conso: 0, fixedCost: 0, variableCost: 0, total: 0 };
    }

    const conso = calculateConsumption(reading);
    const fixedCost = validTantiemes > 0
        ? (subAmount || 0) * (owner.tantiemes / validTantiemes)
        : 0;
    const variableCost = conso * pricePerM3;
    const total = fixedCost + variableCost;

    return { conso, fixedCost, variableCost, total };
}

/**
 * Calcule la consommation annuelle totale pour un propriétaire.
 * @param {Object} readings - Relevés par trimestre { T1, T2, T3, T4 }
 * @param {string} ownerId - ID du propriétaire
 * @returns {Object} { quarters: [T1, T2, T3, T4 consommations], total }
 */
export function calculateAnnualConsumption(readings, ownerId) {
    const quarters = ['T1', 'T2', 'T3', 'T4'].map(q => {
        const reading = readings[q]?.[ownerId] || { old: 0, new: 0 };
        return calculateConsumption(reading);
    });

    const total = quarters.reduce((sum, val) => sum + val, 0);
    return { quarters, total };
}

/**
 * Calcule le budget eau prévisionnel N+1 pour un propriétaire.
 * @param {number} projM3 - Prévision consommation en m³
 * @param {number} projPrice - Prix prévu par m³
 * @param {number} projSub - Abonnement annuel prévu
 * @param {number} ownerTantiemes - Tantièmes du propriétaire
 * @param {number} validTantiemes - Total tantièmes valides
 * @returns {number} Budget N+1 estimé
 */
export function calculateProjectedBudget(projM3, projPrice, projSub, ownerTantiemes, validTantiemes) {
    const subPart = validTantiemes > 0
        ? projSub * (ownerTantiemes / validTantiemes)
        : 0;
    const consoPart = projM3 * projPrice;
    return subPart + consoPart;
}

/**
 * Calcule les totaux globaux pour le tableau des relevés.
 * @param {Array<Object>} owners - Liste des propriétaires
 * @param {Object} readings - Relevés du trimestre
 * @param {string} quarter - Trimestre actif
 * @param {number} pricePerM3 - Prix par m³
 * @param {number} subAmount - Montant abonnement
 * @param {number} validTantiemes - Total tantièmes valides
 * @returns {Object} { totalVol, totalFix, totalVar, totalFinal }
 */
export function calculateReadingsTotals(owners, readings, quarter, pricePerM3, subAmount, validTantiemes) {
    let totalVol = 0;
    let totalFix = 0;
    let totalVar = 0;
    let totalFinal = 0;

    owners.forEach(owner => {
        if (owner.hasMeter && !owner.isCommon) {
            const reading = readings[quarter]?.[owner.id] || { old: 0, new: 0 };
            const cost = calculateWaterCost(owner, reading, pricePerM3, subAmount, validTantiemes);

            totalVol += cost.conso;
            totalFix += cost.fixedCost;
            totalVar += cost.variableCost;
            totalFinal += cost.total;
        }
    });

    return { totalVol, totalFix, totalVar, totalFinal };
}
