/**
 * calculations.js - Fonctions pures de calcul pour le module Gestion
 * 
 * Ces fonctions sont isolées pour :
 * 1. Être testables unitairement
 * 2. Être réutilisables dans différents composants
 * 3. Éviter la logique métier dans les composants UI
 */

/**
 * Calcule la quote-part d'un propriétaire selon ses tantièmes.
 * @param {number} amount - Montant total à répartir
 * @param {number} tantiemes - Tantièmes du propriétaire
 * @param {number} totalTantiemes - Diviseur total des tantièmes
 * @param {number} quarterRatio - Ratio trimestriel (défaut: 0.25)
 * @returns {number} Montant dû par le propriétaire
 */
export function calculateQuotePart(amount, tantiemes, totalTantiemes, quarterRatio = 1) {
    if (totalTantiemes === 0) return 0;
    return (amount / totalTantiemes) * tantiemes * quarterRatio;
}

/**
 * Calcule les diviseurs de tantièmes avec exemptions.
 * @param {Array<Object>} owners - Liste des propriétaires avec tantiemes, exoGest, exoMen, isCommon
 * @returns {Object} { divGen, divSpe, divMen, divTra }
 */
export function calculateDivisors(owners) {
    let divGen = 0;
    let divSpe = 0;
    let divMen = 0;
    let divTra = 0;

    owners.forEach(owner => {
        if (!owner.isCommon) {
            divGen += owner.tantiemes;
            divTra += owner.tantiemes;
            if (!owner.exoGest) divSpe += owner.tantiemes;
            if (!owner.exoMen) divMen += owner.tantiemes;
        }
    });

    return { divGen, divSpe, divMen, divTra };
}

/**
 * Calcule le total d'une catégorie budgétaire.
 * @param {Array<Object>} items - Postes budgétaires avec { name, reel, previ, previ_n1 }
 * @param {string} mode - Mode budget ('reel', 'previ', 'previ_n1')
 * @returns {number} Total de la catégorie
 */
export function calculateCategoryTotal(items, mode) {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((acc, item) => acc + (item[mode] || 0), 0);
}

/**
 * Calcule l'appel de fonds complet pour un propriétaire.
 * @param {Object} owner - Propriétaire { id, tantiemes, exoGest, exoMen }
 * @param {Object} budget - Budget par catégorie { general, special, menage, travaux }
 * @param {Object} divisors - Diviseurs { divGen, divSpe, divMen, divTra }
 * @param {Object} waterPrevi - Prévisions eau { subs, charges, reguls }
 * @param {string} mode - Mode budget ('reel', 'previ', 'previ_n1')
 * @param {number} quarterRatio - Ratio trimestriel (défaut: 0.25)
 * @returns {Object} Détail des charges { partGen, partSpe, partMen, partTra, subTotal, wCost, total }
 */
export function calculateOwnerCall(owner, budget, divisors, waterPrevi, mode, quarterRatio = 0.25) {
    // Calcul des totaux par catégorie
    const sums = {
        general: calculateCategoryTotal(budget.general, mode),
        special: calculateCategoryTotal(budget.special, mode),
        menage: calculateCategoryTotal(budget.menage, mode),
        travaux: calculateCategoryTotal(budget.travaux, mode)
    };

    // Quote-parts
    const partGen = calculateQuotePart(sums.general, owner.tantiemes, divisors.divGen, quarterRatio);
    const partTra = calculateQuotePart(sums.travaux, owner.tantiemes, divisors.divTra, quarterRatio);

    // Avec exemptions
    const partSpe = (!owner.exoGest && divisors.divSpe > 0)
        ? calculateQuotePart(sums.special, owner.tantiemes, divisors.divSpe, quarterRatio)
        : 0;
    const partMen = (!owner.exoMen && divisors.divMen > 0)
        ? calculateQuotePart(sums.menage, owner.tantiemes, divisors.divMen, quarterRatio)
        : 0;

    const subTotal = partGen + partTra + partSpe + partMen;

    // Eau depuis prévisions
    const wSubs = parseFloat(waterPrevi?.subs?.[owner.id]) || 0;
    const wCharges = parseFloat(waterPrevi?.charges?.[owner.id]) || 0;
    const wReguls = parseFloat(waterPrevi?.reguls?.[owner.id]) || 0;
    const wCost = wSubs + wCharges + wReguls;

    const total = subTotal + wCost;

    return {
        partGen,
        partSpe,
        partMen,
        partTra,
        subTotal,
        wCost,
        total,
        sums
    };
}

/**
 * Calcule le détail des charges par catégorie pour un propriétaire (pour PDF).
 * @param {Object} owner - Propriétaire
 * @param {Object} budget - Budget par catégorie
 * @param {Object} divisors - Diviseurs
 * @param {string} mode - Mode budget
 * @param {number} quarterRatio - Ratio trimestriel
 * @returns {Object} Détail par catégorie avec base et montant
 */
export function calculateDetailedCharges(owner, budget, divisors, mode, quarterRatio = 0.25) {
    const result = {
        general: { items: [], total: 0, base: 0, divisor: divisors.divGen },
        special: { items: [], total: 0, base: 0, divisor: divisors.divSpe, exempt: owner.exoGest },
        menage: { items: [], total: 0, base: 0, divisor: divisors.divMen, exempt: owner.exoMen },
        travaux: { items: [], total: 0, base: 0, divisor: divisors.divGen }
    };

    ['general', 'special', 'menage', 'travaux'].forEach(category => {
        const items = budget[category] || [];
        const catResult = result[category];

        items.forEach(item => {
            const base = item[mode] || 0;
            let montant = 0;

            if (category === 'special' && owner.exoGest) {
                montant = 0;
            } else if (category === 'menage' && owner.exoMen) {
                montant = 0;
            } else {
                montant = calculateQuotePart(base, owner.tantiemes, catResult.divisor, quarterRatio);
            }

            catResult.items.push({ name: item.name, base, montant });
            catResult.base += base;
            catResult.total += montant;
        });
    });

    return result;
}
