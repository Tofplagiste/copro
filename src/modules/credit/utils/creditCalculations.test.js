/**
 * Tests pour les calculs de crédit
 */
import { describe, it, expect } from 'vitest';
import {
    calculerMensualite,
    calculerCoutTotal,
    calculerQuotePart,
    calculerAmortissement
} from './creditCalculations';

describe('creditCalculations', () => {
    describe('calculerMensualite', () => {
        it('retourne 0 si capital <= 0', () => {
            expect(calculerMensualite(0, 120, 3)).toBe(0);
            expect(calculerMensualite(-1000, 120, 3)).toBe(0);
        });

        it('retourne 0 si durée <= 0', () => {
            expect(calculerMensualite(10000, 0, 3)).toBe(0);
            expect(calculerMensualite(10000, -12, 3)).toBe(0);
        });

        it('calcule correctement sans intérêt (taux 0)', () => {
            const mensualite = calculerMensualite(12000, 12, 0, 0);
            expect(mensualite).toBe(1000); // 12000 / 12
        });

        it('calcule correctement avec assurance seule (taux 0)', () => {
            const mensualite = calculerMensualite(12000, 12, 0, 1.2); // 1.2% annuel = 0.1% mensuel
            const assuranceMensuelle = 12000 * (1.2 / 100 / 12); // 12€
            expect(mensualite).toBeCloseTo(1000 + assuranceMensuelle, 2);
        });

        it('calcule correctement avec taux nominal', () => {
            // Prêt 100 000€ sur 20 ans à 3%
            const mensualite = calculerMensualite(100000, 240, 3, 0);
            // Mensualité attendue ~554.60€
            expect(mensualite).toBeCloseTo(554.60, 0);
        });

        it('calcule correctement avec taux et assurance', () => {
            // Prêt 100 000€ sur 20 ans à 3% + 0.36% assurance
            const mensualite = calculerMensualite(100000, 240, 3, 0.36);
            const assuranceMensuelle = 100000 * (0.36 / 100 / 12); // 30€
            expect(mensualite).toBeCloseTo(554.60 + 30, 0);
        });
    });

    describe('calculerCoutTotal', () => {
        it('retourne 0 si mensualité <= 0', () => {
            expect(calculerCoutTotal(0, 120, 10000)).toBe(0);
        });

        it('retourne 0 si durée <= 0', () => {
            expect(calculerCoutTotal(100, 0, 10000)).toBe(0);
        });

        it('calcule le coût total correctement', () => {
            // Mensualité 555€ sur 240 mois pour 100 000€ = 133 200€ total - 100 000€ = 33 200€
            const cout = calculerCoutTotal(555, 240, 100000);
            expect(cout).toBe(33200);
        });
    });

    describe('calculerQuotePart', () => {
        it('retourne 0 si totalTantiemes <= 0', () => {
            expect(calculerQuotePart(10000, 100, 0)).toBe(0);
        });

        it('calcule correctement la quote-part', () => {
            // 10 000€ pour 100/1000 tantièmes = 1 000€
            expect(calculerQuotePart(10000, 100, 1000)).toBe(1000);
        });

        it('utilise 1000 comme défaut pour totalTantiemes', () => {
            expect(calculerQuotePart(10000, 100)).toBe(1000);
        });

        it('gère les petits tantièmes', () => {
            // 50 000€ pour 37/1000 tantièmes = 1 850€
            expect(calculerQuotePart(50000, 37, 1000)).toBe(1850);
        });
    });

    describe('calculerAmortissement', () => {
        it('retourne un tableau de la bonne longueur', () => {
            const tableau = calculerAmortissement(10000, 12, 3);
            expect(tableau).toHaveLength(12);
        });

        it('chaque ligne a les bonnes propriétés', () => {
            const tableau = calculerAmortissement(10000, 12, 3);
            expect(tableau[0]).toHaveProperty('mois');
            expect(tableau[0]).toHaveProperty('capitalRestant');
            expect(tableau[0]).toHaveProperty('interets');
            expect(tableau[0]).toHaveProperty('amortissement');
        });

        it('le capital restant diminue au fil du temps', () => {
            const tableau = calculerAmortissement(10000, 12, 3);
            expect(tableau[0].capitalRestant).toBeGreaterThan(tableau[11].capitalRestant);
        });

        it('le capital restant final est proche de 0', () => {
            const tableau = calculerAmortissement(10000, 12, 3);
            expect(tableau[11].capitalRestant).toBeLessThan(1);
        });
    });
});
