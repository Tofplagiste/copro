/**
 * Génération PDF pour le module Carnet
 * Export du carnet d'entretien complet
 */
import { autoTable } from 'jspdf-autotable';
import { setupPDF, addHeader, addSectionIdx, addFooter, checkPageBreak } from '../../../utils/pdfBase';

/**
 * Exporte le carnet d'entretien en PDF
 * @param {Object} state - État du carnet depuis le contexte
 */
export function exportCarnetPdf(state) {
    const doc = setupPDF();
    let y = addHeader(doc, "CARNET D'ENTRETIEN");

    // --- I. IDENTIFICATION ---
    y = addSectionIdx(doc, "IDENTIFICATION", y, "I");

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Adresse :", 15, y);
    doc.setFont("helvetica", "normal");
    doc.text("7-9 rue André Leroux, 33780 Soulac-sur-Mer", 40, y);

    doc.setFont("helvetica", "bold");
    doc.text("Syndic :", 110, y);
    doc.setFont("helvetica", "normal");
    doc.text("Mr LE MERLE Christophe 7 rue André Leroux 06 17 25 02 66", 130, y);

    y += 7;

    doc.setFont("helvetica", "bold");
    doc.text("Règlement :", 15, y);
    doc.setFont("helvetica", "normal");
    doc.text("29 septembre 2009 - Notaire: S.C.P Michel MARTIN (Ref: 52-531)", 40, y);

    doc.setFont("helvetica", "bold");
    doc.text("Composition :", 110, y);
    doc.setFont("helvetica", "normal");
    doc.text("21 (14 Principaux, 7 Celliers)", 135, y);

    y += 15;

    // --- II. ADMINISTRATION & FINANCES ---
    y = addSectionIdx(doc, "ADMINISTRATION & FINANCES", y, "II");

    doc.setFontSize(9);
    doc.text("AG Nomination : 17 décembre 2025", 15, y);
    doc.text("Mandat : 31 décembre 2026", 110, y);
    y += 7;
    doc.text("Trésorerie : 1 555.50€ / trimestre", 15, y);
    doc.text("Fonds Travaux : 13 487.27€ (Loi ALUR)", 110, y);
    y += 10;

    doc.setFont("helvetica", "bold");
    doc.text("Conseil Syndical :", 15, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.text("Mme Tropamer Véronique", 15, y); y += 4;
    doc.text("Mme Béliard Véronique", 15, y); y += 4;
    doc.text("M. Sibrac Vincent", 15, y);

    y += 10;

    // --- III. DONNÉES TECHNIQUES ---
    y = addSectionIdx(doc, "DONNÉES TECHNIQUES", y, "III");

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Construction :", 15, y);
    doc.setFont("helvetica", "normal");
    doc.text("Avant 1900 (Pierre / Brique / Bois)", 40, y);

    doc.setFont("helvetica", "bold");
    doc.text("Toiture :", 110, y);
    doc.setFont("helvetica", "normal");
    doc.text("Tuile Marseille et Romane", 130, y);
    y += 7;

    doc.setFont("helvetica", "bold");
    doc.text("Chauffage :", 15, y);
    doc.setFont("helvetica", "normal");
    doc.text("Individuel (Chauffage + Eau Chaude)", 40, y);

    doc.setFont("helvetica", "bold");
    doc.text("Compteurs :", 110, y);
    doc.setFont("helvetica", "normal");
    doc.text("Eau (Cour), Linky (Indiv/Commun)", 130, y);

    y += 15;

    // --- IV. CONTRATS EN COURS ---
    y = addSectionIdx(doc, "CONTRATS EN COURS", y, "IV");

    const prestataires = state?.prestataires || [];

    if (prestataires.length > 0) {
        prestataires.forEach(p => {
            y = checkPageBreak(doc, y);
            doc.setFont("helvetica", "bold");
            doc.text(`• ${p.name}`, 15, y);
            doc.setFont("helvetica", "normal");
            if (p.contrat) doc.text(` - Contrat: ${p.contrat}`, 15 + doc.getTextWidth(`• ${p.name}`), y);

            y += 4;
            doc.setFontSize(8);
            doc.setTextColor(80);
            if (p.address) {
                doc.text(`${p.address}`, 18, y);
                y += 3.5;
            }
            const phones = p.phones?.join(' / ') || "";
            if (phones) {
                doc.text(`Tél: ${phones}`, 18, y);
                y += 3.5;
            }
            const emails = p.emails?.join(' / ') || "";
            if (emails) {
                doc.text(`Email: ${emails}`, 18, y);
                y += 3.5;
            }

            y += 2;
            doc.setFontSize(9);
            doc.setTextColor(0);
        });
    } else {
        doc.setFont("helvetica", "italic");
        doc.text("Aucun contrat enregistré.", 15, y);
        y += 10;
    }

    y += 5;

    // --- V. DIAGNOSTICS ---
    y = checkPageBreak(doc, y);
    y = addSectionIdx(doc, "DIAGNOSTICS", y, "V");

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Amiante (2009) :", 15, y);
    doc.setFont("helvetica", "normal");
    doc.text("Négatif (sauf conduit combles) - 16/09/2009", 50, y);
    y += 6;

    doc.setFont("helvetica", "bold");
    doc.text("Plomb (2009) :", 15, y);
    doc.setFont("helvetica", "normal");
    doc.text("RAS - 16/09/2009", 50, y);
    y += 6;

    doc.setFont("helvetica", "bold");
    doc.text("Termites (2009) :", 15, y);
    doc.setFont("helvetica", "normal");
    doc.text("Contrôlé - 16/09/2009", 50, y);

    y += 15;

    // --- VI. TRAVAUX ---
    y = checkPageBreak(doc, y);
    y = addSectionIdx(doc, "HISTORIQUE DES TRAVAUX IMPORTANTS", y, "VI");

    const travaux = state?.travaux || [];

    const tableBody = travaux.length > 0 ? travaux.map(t => [t.annee, t.nature, t.entreprise]) : [
        ['2025', 'Réfection totale du portillon cour', 'Fait par REPT'],
        ['2024', 'Toiture (60 tuiles + faitage)', 'Boudassou Stéphane'],
        ['2022', 'Peinture Porte d\'entrée', 'Une Pointe de Couleurs']
    ];

    autoTable(doc, {
        startY: y,
        head: [['Année', 'Nature', 'Entreprise']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [255, 255, 255], textColor: 0, lineColor: 0, lineWidth: 0.1 },
        styles: { fontSize: 8, cellPadding: 2, lineColor: 0, lineWidth: 0.1, textColor: 0 },
        columnStyles: {
            0: { cellWidth: 20, fontStyle: 'bold' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 60 }
        }
    });

    addFooter(doc);
    doc.save("Carnet_Entretien_Complet.pdf");
}
