/**
 * Tests unitaires pour waterCalculations.js
 */
import { describe, it, expect } from 'vitest';
import {
    calculatePricePerM3,
    calculateValidTantiemes,
    calculateConsumption,
    calculateWaterCost,
    calculateAnnualConsumption,
    calculateProjectedBudget,
    calculateReadingsTotals
} from './waterCalculations';

// ================= DONNÉES DE TEST =================

const MOCK_WATER = {
    priceMode: 'manual',
    manualPrice: 4.5,
    annualTotal: 1000,
    annualSub: 200,
    annualVol: 160,
    subAmount: 100,
    activeQuarter: 'T1',
    readings: {
        T1: {
            '1': { old: 100, new: 110 },
            '2': { old: 50, new: 55 }
        },
        T2: {
            '1': { old: 110, new: 125 },
            '2': { old: 55, new: 60 }
        },
        T3: {},
        T4: {}
    },
    projections: { '1': 50 }
};

const MOCK_OWNERS = [
    { id: '1', name: 'DUPONT', tantiemes: 100, hasMeter: true, isCommon: false },
    { id: '2', name: 'DURAND', tantiemes: 150, hasMeter: true, isCommon: false },
    { id: '3', name: 'MARTIN', tantiemes: 200, hasMeter: false, isCommon: false },  // Pas de compteur
    { id: 'common', name: 'Communs', tantiemes: 50, hasMeter: false, isCommon: true }
];

// ================= TESTS =================

describe('calculatePricePerM3', () => {
    it('retourne le prix manuel en mode manuel', () => {
        const water = { priceMode: 'manual', manualPrice: 4.5 };
        expect(calculatePricePerM3(water)).toBe(4.5);
    });

    it('calcule le prix en mode annuel', () => {
        const water = {
            priceMode: 'annual',
            annualTotal: 1000,
            annualSub: 200, // Abonnement
            annualVol: 160   // Volume
        };
        // (1000 - 200) / 160 = 5
        expect(calculatePricePerM3(water)).toBe(5);
    });

    it('gère un volume nul', () => {
        const water = { priceMode: 'annual', annualTotal: 1000, annualSub: 200, annualVol: 0 };
        expect(calculatePricePerM3(water)).toBe(0);
    });

    it('retourne le prix par défaut si mode inconnu', () => {
        const water = { priceMode: 'unknown', manualPrice: 4.5 };
        expect(calculatePricePerM3(water)).toBe(4.5);
    });
});

describe('calculateValidTantiemes', () => {
    it('calcule le total des tantièmes pour propriétaires avec compteur', () => {
        // DUPONT (100) + DURAND (150) = 250
        expect(calculateValidTantiemes(MOCK_OWNERS)).toBe(250);
    });

    it('exclut les parties communes', () => {
        const owners = [
            { id: '1', tantiemes: 100, hasMeter: true, isCommon: false },
            { id: 'common', tantiemes: 500, hasMeter: true, isCommon: true }
        ];
        expect(calculateValidTantiemes(owners)).toBe(100);
    });

    it('exclut les propriétaires sans compteur', () => {
        const owners = [
            { id: '1', tantiemes: 100, hasMeter: true, isCommon: false },
            { id: '2', tantiemes: 200, hasMeter: false, isCommon: false }
        ];
        expect(calculateValidTantiemes(owners)).toBe(100);
    });
});

describe('calculateConsumption', () => {
    it('calcule la consommation correctement', () => {
        expect(calculateConsumption({ old: 100, new: 110 })).toBe(10);
    });

    it('retourne 0 pour consommation négative', () => {
        expect(calculateConsumption({ old: 110, new: 100 })).toBe(0);
    });

    it('gère un relevé null', () => {
        expect(calculateConsumption(null)).toBe(0);
    });
});

describe('calculateWaterCost', () => {
    it('calcule le coût complet pour un propriétaire avec compteur', () => {
        const owner = { id: '1', tantiemes: 100, hasMeter: true };
        const reading = { old: 100, new: 110 }; // 10 m³
        const pricePerM3 = 4.5;
        const subAmount = 100;
        const validTantiemes = 250;

        const result = calculateWaterCost(owner, reading, pricePerM3, subAmount, validTantiemes);

        expect(result.conso).toBe(10);
        expect(result.fixedCost).toBe(40); // 100 * (100/250)
        expect(result.variableCost).toBe(45); // 10 * 4.5
        expect(result.total).toBe(85);
    });

    it('retourne 0 pour propriétaire sans compteur', () => {
        const owner = { id: '1', tantiemes: 100, hasMeter: false };
        const result = calculateWaterCost(owner, { old: 0, new: 10 }, 4.5, 100, 250);

        expect(result.conso).toBe(0);
        expect(result.total).toBe(0);
    });
});

describe('calculateAnnualConsumption', () => {
    it('calcule la consommation annuelle par trimestre', () => {
        const result = calculateAnnualConsumption(MOCK_WATER.readings, '1');

        expect(result.quarters[0]).toBe(10); // T1: 110 - 100
        expect(result.quarters[1]).toBe(15); // T2: 125 - 110
        expect(result.quarters[2]).toBe(0);  // T3: pas de données
        expect(result.quarters[3]).toBe(0);  // T4: pas de données
        expect(result.total).toBe(25);
    });
});

describe('calculateProjectedBudget', () => {
    it('calcule le budget prévisionnel N+1', () => {
        const projM3 = 50;
        const projPrice = 5;
        const projSub = 100;
        const ownerTantiemes = 100;
        const validTantiemes = 250;

        const result = calculateProjectedBudget(projM3, projPrice, projSub, ownerTantiemes, validTantiemes);

        // subPart = 100 * (100/250) = 40
        // consoPart = 50 * 5 = 250
        // total = 290
        expect(result).toBe(290);
    });
});

describe('calculateReadingsTotals', () => {
    it('calcule les totaux globaux du tableau', () => {
        const result = calculateReadingsTotals(
            MOCK_OWNERS,
            MOCK_WATER.readings,
            'T1',
            4.5,
            100,
            250
        );

        // DUPONT: conso=10, fix=40, var=45
        // DURAND: conso=5, fix=60, var=22.5
        expect(result.totalVol).toBe(15);
        expect(result.totalFix).toBe(100); // 40 + 60
        expect(result.totalVar).toBe(67.5); // 45 + 22.5
        expect(result.totalFinal).toBe(167.5);
    });
});
