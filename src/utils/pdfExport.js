/**
 * Utilitaires d'export PDF pour l'application Copro
 * Utilise jspdf et jspdf-autotable
 */
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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
    
    doc.autoTable({
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
