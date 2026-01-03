/**
 * waterAdapter.js - Transforme les données Supabase en format UI pour l'eau
 * 
 * Architecture V6 : water_meters et water_readings sont liés à lots(id).
 * Les propriétaires sont récupérés via owner_lots.
 */

/**
 * @typedef {Object} WaterRow
 * @property {number} lot_id - ID du lot
 * @property {string} lot_numero - Numéro du lot (ex: "A1")
 * @property {string} lot_type - Type de lot (appartement, cave, etc.)
 * @property {number} lot_tantiemes - Tantièmes du lot
 * @property {string} owner_name - Nom du/des propriétaire(s) actuel(s)
 * @property {number|null} owner_id - ID du propriétaire principal (ou null)
 * @property {number|null} meter_id - ID du compteur
 * @property {string} meter_number - Numéro du compteur
 * @property {boolean} has_meter - Si le lot a un compteur
 * @property {Object} readings - Relevés par trimestre { T1: {old, new}, T2: {...}, ... }
 */

/**
 * Récupère le nom des propriétaires actuels d'un lot.
 * Si plusieurs propriétaires (indivision), concatène les noms.
 * @param {Array} ownerLots - Relations owner_lots avec owners
 * @returns {{ name: string, id: number|null }}
 */
function getOwnerInfo(ownerLots) {
    if (!ownerLots || ownerLots.length === 0) {
        return { name: '(Sans propriétaire)', id: null };
    }

    // Filtrer les propriétaires actuels
    const currentOwners = ownerLots
        .filter(ol => ol.owners?.is_current_owner !== false)
        .map(ol => ol.owners)
        .filter(Boolean);

    if (currentOwners.length === 0) {
        return { name: '(Sans propriétaire)', id: null };
    }

    // Concaténer si indivision
    const names = currentOwners.map(o => o.name).join(' & ');
    return { name: names, id: currentOwners[0]?.id || null };
}

/**
 * Formate les relevés par trimestre depuis un tableau de readings.
 * @param {Array} readings - Tableau de water_readings
 * @param {number} year - Année à filtrer
 * @returns {Object} Format { T1: { old, new, id }, T2: {...}, T3: {...}, T4: {...} }
 */
function formatReadingsByQuarter(readings, year) {
    const result = { T1: null, T2: null, T3: null, T4: null };

    if (!readings || readings.length === 0) return result;

    // Filtrer par année et mapper par trimestre
    readings
        .filter(r => r.year === year)
        .forEach(r => {
            if (result[r.quarter] !== undefined) {
                result[r.quarter] = {
                    id: r.id,
                    old: r.old_value || 0,
                    new: r.new_value || 0
                };
            }
        });

    return result;
}

/**
 * Transforme les données Supabase imbriquées en format plat pour l'UI eau.
 * @param {Array} lots - Lots avec relations (water_meters, water_readings, owner_lots)
 * @param {number} year - Année en cours pour filtrer les relevés
 * @returns {WaterRow[]} Tableau formaté pour le composant WaterReadings
 */
export function transformWaterData(lots, year) {
    if (!lots || lots.length === 0) return [];

    return lots.map(lot => {
        const meter = lot.water_meters?.[0] || null;
        const ownerInfo = getOwnerInfo(lot.owner_lots);
        const readings = formatReadingsByQuarter(lot.water_readings, year);

        return {
            lot_id: lot.id,
            lot_numero: lot.numero || '',
            lot_type: lot.type || 'appartement',
            lot_tantiemes: lot.tantiemes || 0,
            owner_name: ownerInfo.name,
            owner_id: ownerInfo.id,
            meter_id: meter?.id || null,
            meter_number: meter?.meter_number || '',
            has_meter: !!meter,
            readings
        };
    });
}

/**
 * Calcule les tantièmes valides (lots avec compteur).
 * @param {WaterRow[]} waterRows - Données transformées
 * @returns {number} Total des tantièmes
 */
export function calculateValidTantièmes(waterRows) {
    return waterRows
        .filter(row => row.has_meter)
        .reduce((sum, row) => sum + row.lot_tantiemes, 0);
}
