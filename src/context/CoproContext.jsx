/**
 * CoproContext - Contexte React pour l'état global de l'application
 */
import { createContext, useContext, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { INITIAL_STATE } from '../data/initialState';

const CoproContext = createContext(null);

const STORAGE_KEY = 'copro_data_v10'; // v10 pour React migration

export function CoproProvider({ children }) {
    const [state, setState] = useLocalStorage(STORAGE_KEY, INITIAL_STATE);

    // Mise à jour partielle du state
    const updateState = useCallback((updates) => {
        setState(prev => ({ ...prev, ...updates }));
    }, [setState]);

    // Mise à jour d'un owner
    const updateOwner = useCallback((ownerId, updates) => {
        setState(prev => ({
            ...prev,
            owners: prev.owners.map(o =>
                o.id === ownerId ? { ...o, ...updates } : o
            )
        }));
    }, [setState]);

    // Reset complet
    const resetAll = useCallback(() => {
        if (window.confirm('ATTENTION : Effacement TOTAL. Continuer ?')) {
            localStorage.removeItem(STORAGE_KEY);
            window.location.reload();
        }
    }, []);

    const value = {
        state,
        setState,
        updateState,
        updateOwner,
        resetAll
    };

    return (
        <CoproContext.Provider value={value}>
            {children}
        </CoproContext.Provider>
    );
}

export function useCopro() {
    const context = useContext(CoproContext);
    if (!context) {
        throw new Error('useCopro must be used within CoproProvider');
    }
    return context;
}
