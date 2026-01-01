/**
 * Calculs de crédit immobilier
 * Fonctions pures pour la simulation de prêt
 */

/**
 * Calcule la mensualité d'un prêt
 * @param {number} capital - Montant emprunté (€)
 * @param {number} dureeNombreMois - Durée en mois
 * @param {number} tauxNominal - Taux nominal annuel (%)
 * @param {number} tauxAssurance - Taux assurance annuel (%)
 * @returns {number} Mensualité totale (€)
 */
export function calculerMensualite(capital, dureeNombreMois, tauxNominal, tauxAssurance = 0) {
    if (capital <= 0 || dureeNombreMois <= 0) return 0;

    const tauxMensuel = tauxNominal / 100 / 12;
    const tauxAssuranceMensuel = tauxAssurance / 100 / 12;

    // Si taux 0, simple division + assurance
    if (tauxMensuel === 0) {
        return capital / dureeNombreMois + capital * tauxAssuranceMensuel;
    }

    // Formule classique de mensualité
    const mensualiteHorsAssurance = capital * (tauxMensuel / (1 - Math.pow(1 + tauxMensuel, -dureeNombreMois)));
    const assurance = capital * tauxAssuranceMensuel;

    return mensualiteHorsAssurance + assurance;
}

/**
 * Calcule le coût total d'un prêt
 * @param {number} mensualite - Mensualité (€)
 * @param {number} dureeNombreMois - Durée en mois
 * @param {number} capital - Montant emprunté (€)
 * @returns {number} Coût total des intérêts (€)
 */
export function calculerCoutTotal(mensualite, dureeNombreMois, capital) {
    if (mensualite <= 0 || dureeNombreMois <= 0) return 0;
    return (mensualite * dureeNombreMois) - capital;
}

/**
 * Calcule la quote-part d'un copropriétaire
 * @param {number} montantTotal - Montant total du prêt
 * @param {number} tantiemes - Tantièmes du copropriétaire
 * @param {number} totalTantiemes - Total des tantièmes (défaut: 1000)
 * @returns {number} Quote-part (€)
 */
export function calculerQuotePart(montantTotal, tantiemes, totalTantiemes = 1000) {
    if (totalTantiemes <= 0) return 0;
    return (montantTotal / totalTantiemes) * tantiemes;
}

/**
 * Calcule le tableau d'amortissement simplifié
 * @param {number} capital - Montant emprunté
 * @param {number} dureeNombreMois - Durée en mois
 * @param {number} tauxNominal - Taux nominal annuel (%)
 * @returns {Array<{mois: number, capitalRestant: number, interets: number, amortissement: number}>}
 */
export function calculerAmortissement(capital, dureeNombreMois, tauxNominal) {
    const mensualite = calculerMensualite(capital, dureeNombreMois, tauxNominal, 0);
    const tauxMensuel = tauxNominal / 100 / 12;
    const tableau = [];
    let capitalRestant = capital;

    for (let mois = 1; mois <= dureeNombreMois; mois++) {
        const interets = capitalRestant * tauxMensuel;
        const amortissement = mensualite - interets;
        capitalRestant = Math.max(0, capitalRestant - amortissement);

        tableau.push({
            mois,
            capitalRestant: Math.round(capitalRestant * 100) / 100,
            interets: Math.round(interets * 100) / 100,
            amortissement: Math.round(amortissement * 100) / 100
        });
    }

    return tableau;
}
