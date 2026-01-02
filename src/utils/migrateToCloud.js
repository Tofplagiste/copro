/**
 * Migration Script: localStorage → Supabase
 * 
 * This utility migrates existing localStorage data to Supabase tables.
 * Run this once after deploying the SQL schema.
 * 
 * @module migrateToCloud
 */
import { supabase } from '../lib/supabaseClient';

// Storage keys from the application
const STORAGE_KEY_COPRO = 'copro_data_v10';
const STORAGE_KEY_CARNET = 'carnet_data';

/**
 * Read data from localStorage
 * @param {string} key - localStorage key
 * @returns {Object|null} Parsed data or null
 */
function readLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error(`[Migration] Error reading ${key}:`, error);
        return null;
    }
}

/**
 * Migration result object
 * @typedef {Object} MigrationResult
 * @property {boolean} success - Whether migration succeeded
 * @property {string[]} migrated - List of migrated tables
 * @property {string[]} errors - List of error messages
 */

/**
 * Migrates all localStorage data to Supabase
 * @returns {Promise<MigrationResult>}
 */
export async function migrateAllToCloud() {
    const result = {
        success: true,
        migrated: [],
        errors: []
    };

    console.log('[Migration] Starting migration to Supabase...');

    try {
        // Migrate Copro data (Gestion module)
        const coproData = readLocalStorage(STORAGE_KEY_COPRO);
        if (coproData) {
            await migrateCoproData(coproData, result);
        } else {
            console.log('[Migration] No copro data found in localStorage');
        }

        // Migrate Carnet data
        const carnetData = readLocalStorage(STORAGE_KEY_CARNET);
        if (carnetData) {
            await migrateCarnetData(carnetData, result);
        } else {
            console.log('[Migration] No carnet data found in localStorage');
        }

    } catch (error) {
        result.success = false;
        result.errors.push(`Global error: ${error.message}`);
        console.error('[Migration] Fatal error:', error);
    }

    console.log('[Migration] Complete:', result);
    return result;
}

// =====================================================
// COPRO DATA MIGRATION (Gestion Module)
// =====================================================

/**
 * Migrate main copro data (owners, budget, water, finance)
 * @param {Object} data - Copro localStorage data
 * @param {MigrationResult} result - Result object to update
 */
