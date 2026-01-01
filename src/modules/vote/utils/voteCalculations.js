/**
 * Calculs de vote en Assemblée Générale
 * Fonctions pures pour le calcul des résultats de votes
 */

/**
 * Articles de loi et leurs seuils de majorité
 */
export const ARTICLES = {
    '24': { label: 'Majorité simple', seuil: 0.5, description: 'Plus de 50% des voix exprimées' },
    '25': { label: 'Majorité absolue', seuil: 0.5, description: 'Plus de 50% de tous les tantièmes' },
    '26': { label: 'Double majorité', seuil: 2 / 3, description: 'Plus de 2/3 de tous les tantièmes' },
    'unanimite': { label: 'Unanimité', seuil: 1.0, description: '100% des tantièmes' }
};

/**
 * Calcule le résultat d'un vote pour un point
 * @param {Object} params - Paramètres du vote
 * @param {Object} params.pointVotes - Votes pour ce point { coproId: 'pour'|'contre'|'abstention' }
 * @param {string} params.article - Article de loi ('24', '25', '26', 'unanimite')
 * @param {Array} params.copros - Liste des copropriétaires { id, tantiemes }
 * @param {number} params.totalTantiemes - Total des tantièmes (défaut: 1000)
 * @returns {{ pour: number, contre: number, abstention: number, adopte: boolean, hasVotes: boolean }}
 */
export function calculerResultatVote({ pointVotes, article, copros, totalTantiemes = 1000 }) {
    let pour = 0, contre = 0, abstention = 0;

    copros.forEach(copro => {
        const vote = pointVotes[copro.id];
        if (!vote) return;

        if (vote === 'pour') pour += copro.tantiemes;
        else if (vote === 'contre') contre += copro.tantiemes;
        else if (vote === 'abstention') abstention += copro.tantiemes;
    });

    const exprimes = pour + contre;
    let adopte = false;

    if (article === '24') {
        // Majorité simple: majorité des exprimés
        adopte = exprimes > 0 && pour > (exprimes / 2);
    } else if (article === '25') {
        // Majorité absolue: plus de 50% de tous les tantièmes
        adopte = pour > (totalTantiemes * 0.5);
    } else if (article === '26') {
        // Double majorité: plus de 2/3 de tous les tantièmes
        adopte = pour > (totalTantiemes * (2 / 3));
    } else if (article === 'unanimite') {
        // Unanimité: 100% des tantièmes
        adopte = pour === totalTantiemes;
    }

    const totalVotes = pour + contre + abstention;
    const hasVotes = totalVotes > 0;

    return { pour, contre, abstention, adopte, hasVotes };
}

/**
 * Calcule les statistiques de présence à l'AG
 * @param {Array} copros - Liste { id, tantiemes, presence }
 * @param {number} totalTantiemes - Total des tantièmes
 * @returns {{ presents: number, correspondance: number, absents: number, tantiemesVotants: number, quorum: boolean }}
 */
export function calculerPresence(copros, totalTantiemes = 1000) {
    let presents = 0, correspondance = 0, absents = 0, tantiemesVotants = 0;

    copros.forEach(copro => {
        if (copro.presence === 'present' || copro.presence === 'correspondance') {
            tantiemesVotants += copro.tantiemes;
            if (copro.presence === 'present') presents++;
            else correspondance++;
        } else {
            absents++;
        }
    });

    // Quorum: au moins 1/4 des tantièmes représentés
    const quorum = tantiemesVotants >= (totalTantiemes / 4);

    return { presents, correspondance, absents, tantiemesVotants, quorum };
}

/**
 * Vérifie si un mandataire peut accepter une procuration (max 3)
 * @param {number} mandataireId - ID du mandataire
 * @param {Array} copros - Liste { id, procurationDonneeA }
 * @param {number} maxProcurations - Nombre max (défaut: 3)
 * @returns {boolean}
 */
export function peutAccepterProcuration(mandataireId, copros, maxProcurations = 3) {
    const nbProcurations = copros.filter(c => c.procurationDonneeA === mandataireId).length;
    return nbProcurations < maxProcurations;
}

/**
 * Retourne les copropriétaires pouvant voter
 * @param {Array} copros - Liste { id, tantiemes, presence, procurationDonneeA }
 * @returns {Array} Copropriétaires votants
 */
export function getVotants(copros) {
    return copros.filter(copro => {
        // Présent ou correspondance
        if (copro.presence === 'present' || copro.presence === 'correspondance') {
            return true;
        }
        // Absent avec procuration valide
        if (copro.procurationDonneeA) {
            const mandataire = copros.find(c => c.id === copro.procurationDonneeA);
            return mandataire && (mandataire.presence === 'present' || mandataire.presence === 'correspondance');
        }
        return false;
    });
}
