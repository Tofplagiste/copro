/**
 * GestionSupabaseContext - Contexte React pour le module Gestion (Supabase)
 * 
 * Fournit les données Budget, Comptes et Opérations aux composants enfants.
 * Permet une migration progressive : les tabs peuvent migrer un par un.
 */
import { createContext, useContext } from 'react';
import { useGestionSupabase } from '../hooks/useGestionSupabase';

const GestionSupabaseContext = createContext(null);

/**
 * Provider pour les données Gestion Supabase
 * Encapsule useGestionSupabase et expose ses valeurs via Context
 */
export function GestionSupabaseProvider({ children }) {
    const gestion = useGestionSupabase();

    return (
        <GestionSupabaseContext.Provider value={gestion}>
            {children}
        </GestionSupabaseContext.Provider>
    );
}

/**
 * Hook pour accéder aux données Gestion Supabase
 * @returns {Object} État et fonctions du hook useGestionSupabase
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useGestionData() {
    const context = useContext(GestionSupabaseContext);
    if (!context) {
        throw new Error('useGestionData must be used within GestionSupabaseProvider');
    }
    return context;
}
