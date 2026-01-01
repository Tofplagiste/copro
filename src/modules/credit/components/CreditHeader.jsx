/**
 * CreditHeader - En-tête du simulateur de crédit
 * Contient le titre, le bouton retour et les actions
 */
import { Link } from 'react-router-dom';
import { ArrowLeft, Calculator, Download, FileText } from 'lucide-react';

/**
 * @param {Object} props
 * @param {Function} props.onExportPdf - Callback pour export PDF
 */
export default function CreditHeader({ onExportPdf }) {
    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        to="/"
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-sm text-slate-600"
                    >
                        <ArrowLeft size={16} />
                        Hub
                    </Link>
                    <div className="flex items-center gap-2">
                        <Calculator size={24} className="text-indigo-600" />
                        <div>
                            <h1 className="font-bold text-lg text-slate-800">Simulateur de Crédit Copropriété</h1>
                            <p className="text-xs text-slate-500">9 Rue André Leroux - Soulac-sur-Mer (33780)</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2">
                        <Download size={16} />
                        Sauvegarder
                    </button>
                    <button onClick={onExportPdf} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2">
                        <FileText size={16} />
                        PDF
                    </button>
                </div>
            </div>
        </header>
    );
}
