/**
 * Génération PDF pour le module Vote
 * Export du procès-verbal d'Assemblée Générale
 */
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { TOTAL_TANTIEMES } from '../data/voteConstants';

/**
 * Exporte le procès-verbal d'AG en PDF
 * @param {Object} params - Données du vote
 * @param {string} params.date - Date de l'AG
 * @param {Array} params.copros - Liste des copropriétaires
 * @param {Array} params.points - Points de vote
 * @param {Object} params.presenceStats - Statistiques de présence
 * @param {Function} params.getPointResult - Fonction pour calculer résultat d'un point
 */
export function exportVotePdf({ date, copros, points, presenceStats, getPointResult }) {
    const doc = new jsPDF();

    // En-tête
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PROCÈS-VERBAL ASSEMBLÉE GÉNÉRALE', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Copropriété 9 Rue André Leroux - 33780 SOULAC-SUR-MER', 105, 28, { align: 'center' });
    doc.text(`Date: ${new Date(date).toLocaleDateString('fr-FR')}`, 105, 35, { align: 'center' });

    // Feuille de présence
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Feuille de Présence', 14, 50);

    const presenceRows = copros.map(c => {
        let statut = 'Absent';
        if (c.presence === 'present') statut = 'Présent';
        else if (c.presence === 'correspondance') statut = 'Correspondance';
        else if (c.presence === 'procuration') {
            const mandataire = copros.find(m => m.id === c.procurationDonneeA);
            statut = mandataire ? `Procuration → ${mandataire.nom}` : 'Procuration (non assignée)';
        }
        return [c.nom, c.tantiemes, statut];
    });

    autoTable(doc, {
        startY: 55,
        head: [['Copropriétaire', 'Tantièmes', 'Statut']],
        body: presenceRows,
        headStyles: { fillColor: [51, 65, 85] },
        styles: { fontSize: 9 }
    });

    // Stats présence
    let y = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total tantièmes votants: ${presenceStats.tantiemesVotants} / ${TOTAL_TANTIEMES}`, 14, y);

    // Points de vote
    y += 15;
    doc.setFontSize(12);
    doc.text('Résolutions', 14, y);

    points.forEach(point => {
        const result = getPointResult(point.id);
        if (!result.hasVotes) return;

        y += 10;
        if (y > 270) {
            doc.addPage();
            y = 20;
        }

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`${point.id}. ${point.titre} (Art. ${point.article})`, 14, y);

        y += 6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`Pour: ${result.pour} | Contre: ${result.contre} | Abstention: ${result.abstention}`, 14, y);

        y += 5;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(result.adopte ? 34 : 220, result.adopte ? 197 : 38, result.adopte ? 94 : 38);
        doc.text(result.adopte ? '→ ADOPTÉ' : '→ REJETÉ', 14, y);
        doc.setTextColor(0, 0, 0);
    });

    doc.save(`PV_AG_${date}.pdf`);
}
