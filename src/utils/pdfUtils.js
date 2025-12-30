import { jsPDF } from 'jspdf';

/**
 * Configure la police et les styles de base
 */
export const setupPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");
    return doc;
};


/**
 * Ajoute l'en-tête standard "Copro Les Pyrénées"
 * @param {jsPDF} doc 
 * @param {string} title - Titre du document
 * @param {string} subtitle - Sous-titre (optionnel)
 */
export const addHeader = (doc, title, subtitle = "") => {
    const pageWidth = doc.internal.pageSize.width;
    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR');
    const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    // Date/Heure en haut à gauche
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`${dateStr} ${timeStr}`, 15, 10);

    // Titre de l'appli en haut à droite
    doc.text("Gestion Copro - V19 (Carnet Complet)", pageWidth - 15, 10, { align: 'right' });

    // Titre Principal centré
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0); // Noir
    doc.text(title.toUpperCase(), pageWidth / 2, 25, { align: 'center' });

    // Sous-titre (Nom de la copro + Date)
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Copropriété Les Pyrénées - 33780 Soulac-sur-Mer`, pageWidth / 2, 32, { align: 'center' });

    if (subtitle) {
        doc.text(subtitle, pageWidth / 2, 37, { align: 'center' });
    } else {
        doc.text(`Edité le ${dateStr}`, pageWidth / 2, 37, { align: 'center' });
    }

    // Ligne de séparation
    doc.setLineWidth(0.5);
    doc.line(15, 42, pageWidth - 15, 42);

    return 50; // Retourne la position Y pour commencer le contenu
};

/**
 * Ajoute un titre de section stylisé
 * @param {jsPDF} doc 
 * @param {string} title 
 * @param {number} y 
 */
export const addSectionIdx = (doc, title, y, index = null) => {
    doc.setFillColor(240, 240, 240); // Gris clair
    doc.rect(15, y, doc.internal.pageSize.width - 30, 8, 'F');
    doc.setDrawColor(0);
    doc.rect(15, y, doc.internal.pageSize.width - 30, 8, 'S'); // Bordure

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    const text = index ? `${index}. ${title}` : title;
    doc.text(text, 18, y + 5.5);

    return y + 15; // Y après la section
};

/**
 * Ajoute un footer avec numérotation de page
 * @param {jsPDF} doc 
 */
export const addFooter = (doc) => {
    const pageCount = doc.internal.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`Page ${i}/${pageCount}`, pageWidth - 15, pageHeight - 10, { align: 'right' });

        // Optionnel : Ajout du chemin fichier pour faire "vrai" comme sur la capture
        // doc.text(`file:///C:/Users/.../Gestion_Copro_Complet.html`, 15, pageHeight - 10);
    }
};

/**
 * Helpers pour check page break
 */
export const checkPageBreak = (doc, y, margin = 20) => {
    const pageHeight = doc.internal.pageSize.height;
    if (y > pageHeight - margin) {
        doc.addPage();
        return 20; // Nouvelle position Y en haut de page
    }
    return y;
};
