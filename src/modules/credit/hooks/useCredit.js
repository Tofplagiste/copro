/**
 * useCredit - Hook principal pour le simulateur de crédit copropriété
 * Gère tout l'état et la logique métier du module Crédit
 */
import { useState, useMemo } from 'react';
import { COPROPRIETAIRES, TOTAL_TANTIEMES, TOTAL_TANTIEMES_CELLIERS } from '../data/coproprietaires';
import { calculerMensualite } from '../utils/creditCalculations';

/**
 * Hook principal du module Crédit
 * @returns {Object} État et fonctions pour le simulateur de crédit
 */
export function useCredit() {
    // Paramètres crédit
    const [duree, setDuree] = useState(120);
    const [tauxNominal, setTauxNominal] = useState(3.5);
    const [tauxAssurance, setTauxAssurance] = useState(0.36);
    const [fondsTravaux, setFondsTravaux] = useState(0);

    // Montants travaux
    const [partiesCommunes, setPartiesCommunes] = useState(0);
    const [grandBalcon, setGrandBalcon] = useState(0);
    const [petitsBalcons, setPetitsBalcons] = useState(0);
    const [celliers, setCelliers] = useState(0);

    // Copropriétaires avec apports
    const [copros, setCopros] = useState(
        COPROPRIETAIRES.map(c => ({ ...c, apportPersonnel: 0, paiementComptant: false }))
    );

    // Montant total des travaux
    const montantTotal = partiesCommunes + grandBalcon + petitsBalcons + celliers;

    /**
     * Calcule la répartition pour chaque copropriétaire
     */
    const repartition = useMemo(() => {
        const coprosAvecGrandBalcon = copros.filter(c => c.grandBalcon);
        const totalTantiemesGrandBalcon = coprosAvecGrandBalcon.reduce((sum, c) => sum + c.tantiemes, 0);
        const coprosAvecPetitBalcon = copros.filter(c => c.aBalcon && !c.grandBalcon);
        const nbPetitsBalcons = coprosAvecPetitBalcon.length;

        return copros.map(copro => {
            const totalTantiemesLot = copro.tantiemes + copro.tantCellier;
            const quotiteCommunes = totalTantiemesLot / TOTAL_TANTIEMES;
            const partCommunes = partiesCommunes * quotiteCommunes;

            let partBalcon = 0;
            if (copro.grandBalcon) {
                const quotiteGrandBalcon = copro.tantiemes / totalTantiemesGrandBalcon;
                partBalcon = grandBalcon * quotiteGrandBalcon;
            } else if (copro.aBalcon && !copro.grandBalcon) {
                partBalcon = nbPetitsBalcons > 0 ? petitsBalcons / nbPetitsBalcons : 0;
            }

            const quotiteCellier = copro.aCellier ? copro.tantCellier / TOTAL_TANTIEMES_CELLIERS : 0;
            const partCellier = copro.aCellier ? celliers * quotiteCellier : 0;

            const totalPart = partCommunes + partBalcon + partCellier;
            const partFondsTravaux = montantTotal > 0 ? (totalPart / montantTotal) * fondsTravaux : 0;
            const montantApresFonds = totalPart - partFondsTravaux;
            const apportUtilise = Math.min(copro.apportPersonnel, montantApresFonds);
            const montantAFinancer = Math.max(0, montantApresFonds - apportUtilise);
            const mensualite = copro.paiementComptant ? 0 : calculerMensualite(montantAFinancer, duree, tauxNominal, tauxAssurance);

            return {
                ...copro,
                partCommunes,
                partBalcon,
                partCellier,
                totalPart,
                partFondsTravaux,
                apportUtilise,
                montantAFinancer,
                mensualite
            };
        });
    }, [copros, partiesCommunes, grandBalcon, petitsBalcons, celliers, fondsTravaux, duree, tauxNominal, tauxAssurance, montantTotal]);

    /**
     * Calcule les totaux financiers globaux
     */
    const totaux = useMemo(() => {
        const totalApports = repartition.reduce((s, c) => s + c.apportUtilise, 0);
        const montantFinance = repartition.filter(c => !c.paiementComptant).reduce((s, c) => s + c.montantAFinancer, 0);

        const tauxMensuel = tauxNominal / 100 / 12;
        const tauxAssuranceMensuel = tauxAssurance / 100 / 12;

        let interetsTEG = 0;
        if (montantFinance > 0 && tauxMensuel > 0) {
            const mensualiteHorsAssurance = montantFinance * (tauxMensuel / (1 - Math.pow(1 + tauxMensuel, -duree)));
            const totalRembourse = mensualiteHorsAssurance * duree;
            interetsTEG = totalRembourse - montantFinance;
        }

        const coutAssurance = montantFinance * tauxAssuranceMensuel * duree;
        const coutTotal = montantFinance + interetsTEG + coutAssurance;
        const surprix = interetsTEG + coutAssurance;

        return {
            montantTotal,
            fondsTravaux,
            totalApports,
            montantFinance,
            coutTotal,
            interetsTEG,
            coutAssurance,
            surprix
        };
    }, [repartition, tauxNominal, tauxAssurance, duree, montantTotal, fondsTravaux]);

    /**
     * Met à jour un champ d'un copropriétaire
     * @param {number} id - ID du copropriétaire
     * @param {string} field - Nom du champ
     * @param {*} value - Nouvelle valeur
     */
    const updateCopro = (id, field, value) => {
        setCopros(prev => prev.map(c =>
            c.id === id ? { ...c, [field]: value } : c
        ));
    };

    return {
        // Paramètres crédit
        duree, setDuree,
        tauxNominal, setTauxNominal,
        tauxAssurance, setTauxAssurance,
        fondsTravaux, setFondsTravaux,
        // Montants
        partiesCommunes, setPartiesCommunes,
        grandBalcon, setGrandBalcon,
        petitsBalcons, setPetitsBalcons,
        celliers, setCelliers,
        montantTotal,
        // Copropriétaires
        copros,
        updateCopro,
        // Résultats
        repartition,
        totaux
    };
}
