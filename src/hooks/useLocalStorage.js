/**
 * Hook useLocalStorage - Persiste l'état dans localStorage
 * @param {string} key - Clé localStorage
 * @param {any} initialValue - Valeur initiale
 */
import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
    // Récupère la valeur depuis localStorage ou utilise initialValue
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error('Erreur lecture localStorage:', error);
            return initialValue;
        }
    });

    // Sauvegarde dans localStorage à chaque changement
    useEffect(() => {
        try {
            const valueToStore = { ...storedValue, timestamp: Date.now() };
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error('Erreur écriture localStorage:', error);
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue];
}
