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

        expect(screen.getByText(/Simulateur/i)).toBeInTheDocument();
    });

    it('affiche les sections principales', () => {
        renderCreditApp();

        expect(screen.getByText(/Paramètres du Crédit/i)).toBeInTheDocument();
        expect(screen.getByText(/Montants Globaux/i)).toBeInTheDocument();
    });

    it('affiche le bouton Exporter PDF', () => {
        renderCreditApp();

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

        renderCreditApp();

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

    it('affiche le tableau de répartition', () => {
        renderCreditApp();

        expect(screen.getByText(/Répartition Détaillée/i)).toBeInTheDocument();
    });

    it('affiche les statistiques du crédit', () => {
        renderCreditApp();

        expect(screen.getByText(/Montant Total Travaux/i)).toBeInTheDocument();
    });

    it('affiche les champs de saisie pour le crédit', () => {
        renderCreditApp();

        expect(screen.getByText(/mois/i)).toBeInTheDocument();
    });
});
