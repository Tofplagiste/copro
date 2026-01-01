/**
 * Utilitaires d'export PDF pour l'application Copro
 * Utilise jspdf et jspdf-autotable
 */
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

/**
 * Crée un nouveau document PDF
 * @param {'portrait' | 'landscape'} orientation
 * @returns {jsPDF}
 */
export function createPDF(orientation = 'portrait') {
    return new jsPDF(orientation);
}

/**
 * Ajoute un en-tête standardisé au document
 * @param {jsPDF} doc
 * @param {string} title
 * @param {string} subtitle
 * @param {number} startY
 * @returns {number} Position Y après l'en-tête
 */
export function addHeader(doc, title, subtitle = '', startY = 15) {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, startY);

    let y = startY + 8;

    if (subtitle) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(subtitle, 14, y);
        y += 6;
    }

    return y;
}

/**
 * Ajoute un tableau au document
 * @param {jsPDF} doc
 * @param {string[]} headers
 * @param {Array<Array<string|number>>} rows
 * @param {Object} options
 * @returns {number} Position Y finale
 */
export function addTable(doc, headers, rows, options = {}) {
    const defaultOptions = {
        startY: options.startY || doc.lastAutoTable?.finalY + 10 || 30,
        headStyles: {
            fillColor: [51, 65, 85], // slate-700
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 9
        },
        bodyStyles: {
            fontSize: 8
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252] // slate-50
        },
        margin: { left: 14, right: 14 },
        ...options
    };

    autoTable(doc, {
        head: [headers],
        body: rows,
        ...defaultOptions
    });

    return doc.lastAutoTable.finalY;
}

/**
 * Ajoute une ligne de texte simple
 * @param {jsPDF} doc
 * @param {string} text
 * @param {number} y
 * @param {Object} options
 * @returns {number} Nouvelle position Y
 */
export function addText(doc, text, y, options = {}) {
    const { fontSize = 10, fontStyle = 'normal', color = [0, 0, 0] } = options;
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    doc.setTextColor(...color);
    doc.text(text, 14, y);
    return y + (fontSize * 0.5);
}

/**
 * Formate un nombre en euros
 * @param {number} value
 * @returns {string}
 */
export function fmtEuro(value) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2
    }).format(value || 0);
}

/**
 * Sauvegarde et télécharge le PDF
 * @param {jsPDF} doc
 * @param {string} filename
 */
export function savePDF(doc, filename) {
    doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}

// =============================================================================
// FONCTIONS SPÉCIALISÉES POUR COPRO
// =============================================================================

/**
 * Génère un PDF d'appel de fonds pour un propriétaire.
 * @param {Object} owner - Propriétaire { id, name, apt, lot, tantiemes, exoGest, exoMen }
 * @param {Object} details - Détails des charges { general, special, menage, travaux, water }
 * @param {Object} options - Options { quarter, year, divisors, budgetMode }
 * @returns {jsPDF} Document PDF généré
 */
