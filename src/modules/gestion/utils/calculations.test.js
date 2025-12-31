/**
 * Tests unitaires pour calculations.js
 * Couvre les calculs de charges, tantièmes et appels de fonds
 */
import { describe, it, expect } from 'vitest';
import {
    calculateQuotePart,
    calculateDivisors,
    calculateCategoryTotal,
    calculateOwnerCall,
    calculateDetailedCharges
} from './calculations';

// ================= DONNÉES DE TEST =================

const MOCK_OWNERS = [
    { id: '1', name: 'DUPONT', tantiemes: 100, exoGest: false, exoMen: false, isCommon: false },
    { id: '2', name: 'DURAND', tantiemes: 150, exoGest: true, exoMen: false, isCommon: false },  // Exo Syndic
    { id: '3', name: 'MARTIN', tantiemes: 200, exoGest: false, exoMen: true, isCommon: false },  // Exo Ménage
    { id: '4', name: 'BERNARD', tantiemes: 50, exoGest: true, exoMen: true, isCommon: false },   // Double exo
    { id: 'common', name: 'Parties Communes', tantiemes: 500, isCommon: true }                  // Exclu
];

const MOCK_BUDGET = {
    general: [
        { name: 'Assurance', reel: 1000, previ: 1200, previ_n1: 1300 },
        { name: 'EDF', reel: 500, previ: 600, previ_n1: 650 }
    ],
    special: [
        { name: 'Honoraires Syndic', reel: 800, previ: 850, previ_n1: 900 },
        { name: 'Entretien', reel: 400, previ: 450, previ_n1: 500 }
    ],
    menage: [
        { name: 'Ménage', reel: 600, previ: 700, previ_n1: 750 }
    ],
    travaux: [
        { name: 'Ravalement', reel: 0, previ: 2000, previ_n1: 0 }
    ]
};

const MOCK_WATER_PREVI = {
    subs: { '1': 50, '2': 60, '3': 70 },
    charges: { '1': 10, '2': 15, '3': 20 },
    reguls: { '1': -5, '2': 0, '3': 5 }
};

// ================= TESTS =================

describe('calculateQuotePart', () => {
    it('calcule correctement une quote-part simple', () => {
        // 1000€ total, 100/1000 tantièmes = 100€
        expect(calculateQuotePart(1000, 100, 1000)).toBe(100);
    });

    it('applique le ratio trimestriel', () => {
        // 1000€ total, 100/1000 tantièmes, trimestre = 25€
        expect(calculateQuotePart(1000, 100, 1000, 0.25)).toBe(25);
    });

    it('retourne 0 si diviseur est 0', () => {
        expect(calculateQuotePart(1000, 100, 0)).toBe(0);
    });

    it('gère les tantièmes fractionnaires', () => {
        // 1000€ total, 150/500 tantièmes = 300€
        expect(calculateQuotePart(1000, 150, 500)).toBe(300);
    });
});

describe('calculateDivisors', () => {
    it('calcule correctement les diviseurs avec exemptions', () => {
        const divisors = calculateDivisors(MOCK_OWNERS);

        // divGen: 100 + 150 + 200 + 50 = 500 (tous sauf isCommon)
        expect(divisors.divGen).toBe(500);

        // divSpe: exclut exoGest (150 + 50) = 500 - 200 = 300
        expect(divisors.divSpe).toBe(300);

        // divMen: exclut exoMen (200 + 50) = 500 - 250 = 250
        expect(divisors.divMen).toBe(250);

        // divTra: même que divGen
        expect(divisors.divTra).toBe(500);
    });

    it('exclut les parties communes', () => {
        const divisors = calculateDivisors(MOCK_OWNERS);
        // Le tantiemes de 500 (isCommon) n'est pas compté
        expect(divisors.divGen).toBe(500);
    });

    it('gère une liste vide', () => {
        const divisors = calculateDivisors([]);
        expect(divisors).toEqual({ divGen: 0, divSpe: 0, divMen: 0, divTra: 0 });
    });
});

