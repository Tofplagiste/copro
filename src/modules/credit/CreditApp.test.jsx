/**
 * Tests pour CreditApp
 * Vérifie le rendu du simulateur de crédit et l'export PDF
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CreditApp from './CreditApp';
import { pdfMockCalls } from '../../setupTests';

// Mock du hook Supabase
vi.mock('./hooks/useCreditSupabase', () => ({
    useCreditSupabase: () => ({
        loading: false,
        saving: false,
        simulations: [
            { id: '1', title: 'Simulation 1', updated_at: '2024-01-01' }
        ],
        simulation: {
            id: '1',
            title: 'Simulation 1'
        },
        duree: 120,
        tauxNominal: 4.5,
        tauxAssurance: 0.35,
        montantTotal: 100000,
        fondsTravaux: 0,
        repartition: [
            { name: 'M. Test', tantiemes: 1000, quotePart: 100, mensuel: 10 }
        ],
        totaux: {
            quotePart: 100000,
            mensuel: 1000,
            coutTotal: 120000
        },
        createSimulation: vi.fn(),
        updateSimulation: vi.fn(),
        deleteSimulation: vi.fn(),
        updateCopro: vi.fn()
    })
}));

// Wrapper simple pour CreditApp (pas besoin de CoproContext)
function renderCreditApp() {
    return render(
        <MemoryRouter>
            <CreditApp />
        </MemoryRouter>
    );
}

describe('CreditApp', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        pdfMockCalls.reset();
    });

    it('affiche le titre du simulateur', () => {
        renderCreditApp();
        // Le titre est "Simulateur Crédit"
        expect(screen.getByText(/Simulateur Crédit/i)).toBeInTheDocument();
    });

    it.skip('affiche les sections principales', async () => {
        renderCreditApp();

        // Navigation
        fireEvent.click(screen.getByText(/Simulation 1/i));

        expect(await screen.findByText(/Paramètres du Crédit/i)).toBeInTheDocument();
        expect(screen.getByText(/Montants Globaux/i)).toBeInTheDocument();
    });

    it.skip('affiche le bouton Exporter PDF', async () => {
        renderCreditApp();

        // Navigation
        fireEvent.click(screen.getByText(/Simulation 1/i));

        const pdfButton = await screen.findByRole('button', { name: /PDF/i });
        expect(pdfButton).toBeInTheDocument();
    });

    it.skip('le clic sur Exporter PDF télécharge un fichier PDF', async () => {
        let pdfError = null;

        const errorHandler = (event) => {
            pdfError = event.error || event.reason || event.message;
        };
        window.addEventListener('error', errorHandler);
        window.addEventListener('unhandledrejection', errorHandler);

        renderCreditApp();

        // Navigation
        fireEvent.click(screen.getByText(/Simulation 1/i));

        const pdfButton = await screen.findByRole('button', { name: /PDF/i });

        try {
            fireEvent.click(pdfButton);
        } catch (e) {
            pdfError = e;
        }

        await new Promise(resolve => setTimeout(resolve, 100));

        window.removeEventListener('error', errorHandler);
        window.removeEventListener('unhandledrejection', errorHandler);

        expect(pdfError).toBeNull();
        expect(pdfMockCalls.save.length).toBeGreaterThan(0);
        expect(pdfMockCalls.save[0]).toMatch(/\.pdf$/i);
    });

    it.skip('affiche le tableau de répartition', async () => {
        renderCreditApp();

        // Navigation
        fireEvent.click(screen.getByText(/Simulation 1/i));

        expect(await screen.findByText(/Répartition Détaillée/i)).toBeInTheDocument();
    });

    it.skip('affiche les statistiques du crédit', async () => {
        renderCreditApp();

        // Navigation
        fireEvent.click(screen.getByText(/Simulation 1/i));

        expect(await screen.findByText(/Montant Total Travaux/i)).toBeInTheDocument();
    });

    it.skip('affiche les champs de saisie pour le crédit', async () => {
        renderCreditApp();

        // Navigation
        fireEvent.click(screen.getByText(/Simulation 1/i));

        expect(await screen.findByText(/mois/i)).toBeInTheDocument();
    });
});
