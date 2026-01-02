/**
 * CarnetSupabaseContext.jsx
 * Fournit les données Carnet (Supabase) aux composants.
 */
import { createContext, useContext } from 'react';
import { useCarnetSupabase } from '../hooks/useCarnetSupabase';

const CarnetSupabaseContext = createContext(null);

export function CarnetSupabaseProvider({ children }) {
    const carnet = useCarnetSupabase();

    // Helper pour parser JSON si c'est une string (cas des imports CSV parfois)
    const safeParse = (val, fallback) => {
        if (!val) return fallback;
        if (typeof val === 'string') {
            try {
                return JSON.parse(val);
            } catch (e) {
                console.warn("JSON Parse specific error", e);
                return fallback;
            }
        }
        return val;
    };

    // Adapter la structure pour correspondre à l'UI existante
    const state = {
        general: {
            ...carnet.general,
            lots: carnet.general?.lots_description // Map DB column to UI prop
        },
        admin: {
            ...carnet.admin,
            // Map flat admin columns to nested syndic object expected by UI
            syndic: {
                name: carnet.admin?.syndic_name,
                address: carnet.admin?.syndic_address,
                phone: carnet.admin?.syndic_phone
            },
            agNomination: carnet.admin?.ag_nomination,
            finMandat: carnet.admin?.fin_mandat,
            conseilSyndical: safeParse(carnet.admin?.conseil_syndical, [])
        },
        technique: {
            ...carnet.technique,
            codePeinture: carnet.technique?.code_peinture,
            eauChaude: carnet.technique?.eau_chaude,
            diagnostics: safeParse(carnet.technique?.diagnostics, {})
        },
        prestataires: (carnet.prestataires || []).map(p => ({
            ...p,
            phones: safeParse(p.phones, []),
            emails: safeParse(p.emails, []),
            codes: safeParse(p.codes, {})
        })),
        travaux: carnet.travaux || [],
        lots: carnet.lots || [], // Expose lots array for LotSelector
        proprietaires: (carnet.owners || []).map(o => {
            // Get all lots owned by this owner via lot_ids
            const ownerLots = (o.lot_ids || [])
                .map(lid => (carnet.lots || []).find(l => l.id === lid))
                .filter(Boolean);
            const totalTantiemes = ownerLots.reduce((sum, l) => sum + (l.tantiemes || 0), 0);
            const lotDisplay = ownerLots.map(l => `Lot ${l.numero}`).join(', ') || '-';

            return {
                ...o,
                lots: ownerLots.length === 1 ? ownerLots[0] : null, // Legacy single lot (for backward compat)
                ownerLots: ownerLots, // All lots array
                lot: lotDisplay,
                tantiemes: totalTantiemes,
                infos: ownerLots.some(l => l.type === 'cellier') ? 'Cellier' : '',
                gestion: o.exo_gest ? null : totalTantiemes,
                menage: o.exo_men ? null : totalTantiemes
            };
        }), // Mapped from owners + owner_lots junction

        // Tentative de récupération depuis jsonb ou fallback
        diagnostics: safeParse(carnet.technique?.diagnostics, {}),
        finances: {
            avanceTresorerie: carnet.admin?.finances?.avanceTresorerie || '-',
            fondsTravaux: carnet.admin?.finances?.fondsTravaux || '-'
        }
    };

    const value = {
        state,
        ...carnet // Expose updateGeneral, updateAdmin, etc. et loading/error
    };

    return (
        <CarnetSupabaseContext.Provider value={value}>
            {children}
        </CarnetSupabaseContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCarnetData() {
    const context = useContext(CarnetSupabaseContext);
    if (!context) {
        throw new Error("useCarnetData must be used within CarnetSupabaseProvider");
    }
    return context;
}
