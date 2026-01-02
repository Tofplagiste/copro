/**
 * RepartitionTab - Onglet répartition des tantièmes par copropriétaire
 */
import { useState } from 'react';
import { Plus, Edit, Trash2, FileText, Download, Loader2, AlertCircle } from 'lucide-react';
import { useCarnetData } from '../context/CarnetSupabaseContext';
import { ConfirmModal } from '../../../components/Modal';
import { setupPDF, addHeader, addFooter } from '../../../utils/pdfBase';
import { autoTable } from 'jspdf-autotable';
import OwnerEditModal from '../components/repartition/OwnerEditModal';

export default function RepartitionTab() {
    const { state, addProprietaire, updateProprietaire, deleteProprietaire, updateOwnerLots, loading, error } = useCarnetData();
    const [editModal, setEditModal] = useState({ open: false, data: null });
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
    if (error) return <div className="p-4 bg-red-50 text-red-600 rounded flex items-center gap-2"><AlertCircle size={20} />{error}</div>;

    const proprietaires = state.proprietaires || [];
    const totalTantiemes = proprietaires.reduce((sum, p) => sum + (p.tantiemes || 0), 0);
    const totalGestion = proprietaires.filter(p => p.gestion).reduce((sum, p) => sum + p.gestion, 0);
    const totalMenage = proprietaires.filter(p => p.menage).reduce((sum, p) => sum + p.menage, 0);

    const handleExportGlobalPDF = () => {
        const doc = setupPDF();
        let y = addHeader(doc, "RÉPARTITION DES CHARGES", "Année 2025");

        const tableBody = proprietaires.map(p => [
            p.name,
            p.lots || '-',
            `${p.tantiemes || 0} / 1000`
        ]);

        autoTable(doc, {
            startY: y,
            head: [['Propriétaire', 'Lots', 'Tantièmes']],
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: [40, 40, 40], textColor: 255 },
            styles: { fontSize: 10, cellPadding: 3 },
            margin: { bottom: 20 }
        });

        addFooter(doc);
        doc.save("Repartition_Tantiemes.pdf");
    };

    const handleExportFichePDF = (proprio) => {
        const doc = setupPDF();
        let y = addHeader(doc, "Fiche Propriétaire", proprio.name);

        const Field = ({ label, value }) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.text(label, 15, y);

            // Ligne de champ
            doc.setDrawColor(240);
            doc.setFillColor(250);
            doc.roundedRect(15, y + 2, 180, 8, 1, 1, 'F');
            doc.setDrawColor(200);

            doc.setFont("helvetica", "normal");
            doc.text(String(value || ''), 18, y + 7);
            y += 15;
        };

        const Section = (title) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text(title, 15, y);
            y += 6;
            // Ligne soulignement
            doc.setLineWidth(0.5);
            doc.line(15, y - 2, 50, y - 2);
            y += 4;
        };

        y += 5;

        // --- CHAMPS ---
        Field({ label: "Nom :", value: proprio.name });
        Field({ label: "Lot :", value: proprio.lots });
        Field({ label: "Tantièmes :", value: proprio.tantiemes });

        y += 5;
        Section("Coordonnées");
        Field({ label: "Adresse :", value: proprio.address });

        Section("Téléphones");
        Field({ label: "", value: proprio.phone });

        Section("Emails");
        Field({ label: "", value: proprio.email });

        y += 5;
        Section("Répartition");
        Field({ label: "Gestion :", value: proprio.gestion ? `${proprio.gestion}%` : "Exonéré" });
        Field({ label: "Ménage :", value: proprio.menage ? `${proprio.menage}%` : "Exonéré" });

        addFooter(doc);
        doc.save(`Fiche_${proprio.name.replace(/\s+/g, '_')}.pdf`);
    };

    const handleSaveOwner = async (ownerData, selectedLotIds) => {
        if (editModal.data?.id) {
            // Update existing owner
            await updateProprietaire(editModal.data.id, ownerData);
            await updateOwnerLots(editModal.data.id, selectedLotIds);
        } else {
            // Add new owner, then assign lots
            const result = await addProprietaire(ownerData);
            if (result?.id) {
                await updateOwnerLots(result.id, selectedLotIds);
            }
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
                    PDF Répartition
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[800px]">
                        <thead className="bg-blue-600 text-white">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold">Propriétaire</th>
                                <th className="px-4 py-3 text-left font-semibold">Lot</th>
                                <th className="px-4 py-3 text-center font-semibold">Balcon</th>
                                <th className="px-4 py-3 text-center font-semibold">Tant.</th>
                                <th className="px-4 py-3 text-center font-semibold">Gestion</th>
                                <th className="px-4 py-3 text-center font-semibold">Ménage</th>
                                <th className="px-4 py-3 text-left font-semibold">Infos</th>
                                <th className="px-4 py-3 text-center font-semibold w-32">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proprietaires.map(proprio => (
                                <tr key={proprio.id} className="border-b hover:bg-slate-50">
                                    <td className="px-4 py-3 font-bold text-slate-800">{proprio.name}</td>
                                    <td className="px-4 py-3 text-slate-600">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-700">
                                                {proprio.lot || '-'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {proprio.ownerLots?.some(l => l.type_balcon === 'grand') && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">Grand</span>}
                                        {proprio.ownerLots?.some(l => l.type_balcon === 'petit') && !proprio.ownerLots?.some(l => l.type_balcon === 'grand') && <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs font-bold">Petit</span>}
                                        {(!proprio.ownerLots?.length || proprio.ownerLots?.every(l => !l.type_balcon || l.type_balcon === 'aucun')) && <span className="text-slate-400 text-xs">-</span>}
                                    </td>
                                    <td className="px-4 py-3 text-center font-bold text-blue-600">{proprio.tantiemes || 0}</td>
                                    <td className="px-4 py-3 text-center">
                                        {proprio.gestion != null ? (
                                            <span>{Number(proprio.gestion).toFixed(2)}%</span>
                                        ) : (
                                            <span className="text-red-500 italic text-xs">Exonéré</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {proprio.menage != null ? (
                                            <span>{Number(proprio.menage).toFixed(2)}%</span>
                                        ) : (
                                            <span className="text-red-500 italic text-xs">Exonéré</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-500">{proprio.infos}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-center gap-1">
                                            <button
                                                onClick={() => handleExportFichePDF(proprio)}
                                                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full"
                                                title="Fiche PDF"
                                            >
                                                <FileText size={14} />
                                            </button>
                                            <button
                                                onClick={() => setEditModal({ open: true, data: proprio })}
                                                className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-600 rounded-full"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm({ open: true, id: proprio.id })}
                                                className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-slate-100 font-bold">
                            <tr>
                                <td colSpan="3" className="px-4 py-3 text-slate-700">TOTAL</td>
                                <td className="px-4 py-3 text-center text-blue-600">{totalTantiemes}</td>
                                <td className="px-4 py-3 text-center">{totalGestion.toFixed(0)}%</td>
                                <td className="px-4 py-3 text-center">{totalMenage.toFixed(0)}%</td>
                                <td colSpan="2"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            <OwnerEditModal
                key={editModal.data?.id || 'new'}
                isOpen={editModal.open}
                onClose={() => setEditModal({ open: false, data: null })}
                initialData={editModal.data}
                lots={state.lots || []}
                owners={proprietaires}
                onSave={handleSaveOwner}
            />

            {/* Confirm Delete */}
            <ConfirmModal
                isOpen={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, id: null })}
                onConfirm={() => deleteProprietaire(deleteConfirm.id)}
                title="Supprimer ce propriétaire ?"
                message="Cette action est irréversible."
                confirmText="Supprimer"
                variant="danger"
            />
        </div>
    );
}
