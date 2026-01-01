/**
 * Tests pour les calculs de vote AG
 */
import { describe, it, expect } from 'vitest';
import {
    calculerResultatVote,
    calculerPresence,
    peutAccepterProcuration,
    getVotants,
    ARTICLES
} from './voteCalculations';

// Données de test
const mockCopros = [
    { id: 1, tantiemes: 100, presence: 'present', procurationDonneeA: null },
    { id: 2, tantiemes: 150, presence: 'present', procurationDonneeA: null },
    { id: 3, tantiemes: 200, presence: 'correspondance', procurationDonneeA: null },
    { id: 4, tantiemes: 250, presence: 'absent', procurationDonneeA: 1 },
    { id: 5, tantiemes: 300, presence: 'absent', procurationDonneeA: null }
];

describe('voteCalculations', () => {
    describe('ARTICLES', () => {
        it('contient les 3 articles de loi', () => {
            expect(ARTICLES).toHaveProperty('24');
            expect(ARTICLES).toHaveProperty('25');
            expect(ARTICLES).toHaveProperty('26');
        });

        it('article 24 a un seuil de 0.5', () => {
            expect(ARTICLES['24'].seuil).toBe(0.5);
        });

        it('article 26 a un seuil de 2/3', () => {
            expect(ARTICLES['26'].seuil).toBeCloseTo(0.667, 2);
        });
    });

    describe('calculerResultatVote', () => {
        it('compte correctement les tantièmes pour/contre', () => {
            const pointVotes = { 1: 'pour', 2: 'contre', 3: 'pour' };
            const result = calculerResultatVote({
                pointVotes,
                article: '24',
                copros: mockCopros.slice(0, 3)
            });

            expect(result.pour).toBe(300); // 100 + 200
            expect(result.contre).toBe(150);
            expect(result.abstention).toBe(0);
        });

        it('gère les abstentions', () => {
            const pointVotes = { 1: 'pour', 2: 'abstention' };
            const result = calculerResultatVote({
                pointVotes,
                article: '24',
                copros: mockCopros.slice(0, 2)
            });

            expect(result.abstention).toBe(150);
        });

        it('article 24: adopté si majorité des exprimés', () => {
            const pointVotes = { 1: 'pour', 2: 'contre', 3: 'pour' };
            const result = calculerResultatVote({
                pointVotes,
                article: '24',
                copros: mockCopros.slice(0, 3)
            });

            // Pour: 300, Contre: 150, Exprimés: 450 -> 300 > 225 ✓
            expect(result.adopte).toBe(true);
        });

        it('article 24: rejeté si pas majorité', () => {
            const pointVotes = { 1: 'pour', 2: 'contre', 3: 'contre' };
            const result = calculerResultatVote({
                pointVotes,
                article: '24',
                copros: mockCopros.slice(0, 3)
            });

            // Pour: 100, Contre: 350 -> 100 < 225 ✗
            expect(result.adopte).toBe(false);
        });

        it('article 25: adopté si majorité absolue', () => {
            const pointVotes = { 1: 'pour', 2: 'pour', 3: 'pour' };
            const result = calculerResultatVote({
                pointVotes,
                article: '25',
                copros: mockCopros.slice(0, 3),
                totalTantiemes: 450
            });

            // Pour: 450, Total: 450 -> 450 > 225 ✓
            expect(result.adopte).toBe(true);
        });

        it('article 25: rejeté si pas majorité absolue', () => {
            const pointVotes = { 1: 'pour' };
            const result = calculerResultatVote({
                pointVotes,
                article: '25',
                copros: mockCopros.slice(0, 3),
                totalTantiemes: 1000
            });

            // Pour: 100, Total: 1000 -> 100 < 500 ✗
            expect(result.adopte).toBe(false);
        });

        it('article 26: nécessite 2/3 des voix', () => {
            const pointVotes = { 1: 'pour', 2: 'pour', 3: 'pour' };
            const result = calculerResultatVote({
                pointVotes,
                article: '26',
                copros: mockCopros.slice(0, 3),
                totalTantiemes: 600
            });

            // Pour: 450, Seuil: 400 -> 450 > 400 ✓
            expect(result.adopte).toBe(true);
        });

        it('hasVotes est false si aucun vote', () => {
            const result = calculerResultatVote({
                pointVotes: {},
                article: '24',
                copros: mockCopros
            });

            expect(result.hasVotes).toBe(false);
        });
    });

    describe('calculerPresence', () => {
        it('compte les présents et absents', () => {
            const result = calculerPresence(mockCopros, 1000);

            expect(result.presents).toBe(2);
            expect(result.correspondance).toBe(1);
            expect(result.absents).toBe(2);
        });

        it('calcule les tantièmes votants', () => {
            const result = calculerPresence(mockCopros, 1000);

            // Présents: 100 + 150 + 200 = 450
            expect(result.tantiemesVotants).toBe(450);
        });

        it('vérifie le quorum (1/4 des tantièmes)', () => {
            const result = calculerPresence(mockCopros, 1000);

            // 450 >= 250 (1/4 de 1000) ✓
            expect(result.quorum).toBe(true);
        });

        it('quorum non atteint si moins de 1/4', () => {
            const fewCopros = [{ id: 1, tantiemes: 100, presence: 'present' }];
            const result = calculerPresence(fewCopros, 1000);

            // 100 < 250 ✗
            expect(result.quorum).toBe(false);
        });
    });

    describe('peutAccepterProcuration', () => {
        it('retourne true si moins de 3 procurations', () => {
            const copros = [
                { id: 1, procurationDonneeA: null },
                { id: 2, procurationDonneeA: 1 },
                { id: 3, procurationDonneeA: 1 }
            ];

            expect(peutAccepterProcuration(1, copros)).toBe(true);
        });

        it('retourne false si 3 procurations ou plus', () => {
            const copros = [
                { id: 1, procurationDonneeA: null },
                { id: 2, procurationDonneeA: 1 },
                { id: 3, procurationDonneeA: 1 },
                { id: 4, procurationDonneeA: 1 }
            ];

            expect(peutAccepterProcuration(1, copros)).toBe(false);
        });
    });

    describe('getVotants', () => {
        it('inclut les présents', () => {
            const votants = getVotants(mockCopros);
            const ids = votants.map(v => v.id);

            expect(ids).toContain(1);
            expect(ids).toContain(2);
        });

        it('inclut les correspondance', () => {
            const votants = getVotants(mockCopros);
            const ids = votants.map(v => v.id);

            expect(ids).toContain(3);
        });

        it('inclut les absents avec procuration valide', () => {
            const votants = getVotants(mockCopros);
            const ids = votants.map(v => v.id);

            // Copro 4 a une procuration vers 1 qui est présent
            expect(ids).toContain(4);
        });

        it('exclut les absents sans procuration', () => {
            const votants = getVotants(mockCopros);
            const ids = votants.map(v => v.id);

            expect(ids).not.toContain(5);
        });
    });
});
