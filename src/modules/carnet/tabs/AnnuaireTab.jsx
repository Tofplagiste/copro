/**
 * AnnuaireTab - Annuaire des copropriétaires avec contacts
 */
import { Phone, Mail, MapPin, Download } from 'lucide-react';
import { useCarnet } from '../../../context/CarnetContext';
import { setupPDF, addHeader, addFooter } from '../../../utils/pdfBase';
import { autoTable } from 'jspdf-autotable';

export default function AnnuaireTab() {
    const { state } = useCarnet();
    const proprietaires = state.proprietaires || [];

    const handleExportPDF = () => {
        const doc = setupPDF();
        let y = addHeader(doc, "ANNUAIRE DES COPROPRIÉTAIRES", "Contacts & Coordonnées");

        const tableBody = proprietaires.map(p => [
            p.name,
            p.phone || '-',
            p.email || '-',
            p.address || '-'
        ]);

        autoTable(doc, {
            startY: y,
            head: [['Propriétaire', 'Téléphone', 'Email', 'Adresse']],
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: [70, 70, 70], textColor: 255 },
            styles: { fontSize: 8, cellPadding: 2 },
            columnStyles: {
                0: { cellWidth: 40, fontStyle: 'bold' },
                1: { cellWidth: 30 },
                2: { cellWidth: 50 },
                3: { cellWidth: 'auto' }
            },
            margin: { bottom: 20 }
        });

        addFooter(doc);
        doc.save("Annuaire_Copro.pdf");
    };

    return (
        <div className="p-4">
            {/* Actions */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={handleExportPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-semibold transition-colors">
                    <Download size={18} />
                    Imprimer Annuaire
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[600px]">
                        <thead className="bg-blue-600 text-white">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold">Nom</th>
                                <th className="px-4 py-3 text-left font-semibold">Contacts (Tél / Email)</th>
                                <th className="px-4 py-3 text-left font-semibold">Adresse</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proprietaires.map(proprio => (
                                <tr key={proprio.id} className="border-b hover:bg-slate-50">
                                    <td className="px-4 py-3 font-bold text-slate-800">{proprio.name}</td>
                                    <td className="px-4 py-3">
                                        <div className="space-y-1">
                                            {proprio.phone && (
                                                <a
                                                    href={`tel:${proprio.phone}`}
                                                    className="flex items-center gap-2 text-blue-600 hover:underline"
                                                >
                                                    <Phone size={14} />
                                                    {proprio.phone}
                                                </a>
                                            )}
                                            {proprio.email && (
                                                <a
                                                    href={`mailto:${proprio.email}`}
                                                    className="flex items-center gap-2 text-blue-600 hover:underline"
                                                >
                                                    <Mail size={14} />
                                                    {proprio.email}
                                                </a>
                                            )}
                                            {!proprio.phone && !proprio.email && (
                                                <span className="text-slate-400 italic">Aucun contact</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {proprio.address ? (
                                            <div className="flex items-start gap-2 text-slate-600">
                                                <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                                                <span>{proprio.address}</span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 italic">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
