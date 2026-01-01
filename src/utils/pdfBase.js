/**
 * pdfBase.js - Socle PDF partagé pour l'application Copro
 * 
 * CE FICHIER NE CONTIENT QUE DES FONCTIONS GÉNÉRIQUES.
 * Les fonctions spécialisées doivent être dans les modules correspondants :
 * - src/modules/gestion/utils/pdfGestion.js
 * - src/modules/credit/utils/pdfCredit.js
 * - src/modules/vote/utils/pdfVote.js
 * - src/modules/carnet/utils/pdfCarnet.js
 */
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

// =============================================================================
// CRÉATION ET CONFIGURATION
// =============================================================================

/**
 * Crée un nouveau document PDF avec configuration par défaut
 * @param {'portrait' | 'landscape'} orientation
 * @returns {jsPDF} Document PDF configuré
 */
export function createPDF(orientation = 'portrait') {
    const doc = new jsPDF(orientation);
    doc.setFont('helvetica', 'normal');
    return doc;
}

/**
 * Alias pour compatibilité avec l'ancien pdfUtils.js
 * @returns {jsPDF} Document PDF configuré
 */
export const setupPDF = () => createPDF('portrait');

// =============================================================================
// EN-TÊTES ET PIEDS DE PAGE
// =============================================================================

/**
 * Ajoute l'en-tête standard "Copro Les Pyrénées"
 * @param {jsPDF} doc 
 * @param {string} title - Titre du document
 * @param {string} subtitle - Sous-titre (optionnel)
 * @returns {number} Position Y pour commencer le contenu
 */
export function addHeader(doc, title, subtitle = '') {
    const pageWidth = doc.internal.pageSize.width;
    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR');
    const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    // Date/Heure en haut à gauche
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`${dateStr} ${timeStr}`, 15, 10);

    // Titre de l'appli en haut à droite
    doc.text('Gestion Copro - V19', pageWidth - 15, 10, { align: 'right' });

    // Titre Principal centré
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text(title.toUpperCase(), pageWidth / 2, 25, { align: 'center' });

    // Sous-titre
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Copropriété Les Pyrénées - 33780 Soulac-sur-Mer', pageWidth / 2, 32, { align: 'center' });

    if (subtitle) {
        doc.text(subtitle, pageWidth / 2, 37, { align: 'center' });
    } else {
        doc.text(`Edité le ${dateStr}`, pageWidth / 2, 37, { align: 'center' });
    }

    // Ligne de séparation
    doc.setLineWidth(0.5);
    doc.line(15, 42, pageWidth - 15, 42);

    return 50;
}

/**
 * Ajoute un en-tête simple (sans date/heure)
 * @param {jsPDF} doc
 * @param {string} title
 * @param {string} subtitle
 * @param {number} startY
 * @returns {number} Position Y après l'en-tête
 */
export function addSimpleHeader(doc, title, subtitle = '', startY = 15) {
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
 * Ajoute un footer avec numérotation de page
 * @param {jsPDF} doc 
 */
export function addFooter(doc) {
    const pageCount = doc.internal.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`Page ${i}/${pageCount}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
    }
}

// =============================================================================
// SECTIONS ET CONTENU
// =============================================================================

/**
 * Ajoute un titre de section stylisé avec index optionnel
 * @param {jsPDF} doc 
 * @param {string} title 
 * @param {number} y 
 * @param {string|null} index - Numéro de section (ex: "I", "II", "1", "2")
 * @returns {number} Position Y après la section
 */
export function addSectionIdx(doc, title, y, index = null) {
    doc.setFillColor(240, 240, 240);
    doc.rect(15, y, doc.internal.pageSize.width - 30, 8, 'F');
    doc.setDrawColor(0);
    doc.rect(15, y, doc.internal.pageSize.width - 30, 8, 'S');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    const text = index ? `${index}. ${title}` : title;
    doc.text(text, 18, y + 5.5);

    return y + 15;
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

// =============================================================================
// TABLEAUX
// =============================================================================

/**
 * Ajoute un tableau au document avec styles par défaut
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

// =============================================================================
// UTILITAIRES
// =============================================================================

/**
 * Vérifie si un saut de page est nécessaire
 * @param {jsPDF} doc 
 * @param {number} y - Position Y actuelle
 * @param {number} margin - Marge de sécurité
 * @returns {number} Position Y (nouvelle page si nécessaire)
 */
export function checkPageBreak(doc, y, margin = 20) {
    const pageHeight = doc.internal.pageSize.height;
    if (y > pageHeight - margin) {
        doc.addPage();
        return 20;
    }
    return y;
}

/**
 * Formate un nombre en euros
 * @param {number} value
 * @returns {string} Valeur formatée (ex: "1 234,56 €")
 */
export function fmtEuro(value) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2
    }).format(value || 0);
}

/**
 * Formate un nombre en devise (sans décimales)
 * @param {number} num
 * @returns {string} Montant formaté avec symbole €
 */
export function formatMoney(num) {
    return num.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' €';
}

/**
 * Sauvegarde et télécharge le PDF
 * @param {jsPDF} doc
 * @param {string} filename
 */
export function savePDF(doc, filename) {
    doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}

// Export de autoTable pour usage direct si nécessaire
export { autoTable };
