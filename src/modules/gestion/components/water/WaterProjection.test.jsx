/**
 * Tests pour WaterProjection
 * Vérifie l'affichage et les boutons d'export PDF / Copier Tableau
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../../utils/testUtils';
import WaterProjection from './WaterProjection';
import { pdfMockCalls } from '../../../../setupTests';

describe('WaterProjection', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        pdfMockCalls.reset();
    });

    it('affiche le titre du composant', () => {
        renderWithProviders(<WaterProjection />);

        expect(screen.getByText(/Bilan Annuel/i)).toBeInTheDocument();
        expect(screen.getByText(/Projection N\+1/i)).toBeInTheDocument();
    });

    it('affiche le bouton Exporter PDF', () => {
        renderWithProviders(<WaterProjection />);

        const pdfButton = screen.getByRole('button', { name: /Exporter PDF/i });
        expect(pdfButton).toBeInTheDocument();
    });

    it('affiche le bouton Copier Tableau', () => {
        renderWithProviders(<WaterProjection />);

        const copyButton = screen.getByRole('button', { name: /Copier Tableau/i });
        expect(copyButton).toBeInTheDocument();
    });

    it('le clic sur Exporter PDF télécharge un fichier PDF', async () => {
        // Ce test vérifie que le clic sur le bouton PDF génère effectivement un téléchargement
        // Si jsPDF ou jspdf-autotable ne fonctionne pas, ce test DOIT échouer

        let pdfError = null;

        // Capture les erreurs non gérées
        const errorHandler = (event) => {
            pdfError = event.error || event.reason || event.message;
        };
        window.addEventListener('error', errorHandler);
        window.addEventListener('unhandledrejection', errorHandler);

        renderWithProviders(<WaterProjection />);

        const pdfButton = screen.getByRole('button', { name: /Exporter PDF/i });

        // Try to click and catch any error
        try {
            fireEvent.click(pdfButton);
        } catch (e) {
            pdfError = e;
        }

        // Attendre un peu pour les erreurs async
        await new Promise(resolve => setTimeout(resolve, 100));

        window.removeEventListener('error', errorHandler);
        window.removeEventListener('unhandledrejection', errorHandler);

        // Si une erreur s'est produite, le test doit échouer
        expect(pdfError).toBeNull();

        // Vérifie que doc.save() a été appelé avec un nom de fichier
        expect(pdfMockCalls.save.length).toBeGreaterThan(0);
        expect(pdfMockCalls.save[0]).toMatch(/\.pdf$/i);
    });

    it('le clic sur Copier Tableau appelle le clipboard', async () => {
        renderWithProviders(<WaterProjection />);

        const copyButton = screen.getByRole('button', { name: /Copier Tableau/i });
        fireEvent.click(copyButton);

        await waitFor(() => {
            expect(navigator.clipboard.write).toHaveBeenCalled();
        });
    });

    it('affiche les champs de paramètres de projection', () => {
        renderWithProviders(<WaterProjection />);

        expect(screen.getByText(/Prix Estimé N\+1/i)).toBeInTheDocument();
        expect(screen.getByText(/Abonnement Annuel Est/i)).toBeInTheDocument();
    });

    it('affiche le tableau avec les en-têtes corrects', () => {
        renderWithProviders(<WaterProjection />);

        expect(screen.getByText('Propriétaire')).toBeInTheDocument();
        expect(screen.getByText('T1')).toBeInTheDocument();
        expect(screen.getByText('T2')).toBeInTheDocument();
        expect(screen.getByText('Budget N+1 (€)')).toBeInTheDocument();
    });
});
