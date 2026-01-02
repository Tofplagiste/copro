/**
 * RepartitionTab - Onglet répartition des tantièmes par copropriétaire
 */
import { useState } from 'react';
import { Plus, Edit, Trash2, FileText, Download, User, Loader2, AlertCircle } from 'lucide-react';
import { useCarnetData } from '../context/CarnetSupabaseContext';
import Modal, { ConfirmModal } from '../../../components/Modal';
import { setupPDF, addHeader, addFooter } from '../../../utils/pdfBase';
import { autoTable } from 'jspdf-autotable';

export default function RepartitionTab() {
    const { state, addProprietaire, updateProprietaire, deleteProprietaire, loading, error } = useCarnetData();
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

    const handleSave = (e) => {
        e.preventDefault();
        const form = e.target;
        const data = {
            name: form.name.value,
            lot_principal: form.lot_principal.value,
            lot_annexe: form.lot_annexe.value,
            tantiemes: parseInt(form.tantiemes.value) || 0,
            gestion: form.gestion.value ? parseFloat(form.gestion.value) : null,
            menage: form.menage.value ? parseFloat(form.menage.value) : null,
            infos: form.infos.value,
            phone: form.phone.value,
            email: form.email.value,
            address: form.address.value
        };

        if (editModal.data?.id) {
            updateProprietaire(editModal.data.id, data);
        } else {
            addProprietaire(data);
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
                                <th className="px-4 py-3 text-left font-semibold">Détail Lots</th>
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
                                            <span className="font-semibold text-slate-700">P: {proprio.lot_principal || '-'}</span>
                                            {proprio.lot_annexe && (
                                                <span className="text-xs text-slate-500">A: {proprio.lot_annexe}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center font-bold text-blue-600">{proprio.tantiemes}</td>
                                    <td className="px-4 py-3 text-center">
                                        {proprio.gestion !== null ? (
                                            <span>{proprio.gestion.toFixed(2)}%</span>
                                        ) : (
                                            <span className="text-red-500 italic text-xs">Exonéré</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {proprio.menage !== null ? (
                                            <span>{proprio.menage.toFixed(2)}%</span>
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
                                <td colSpan="2" className="px-4 py-3 text-slate-700">TOTAL</td>
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
            <Modal
                isOpen={editModal.open}
                onClose={() => setEditModal({ open: false, data: null })}
                title={editModal.data?.id ? 'Modifier Propriétaire' : 'Nouveau Propriétaire'}
                size="lg"
            >
                <form onSubmit={handleSave} className="space-y-6">
                    {/* Section 1: Identité */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-3 text-blue-700 font-semibold border-b border-blue-100 pb-2">
                            <User size={18} />
                            Identification
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nom du propriétaire</label>
                                <input
                                    name="name"
                                    defaultValue={editModal.data?.name}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="Ex: M. DUPONT Jean"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Lot Principal</label>
                                <input
                                    name="lot_principal"
                                    defaultValue={editModal.data?.lot_principal}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Ex: 12"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Lot Annexe</label>
                                <input
                                    name="lot_annexe"
                                    defaultValue={editModal.data?.lot_annexe}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Ex: Parking 4"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Répartition (Grid 3 cols) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                            <label className="block text-sm font-bold text-blue-800 mb-1">Tantièmes</label>
                            <div className="relative">
                                <input
                                    name="tantiemes"
                                    type="number"
                                    defaultValue={editModal.data?.tantiemes}
                                    className="w-full pl-4 pr-8 py-2 bg-white border border-blue-200 rounded-lg font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                                <span className="absolute right-3 top-2.5 text-blue-400 text-xs font-bold">/1000</span>
                            </div>
                        </div>

                        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                            <label className="block text-sm font-medium text-emerald-800 mb-1">% Gestion</label>
                            <input
                                name="gestion"
                                type="number"
                                step="0.01"
                                defaultValue={editModal.data?.gestion}
                                className="w-full px-4 py-2 bg-white border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                placeholder="Vide = Exonéré"
                            />
                        </div>

                        <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                            <label className="block text-sm font-medium text-purple-800 mb-1">% Ménage</label>
                            <input
                                name="menage"
                                type="number"
                                step="0.01"
                                defaultValue={editModal.data?.menage}
                                className="w-full px-4 py-2 bg-white border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                placeholder="Vide = Exonéré"
                            />
                        </div>
                    </div>

                    {/* Section 3: Infos Complémentaires */}
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Infos complémentaires (balcon, cellier...)</label>
                        <input
                            name="infos"
                            defaultValue={editModal.data?.infos}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 outline-none"
                        />
                    </div>

                    {/* Section 4: Contact */}
                    <div className="border-t pt-4">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Coordonnées de contact</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Téléphone</label>
                                <input
                                    name="phone"
                                    defaultValue={editModal.data?.phone}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    defaultValue={editModal.data?.email}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Adresse Postale</label>
                            <input
                                name="address"
                                defaultValue={editModal.data?.address}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t mt-2">
                        <button type="button" onClick={() => setEditModal({ open: false, data: null })} className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium transition-colors">
                            Annuler
                        </button>
                        <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-medium shadow-lg shadow-blue-500/20 transition-all">
                            Enregistrer
                        </button>
                    </div>
                </form>
            </Modal>

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
