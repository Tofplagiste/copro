/**
 * Tests pour CreditApp
 * Vérifie le rendu du simulateur de crédit et l'export PDF
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CreditApp from './CreditApp';
import { pdfMockCalls } from '../../setupTests';

// Inline mock pour éviter hoisting issues
vi.mock('./hooks/useCreditSupabase', () => {
    const mockFunctions = {
        loading: false,
        saving: false,
        error: null,
        simulations: [
            { id: '1', title: 'Simulation 1', updated_at: '2024-01-01' }
        ],
        simulation: {
            id: '1',
            title: 'Simulation 1'
        },
        duree: 120,
        setDuree: vi.fn(),
        tauxNominal: 4.5,
        setTauxNominal: vi.fn(),
        tauxAssurance: 0.35,
        setTauxAssurance: vi.fn(),
        montantTotal: 100000,
        fondsTravaux: 0,
        setFondsTravaux: vi.fn(),
        partiesCommunes: 50000,
        setPartiesCommunes: vi.fn(),
        grandBalcon: 20000,
        setGrandBalcon: vi.fn(),
        petitsBalcons: 20000,
        setPetitsBalcons: vi.fn(),
        celliers: 10000,
        setCelliers: vi.fn(),
        copros: [
            { id: '1', nom: 'M. Test', tantiemes: 1000, hasGrandBalcon: false, hasPetitBalcon: false, hasCellier: false }
        ],
        repartition: [
            { id: '1', nom: 'M. Test', lot: '1', tantiemes: 1000, quotePart: 100, totalPart: 100, partCommunes: 100, partBalcon: 0, partCellier: 0, partFondsTravaux: 0, apportUtilise: 0, montantAFinancer: 10, paiementComptant: false, mensualite: 10 }
        ],
        totaux: {
            quotePart: 100000,
            mensuel: 1000,
            coutTotal: 120000,
            montantTotal: 100000,
            fondsTravaux: 0,
            totalApports: 0,
            montantFinance: 100000,
            interetsTEG: 10000,
            coutAssurance: 5000,
            surprix: 15000
        },
        createSimulation: vi.fn().mockResolvedValue({ success: true, simulationId: '2' }),
        updateSimulation: vi.fn().mockResolvedValue({ success: true }),
        deleteSimulation: vi.fn().mockResolvedValue({ success: true }),
        renameSimulation: vi.fn().mockResolvedValue({ success: true }),
        updateCopro: vi.fn().mockResolvedValue({ success: true }),
        saveSimulationParams: vi.fn().mockResolvedValue({ success: true })
    };

    return {
        useCreditSupabase: (simulationId) => {
            if (!simulationId) {
                return {
                    ...mockFunctions,
                    simulation: null
                };
            }
            return mockFunctions;
        }
    };
});

// Wrapper simple pour CreditApp
function renderCreditApp() {
    return render(
        <MemoryRouter>
            <CreditApp />
        </MemoryRouter>
    );
}

describe('CreditApp - Page d\'accueil', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        pdfMockCalls.reset();
    });

    it('affiche le titre du simulateur', () => {
        renderCreditApp();
        expect(screen.getByText(/Simulateur Crédit/i)).toBeInTheDocument();
    });

    it('affiche la liste des simulations', () => {
        renderCreditApp();
        expect(screen.getByText(/Mes simulations/i)).toBeInTheDocument();
        expect(screen.getByText(/Simulation 1/i)).toBeInTheDocument();
    });

    it('affiche le bouton pour créer une nouvelle simulation', () => {
        renderCreditApp();
        expect(screen.getByRole('button', { name: /Nouvelle/i })).toBeInTheDocument();
    });

    it('affiche la barre de recherche', () => {
        renderCreditApp();
        expect(screen.getByPlaceholderText(/Rechercher une simulation/i)).toBeInTheDocument();
    });

    it('affiche les boutons d\'action', () => {
        renderCreditApp();
        const openButtons = screen.getAllByTitle(/Ouvrir/i);
        expect(openButtons.length).toBeGreaterThan(0);
    });

    it('affiche le formulaire de création', async () => {
        renderCreditApp();
        fireEvent.click(screen.getByRole('button', { name: /Nouvelle/i }));
        await waitFor(() => {
            expect(screen.getByText(/Nouvelle Simulation/i)).toBeInTheDocument();
        });
    });
});

describe('CreditApp - Vue Simulation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        pdfMockCalls.reset();
    });

    it('affiche le bouton PDF après navigation', async () => {
        renderCreditApp();
        const openButtons = screen.getAllByTitle(/Ouvrir/i);
        fireEvent.click(openButtons[0]);

        expect(await screen.findByRole('button', { name: /PDF/i })).toBeInTheDocument();
    });

    it('affiche les paramètres du crédit', async () => {
        renderCreditApp();
        const openButtons = screen.getAllByTitle(/Ouvrir/i);
        fireEvent.click(openButtons[0]);

        expect(await screen.findByText(/Paramètres du Crédit/i)).toBeInTheDocument();
    });

    it('affiche la section des montants', async () => {
        renderCreditApp();
        const openButtons = screen.getAllByTitle(/Ouvrir/i);
        fireEvent.click(openButtons[0]);

        expect(await screen.findByText(/Montants Globaux/i)).toBeInTheDocument();
    });

    it('affiche le tableau de répartition', async () => {
        renderCreditApp();
        const openButtons = screen.getAllByTitle(/Ouvrir/i);
        fireEvent.click(openButtons[0]);

        expect(await screen.findByText(/Répartition Détaillée/i)).toBeInTheDocument();
    });

    it('exporte un PDF au clic sur le bouton', async () => {
        renderCreditApp();
        const openButtons = screen.getAllByTitle(/Ouvrir/i);
        fireEvent.click(openButtons[0]);

        const pdfButton = await screen.findByRole('button', { name: /PDF/i });
        fireEvent.click(pdfButton);

        await waitFor(() => {
            expect(pdfMockCalls.save.length).toBeGreaterThan(0);
        });
    });

    it('affiche les statistiques du crédit', async () => {
        renderCreditApp();
        const openButtons = screen.getAllByTitle(/Ouvrir/i);
        fireEvent.click(openButtons[0]);

        // Vérifie une des stat cards
        expect(await screen.findByText(/Montant Total Travaux/i)).toBeInTheDocument();
    });
});
