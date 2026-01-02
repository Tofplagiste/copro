/**
 * Génération PDF pour le module Crédit
 * Export du tableau de répartition et résumé financier avec cartes colorées
 */
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { formatMoney } from './creditCalculations';

/**
 * Sanitize filename by removing special characters
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeFilename(str) {
    return str.replace(/[^a-zA-Z0-9àâäéèêëïîôùûüç\s-]/gi, '').replace(/\s+/g, '_').substring(0, 50);
}

/**
 * Dessine une carte colorée avec gradient
 * @param {jsPDF} doc - Instance jsPDF
 * @param {number} x - Position X
 * @param {number} y - Position Y
 * @param {number} w - Largeur
 * @param {number} h - Hauteur
 * @param {Array<number>} color - Couleur RGB [r, g, b]
 * @param {string} label - Label de la carte
 * @param {string} value - Valeur affichée
 */
function drawColorCard(doc, x, y, w, h, color, label, value) {
    // Fond coloré avec coins arrondis simulés
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(x, y, w, h, 2, 2, 'F');

    // Label en haut
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text(label, x + 3, y + 5);

    // Valeur en grand
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(value, x + 3, y + 13);

    // Reset couleur texte
    doc.setTextColor(0, 0, 0);
}

/**
 * Exporte la simulation de crédit en PDF
 * @param {Object} params - Données de la simulation
 * @param {string} params.title - Titre de la simulation
 * @param {number} params.duree - Durée en mois
 * @param {number} params.tauxNominal - Taux nominal (%)
 * @param {number} params.tauxAssurance - Taux assurance (%)
 * @param {number} params.montantTotal - Montant total travaux
 * @param {number} params.fondsTravaux - Fonds travaux Loi Alur
 * @param {Array} params.repartition - Répartition par copropriétaire
 * @param {Object} params.totaux - Totaux financiers
 */