async function migrateCoproData(data, result) {
    // 1. Migrate Owners
    if (data.owners?.length) {
        const ownersPayload = data.owners.map(o => ({
            id: o.id,
            name: o.name,
            apt: o.apt || null,
            lot: o.lot || null,
            tantiemes: o.tantiemes || 0,
            has_meter: o.hasMeter ?? true,
            exo_gest: o.exoGest ?? false,
            exo_men: o.exoMen ?? false,
            email: o.email || null,
            is_common: o.isCommon ?? false
        }));

        const { error } = await supabase.from('owners').upsert(ownersPayload, { onConflict: 'id' });
        if (error) {
            result.errors.push(`Owners: ${error.message}`);
        } else {
            result.migrated.push('owners');
            console.log(`[Migration] Migrated ${ownersPayload.length} owners`);
        }
    }

    // 2. Migrate Accounts
    if (data.accounts?.length) {
        const accountsPayload = data.accounts.map(a => ({
            id: a.id,
            name: a.name,
            initial_balance: a.initial || 0
        }));

        const { error } = await supabase.from('accounts').upsert(accountsPayload, { onConflict: 'id' });
        if (error) {
            result.errors.push(`Accounts: ${error.message}`);
        } else {
            result.migrated.push('accounts');
            console.log(`[Migration] Migrated ${accountsPayload.length} accounts`);
        }
    }

    // 3. Migrate Budget Items
    if (data.budget) {
        const budgetPayload = [];
        for (const [category, items] of Object.entries(data.budget)) {
            if (Array.isArray(items)) {
                items.forEach((item, index) => {
                    budgetPayload.push({
                        category,
                        name: item.name,
                        reel: item.reel || 0,
                        previ: item.previ || 0,
                        previ_n1: item.previ_n1 || 0,
                        sort_order: index
                    });
                });
            }
        }

        if (budgetPayload.length) {
            const { error } = await supabase.from('budget_items').insert(budgetPayload);
            if (error) {
                result.errors.push(`Budget: ${error.message}`);
            } else {
                result.migrated.push('budget_items');
                console.log(`[Migration] Migrated ${budgetPayload.length} budget items`);
            }
        }
    }

    // 4. Migrate Water Settings
    if (data.water) {
        const currentYear = new Date().getFullYear();
        const waterSettings = {
            year: currentYear,
            active_quarter: data.water.activeQuarter || 'T1',
            price_mode: data.water.priceMode || 'annual',
            invoice_total: data.water.invoiceTotal || 0,
            annual_total: data.water.annualTotal || 0,
            annual_sub: data.water.annualSub || 0,
            annual_vol: data.water.annualVol || 0,
            manual_price: data.water.manualPrice || 0,
            sub_amount: data.water.subAmount || 0,
            proj_price: data.water.projPrice || 5.08,
            proj_sub: data.water.projSub || 92.21
        };

        const { error } = await supabase.from('water_settings').upsert(waterSettings, { onConflict: 'year' });
        if (error) {
            result.errors.push(`Water Settings: ${error.message}`);
        } else {
            result.migrated.push('water_settings');
            console.log('[Migration] Migrated water settings');
        }

        // 4b. Migrate Water Readings (nested structure → flat table)
        if (data.water.readings) {
            const readingsPayload = [];
            for (const [quarter, ownerReadings] of Object.entries(data.water.readings)) {
                for (const [ownerId, reading] of Object.entries(ownerReadings)) {
                    readingsPayload.push({
                        owner_id: parseInt(ownerId, 10),
                        year: currentYear,
                        quarter,
                        old_value: reading.old || 0,
                        new_value: reading.new || 0
                    });
                }
            }

            if (readingsPayload.length) {
                const { error: readingsError } = await supabase
                    .from('water_readings')
                    .upsert(readingsPayload, { onConflict: 'owner_id,year,quarter' });
                if (readingsError) {
                    result.errors.push(`Water Readings: ${readingsError.message}`);
                } else {
                    result.migrated.push('water_readings');
                    console.log(`[Migration] Migrated ${readingsPayload.length} water readings`);
                }
            }
        }

        // 4c. Migrate Water Meters
        if (data.water.meters) {
            const metersPayload = Object.entries(data.water.meters).map(([ownerId, meterNumber]) => ({
                owner_id: parseInt(ownerId, 10),
                meter_number: meterNumber
            }));

            if (metersPayload.length) {
                const { error: metersError } = await supabase
                    .from('water_meters')
                    .upsert(metersPayload, { onConflict: 'owner_id' });
                if (metersError) {
                    result.errors.push(`Water Meters: ${metersError.message}`);
                } else {
                    result.migrated.push('water_meters');
                    console.log(`[Migration] Migrated ${metersPayload.length} water meters`);
                }
            }
        }

        // 4d. Migrate Water Projections
        if (data.water.projections) {
            const projectionsPayload = Object.entries(data.water.projections).map(([ownerId, volume]) => ({
                owner_id: parseInt(ownerId, 10),
                year: currentYear,
                projected_volume: volume
            }));

            if (projectionsPayload.length) {
                const { error: projError } = await supabase
                    .from('water_projections')
                    .upsert(projectionsPayload, { onConflict: 'owner_id,year' });
                if (projError) {
                    result.errors.push(`Water Projections: ${projError.message}`);
                } else {
                    result.migrated.push('water_projections');
                    console.log(`[Migration] Migrated ${projectionsPayload.length} water projections`);
                }
            }
        }
    }

    // 5. Migrate Finance Operations
    if (data.finance?.operations?.length) {
        const operationsPayload = data.finance.operations.map(op => ({
            account_id: op.accountId || null,
            date: op.date,
            due_date: op.dueDate || null,
            accounting_date: op.accountingDate || null,
            description: op.description || op.libelle || '',
            amount: op.amount || op.montant || 0,
            category_code: op.categoryCode || op.category || null,
            owner_id: op.ownerId || null,
            is_reconciled: op.isReconciled || op.pointage || false
        }));

        const { error } = await supabase.from('finance_operations').insert(operationsPayload);
        if (error) {
            result.errors.push(`Finance Operations: ${error.message}`);
        } else {
            result.migrated.push('finance_operations');
            console.log(`[Migration] Migrated ${operationsPayload.length} finance operations`);
        }
    }

    // 6. Migrate Expense Categories
    if (data.categories?.length) {
        const categoriesPayload = data.categories.map(c => ({
            code: c.code,
            label: c.label
        }));

        const { error } = await supabase.from('expense_categories').upsert(categoriesPayload, { onConflict: 'code' });
        if (error) {
            result.errors.push(`Expense Categories: ${error.message}`);
        } else {
            result.migrated.push('expense_categories');
            console.log(`[Migration] Migrated ${categoriesPayload.length} expense categories`);
        }
    }
}

// =====================================================
// CARNET DATA MIGRATION
// =====================================================

