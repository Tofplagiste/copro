/**
 * Configuration globale pour les tests React
 * Ce fichier est chargé automatiquement par Vitest avant chaque test
 * 
 * Le mock jsPDF est complet pour permettre à jspdf-autotable de fonctionner
 */
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Variables pour tracker les appels save (pour vérifier que le PDF est téléchargé)
export const pdfMockCalls = {
    save: [],
    reset() {
        this.save = [];
    }
};

// Mock complet pour jsPDF avec toutes les méthodes internes nécessaires à jspdf-autotable
vi.mock('jspdf', () => {
    class MockJsPDF {
        constructor(orientation = 'portrait', unit = 'mm', format = 'a4') {
            this.orientation = orientation;
            this.lastAutoTable = { finalY: 100 };
            this.currentPage = 1;
            this.pages = [1];

            // Internal state
            this._fontSize = 12;
            this._font = { fontName: 'helvetica', fontStyle: 'normal' };
            this._textColor = { r: 0, g: 0, b: 0 };
            this._drawColor = { r: 0, g: 0, b: 0 };
            this._fillColor = { r: 0, g: 0, b: 0 };
            this._lineWidth = 0.2;

            const pageWidth = orientation === 'landscape' ? 297 : 210;
            const pageHeight = orientation === 'landscape' ? 210 : 297;

            this.internal = {
                pageSize: {
                    getWidth: () => pageWidth,
                    getHeight: () => pageHeight,
                    width: pageWidth,
                    height: pageHeight
                },
                getFontSize: () => this._fontSize,
                getFont: () => this._font,
                getLineHeight: () => this._fontSize * 1.15,
                getLineHeightFactor: () => 1.15,
                scaleFactor: 1,
                pages: this.pages,
                getNumberOfPages: () => this.pages.length,
                getCurrentPageInfo: () => ({ pageNumber: this.currentPage }),
                getEncryptor: () => null,
                write: () => { },
                getCoordinateString: (x) => String(x),
                getVerticalCoordinateString: (y) => String(y),
                getCharWidthsArray: (text) => Array(text.length).fill(5),
                getTextDimensions: (text) => ({ w: text.length * 3, h: this._fontSize })
            };
        }

        save(filename) {
            pdfMockCalls.save.push(filename);
        }

        // Font methods
        getFontList() {
            return {
                helvetica: ['normal', 'bold', 'italic', 'bolditalic'],
                times: ['normal', 'bold', 'italic', 'bolditalic'],
                courier: ['normal', 'bold', 'italic', 'bolditalic']
            };
        }
        getFont() { return this._font; }
        setFont(fontName, fontStyle) {
            this._font = { fontName: fontName || 'helvetica', fontStyle: fontStyle || 'normal' };
            return this;
        }
        getFontSize() { return this._fontSize; }
        setFontSize(size) { this._fontSize = size; return this; }

        // Text methods
        text(text, x, y, options) { return this; }
        getTextWidth(text) { return (text?.length || 0) * 2; }
        getStringUnitWidth(text) { return (text?.length || 0) * 0.5; }
        getTextDimensions(text) { return { w: (text?.length || 0) * 3, h: this._fontSize }; }
        splitTextToSize(text, maxLen) { return [text]; }

        // Color methods
        setTextColor(r, g, b) { this._textColor = { r, g, b }; return this; }
        setDrawColor(r, g, b) { this._drawColor = { r, g, b }; return this; }
        setFillColor(r, g, b) { this._fillColor = { r, g, b }; return this; }
        getTextColor() { return `${this._textColor.r} ${this._textColor.g} ${this._textColor.b}`; }
        getDrawColor() { return `${this._drawColor.r} ${this._drawColor.g} ${this._drawColor.b}`; }
        getFillColor() { return `${this._fillColor.r} ${this._fillColor.g} ${this._fillColor.b}`; }

        // Drawing methods
        rect(x, y, w, h, style) { return this; }
        line(x1, y1, x2, y2) { return this; }
        setLineWidth(w) { this._lineWidth = w; return this; }
        getLineWidth() { return this._lineWidth; }
        setLineCap(style) { return this; }
        setLineJoin(style) { return this; }
        circle(x, y, r, style) { return this; }
        ellipse(x, y, rx, ry, style) { return this; }
        triangle(x1, y1, x2, y2, x3, y3, style) { return this; }
        roundedRect(x, y, w, h, rx, ry, style) { return this; }

        // Page methods
        addPage() {
            this.currentPage++;
            this.pages.push(this.currentPage);
            return this;
        }
        setPage(n) { this.currentPage = n; return this; }
        getNumberOfPages() { return this.pages.length; }
        getCurrentPageInfo() { return { pageNumber: this.currentPage }; }

        // Misc methods
        setProperties(props) { return this; }
        output(type) { return type === 'blob' ? new Blob(['']) : ''; }
        getCharSpace() { return 0; }
        setCharSpace(space) { return this; }
        getCreationDate(type) { return new Date().toISOString(); }
        setCreationDate(date) { return this; }
        getLineHeightFactor() { return 1.15; }
        setLineHeightFactor(factor) { return this; }
        getR2L() { return false; }
        setR2L(value) { return this; }
    }

    return {
        jsPDF: MockJsPDF,
        default: MockJsPDF
    };
});

// Mock pour navigator.clipboard
const mockClipboardWrite = vi.fn().mockResolvedValue(undefined);
const mockClipboardWriteText = vi.fn().mockResolvedValue(undefined);

Object.defineProperty(navigator, 'clipboard', {
    value: {
        write: mockClipboardWrite,
        writeText: mockClipboardWriteText,
        read: vi.fn().mockResolvedValue([]),
        readText: vi.fn().mockResolvedValue('')
    },
    writable: true,
    configurable: true
});

// Mock pour ClipboardItem
global.ClipboardItem = class MockClipboardItem {
    constructor(data) {
        this.data = data;
        this.types = Object.keys(data);
    }
    getType(type) {
        return this.data[type];
    }
};

// Suppression des warnings React
const originalError = console.error;
console.error = (...args) => {
    if (
        typeof args[0] === 'string' &&
        (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
            args[0].includes('Warning: An update to'))
    ) {
        return;
    }
    originalError.call(console, ...args);
};
