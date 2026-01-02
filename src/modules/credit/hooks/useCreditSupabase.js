/**
 * useCreditSupabase - Hook Crédit migré sur Supabase
 * 
 * Gère les simulations de crédit persistées en base.
 * Suit le pattern de useVoteSupabase.js.
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { TOTAL_TANTIEMES, TOTAL_TANTIEMES_CELLIERS } from '../data/coproprietaires';
import { calculerMensualite } from '../utils/creditCalculations';

/**
 * Hook principal du module Crédit (version Supabase)
 * @param {number} [simulationId] - ID de simulation existante (optionnel)
 * @returns {Object} État et fonctions pour le simulateur de crédit
 */
export function useCreditSupabase(simulationId = null) {
    // =====================================================
    // STATE
    // =====================================================
    const [simulation, setSimulation] = useState(null);
    const [copros, setCopros] = useState([]);
    const [simulations, setSimulations] = useState([]); // Liste des sauvegardes

    // Paramètres locaux (mise à jour optimiste)
    const [duree, setDuree] = useState(120);
    const [tauxNominal, setTauxNominal] = useState(3.5);
    const [tauxAssurance, setTauxAssurance] = useState(0.36);
    const [fondsTravaux, setFondsTravaux] = useState(0);
    const [partiesCommunes, setPartiesCommunes] = useState(0);
    const [grandBalcon, setGrandBalcon] = useState(0);
    const [petitsBalcons, setPetitsBalcons] = useState(0);
    const [celliers, setCelliers] = useState(0);

    // Loading & Error states
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // =====================================================
    // DATA FETCHING
    // =====================================================

    /**
     * Charge la liste des simulations existantes
     */
    const loadSimulationsList = useCallback(async () => {
        try {
            const { data, error: listError } = await supabase
                .from('credit_simulations')
                .select('id, title, created_at, updated_at')
                .order('updated_at', { ascending: false });

            if (listError) throw listError;
            setSimulations(data || []);
        } catch (err) {
            console.error('[useCreditSupabase] Erreur liste:', err);
            setError(err.message);
        }
    }, []);

    /**
     * Charge une simulation existante depuis Supabase
     */
    const loadSimulation = useCallback(async (id) => {
        if (!id) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Charger la simulation
            const { data: simData, error: simError } = await supabase
                .from('credit_simulations')
                .select('*')
                .eq('id', id)
                .single();

            if (simError) throw simError;
            setSimulation(simData);

            // Appliquer les paramètres
            setDuree(simData.duree || 120);
            setTauxNominal(simData.taux_nominal || 3.5);
            setTauxAssurance(simData.taux_assurance || 0.36);
            setFondsTravaux(simData.fonds_travaux || 0);
            setPartiesCommunes(simData.parties_communes || 0);
            setGrandBalcon(simData.grand_balcon || 0);
            setPetitsBalcons(simData.petits_balcons || 0);
            setCelliers(simData.celliers || 0);

            // 2. Charger les copropriétaires
            const { data: coprosData, error: coprosError } = await supabase
                .from('credit_copros')
                .select('*')
                .eq('simulation_id', id)
                .order('id');

            if (coprosError) throw coprosError;

            // Transformer vers le format attendu par l'UI
            const formattedCopros = coprosData.map(c => ({
                id: c.id,
                nom: c.copro_name,
                commune: c.commune,
                lot: c.lot,
                tantiemes: c.tantiemes,
                aCellier: c.a_cellier,
                aBalcon: c.a_balcon,
                grandBalcon: c.grand_balcon,
                tantCellier: c.tant_cellier || 0,
                apportPersonnel: c.apport_personnel || 0,
                paiementComptant: c.paiement_comptant || false
            }));
            setCopros(formattedCopros);

        } catch (err) {
            console.error('[useCreditSupabase] Erreur chargement:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Charger au montage
    useEffect(() => {
        loadSimulationsList();
        if (simulationId) {
            loadSimulation(simulationId);
        } else {
            setLoading(false);
        }
    }, [simulationId, loadSimulation, loadSimulationsList]);

    // =====================================================
    // DATA MUTATIONS
    // =====================================================

    /**
     * Crée une nouvelle simulation
     * @param {string} title - Titre de la simulation
     * @param {Array} initialCopros - Liste des copropriétaires (depuis COPROPRIETAIRES)
     * @returns {Promise<{success: boolean, simulationId?: number, error?: string}>}
     */
    const createSimulation = async (title, initialCopros) => {
        setSaving(true);
        setError(null);

        try {
            // 1. Créer la simulation
            const { data: simData, error: createError } = await supabase
                .from('credit_simulations')
                .insert({
                    title,
                    duree,
                    taux_nominal: tauxNominal,
                    taux_assurance: tauxAssurance,
                    fonds_travaux: fondsTravaux,
                    parties_communes: partiesCommunes,
                    grand_balcon: grandBalcon,
                    petits_balcons: petitsBalcons,
                    celliers
                })
                .select()
                .single();

            if (createError) throw createError;

            // 2. Créer les copropriétaires associés
            if (initialCopros && initialCopros.length > 0) {
                const coprosPayload = initialCopros.map(c => ({
                    simulation_id: simData.id,
                    copro_name: c.nom,
                    commune: c.commune,
                    lot: c.lot,
                    tantiemes: c.tantiemes,
                    a_cellier: c.aCellier,
                    a_balcon: c.aBalcon,
                    grand_balcon: c.grandBalcon,
                    tant_cellier: c.tantCellier || 0,
                    apport_personnel: 0,
                    paiement_comptant: false
                }));

                const { error: coprosError } = await supabase
                    .from('credit_copros')
                    .insert(coprosPayload);

                if (coprosError) throw coprosError;
            }

            setSimulation(simData);
            await loadSimulationsList();
            await loadSimulation(simData.id);

            return { success: true, simulationId: simData.id };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    };

    /**
     * Met à jour les paramètres de la simulation courante
     */
    const saveSimulationParams = async () => {
        if (!simulation) return;

        setSaving(true);
        try {
            const { error: updateError } = await supabase
                .from('credit_simulations')
                .update({
                    duree,
                    taux_nominal: tauxNominal,
                    taux_assurance: tauxAssurance,
                    fonds_travaux: fondsTravaux,
                    parties_communes: partiesCommunes,
                    grand_balcon: grandBalcon,
                    petits_balcons: petitsBalcons,
                    celliers,
                    updated_at: new Date().toISOString()
                })
                .eq('id', simulation.id);

            if (updateError) throw updateError;
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    /**
     * Supprime une simulation
     * @param {number} id - ID de la simulation à supprimer
     */
    const deleteSimulation = async (id) => {
        setSaving(true);
        try {
            // credit_copros sera supprimé en cascade (ON DELETE CASCADE)
            const { error: deleteError } = await supabase
                .from('credit_simulations')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            if (simulation?.id === id) {
                setSimulation(null);
                setCopros([]);
            }

            await loadSimulationsList();
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    };

    /**
     * Renomme une simulation
     * @param {number} id - ID de la simulation
     * @param {string} newTitle - Nouveau titre
     */
    const renameSimulation = async (id, newTitle) => {
        setSaving(true);
        try {
            const { error: updateError } = await supabase
                .from('credit_simulations')
                .update({ title: newTitle, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (updateError) throw updateError;

            // Update local state
            if (simulation?.id === id) {
                setSimulation(prev => ({ ...prev, title: newTitle }));
            }
            setSimulations(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));

            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    };

    /**
     * Met à jour un champ d'un copropriétaire
     */
    const updateCopro = async (coproId, field, value) => {
        // Map frontend field names to DB column names
        const fieldMap = {
            apportPersonnel: 'apport_personnel',
            paiementComptant: 'paiement_comptant'
        };
        const dbField = fieldMap[field] || field;

        // Optimistic update
        setCopros(prev => prev.map(c =>
            c.id === coproId ? { ...c, [field]: value } : c
        ));

        // Sync to Supabase
        try {
            const { error: updateError } = await supabase
                .from('credit_copros')
                .update({ [dbField]: value })
                .eq('id', coproId);

            if (updateError) throw updateError;
        } catch (err) {
            console.error('[useCreditSupabase] Erreur update copro:', err);
            setError(err.message);
        }
    };

    // =====================================================
    // COMPUTED VALUES
    // =====================================================

    const montantTotal = partiesCommunes + grandBalcon + petitsBalcons + celliers;

    /**
     * Calcule la répartition pour chaque copropriétaire
     */
    const repartition = useMemo(() => {
        if (!copros.length) return [];

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

    // =====================================================
    // RETURN
    // =====================================================

    return {
        // État
        simulation,
        simulations,
        copros,

        // Loading / Error
        loading,
        saving,
        error,

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

        // Résultats
        repartition,
        totaux,

        // Actions
        loadSimulation,
        loadSimulationsList,
        createSimulation,
        saveSimulationParams,
        deleteSimulation,
        renameSimulation,
        updateCopro
    };
}
