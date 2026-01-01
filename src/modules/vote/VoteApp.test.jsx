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

    it('affiche la liste des copropriétaires', () => {
        renderVoteApp();

        expect(screen.getByText(/CARSOULE/i)).toBeInTheDocument();
        expect(screen.getByText(/TROPAMER/i)).toBeInTheDocument();
    });

    it('affiche les points de vote', () => {
        renderVoteApp();

        expect(screen.getByText(/Bureau de Séance/i)).toBeInTheDocument();
    });

    it('affiche le bouton Exporter PDF', () => {
        renderVoteApp();

        const pdfButton = screen.getByRole('button', { name: /PDF/i });
        expect(pdfButton).toBeInTheDocument();
    });

    it('le clic sur Exporter PDF télécharge un fichier PDF', async () => {
        // Ce test vérifie que le clic sur le bouton PDF génère effectivement un téléchargement
        // Si jsPDF ou jspdf-autotable ne fonctionne pas, ce test DOIT échouer

        let pdfError = null;

        const errorHandler = (event) => {
            pdfError = event.error || event.reason || event.message;
        };
        window.addEventListener('error', errorHandler);
        window.addEventListener('unhandledrejection', errorHandler);

        renderVoteApp();

        const pdfButton = screen.getByRole('button', { name: /PDF/i });

        try {
            fireEvent.click(pdfButton);
        } catch (e) {
            pdfError = e;
        }

        await new Promise(resolve => setTimeout(resolve, 100));

        window.removeEventListener('error', errorHandler);
        window.removeEventListener('unhandledrejection', errorHandler);

        // Si une erreur s'est produite, le test doit échouer
        expect(pdfError).toBeNull();

        // Vérifie que doc.save() a été appelé avec un nom de fichier .pdf
        expect(pdfMockCalls.save.length).toBeGreaterThan(0);
        expect(pdfMockCalls.save[0]).toMatch(/\.pdf$/i);
    });

    it('affiche la section de configuration des présences', () => {
        renderVoteApp();

        expect(screen.getByText(/Configuration Présence/i)).toBeInTheDocument();
    });

    it('affiche les tantièmes totaux dans l\'en-tête', () => {
        renderVoteApp();

        expect(screen.getByText(/1000 tantièmes/i)).toBeInTheDocument();
    });
});
