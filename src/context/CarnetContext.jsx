/**
 * CarnetContext - Contexte pour le Carnet de Copropriété
 */
import { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { CARNET_INITIAL_STATE } from '../data/carnetState';

const CarnetContext = createContext(null);

export function CarnetProvider({ children }) {
    const [state, setState] = useLocalStorage('carnet_data_v1', CARNET_INITIAL_STATE);

    const updateState = (updates) => {
        setState(prev => ({ ...prev, ...updates }));
    };

    const updateProprietaire = (id, updates) => {
        setState(prev => ({
            ...prev,
            proprietaires: prev.proprietaires.map(p =>
                p.id === id ? { ...p, ...updates } : p
            )
        }));
    };

    const addProprietaire = (proprietaire) => {
        setState(prev => ({
            ...prev,
            proprietaires: [...prev.proprietaires, { ...proprietaire, id: Date.now() }]
        }));
    };

    const deleteProprietaire = (id) => {
        setState(prev => ({
            ...prev,
            proprietaires: prev.proprietaires.filter(p => p.id !== id)
        }));
    };

    const updatePrestataire = (id, updates) => {
        setState(prev => ({
            ...prev,
            prestataires: prev.prestataires.map(p =>
                p.id === id ? { ...p, ...updates } : p
            )
        }));
    };

    const addPrestataire = (prestataire) => {
        setState(prev => ({
            ...prev,
            prestataires: [...prev.prestataires, { ...prestataire, id: Date.now() }]
        }));
    };

    const deletePrestataire = (id) => {
        setState(prev => ({
            ...prev,
            prestataires: prev.prestataires.filter(p => p.id !== id)
        }));
    };

    const addTravaux = (travail) => {
        setState(prev => ({
            ...prev,
            travaux: [{ ...travail, id: Date.now() }, ...prev.travaux]
        }));
    };

    const updateTravaux = (id, updates) => {
        setState(prev => ({
            ...prev,
            travaux: prev.travaux.map(t =>
                t.id === id ? { ...t, ...updates } : t
            )
        }));
    };

    const deleteTravaux = (id) => {
        setState(prev => ({
            ...prev,
            travaux: prev.travaux.filter(t => t.id !== id)
        }));
    };

    return (
        <CarnetContext.Provider value={{
            state,
            updateState,
            updateProprietaire,
            addProprietaire,
            deleteProprietaire,
            updatePrestataire,
            addPrestataire,
            deletePrestataire,
            addTravaux,
            updateTravaux,
            deleteTravaux
        }}>
            {children}
        </CarnetContext.Provider>
    );
}

export function useCarnet() {
    const context = useContext(CarnetContext);
    if (!context) {
        throw new Error('useCarnet must be used within CarnetProvider');
    }
    return context;
}
