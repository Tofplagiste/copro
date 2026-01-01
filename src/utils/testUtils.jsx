/**
 * Utilitaires de test pour les composants React
 * Fournit des wrappers avec les providers nécessaires
 */
/* eslint-disable react-refresh/only-export-components */
import { render } from '@testing-library/react';
import { CoproProvider } from '../context/CoproContext';
import { ToastProvider } from '../components/ToastProvider';
import { MemoryRouter } from 'react-router-dom';

/**
 * Wrapper avec tous les providers de l'application
 * Pour tester des composants qui utilisent le contexte
 */
export function AllProviders({ children }) {
    return (
        <MemoryRouter>
            <CoproProvider>
                <ToastProvider>
                    {children}
                </ToastProvider>
            </CoproProvider>
        </MemoryRouter>
    );
}

/**
 * Render personnalisé avec tous les providers
 * @param {React.ReactElement} ui - Composant à rendre
 * @param {Object} options - Options de render
 */
export function renderWithProviders(ui, options = {}) {
    return render(ui, { wrapper: AllProviders, ...options });
}

/**
 * Mock data pour les tests
 */
export const MOCK_OWNERS = [
    { id: 1, name: 'DUPONT', apt: 'Test', lot: 'Lot 1', tantiemes: 100, hasMeter: true, exoGest: false, exoMen: false },
    { id: 2, name: 'DURAND', apt: 'Test2', lot: 'Lot 2', tantiemes: 150, hasMeter: true, exoGest: false, exoMen: false }
];

export const MOCK_WATER = {
    activeQuarter: 'T1',
    priceMode: 'manual',
    manualPrice: 4.5,
    subAmount: 100,
    readings: {
        T1: { '1': { old: 100, new: 110 }, '2': { old: 50, new: 55 } },
        T2: {}, T3: {}, T4: {}
    },
    projections: {},
    projPrice: 5.08,
    projSub: 92.21
};

export const MOCK_BUDGET = {
    general: [{ name: 'Frais bancaire', reel: 100, previ: 120, previ_n1: 120 }],
    special: [],
    menage: [],
    travaux: []
};
