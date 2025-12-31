/**
 * Example test file to verify Vitest is correctly configured.
 * This demonstrates the basic testing setup.
 */
import { describe, it, expect } from 'vitest';

/**
 * Additionne deux nombres.
 * @param {number} a - Premier nombre
 * @param {number} b - Deuxième nombre
 * @returns {number} La somme des deux nombres
 */
export function add(a, b) {
    return a + b;
}

/**
 * Calcule la quote-part d'un copropriétaire.
 * @param {number} amount - Montant total
 * @param {number} tantiemes - Tantièmes du copropriétaire
 * @param {number} totalTantiemes - Total des tantièmes (défaut: 1000)
 * @returns {number} Montant dû
 */
export function calculateQuotePart(amount, tantiemes, totalTantiemes = 1000) {
    if (totalTantiemes === 0) return 0;
    return (amount * tantiemes) / totalTantiemes;
}

describe('Example Test Suite', () => {
    it('should add two numbers correctly', () => {
        expect(add(1, 1)).toBe(2);
        expect(add(10, 5)).toBe(15);
        expect(add(-1, 1)).toBe(0);
    });

    it('should calculate quote-part correctly', () => {
        // Un copropriétaire avec 100/1000 tantièmes paie 10% du total
        expect(calculateQuotePart(1000, 100)).toBe(100);
        expect(calculateQuotePart(500, 200)).toBe(100);
        expect(calculateQuotePart(1000, 0)).toBe(0);
    });

    it('should handle edge cases', () => {
        expect(calculateQuotePart(0, 100)).toBe(0);
        expect(calculateQuotePart(1000, 100, 0)).toBe(0);
    });
});