export function exportCreditPdf({ title, duree, tauxNominal, tauxAssurance, montantTotal, fondsTravaux, repartition, totaux }) {
    const doc = new jsPDF('landscape');

    // === EN-TÊTE ===
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text(`Simulateur de Crédit - ${title || 'Simulation'}`, 14, 15);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('9 Rue André Leroux - Soulac-sur-Mer (33780)', 14, 21);
    doc.setTextColor(0, 0, 0);

    // === SECTION TABLEAU ===
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text('Répartition Détaillée par Copropriétaire', 14, 32);
    doc.setTextColor(0, 0, 0);

    // Tableau avec colonnes
    const tableHeaders = [
        'Copropriétaire', 'Lot', 'Tant.', 'P. Communes', 'Balcons', 'Celliers',
        'Total Travaux', 'Fonds Alur', 'Apport Perso', 'À Financer', 'Mensualité'
    ];

    const tableRows = repartition.map(c => [
        c.nom,
        c.lot,
        c.tantiemes + c.tantCellier,
        formatMoney(c.partCommunes),
        c.partBalcon > 0 ? formatMoney(c.partBalcon) : '-',
        c.partCellier > 0 ? formatMoney(c.partCellier) : '-',
        formatMoney(c.totalPart),
        c.partFondsTravaux > 0 ? '-' + formatMoney(c.partFondsTravaux) : '-0€',
        c.apportUtilise > 0 ? '-' + formatMoney(c.apportUtilise) : '-0€',
        c.paiementComptant ? 'Comptant' : formatMoney(c.montantAFinancer),
        c.paiementComptant ? '-' : formatMoney(c.mensualite)
    ]);

    // Ligne de total
    const totalTantiemes = repartition.reduce((s, c) => s + c.tantiemes + c.tantCellier, 0);
    const totalCommunes = repartition.reduce((s, c) => s + c.partCommunes, 0);
    const totalBalcons = repartition.reduce((s, c) => s + c.partBalcon, 0);
    const totalCelliers = repartition.reduce((s, c) => s + c.partCellier, 0);
    const totalTravaux = repartition.reduce((s, c) => s + c.totalPart, 0);
    const totalFonds = repartition.reduce((s, c) => s + c.partFondsTravaux, 0);
    const totalApports = repartition.reduce((s, c) => s + c.apportUtilise, 0);
    const totalFinancer = repartition.filter(c => !c.paiementComptant).reduce((s, c) => s + c.montantAFinancer, 0);
    const totalMensualite = repartition.filter(c => !c.paiementComptant).reduce((s, c) => s + c.mensualite, 0);

    tableRows.push([
        'TOTAL',
        '',
        totalTantiemes,
        formatMoney(totalCommunes),
        formatMoney(totalBalcons),
        formatMoney(totalCelliers),
        formatMoney(totalTravaux),
        '-' + formatMoney(totalFonds),
        '-' + formatMoney(totalApports),
        formatMoney(totalFinancer),
        formatMoney(totalMensualite)
    ]);

    autoTable(doc, {
        startY: 36,
        head: [tableHeaders],
        body: tableRows,
        headStyles: {
            fillColor: [241, 245, 249],
            textColor: [51, 65, 85],
            fontSize: 7,
            fontStyle: 'bold',
            halign: 'center'
        },
        bodyStyles: {
            fontSize: 7,
            textColor: [51, 65, 85]
        },
        columnStyles: {
            0: { cellWidth: 38, fontStyle: 'bold' },
            1: { cellWidth: 18, halign: 'center', textColor: [100, 116, 139] },
            2: { cellWidth: 12, halign: 'center' },
            3: { halign: 'right' },
            4: { halign: 'right' },
            5: { halign: 'right' },
            6: { halign: 'right' },
            7: { halign: 'right', textColor: [239, 68, 68] },
            8: { halign: 'right', textColor: [34, 197, 94] },
            9: { halign: 'right' },
            10: { halign: 'right' }
        },
        didParseCell: function (data) {
            // Style la ligne TOTAL en gras
            if (data.row.index === tableRows.length - 1) {
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fillColor = [241, 245, 249];
            }
        },
        alternateRowStyles: {
            fillColor: [255, 255, 255]
        }
    });

    // === CARTES COLORÉES DE SYNTHÈSE ===
    const finalY = doc.lastAutoTable.finalY + 8;
    const cardW = 50;
    const cardH = 18;
    const gap = 4;
    const startX = 14;

    // Première ligne de cartes (5 cartes)
    const row1Colors = [
        [99, 102, 241],   // Indigo - Montant Total
        [34, 197, 94],    // Vert - Fonds Travaux
        [249, 115, 22],   // Orange - Apports
        [168, 85, 247],   // Violet - Montant Financé
        [236, 72, 153]    // Rose - Coût Total
    ];

    const row1Cards = [
        { label: 'Montant Total Travaux', value: formatMoney(montantTotal) },
        { label: 'Fonds Travaux Loi Alur', value: formatMoney(fondsTravaux) },
        { label: 'Apports Personnels', value: formatMoney(totaux.totalApports) },
        { label: 'Montant Financé', value: formatMoney(totaux.montantFinance) },
        { label: 'Coût Total Crédit', value: formatMoney(totaux.coutTotal) }
    ];

    row1Cards.forEach((card, i) => {
        drawColorCard(doc, startX + i * (cardW + gap), finalY, cardW, cardH, row1Colors[i], card.label, card.value);
    });

    // Deuxième ligne de cartes (3 cartes, plus larges)
    const row2Y = finalY + cardH + gap;
    const row2CardW = 80;

    const row2Colors = [
        [239, 68, 68],    // Rouge - Intérêts
        [6, 182, 212],    // Cyan - Assurance
        [236, 72, 153]    // Rose - Surprix
    ];

    const row2Cards = [
        { label: 'Intérêts TEG', value: formatMoney(totaux.interetsTEG) },
        { label: 'Coût Assurance', value: formatMoney(totaux.coutAssurance) },
        { label: 'Surprix Total (Intérêts + Assurance)', value: formatMoney(totaux.surprix) }
    ];

    row2Cards.forEach((card, i) => {
        drawColorCard(doc, startX + i * (row2CardW + gap), row2Y, row2CardW, cardH, row2Colors[i], card.label, card.value);
    });

    // === PIED DE PAGE ===
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(150, 150, 150);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} - Durée: ${duree} mois | TEG: ${tauxNominal}% | Assurance: ${tauxAssurance}%`, 14, pageHeight - 8);

    // Filename with simulation title
    const safeTitle = sanitizeFilename(title || 'Simulation');
    doc.save(`Credit_${safeTitle}.pdf`);
}