describe('calculateCategoryTotal', () => {
    it('calcule le total en mode previ', () => {
        // general: 1200 + 600 = 1800
        expect(calculateCategoryTotal(MOCK_BUDGET.general, 'previ')).toBe(1800);
    });

    it('calcule le total en mode reel', () => {
        // general: 1000 + 500 = 1500
        expect(calculateCategoryTotal(MOCK_BUDGET.general, 'reel')).toBe(1500);
    });

    it('gère une catégorie vide', () => {
        expect(calculateCategoryTotal([], 'previ')).toBe(0);
    });

    it('gère une catégorie null', () => {
        expect(calculateCategoryTotal(null, 'previ')).toBe(0);
    });
});

describe('calculateOwnerCall', () => {
    const divisors = calculateDivisors(MOCK_OWNERS);

    it('calcule l\'appel complet pour un propriétaire sans exemption', () => {
        const owner = MOCK_OWNERS[0]; // DUPONT, 100 tantièmes, pas d'exemption
        const call = calculateOwnerCall(owner, MOCK_BUDGET, divisors, MOCK_WATER_PREVI, 'previ');

        // Vérifications
        expect(call.partGen).toBeGreaterThan(0);
        expect(call.partSpe).toBeGreaterThan(0);
        expect(call.partMen).toBeGreaterThan(0);
        expect(call.partTra).toBeGreaterThan(0);
        expect(call.wCost).toBe(55); // 50 + 10 - 5
        expect(call.total).toBe(call.subTotal + call.wCost);
    });

    it('applique l\'exemption Syndic (exoGest)', () => {
        const owner = MOCK_OWNERS[1]; // DURAND, exoGest = true
        const call = calculateOwnerCall(owner, MOCK_BUDGET, divisors, MOCK_WATER_PREVI, 'previ');

        expect(call.partSpe).toBe(0);
        expect(call.partMen).toBeGreaterThan(0);
    });

    it('applique l\'exemption Ménage (exoMen)', () => {
        const owner = MOCK_OWNERS[2]; // MARTIN, exoMen = true
        const call = calculateOwnerCall(owner, MOCK_BUDGET, divisors, MOCK_WATER_PREVI, 'previ');

        expect(call.partMen).toBe(0);
        expect(call.partSpe).toBeGreaterThan(0);
    });

    it('applique la double exemption', () => {
        const owner = MOCK_OWNERS[3]; // BERNARD, double exo
        const call = calculateOwnerCall(owner, MOCK_BUDGET, divisors, MOCK_WATER_PREVI, 'previ');

        expect(call.partSpe).toBe(0);
        expect(call.partMen).toBe(0);
        expect(call.partGen).toBeGreaterThan(0);
        expect(call.partTra).toBeGreaterThan(0);
    });

    it('gère un propriétaire sans données eau', () => {
        const owner = MOCK_OWNERS[3]; // BERNARD, pas dans waterPrevi
        const call = calculateOwnerCall(owner, MOCK_BUDGET, divisors, MOCK_WATER_PREVI, 'previ');

        expect(call.wCost).toBe(0);
    });
});

describe('calculateDetailedCharges', () => {
    const divisors = calculateDivisors(MOCK_OWNERS);

    it('retourne le détail par catégorie', () => {
        const owner = MOCK_OWNERS[0];
        const details = calculateDetailedCharges(owner, MOCK_BUDGET, divisors, 'previ');

        expect(details.general.items).toHaveLength(2);
        expect(details.special.items).toHaveLength(2);
        expect(details.menage.items).toHaveLength(1);
        expect(details.travaux.items).toHaveLength(1);
    });

    it('marque les catégories exonérées', () => {
        const owner = MOCK_OWNERS[1]; // exoGest
        const details = calculateDetailedCharges(owner, MOCK_BUDGET, divisors, 'previ');

        expect(details.special.exempt).toBe(true);
        expect(details.special.total).toBe(0);
    });
});
