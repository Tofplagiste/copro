/**
 * Fonctions utilitaires de formatage
 */

/**
 * Formate un nombre en montant monétaire (2 décimales)
 * @param {number|string} value 
 * @returns {string}
 */
export const fmtMoney = (value) => {
    return (parseFloat(value) || 0).toFixed(2);
};

/**
 * Formate une date ISO en format français JJ/MM/AAAA
 * @param {string} isoDate 
 * @returns {string}
 */
export const fmtDateFR = (isoDate) => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
};

/**
 * Retourne la date du jour au format ISO (YYYY-MM-DD)
 * @returns {string}
 */
export const getTodayISO = () => {
    return new Date().toISOString().slice(0, 10);
};

/**
 * Calcule le total des tantièmes (hors commun)
 * @param {Array} owners 
 * @returns {number}
 */
export const getTotalTantiemes = (owners) => {
    return owners
        .filter(o => !o.isCommon)
        .reduce((sum, o) => sum + (o.tantiemes || 0), 0);
};
