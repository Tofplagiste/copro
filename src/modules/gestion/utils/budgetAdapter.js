/**
 * Adaptateur pour les données budgétaires.
 * Transforme le format plat de la DB en format groupé pour l'UI.
 */

/**
 * Groupe les items budgétaires par catégorie.
 * @param {Array} items - Liste plate des items venant de Supabase
 * @returns {Object} Objet { general: [], special: [], menage: [], travaux: [] }
 */
export const groupBudgetItems = (items = []) => {
    const grouped = { general: [], special: [], menage: [], travaux: [] };

    items.forEach(item => {
        if (grouped[item.category]) {
            grouped[item.category].push({
                id: item.id,
                name: item.name,
                reel: parseFloat(item.reel) || 0,
                previ: parseFloat(item.previ) || 0,
                previ_n1: parseFloat(item.previ_n1) || 0,
                sortOrder: item.sort_order
            });
        }
    });

    return grouped;
};
