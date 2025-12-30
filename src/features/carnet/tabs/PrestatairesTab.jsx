/**
 * PrestatairesTab - Liste des prestataires de la copropriété
 */
import { useState } from 'react';
import { Plus, Edit, Trash2, FileText, Download, Phone, Mail, MapPin, Key } from 'lucide-react';
import { useCarnet } from '../../../context/CarnetContext';
import Modal, { ConfirmModal } from '../../../components/Modal';

export default function PrestatairesTab() {
    const { state, addPrestataire, updatePrestataire, deletePrestataire } = useCarnet();
    const [editModal, setEditModal] = useState({ open: false, data: null });
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

    const prestataires = state.prestataires || [];

    const handleSave = (e) => {
        e.preventDefault();
        const form = e.target;
        const data = {
            name: form.name.value,
            contrat: form.contrat.value,
            contact: form.contact.value,
            phones: form.phones.value.split('\n').filter(p => p.trim()),
            emails: form.emails.value.split('\n').filter(e => e.trim()),
            address: form.address.value,
            codes: {
                id: form.codeId.value,
                mdp: form.codeMdp.value
            }
        };

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
                                            <button className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full" title="Fiche PDF">
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
            <Modal
                isOpen={editModal.open}
                onClose={() => setEditModal({ open: false, data: null })}
                title={editModal.data?.id ? 'Modifier Prestataire' : 'Nouveau Prestataire'}
                size="lg"
            >
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Nom</label>
                            <input name="name" defaultValue={editModal.data?.name} className="w-full px-3 py-2 border rounded-lg" required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">N° Contrat</label>
                            <input name="contrat" defaultValue={editModal.data?.contrat} className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-1">Interlocuteur</label>
                        <input name="contact" defaultValue={editModal.data?.contact} className="w-full px-3 py-2 border rounded-lg" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Téléphones (1 par ligne)</label>
                            <textarea name="phones" defaultValue={editModal.data?.phones?.join('\n')} className="w-full px-3 py-2 border rounded-lg" rows={3} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Emails (1 par ligne)</label>
                            <textarea name="emails" defaultValue={editModal.data?.emails?.join('\n')} className="w-full px-3 py-2 border rounded-lg" rows={3} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-1">Adresse</label>
                        <input name="address" defaultValue={editModal.data?.address} className="w-full px-3 py-2 border rounded-lg" />
                    </div>

                    <div className="border-t pt-4 mt-4">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-3">Codes d'accès</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-1">Identifiant</label>
                                <input name="codeId" defaultValue={editModal.data?.codes?.id} className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-1">Mot de passe</label>
                                <input name="codeMdp" defaultValue={editModal.data?.codes?.mdp} className="w-full px-3 py-2 border rounded-lg" />
                            </div>
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
                onConfirm={() => deletePrestataire(deleteConfirm.id)}
                title="Supprimer ce prestataire ?"
                message="Cette action est irréversible."
                confirmText="Supprimer"
                variant="danger"
            />
        </div>
    );
}
