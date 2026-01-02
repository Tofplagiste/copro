/**
 * CarnetInfoTab - Onglet principal du carnet avec informations générales
 */
import { useState } from 'react';
import { Info, Users, Euro, Wrench, FileCheck, History, Plus, Edit, Trash2, Download } from 'lucide-react';
import { useCarnet } from '../../../context/CarnetContext';
import Modal, { ConfirmModal } from '../../../components/Modal';
import { setupPDF, addHeader, addSectionIdx, addFooter, checkPageBreak } from '../../../utils/pdfBase';
import { autoTable } from 'jspdf-autotable';

// eslint-disable-next-line no-unused-vars
const SectionCard = ({ icon: IconComponent, title, children, editKey, onEdit }) => (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-50 to-white border-b">
            <div className="flex items-center gap-2">
                <IconComponent size={20} className="text-blue-600" />
                <h3 className="font-bold text-slate-700">{title}</h3>
            </div>
            {editKey && (
                <button
                    onClick={() => onEdit(editKey)}
                    className="text-blue-600 hover:bg-blue-50 p-1.5 rounded transition-colors"
                    title="Modifier"
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

export default function CarnetInfoTab() {
    const { state, updateState, addTravaux, updateTravaux, deleteTravaux } = useCarnet();
    const [editingSection, setEditingSection] = useState(null);
    const [travailModal, setTravailModal] = useState({ open: false, data: null });
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

    // Form state for editing sections
    const [editFormData, setEditFormData] = useState({});

    const openEditModal = (editKey) => {
        // Initialize form data based on the section being edited
        let initialData = {};
        switch (editKey) {
            case 'general':
                initialData = { ...state.general };
                break;
            case 'admin':
                initialData = { ...state.admin };
                break;
            case 'finances':
                initialData = { ...state.finances };
                break;
            case 'technique':
                initialData = { ...state.technique };
                break;
            case 'diagnostics':
                initialData = { ...state.diagnostics };
                break;
        }
        setEditFormData(initialData);
        setEditingSection(editKey);
    };

    const handleSaveSection = () => {
        if (!editingSection) return;

        const newState = { ...state };
        newState[editingSection] = editFormData;
        updateState(newState);
        setEditingSection(null);
        setEditFormData({});
    };

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

    // Render edit form based on section
    const renderEditForm = () => {
        switch (editingSection) {
            case 'general':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Adresse Immeuble</label>
                            <input
                                value={editFormData.address || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Lots</label>
                            <input
                                value={editFormData.lots || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, lots: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Règlement Copro</label>
                            <input
                                value={editFormData.reglement || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, reglement: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Modifications</label>
                            <textarea
                                value={editFormData.modifications || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, modifications: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                                rows={3}
                            />
                        </div>
                    </div>
                );
            case 'admin':
                return (
                    <div className="space-y-4">
                        <div className="border rounded-lg p-3 bg-slate-50">
                            <h4 className="font-bold text-sm text-slate-700 mb-3">Syndic Bénévole</h4>
                            <div className="space-y-2">
                                <input
                                    placeholder="Nom"
                                    value={editFormData.syndic?.name || ''}
                                    onChange={(e) => setEditFormData({
                                        ...editFormData,
                                        syndic: { ...editFormData.syndic, name: e.target.value }
                                    })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                                <input
                                    placeholder="Adresse"
                                    value={editFormData.syndic?.address || ''}
                                    onChange={(e) => setEditFormData({
                                        ...editFormData,
                                        syndic: { ...editFormData.syndic, address: e.target.value }
                                    })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                                <input
                                    placeholder="Téléphone"
                                    value={editFormData.syndic?.phone || ''}
                                    onChange={(e) => setEditFormData({
                                        ...editFormData,
                                        syndic: { ...editFormData.syndic, phone: e.target.value }
                                    })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">AG Nomination</label>
                            <input
                                type="date"
                                value={editFormData.agNomination || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, agNomination: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Fin Mandat</label>
                            <input
                                type="date"
                                value={editFormData.finMandat || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, finMandat: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Conseil Syndical (un nom par ligne)</label>
                            <textarea
                                value={(editFormData.conseilSyndical || []).join('\n')}
                                onChange={(e) => setEditFormData({
                                    ...editFormData,
                                    conseilSyndical: e.target.value.split('\n').filter(Boolean)
                                })}
                                className="w-full px-3 py-2 border rounded-lg"
                                rows={4}
                            />
                        </div>
                    </div>
                );
            case 'finances':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Avance Trésorerie</label>
                            <input
                                value={editFormData.avanceTresorerie || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, avanceTresorerie: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Fonds de Travaux</label>
                            <input
                                value={editFormData.fondsTravaux || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, fondsTravaux: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                    </div>
                );
            case 'technique':
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-1">Construction</label>
                                <input
                                    value={editFormData.construction || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, construction: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-1">Surface Développée</label>
                                <input
                                    value={editFormData.surface || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, surface: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-1">Toiture</label>
                                <input
                                    value={editFormData.toiture || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, toiture: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-1">Façade / Murs</label>
                                <input
                                    value={editFormData.facade || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, facade: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-1">Code Peinture</label>
                                <input
                                    value={editFormData.codePeinture || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, codePeinture: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-1">Chauffage</label>
                                <input
                                    value={editFormData.chauffage || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, chauffage: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                        </div>
                    </div>
                );
            case 'diagnostics':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Amiante</label>
                            <input
                                value={editFormData.amiante || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, amiante: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Plomb</label>
                            <input
                                value={editFormData.plomb || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, plomb: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Termites</label>
                            <input
                                value={editFormData.termites || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, termites: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const getSectionTitle = () => {
        switch (editingSection) {
            case 'general': return 'Modifier Informations Générales';
            case 'admin': return 'Modifier Administration';
            case 'finances': return 'Modifier Budget & Finances';
            case 'technique': return 'Modifier Données Techniques';
            case 'diagnostics': return 'Modifier Diagnostics';
            default: return 'Modifier';
        }
    };

    const handleExportPDF = () => {
        const doc = setupPDF();
        let y = addHeader(doc, "CARNET D'ENTRETIEN");

        // --- I. IDENTIFICATION ---
        y = addSectionIdx(doc, "IDENTIFICATION", y, "I");

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("Adresse :", 15, y);
        doc.setFont("helvetica", "normal");
        doc.text(state.general?.address || "7-9 rue André Leroux, 33780 Soulac-sur-Mer", 40, y);

        doc.setFont("helvetica", "bold");
        doc.text("Syndic :", 110, y);
        doc.setFont("helvetica", "normal");
        const syndic = state.admin?.syndic || {};
        doc.text(`${syndic.name || ''} ${syndic.phone || ''}`, 130, y);

        y += 7;

        doc.setFont("helvetica", "bold");
        doc.text("Règlement :", 15, y);
        doc.setFont("helvetica", "normal");
        doc.text(state.general?.reglement || "29 septembre 2009", 40, y);

        doc.setFont("helvetica", "bold");
        doc.text("Composition :", 110, y);
        doc.setFont("helvetica", "normal");
        doc.text(state.general?.lots || "21 Lots", 135, y);

        y += 15;

        // --- II. ADMINISTRATION & FINANCES ---
        y = checkPageBreak(doc, y);
        y = addSectionIdx(doc, "ADMINISTRATION & FINANCES", y, "II");

        doc.setFontSize(9);
        doc.text(`AG Nomination : ${state.admin?.agNomination || '-'}`, 15, y);
        doc.text(`Mandat : ${state.admin?.finMandat || '-'}`, 110, y);
        y += 7;
        doc.text(`Trésorerie : ${state.finances?.avanceTresorerie || '-'}`, 15, y);
        doc.text(`Fonds Travaux : ${state.finances?.fondsTravaux || '-'}`, 110, y);
        y += 10;

        doc.setFont("helvetica", "bold");
        doc.text("Conseil Syndical :", 15, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        if (state.admin?.conseilSyndical && state.admin.conseilSyndical.length > 0) {
            state.admin.conseilSyndical.forEach(member => {
                doc.text(member, 15, y);
                y += 4;
            });
        } else {
            doc.text("-", 15, y);
            y += 4;
        }

        y += 10;

        // --- III. DONNÉES TECHNIQUES ---
        y = addSectionIdx(doc, "DONNÉES TECHNIQUES", y, "III");

        doc.setFontSize(9);
        const tech = state.technique || {};
        doc.setFont("helvetica", "bold"); doc.text("Construction :", 15, y);
        doc.setFont("helvetica", "normal"); doc.text(tech.construction || '-', 40, y);

        doc.setFont("helvetica", "bold"); doc.text("Toiture :", 110, y);
        doc.setFont("helvetica", "normal"); doc.text(tech.toiture || '-', 130, y);
        y += 7;

        doc.setFont("helvetica", "bold"); doc.text("Chauffage :", 15, y);
        doc.setFont("helvetica", "normal"); doc.text(tech.chauffage || '-', 40, y);

        doc.setFont("helvetica", "bold"); doc.text("Compteurs :", 110, y);
        doc.setFont("helvetica", "normal"); doc.text("Voir détails", 130, y);

        y += 15;

        // --- IV. CONTRATS EN COURS ---
        y = addSectionIdx(doc, "CONTRATS EN COURS", y, "IV");

        const prestataires = state?.prestataires || [];

        if (prestataires.length > 0) {
            prestataires.forEach(p => {
                y = checkPageBreak(doc, y);
                doc.setFont("helvetica", "bold");
                doc.text(`• ${p.name}`, 15, y);
                doc.setFont("helvetica", "normal");
                if (p.contrat) doc.text(` - Contrat: ${p.contrat}`, 15 + doc.getTextWidth(`• ${p.name}`), y);

                y += 4;
                doc.setFontSize(8);
                doc.setTextColor(80);
                if (p.address) {
                    doc.text(`${p.address}`, 18, y);
                    y += 3.5;
                }
                const phones = p.phones?.join(' / ') || "";
                if (phones) {
                    doc.text(`Tél: ${phones}`, 18, y);
                    y += 3.5;
                }
                const emails = p.emails?.join(' / ') || "";
                if (emails) {
                    doc.text(`Email: ${emails}`, 18, y);
                    y += 3.5;
                }

                y += 2;
                doc.setFontSize(9);
                doc.setTextColor(0);
            });
        } else {
            doc.setFont("helvetica", "italic");
            doc.text("Aucun contrat enregistré.", 15, y);
            y += 10;
        }

        y += 5;

        // --- V. DIAGNOSTICS ---
        y = checkPageBreak(doc, y);
        y = addSectionIdx(doc, "DIAGNOSTICS", y, "V");

        const diag = state.diagnostics || {};
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold"); doc.text("Amiante :", 15, y);
        doc.setFont("helvetica", "normal"); doc.text(diag.amiante || '-', 50, y);
        y += 6;

        doc.setFont("helvetica", "bold"); doc.text("Plomb :", 15, y);
        doc.setFont("helvetica", "normal"); doc.text(diag.plomb || '-', 50, y);
        y += 6;

        doc.setFont("helvetica", "bold"); doc.text("Termites :", 15, y);
        doc.setFont("helvetica", "normal"); doc.text(diag.termites || '-', 50, y);

        y += 15;

        // --- VI. TRAVAUX ---
        y = checkPageBreak(doc, y);
        y = addSectionIdx(doc, "HISTORIQUE DES TRAVAUX", y, "VI");

        const travaux = state?.travaux || [];
        const tableBody = travaux.map(t => [t.annee, t.nature, t.entreprise]);

        if (tableBody.length > 0) {
            autoTable(doc, {
                startY: y,
                head: [['Année', 'Nature', 'Entreprise']],
                body: tableBody,
                theme: 'grid',
                headStyles: { fillColor: [255, 255, 255], textColor: 0, lineColor: 0, lineWidth: 0.1 },
                styles: { fontSize: 8, cellPadding: 2, lineColor: 0, lineWidth: 0.1, textColor: 0 },
                columnStyles: {
                    0: { cellWidth: 20, fontStyle: 'bold' },
                    1: { cellWidth: 'auto' },
                    2: { cellWidth: 60 }
                },
                margin: { bottom: 20 }
            });
        } else {
            doc.text("Aucun historique de travaux.", 15, y);
        }

        addFooter(doc);
        doc.save("Carnet_Entretien_Complet.pdf");
    };

    return (
        <div className="p-2 sm:p-4 space-y-4">
            <div className="flex justify-end">
                <button
                    onClick={handleExportPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-semibold transition-colors"
                >
                    <Download size={18} />
                    Export PDF Carnet
                </button>
            </div>

            {/* Informations Générales */}
            <SectionCard icon={Info} title="Informations Générales" editKey="general" onEdit={openEditModal}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem label="Adresse Immeuble" value={state.general?.address} />
                    <InfoItem label="Lots" value={state.general?.lots} />
                    <InfoItem label="Règlement Copro" value={state.general?.reglement} />
                    <InfoItem label="Modifications" value={state.general?.modifications} />
                </div>
            </SectionCard>

            {/* Administration */}
            <SectionCard icon={Users} title="Administration & Conseil Syndical" editKey="admin" onEdit={openEditModal}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <InfoItem
                        label="Syndic Bénévole"
                        value={`${state.admin?.syndic?.name} \n${state.admin?.syndic?.address} \n${state.admin?.syndic?.phone} `}
                    />
                    <InfoItem label="AG Nomination" value={state.admin?.agNomination} />
                    <InfoItem label="Fin Mandat" value={state.admin?.finMandat} />
                    <InfoItem label="Conseil Syndical" value={state.admin?.conseilSyndical?.join('\n')} />
                </div>
            </SectionCard>

            {/* Budget & Finances */}
            <SectionCard icon={Euro} title="Budget & Finances" editKey="finances" onEdit={openEditModal}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem label="Avance Trésorerie" value={state.finances?.avanceTresorerie} />
                    <InfoItem label="Fonds de Travaux" value={state.finances?.fondsTravaux} />
                </div>
            </SectionCard>

            {/* Données Techniques */}
            <SectionCard icon={Wrench} title="Données Techniques" editKey="technique" onEdit={openEditModal}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InfoItem label="Construction" value={state.technique?.construction} />
                    <InfoItem label="Surface Développée" value={state.technique?.surface} />
                    <InfoItem label="Toiture" value={state.technique?.toiture} />
                    <InfoItem label="Façade / Murs" value={state.technique?.facade} />
                    <InfoItem label="Code Peinture" value={state.technique?.codePeinture} />
                    <InfoItem label="Chauffage" value={state.technique?.chauffage} />
                </div>
            </SectionCard>

            {/* Diagnostics */}
            <SectionCard icon={FileCheck} title="Diagnostics" editKey="diagnostics" onEdit={openEditModal}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

            {/* Modal Edition Section */}
            <Modal
                isOpen={!!editingSection}
                onClose={() => { setEditingSection(null); setEditFormData({}); }}
                title={getSectionTitle()}
            >
                <div className="space-y-4">
                    {renderEditForm()}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button
                            onClick={() => { setEditingSection(null); setEditFormData({}); }}
                            className="px-4 py-2 border rounded-lg hover:bg-slate-50"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleSaveSection}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 font-semibold"
                        >
                            Enregistrer
                        </button>
                    </div>
                </div>
            </Modal>

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

