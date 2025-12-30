/**
 * RepartitionTab - Onglet répartition des tantièmes par copropriétaire
 */
import { useState } from 'react';
import { Plus, Edit, Trash2, FileText, Download } from 'lucide-react';
import { useCarnet } from '../../../context/CarnetContext';
import Modal, { ConfirmModal } from '../../../components/Modal';

export default function RepartitionTab() {
    const { state, addProprietaire, updateProprietaire, deleteProprietaire } = useCarnet();
    const [editModal, setEditModal] = useState({ open: false, data: null });
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

    const proprietaires = state.proprietaires || [];
    const totalTantiemes = proprietaires.reduce((sum, p) => sum + (p.tantiemes || 0), 0);
    const totalGestion = proprietaires.filter(p => p.gestion).reduce((sum, p) => sum + p.gestion, 0);
    const totalMenage = proprietaires.filter(p => p.menage).reduce((sum, p) => sum + p.menage, 0);

    const handleSave = (e) => {
        e.preventDefault();
        const form = e.target;
        const data = {
            name: form.name.value,
            lots: form.lots.value,
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
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-semibold transition-colors">
                    <Download size={18} />
                    PDF
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
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
                                    <td className="px-4 py-3 text-slate-600">{proprio.lots}</td>
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
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Nom</label>
                            <input name="name" defaultValue={editModal.data?.name} className="w-full px-3 py-2 border rounded-lg" required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Lots</label>
                            <input name="lots" defaultValue={editModal.data?.lots} className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Tantièmes</label>
                            <input name="tantiemes" type="number" defaultValue={editModal.data?.tantiemes} className="w-full px-3 py-2 border rounded-lg" required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">% Gestion (vide = exonéré)</label>
                            <input name="gestion" type="number" step="0.01" defaultValue={editModal.data?.gestion} className="w-full px-3 py-2 border rounded-lg" placeholder="Ex: 12.47" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">% Ménage (vide = exonéré)</label>
                            <input name="menage" type="number" step="0.01" defaultValue={editModal.data?.menage} className="w-full px-3 py-2 border rounded-lg" placeholder="Ex: 10.59" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-1">Infos (balcon, cellier...)</label>
                        <input name="infos" defaultValue={editModal.data?.infos} className="w-full px-3 py-2 border rounded-lg" />
                    </div>

                    <div className="border-t pt-4 mt-4">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-3">Coordonnées</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-1">Téléphone</label>
                                <input name="phone" defaultValue={editModal.data?.phone} className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-1">Email</label>
                                <input name="email" type="email" defaultValue={editModal.data?.email} className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Adresse</label>
                            <input name="address" defaultValue={editModal.data?.address} className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setEditModal({ open: false, data: null })} className="px-4 py-2 border rounded-lg hover:bg-slate-50">
                            Annuler
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500">
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
