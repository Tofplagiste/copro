/**
 * Tests pour VoteApp
 * Vérifie le rendu de l'application de vote et l'export PDF
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import VoteApp from './VoteApp';
import { pdfMockCalls } from '../../setupTests';

// Mock du hook Supabase
vi.mock('./hooks/useVoteSupabase', () => ({
    useVoteSupabase: () => ({
        loading: false,
        saving: false,
        sessions: [
            { id: '1', title: 'AG 2024', session_date: '2024-01-01' }
        ],
        session: {
            id: '1',
            title: 'AG 2024',
            session_date: '2024-01-01'
        },
        copros: [
            { id: '1', name: 'M. CARSOULE', lots: ['1'], tantiemes: 500 },
            { id: '2', name: 'Mme TROPAMER', lots: ['2'], tantiemes: 500 }
        ],
        points: [
            { id: 'p1', title: 'Bureau de Séance', type: 'simple' }
        ],
        votes: {},
        presenceStats: {
            totalTantiemes: 1000,
            presentTantiemes: 1000,
            presentCount: 2
        },
        getPointResult: () => ({ pou: 1000, contre: 0, abs: 0 }),
        getMandataires: () => [],
        procurationCounts: {},
        createSession: vi.fn(),
        updatePresence: vi.fn(),
        updateVote: vi.fn(),
        updateProcuration: vi.fn(),
        resetAllVotes: vi.fn()
    })
}));

// Wrapper simple pour VoteApp (pas besoin de CoproContext)
function renderVoteApp() {
    return render(
        <MemoryRouter>
            <VoteApp />
        </MemoryRouter>
    );
}

describe('VoteApp', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        pdfMockCalls.reset();
    });

    it('affiche le titre de l\'application de vote', () => {
        renderVoteApp();
        expect(screen.getByText(/Vote AG/i)).toBeInTheDocument();
    });

    it.skip('affiche la liste des copropriétaires', async () => {
        renderVoteApp();

        // Navigation vers la session
        fireEvent.click(screen.getByText(/AG 2024/i));

        expect(await screen.findByText(/CARSOULE/i)).toBeInTheDocument();
        expect(screen.getByText(/TROPAMER/i)).toBeInTheDocument();
    });

    it.skip('affiche les points de vote', async () => {
        renderVoteApp();

        // Navigation vers la session
        fireEvent.click(screen.getByText(/AG 2024/i));

        expect(await screen.findByText(/Bureau de Séance/i)).toBeInTheDocument();
    });

    it.skip('affiche le bouton Exporter PDF', async () => {
        renderVoteApp();

        // Navigation vers la session
        fireEvent.click(screen.getByText(/AG 2024/i));

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

        renderVoteApp();

        // Navigation vers la session
        fireEvent.click(screen.getByText(/AG 2024/i));

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

    it.skip('affiche la section de configuration des présences', async () => {
        renderVoteApp();

        // Navigation
        fireEvent.click(screen.getByText(/AG 2024/i));

        expect(await screen.findByText(/Configuration Présence/i)).toBeInTheDocument();
    });

    it.skip('affiche les tantièmes totaux dans l\'en-tête', async () => {
        renderVoteApp();

        // Navigation
        fireEvent.click(screen.getByText(/AG 2024/i));

        expect(await screen.findByText(/1000 tantièmes/i)).toBeInTheDocument();
    });
});
