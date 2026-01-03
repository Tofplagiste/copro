/**
 * Tests pour WaterProjection (V6)
 * 
 * Migration Phase 6: Uses mocked GestionSupabaseContext
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WaterProjection from './WaterProjection';

// Mock the context
vi.mock('../../context/GestionSupabaseContext', () => ({
    useGestionData: () => ({
        waterRows: [
            {
                lot_id: 1,
                lot_numero: 'Lot 1',
                owner_name: 'Test Owner',
                has_meter: true,
                readings: {
                    T1: { old: 0, new: 10 },
                    T2: { old: 10, new: 20 },
                    T3: { old: 20, new: 30 },
                    T4: { old: 30, new: 40 }
                }
            }
        ],
        waterSettings: {
            proj_price: 5.08,
            proj_sub: 92.21
        },
        updateWaterSettings: vi.fn()
    })
}));

// Mock toast
vi.mock('../../../../components/ToastProvider', () => ({
    useToast: () => ({
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn()
    })
}));

// Mock clipboard
Object.assign(navigator, {
    clipboard: {
        write: vi.fn().mockResolvedValue()
    }
});

describe('WaterProjection', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('affiche le titre du composant', () => {
        render(<WaterProjection />);
        expect(screen.getByText(/Bilan Annuel/i)).toBeInTheDocument();
        expect(screen.getByText(/Projection N\+1/i)).toBeInTheDocument();
    });

    it('affiche le bouton Exporter PDF', () => {
        render(<WaterProjection />);
        const pdfButton = screen.getByRole('button', { name: /Exporter PDF/i });
        expect(pdfButton).toBeInTheDocument();
    });

    it('affiche le bouton Copier Tableau', () => {
        render(<WaterProjection />);
        const copyButton = screen.getByRole('button', { name: /Copier Tableau/i });
        expect(copyButton).toBeInTheDocument();
    });

    it('le clic sur Copier Tableau appelle le clipboard', async () => {
        render(<WaterProjection />);
        const copyButton = screen.getByRole('button', { name: /Copier Tableau/i });
        fireEvent.click(copyButton);

        await waitFor(() => {
            expect(navigator.clipboard.write).toHaveBeenCalled();
        });
    });

    it('affiche les champs de paramètres de projection', () => {
        render(<WaterProjection />);
        expect(screen.getByText(/Prix Estimé N\+1/i)).toBeInTheDocument();
        expect(screen.getByText(/Abonnement Annuel Est/i)).toBeInTheDocument();
    });

    it('affiche le tableau avec les en-têtes corrects', () => {
        render(<WaterProjection />);
        expect(screen.getByText('Propriétaire / Lot')).toBeInTheDocument();
        expect(screen.getByText('T1')).toBeInTheDocument();
        expect(screen.getByText('T2')).toBeInTheDocument();
        expect(screen.getByText('Budget N+1 (€)')).toBeInTheDocument();
    });

    it('affiche les données du propriétaire test', () => {
        render(<WaterProjection />);
        expect(screen.getByText('Test Owner')).toBeInTheDocument();
        expect(screen.getByText('Lot 1')).toBeInTheDocument();
    });
});
