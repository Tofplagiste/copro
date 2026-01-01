/**
 * Génération PDF pour le module Crédit
 * Export du tableau de répartition et résumé financier
 */
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { formatMoney } from './creditCalculations';

/**
 * Exporte la simulation de crédit en PDF
 * @param {Object} params - Données de la simulation
 * @param {number} params.duree - Durée en mois
 * @param {number} params.tauxNominal - Taux nominal (%)
 * @param {number} params.tauxAssurance - Taux assurance (%)
 * @param {number} params.montantTotal - Montant total travaux
 * @param {number} params.fondsTravaux - Fonds travaux Loi Alur
 * @param {Array} params.repartition - Répartition par copropriétaire
 * @param {Object} params.totaux - Totaux financiers
 */
export function exportCreditPdf({ duree, tauxNominal, tauxAssurance, montantTotal, fondsTravaux, repartition, totaux }) {
    const doc = new jsPDF('landscape');

    // En-tête
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('SIMULATION CRÉDIT COPROPRIÉTÉ', 148, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('9 Rue André Leroux - 33780 SOULAC-SUR-MER', 148, 22, { align: 'center' });

    // Paramètres
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Paramètres du Crédit', 14, 35);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Durée: ${duree} mois (${(duree / 12).toFixed(1)} ans) | TEG: ${tauxNominal}% | Assurance: ${tauxAssurance}%`, 14, 42);
    doc.text(`Montant Total Travaux: ${formatMoney(montantTotal)} | Fonds Travaux Loi Alur: ${formatMoney(fondsTravaux)}`, 14, 48);

    // Tableau répartition
    const tableHeaders = ['Copropriétaire', 'Lot', 'Tant.', 'P. Communes', 'Balcons', 'Celliers', 'Total', 'Fonds Alur', 'Apport', 'À Financer', 'Mensualité'];
    const tableRows = repartition.map(c => [
        c.nom,
        c.lot,
        c.tantiemes + c.tantCellier,
        formatMoney(c.partCommunes),
        c.partBalcon > 0 ? formatMoney(c.partBalcon) : '-',
        c.partCellier > 0 ? formatMoney(c.partCellier) : '-',
        formatMoney(c.totalPart),
        '-' + formatMoney(c.partFondsTravaux),
        c.apportUtilise > 0 ? '-' + formatMoney(c.apportUtilise) : '-',
        c.paiementComptant ? 'Comptant' : formatMoney(c.montantAFinancer),
        c.paiementComptant ? '-' : c.mensualite.toFixed(2) + ' €'
    ]);

    autoTable(doc, {
        startY: 55,
        head: [tableHeaders],
        body: tableRows,
        headStyles: { fillColor: [67, 56, 202], fontSize: 7 },
        bodyStyles: { fontSize: 7 },
        columnStyles: {
            0: { cellWidth: 35 },
            3: { halign: 'right' },
            4: { halign: 'right' },
            5: { halign: 'right' },
            6: { halign: 'right' },
            7: { halign: 'right' },
            8: { halign: 'right' },
            9: { halign: 'right' },
            10: { halign: 'right' }
        }
    });

    // Résumé financier
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Résumé Financier', 14, finalY);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Montant Financé: ${formatMoney(totaux.montantFinance)} | Intérêts TEG: ${formatMoney(totaux.interetsTEG)} | Coût Assurance: ${formatMoney(totaux.coutAssurance)}`, 14, finalY + 7);
    doc.text(`Coût Total Crédit: ${formatMoney(totaux.coutTotal)} | Surprix Total: ${formatMoney(totaux.surprix)}`, 14, finalY + 14);

    doc.save('Simulation_Credit_Copro.pdf');
}
