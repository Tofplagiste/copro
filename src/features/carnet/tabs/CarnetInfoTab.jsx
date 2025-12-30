/**
 * CarnetInfoTab - Onglet principal du carnet avec informations générales
 */
import { useState } from 'react';
import { Info, Users, Euro, Wrench, FileCheck, History, Plus, Edit, Trash2, X, Check } from 'lucide-react';
import { useCarnet } from '../../../context/CarnetContext';
import Modal, { ConfirmModal } from '../../../components/Modal';

export default function CarnetInfoTab() {
    const { state, updateState, addTravaux, updateTravaux, deleteTravaux } = useCarnet();
    const [editingSection, setEditingSection] = useState(null);
    const [travailModal, setTravailModal] = useState({ open: false, data: null });
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

    const SectionCard = ({ icon: Icon, title, children, editKey }) => (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-50 to-white border-b">
                <div className="flex items-center gap-2">
                    <Icon size={20} className="text-blue-600" />
                    <h3 className="font-bold text-slate-700">{title}</h3>
                </div>
                {editKey && (
                    <button
                        onClick={() => setEditingSection(editKey)}
                        className="text-blue-600 hover:bg-blue-50 p-1.5 rounded transition-colors"
                    >
                        <Edit size={16} />
                    </button>
                )}
            </div>
            <div className="p-4">{children}</div>
        </div>
    );

    const InfoItem = ({ label, value }) => (
        <div className="mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase block mb-1">{label}</span>
            <span className="text-sm text-slate-800 whitespace-pre-line">{value || '-'}</span>
        </div>
    );

    const handleSaveTravail = (e) => {
        e.preventDefault();
        const form = e.target;
        const data = {
            annee: form.annee.value,
            nature: form.nature.value,
            entreprise: form.entreprise.value,
            cout: form.cout.value
        };

        if (travailModal.data?.id) {
            updateTravaux(travailModal.data.id, data);
        } else {
            addTravaux(data);
        }
        setTravailModal({ open: false, data: null });
    };

    return (
        <div className="p-4 space-y-4">
            {/* Informations Générales */}
            <SectionCard icon={Info} title="Informations Générales" editKey="general">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem label="Adresse Immeuble" value={state.general?.address} />
                    <InfoItem label="Lots" value={state.general?.lots} />
                    <InfoItem label="Règlement Copro" value={state.general?.reglement} />
                    <InfoItem label="Modifications" value={state.general?.modifications} />
                </div>
            </SectionCard>

            {/* Administration */}
            <SectionCard icon={Users} title="Administration & Conseil Syndical" editKey="admin">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <InfoItem
                        label="Syndic Bénévole"
                        value={`${state.admin?.syndic?.name}\n${state.admin?.syndic?.address}\n${state.admin?.syndic?.phone}`}
                    />
                    <InfoItem label="AG Nomination" value={state.admin?.agNomination} />
                    <InfoItem label="Fin Mandat" value={state.admin?.finMandat} />
                    <InfoItem label="Conseil Syndical" value={state.admin?.conseilSyndical?.join('\n')} />
                </div>
            </SectionCard>

            {/* Budget & Finances */}
            <SectionCard icon={Euro} title="Budget & Finances" editKey="finances">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem label="Avance Trésorerie" value={state.finances?.avanceTresorerie} />
                    <InfoItem label="Fonds de Travaux" value={state.finances?.fondsTravaux} />
                </div>
            </SectionCard>

            {/* Données Techniques */}
            <SectionCard icon={Wrench} title="Données Techniques" editKey="technique">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InfoItem label="Construction" value={state.technique?.construction} />
                    <InfoItem label="Surface Développée" value={state.technique?.surface} />
                    <InfoItem label="Toiture" value={state.technique?.toiture} />
                    <InfoItem label="Façade / Murs" value={state.technique?.facade} />
                    <InfoItem label="Code Peinture" value={state.technique?.codePeinture} />
                    <InfoItem label="Chauffage" value={state.technique?.chauffage} />
                </div>
            </SectionCard>

            {/* Diagnostics */}
            <SectionCard icon={FileCheck} title="Diagnostics" editKey="diagnostics">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InfoItem label="Amiante" value={state.diagnostics?.amiante} />
                    <InfoItem label="Plomb" value={state.diagnostics?.plomb} />
                    <InfoItem label="Termites" value={state.diagnostics?.termites} />
                </div>
            </SectionCard>

            {/* Historique des Travaux */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-50 to-white border-b">
                    <div className="flex items-center gap-2">
                        <History size={20} className="text-blue-600" />
                        <h3 className="font-bold text-slate-700">Historique des Travaux</h3>
                    </div>
                    <button
                        onClick={() => setTravailModal({ open: true, data: null })}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-sm font-semibold transition-colors"
                    >
                        <Plus size={16} />
                        Ajouter
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b">
                            <tr>
                                <th className="px-4 py-2 text-left font-semibold text-slate-600">Année</th>
                                <th className="px-4 py-2 text-left font-semibold text-slate-600">Nature des travaux</th>
                                <th className="px-4 py-2 text-left font-semibold text-slate-600">Entreprise</th>
                                <th className="px-4 py-2 text-right font-semibold text-slate-600">Coût</th>
                                <th className="px-4 py-2 text-center font-semibold text-slate-600 w-24">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(state.travaux || []).map(travail => (
                                <tr key={travail.id} className="border-b hover:bg-slate-50">
                                    <td className="px-4 py-2 font-bold text-blue-600">{travail.annee}</td>
                                    <td className="px-4 py-2">{travail.nature}</td>
                                    <td className="px-4 py-2 text-slate-600">{travail.entreprise}</td>
                                    <td className="px-4 py-2 text-right font-semibold">{travail.cout}</td>
                                    <td className="px-4 py-2">
                                        <div className="flex justify-center gap-1">
                                            <button
                                                onClick={() => setTravailModal({ open: true, data: travail })}
                                                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm({ open: true, id: travail.id })}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
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

            {/* Modal Travail */}
            <Modal
                isOpen={travailModal.open}
                onClose={() => setTravailModal({ open: false, data: null })}
                title={travailModal.data?.id ? 'Modifier Travaux' : 'Ajouter Travaux'}
            >
                <form onSubmit={handleSaveTravail} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-1">Année</label>
                        <input
                            name="annee"
                            defaultValue={travailModal.data?.annee || new Date().getFullYear()}
                            className="w-full px-3 py-2 border rounded-lg"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-1">Nature des travaux</label>
                        <textarea
                            name="nature"
                            defaultValue={travailModal.data?.nature}
                            className="w-full px-3 py-2 border rounded-lg"
                            rows={2}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-1">Entreprise</label>
                        <input
                            name="entreprise"
                            defaultValue={travailModal.data?.entreprise}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-1">Coût</label>
                        <input
                            name="cout"
                            defaultValue={travailModal.data?.cout}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="0€ ou Assurance"
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setTravailModal({ open: false, data: null })}
                            className="px-4 py-2 border rounded-lg hover:bg-slate-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
                        >
                            Enregistrer
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Confirm Delete */}
            <ConfirmModal
                isOpen={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, id: null })}
                onConfirm={() => deleteTravaux(deleteConfirm.id)}
                title="Supprimer ce travail ?"
                message="Cette action est irréversible."
                confirmText="Supprimer"
                variant="danger"
            />
        </div>
    );
}