/**
 * Migrate carnet de copropriété data
 * @param {Object} data - Carnet localStorage data
 * @param {MigrationResult} result - Result object to update
 */
async function migrateCarnetData(data, result) {
    // 1. General Info
    if (data.general) {
        const generalPayload = {
            id: 1, // Singleton
            address: data.general.address,
            lots_description: data.general.lots,
            reglement: data.general.reglement,
            modifications: data.general.modifications
        };

        const { error } = await supabase.from('carnet_general').upsert(generalPayload, { onConflict: 'id' });
        if (error) {
            result.errors.push(`Carnet General: ${error.message}`);
        } else {
            result.migrated.push('carnet_general');
        }
    }

    // 2. Admin Info
    if (data.admin) {
        const adminPayload = {
            id: 1, // Singleton
            syndic_name: data.admin.syndic?.name,
            syndic_address: data.admin.syndic?.address,
            syndic_phone: data.admin.syndic?.phone,
            ag_nomination: data.admin.agNomination,
            fin_mandat: data.admin.finMandat,
            conseil_syndical: JSON.stringify(data.admin.conseilSyndical || [])
        };

        const { error } = await supabase.from('carnet_admin').upsert(adminPayload, { onConflict: 'id' });
        if (error) {
            result.errors.push(`Carnet Admin: ${error.message}`);
        } else {
            result.migrated.push('carnet_admin');
        }
    }

    // 3. Technique
    if (data.technique) {
        const techniquePayload = {
            id: 1, // Singleton
            construction: data.technique.construction,
            surface: data.technique.surface,
            toiture: data.technique.toiture,
            facade: data.technique.facade,
            code_peinture: data.technique.codePeinture,
            chauffage: data.technique.chauffage,
            eau_chaude: data.technique.eauChaude,
            diagnostics: JSON.stringify(data.diagnostics || {})
        };

        const { error } = await supabase.from('carnet_technique').upsert(techniquePayload, { onConflict: 'id' });
        if (error) {
            result.errors.push(`Carnet Technique: ${error.message}`);
        } else {
            result.migrated.push('carnet_technique');
        }
    }

    // 4. Prestataires
    if (data.prestataires?.length) {
        const prestatairesPayload = data.prestataires.map(p => ({
            id: p.id,
            name: p.name,
            contrat: p.contrat,
            contact: p.contact,
            phones: JSON.stringify(p.phones || []),
            emails: JSON.stringify(p.emails || []),
            address: p.address,
            codes: JSON.stringify(p.codes || {})
        }));

        const { error } = await supabase.from('carnet_prestataires').upsert(prestatairesPayload, { onConflict: 'id' });
        if (error) {
            result.errors.push(`Carnet Prestataires: ${error.message}`);
        } else {
            result.migrated.push('carnet_prestataires');
            console.log(`[Migration] Migrated ${prestatairesPayload.length} prestataires`);
        }
    }

    // 5. Travaux History
    if (data.travaux?.length) {
        const travauxPayload = data.travaux.map(t => ({
            id: t.id,
            annee: t.annee,
            nature: t.nature,
            entreprise: t.entreprise,
            cout: t.cout
        }));

        const { error } = await supabase.from('carnet_travaux').upsert(travauxPayload, { onConflict: 'id' });
        if (error) {
            result.errors.push(`Carnet Travaux: ${error.message}`);
        } else {
            result.migrated.push('carnet_travaux');
            console.log(`[Migration] Migrated ${travauxPayload.length} travaux entries`);
        }
    }
}

// =====================================================
// VOTE SESSION MIGRATION
// =====================================================

/**
 * Migrate a vote session from localStorage format to Supabase
 * Call this with the current vote state to save it as a session
 * 
 * @param {Object} voteState - Vote state from useVote hook
 * @param {string} title - Session title
 * @returns {Promise<{success: boolean, sessionId?: number, error?: string}>}
 */