export function generateOwnerCallPDF(owner, details, options = {}) {
    const { quarter = 'T1', year = new Date().getFullYear(), divisors = {}, budgetMode = 'previ' } = options;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // ===== HEADER =====
    doc.setFontSize(10);
    doc.setTextColor(0, 51, 102);
    doc.setFont('helvetica', 'bold');
    doc.text("Copropriété LES PYRÉNÉES", 15, 20);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text("7-9 rue André Leroux", 15, 25);
    doc.text("33780 SOULAC-SUR-MER", 15, 30);
    doc.setTextColor(0, 100, 0);
    doc.text("Email: coprolsp@gmail.com", 15, 35);

    // Info copropriétaire (droite)
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.text(`Copropriétaire: ${owner.name} (${owner.apt})`, pageWidth - 15, 20, { align: 'right' });
    doc.setFontSize(9);
    doc.text(`Lot(s): ${owner.lot}`, pageWidth - 15, 25, { align: 'right' });

    // ===== TITRE =====
    doc.setFontSize(16);
    doc.setTextColor(0, 51, 102);
    doc.setFont('helvetica', 'bold');
    doc.text("APPEL DE FONDS", pageWidth / 2, 50, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`${quarter} ${year}`, pageWidth / 2, 58, { align: 'center' });

    // ===== TABLEAU =====
    const tableData = [];
    const quarterRatio = 0.25;

    // Section Charges Générales
    if (details.general && details.general.items.length > 0) {
        tableData.push([{ content: 'Charges Générales', colSpan: 3, styles: { fillColor: [200, 200, 200], fontStyle: 'bold' } }]);
        details.general.items.forEach(item => {
            tableData.push([`- ${item.name}`, fmtEuro(item.base), fmtEuro(item.montant)]);
        });
        tableData.push([
            { content: `Quote-part (${owner.tantiemes}/${details.general.divisor} t.)`, colSpan: 2, styles: { halign: 'right', fontStyle: 'italic' } },
            { content: fmtEuro(details.general.total), styles: { halign: 'right', fontStyle: 'bold', textColor: [0, 51, 102] } }
        ]);
    }

    // Section Charges Syndic & Entretien
    if (details.special && details.special.items.length > 0) {
        tableData.push([{ content: 'Charges Syndic & Entretien', colSpan: 3, styles: { fillColor: [200, 200, 200], fontStyle: 'bold' } }]);
        details.special.items.forEach(item => {
            tableData.push([`- ${item.name}`, fmtEuro(item.base), fmtEuro(item.montant)]);
        });
        if (owner.exoGest) {
            tableData.push([
                { content: 'Exonéré de ces charges', colSpan: 2, styles: { fontStyle: 'italic', textColor: [150, 150, 150] } },
                { content: '0.00 €', styles: { halign: 'right' } }
            ]);
        } else {
            tableData.push([
                { content: `Quote-part (${owner.tantiemes}/${details.special.divisor} t.)`, colSpan: 2, styles: { halign: 'right', fontStyle: 'italic' } },
                { content: fmtEuro(details.special.total), styles: { halign: 'right', fontStyle: 'bold', textColor: [0, 51, 102] } }
            ]);
        }
    }

    // Section Charges Ménage
    if (details.menage && details.menage.items.length > 0) {
        tableData.push([{ content: 'Charges Ménage', colSpan: 3, styles: { fillColor: [200, 200, 200], fontStyle: 'bold' } }]);
        details.menage.items.forEach(item => {
            tableData.push([`- ${item.name}`, fmtEuro(item.base), fmtEuro(item.montant)]);
        });
        if (owner.exoMen) {
            tableData.push([
                { content: 'Exonéré de ces charges', colSpan: 2, styles: { fontStyle: 'italic', textColor: [150, 150, 150] } },
                { content: '0.00 €', styles: { halign: 'right' } }
            ]);
        } else {
            tableData.push([
                { content: `Quote-part (${owner.tantiemes}/${details.menage.divisor} t.)`, colSpan: 2, styles: { halign: 'right', fontStyle: 'italic' } },
                { content: fmtEuro(details.menage.total), styles: { halign: 'right', fontStyle: 'bold', textColor: [0, 51, 102] } }
            ]);
        }
    }

    // Section Charges Travaux
    if (details.travaux) {
        tableData.push([{ content: 'Charges Travaux', colSpan: 3, styles: { fillColor: [200, 200, 200], fontStyle: 'bold' } }]);
        if (details.travaux.items && details.travaux.items.length > 0) {
            details.travaux.items.forEach(item => {
                tableData.push([`- ${item.name}`, fmtEuro(item.base), fmtEuro(item.montant)]);
            });
        }
        tableData.push([
            { content: `Quote-part (${owner.tantiemes}/1000 t.)`, colSpan: 2, styles: { halign: 'right', fontStyle: 'italic' } },
            { content: fmtEuro(details.travaux.total), styles: { halign: 'right', fontStyle: 'bold', textColor: [0, 51, 102] } }
        ]);
    }

    // Section Eau
    if (details.water) {
        tableData.push([{ content: 'Eau & Compteurs', colSpan: 3, styles: { fillColor: [200, 200, 200], fontStyle: 'bold' } }]);
        tableData.push(['Provision Eau', fmtEuro(details.water.annual || 0), fmtEuro(details.water.period || 0)]);
    }

    // TOTAL
    const grandTotal = (details.general?.total || 0) + (details.special?.total || 0) +
        (details.menage?.total || 0) + (details.travaux?.total || 0) +
        (details.water?.period || 0);
    tableData.push([
        { content: '', colSpan: 1 },
        { content: 'TOTAL À PAYER', styles: { halign: 'right', fontStyle: 'bold', textColor: [180, 0, 0] } },
        { content: fmtEuro(grandTotal), styles: { halign: 'right', fontStyle: 'bold', textColor: [180, 0, 0] } }
    ]);

    autoTable(doc, {
        startY: 70,
        head: [['Poste', 'Base Annuelle', 'Montant Période']],
        body: tableData,
        theme: 'plain',
        headStyles: { fillColor: [66, 66, 66], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: {
            0: { cellWidth: 90 },
            1: { halign: 'right', cellWidth: 45 },
            2: { halign: 'right', cellWidth: 45 }
        }
    });

    // ===== FOOTER =====
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(`À régler avant le 15 du premier mois du trimestre.`, 15, finalY);

    return doc;
}

/**
 * Génère un PDF de fiche relevés eau.
 * @param {Array} owners - Liste des propriétaires avec compteur
 * @param {Object} water - Données eau { readings, meters, activeQuarter }
 * @param {string} quarter - Trimestre
 * @returns {jsPDF} Document PDF
 */
export function generateWaterReadingsPDF(owners, water, quarter) {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Relevé de Compteurs Eau", 105, 15, { align: 'center' });
    doc.setFontSize(11);
    doc.text(`Période : ${quarter} - ${new Date().getFullYear()}`, 105, 22, { align: 'center' });

    const rows = owners
        .filter(o => !o.isCommon && o.hasMeter)
        .map(o => {
            const meterId = water.meters?.[o.id] || "";
            const reading = water.readings?.[quarter]?.[o.id] || { old: 0, new: 0 };
            return [o.name, `${o.apt} - ${o.lot}`, meterId, reading.old.toString(), ""];
        });

    autoTable(doc, {
        startY: 30,
        head: [['Propriétaire', 'Lot / Appt', 'N° Compteur', 'Ancien Index', 'Nouvel Index']],
        body: rows,
        theme: 'grid',
        headStyles: { fillColor: [44, 62, 80] },
        columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 40 },
            2: { cellWidth: 35 },
            3: { cellWidth: 25, halign: 'center' },
            4: { cellWidth: 35 }
        },
        styles: { minCellHeight: 12, valign: 'middle' }
    });

    return doc;
}

/**
 * Génère un PDF de fiche copropriétaire.
 * @param {Object} owner - Propriétaire complet
 * @returns {jsPDF} Document PDF
 */
export function generateOwnerSheetPDF(owner) {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Fiche Copropriétaire : ${owner.name}`, 14, 20);

    doc.setFontSize(12);
    doc.text(`Appartement : ${owner.apt}`, 14, 30);
    doc.text(`Email : ${owner.email || 'Non renseigné'}`, 14, 38);
    doc.text(`Lots : ${owner.lot}`, 14, 46);
    doc.text(`Tantièmes : ${owner.tantiemes} / 1000`, 14, 54);

    autoTable(doc, {
        startY: 65,
        head: [['Propriété', 'Valeur']],
        body: [
            ['Exonération Syndic', owner.exoGest ? 'OUI' : 'NON'],
            ['Exonération Ménage', owner.exoMen ? 'OUI' : 'NON'],
            ['Compteur individuel', owner.hasMeter ? 'OUI' : 'NON'],
        ],
    });

    return doc;
}
