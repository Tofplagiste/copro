/**
 * PrestatairesTab - Liste des prestataires de la copropriété
 */
import { useState } from 'react';
import { Plus, Edit, Trash2, FileText, Download, Phone, Mail, Key, Loader2, AlertCircle } from 'lucide-react';
import { useCarnetData } from '../context/CarnetSupabaseContext';
import { ConfirmModal } from '../../../components/Modal';
import { setupPDF, addHeader, addFooter } from '../../../utils/pdfBase';
import { autoTable } from 'jspdf-autotable';
import PrestaEditModal from '../components/prestataires/PrestaEditModal';

export default function PrestatairesTab() {
    const { state, addPrestataire, updatePrestataire, deletePrestataire, loading, error } = useCarnetData();
    const [editModal, setEditModal] = useState({ open: false, data: null });
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
    if (error) return <div className="p-4 bg-red-50 text-red-600 rounded flex items-center gap-2"><AlertCircle size={20} />{error}</div>;

    const prestataires = state.prestataires || [];

    const handleExportGlobalPDF = () => {
        const doc = setupPDF();
        let y = addHeader(doc, "CONTRATS & PRESTATAIRES", "Liste des contrats en cours");

        const tableBody = prestataires.map(p => [
            p.name,
            p.contrat || '-',
            p.contact || '-',
            (p.phones || []).join('\n'),
            (p.emails || []).join('\n')
        ]);

        autoTable(doc, {
            startY: y,
            head: [['Société', 'Contrat', 'Contact', 'Téléphones', 'Emails']],
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: [30, 41, 59], textColor: 255 }, // Slate-800
            styles: { fontSize: 8, cellPadding: 2, valign: 'middle' },
            columnStyles: {
                0: { cellWidth: 35, fontStyle: 'bold' },
                1: { cellWidth: 25 },
                2: { cellWidth: 30 },
                3: { cellWidth: 35 },
                4: { cellWidth: 'auto' }
            },
            margin: { bottom: 20 }
        });

        addFooter(doc);
        doc.save("Prestataires_Contrats.pdf");
    };

    const handleExportFichePDF = (prest) => {
        const doc = setupPDF();
        let y = addHeader(doc, "Fiche Prestataire", prest.name);

        const Field = ({ label, value }) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.text(label, 15, y);
            // Ligne de champ
            doc.setDrawColor(240);
            doc.setFillColor(250);
            doc.roundedRect(15, y + 2, 180, 8, 1, 1, 'F');

            doc.setFont("helvetica", "normal");
            doc.text(String(value || ''), 18, y + 7);
            y += 15;
        };

        const TextArea = ({ label, values }) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.text(label, 15, y);

            const height = Math.max(8, values.length * 6 + 4);
            doc.setDrawColor(240);
            doc.setFillColor(250);
            doc.roundedRect(15, y + 2, 180, height, 1, 1, 'F');

            doc.setFont("helvetica", "normal");
            if (values.length > 0) {
                values.forEach((v, i) => {
                    doc.text(v, 18, y + 7 + (i * 5));
                });
            } else {
                doc.text("-", 18, y + 7);
            }
            y += height + 7;
        };

        y += 5;
        Field({ label: "Société :", value: prest.name });
        Field({ label: "Contrat :", value: prest.contrat });

        const Section = (title) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text(title, 15, y);
            y += 6;
            doc.setLineWidth(0.5);
            doc.line(15, y - 2, 50, y - 2);
            y += 4;
        };

        y += 5;
        Section("Coordonnées");

        Field({ label: "Adresse :", value: prest.address });
        Field({ label: "Interlocuteur :", value: prest.contact });

        Section("Contacts");
        TextArea({ label: "Téléphones :", values: prest.phones || [] });
        TextArea({ label: "Emails :", values: prest.emails || [] });

        if (prest.codes?.id || prest.codes?.mdp) {
            y += 5;
            Section("Accès");
            Field({ label: "ID :", value: prest.codes?.id });
            Field({ label: "MDP :", value: prest.codes?.mdp });
        }

        addFooter(doc);
        doc.save(`Fiche_Prestataire_${prest.name.replace(/\s+/g, '_')}.pdf`);
    };

    const handleSave = (data) => {
        if (editModal.data?.id) {
            updatePrestataire(editModal.data.id, data);
        } else {
            addPrestataire(data);
        }
        setEditModal({ open: false, data: null });
    };

    return (
        <div className="p-4">
            {/* Actions */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => setEditModal({ open: true, data: null })}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold transition-colors"
                >
                    <Plus size={18} />
                    Nouveau
                </button>
                <button
                    onClick={handleExportGlobalPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-semibold transition-colors">
                    <Download size={18} />
                    PDF Liste
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[800px]">
                        <thead className="bg-blue-600 text-white">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold">Nom</th>
                                <th className="px-4 py-3 text-left font-semibold">Contrat</th>
                                <th className="px-4 py-3 text-left font-semibold">Interlocuteur</th>
                                <th className="px-4 py-3 text-left font-semibold">Contacts</th>
                                <th className="px-4 py-3 text-left font-semibold">Adresse</th>
                                <th className="px-4 py-3 text-left font-semibold">Codes</th>
                                <th className="px-4 py-3 text-center font-semibold w-32">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prestataires.map(prest => (
                                <tr key={prest.id} className="border-b hover:bg-slate-50">
                                    <td className="px-4 py-3 font-bold text-slate-800">{prest.name}</td>
                                    <td className="px-4 py-3 text-slate-600 text-xs">{prest.contrat}</td>
                                    <td className="px-4 py-3 font-semibold">{prest.contact || '-'}</td>
                                    <td className="px-4 py-3">
                                        <div className="space-y-1">
                                            {(prest.phones || []).map((phone, i) => (
                                                <a key={i} href={`tel:${phone}`} className="flex items-center gap-1 text-blue-600 hover:underline text-xs">
                                                    <Phone size={12} />{phone}
                                                </a>
                                            ))}
                                            {(prest.emails || []).map((email, i) => (
                                                <a key={i} href={`mailto:${email}`} className="flex items-center gap-1 text-blue-600 hover:underline text-xs">
                                                    <Mail size={12} />{email}
                                                </a>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-600">{prest.address}</td>
                                    <td className="px-4 py-3">
                                        {prest.codes?.id && (
                                            <div className="text-xs">
                                                <div className="flex items-center gap-1"><Key size={10} />ID: {prest.codes.id}</div>
                                                <div className="text-slate-500">MDP: {prest.codes.mdp}</div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-center gap-1">
                                            <button
                                                onClick={() => handleExportFichePDF(prest)}
                                                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full"
                                                title="Fiche PDF">
                                                <FileText size={14} />
                                            </button>
                                            <button
                                                onClick={() => setEditModal({ open: true, data: prest })}
                                                className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-600 rounded-full"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm({ open: true, id: prest.id })}
                                                className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            <PrestaEditModal
                key={editModal.data?.id || 'new'}
                isOpen={editModal.open}
                onClose={() => setEditModal({ open: false, data: null })}
                initialData={editModal.data}
                onSave={handleSave}
            />

            {/* Confirm Delete */}
            <ConfirmModal
                isOpen={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, id: null })}
                onConfirm={() => deletePrestataire(deleteConfirm.id)}
                title="Supprimer ce prestataire ?"
                message="Cette action est irréversible."
                confirmText="Supprimer"
                variant="danger"
            />
        </div>
    );
}