export async function migrateVoteSession(voteState, title = 'Assemblée Générale') {
    try {
        // 1. Create session
        const { data: session, error: sessionError } = await supabase
            .from('vote_sessions')
            .insert({
                session_date: voteState.date || new Date().toISOString().split('T')[0],
                title,
                status: 'draft',
                total_tantiemes: 1000
            })
            .select()
            .single();

        if (sessionError) throw sessionError;

        const sessionId = session.id;

        // 2. Create vote_copros (participants)
        const coprosPayload = voteState.copros.map(c => ({
            session_id: sessionId,
            name: c.nom,
            tantiemes: c.tantiemes,
            presence: c.presence || null,
            // procuration_to will be set in a second pass
        }));

        const { data: insertedCopros, error: coprosError } = await supabase
            .from('vote_copros')
            .insert(coprosPayload)
            .select();

        if (coprosError) throw coprosError;

        // Map old IDs to new IDs for procuration linking
        const idMap = {};
        voteState.copros.forEach((oldCopro, index) => {
            idMap[oldCopro.id] = insertedCopros[index].id;
        });

        // Update procurations
        for (const oldCopro of voteState.copros) {
            if (oldCopro.procurationDonneeA) {
                const newCoproId = idMap[oldCopro.id];
                const newMandataireId = idMap[oldCopro.procurationDonneeA];
                await supabase
                    .from('vote_copros')
                    .update({ procuration_to: newMandataireId })
                    .eq('id', newCoproId);
            }
        }

        // 3. Create vote_points
        const pointsPayload = voteState.points.map((p, index) => ({
            session_id: sessionId,
            sort_order: index,
            title: p.titre,
            article: p.article || '24'
        }));

        const { data: insertedPoints, error: pointsError } = await supabase
            .from('vote_points')
            .insert(pointsPayload)
            .select();

        if (pointsError) throw pointsError;

        // Map point IDs
        const pointIdMap = {};
        voteState.points.forEach((oldPoint, index) => {
            pointIdMap[oldPoint.id] = insertedPoints[index].id;
        });

        // 4. Create vote_participations
        if (voteState.votes && Object.keys(voteState.votes).length) {
            const participationsPayload = [];
            for (const [oldPointId, coproVotes] of Object.entries(voteState.votes)) {
                const newPointId = pointIdMap[oldPointId];
                for (const [oldCoproId, voteType] of Object.entries(coproVotes)) {
                    const newCoproId = idMap[oldCoproId];
                    if (newPointId && newCoproId) {
                        participationsPayload.push({
                            point_id: newPointId,
                            copro_id: newCoproId,
                            vote_type: voteType
                        });
                    }
                }
            }

            if (participationsPayload.length) {
                const { error: voteError } = await supabase
                    .from('vote_participations')
                    .insert(participationsPayload);
                if (voteError) throw voteError;
            }
        }

        console.log(`[Migration] Vote session created with ID: ${sessionId}`);
        return { success: true, sessionId };

    } catch (error) {
        console.error('[Migration] Vote session error:', error);
        return { success: false, error: error.message };
    }
}

// =====================================================
// CREDIT SIMULATION MIGRATION
// =====================================================

/**
 * Save a credit simulation to Supabase
 * Call this with the current credit state to persist it
 * 
 * @param {Object} creditState - Credit state from useCredit hook
 * @param {string} title - Simulation title
 * @returns {Promise<{success: boolean, simulationId?: number, error?: string}>}
 */
export async function saveCreditSimulation(creditState, title = 'Simulation Crédit') {
    try {
        // 1. Create simulation
        const { data: simulation, error: simError } = await supabase
            .from('credit_simulations')
            .insert({
                title,
                duree: creditState.duree || 120,
                taux_nominal: creditState.tauxNominal || 3.5,
                taux_assurance: creditState.tauxAssurance || 0.36,
                fonds_travaux: creditState.fondsTravaux || 0,
                parties_communes: creditState.partiesCommunes || 0,
                grand_balcon: creditState.grandBalcon || 0,
                petits_balcons: creditState.petitsBalcons || 0,
                celliers: creditState.celliers || 0
            })
            .select()
            .single();

        if (simError) throw simError;

        const simulationId = simulation.id;

        // 2. Create credit_copros
        if (creditState.copros?.length) {
            const coprosPayload = creditState.copros.map(c => ({
                simulation_id: simulationId,
                copro_name: c.nom,
                commune: c.commune,
                lot: c.lot,
                tantiemes: c.tantiemes || 0,
                a_cellier: c.aCellier || false,
                a_balcon: c.aBalcon || false,
                grand_balcon: c.grandBalcon || false,
                tant_cellier: c.tantCellier || 0,
                apport_personnel: c.apportPersonnel || 0,
                paiement_comptant: c.paiementComptant || false
            }));

            const { error: coprosError } = await supabase
                .from('credit_copros')
                .insert(coprosPayload);

            if (coprosError) throw coprosError;
        }

        console.log(`[Migration] Credit simulation saved with ID: ${simulationId}`);
        return { success: true, simulationId };

    } catch (error) {
        console.error('[Migration] Credit simulation error:', error);
        return { success: false, error: error.message };
    }
}

export default migrateAllToCloud;
