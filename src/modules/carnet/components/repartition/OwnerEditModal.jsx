/**
 * OwnerEditModal - Modal for editing/creating owner with multi-lot selector
 */
import { useState } from 'react';
import { User, Home, Phone, Mail, MapPin } from 'lucide-react';
import Modal from '../../../../components/Modal';
import LotSelector from './LotSelector';

/**
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Object|null} props.initialData - Owner being edited (null for new)
 * @param {Array} props.lots - All lots available
 * @param {Array} props.owners - All owners (for LotSelector)
 * @param {Function} props.onSave - (ownerData, lotIds) => void
 */
export default function OwnerEditModal({ isOpen, onClose, initialData, lots, owners, onSave }) {
    // State initialized from props - parent should pass key to remount on owner change
    const [selectedLotIds, setSelectedLotIds] = useState(initialData?.lot_ids || []);

    // Calculate tantiemes from selected lots
    const totalTantiemes = selectedLotIds.reduce((sum, lid) => {
        const lot = lots.find(l => l.id === lid);
        return sum + (lot?.tantiemes || 0);
    }, 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        const form = e.target;

        const ownerData = {
            name: form.name.value,
            exo_gest: form.exo_gest.checked,
            exo_men: form.exo_men.checked,
            phone: form.phone.value,
            email: form.email.value,
            address: form.address.value
        };

        onSave(ownerData, selectedLotIds);
    };

    const isEdit = !!initialData?.id;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? 'Modifier Propriétaire' : 'Nouveau Propriétaire'}
            size="xl"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Section 1: Identification */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 mb-3 text-blue-700 font-semibold border-b border-blue-100 pb-2">
                        <User size={18} />
                        Identification
                    </div>
                    <input
                        name="name"
                        defaultValue={initialData?.name}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Nom du propriétaire"
                        required
                    />
                </div>

                {/* Section 2: Lots Selection */}
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2 mb-3 text-blue-700 font-semibold border-b border-blue-100 pb-2">
                        <Home size={18} />
                        Attribution des Lots
                    </div>
                    <LotSelector
                        lots={lots}
                        owners={owners}
                        selectedLotIds={selectedLotIds}
                        currentOwnerId={initialData?.id}
                        onChange={setSelectedLotIds}
                    />
                </div>

                {/* Section 3: Exonérations */}
                <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100 cursor-pointer hover:bg-emerald-100 transition-colors">
                        <input
                            type="checkbox"
                            name="exo_gest"
                            defaultChecked={initialData?.exo_gest}
                            className="w-5 h-5 text-emerald-600 rounded"
                        />
                        <span className="font-medium text-emerald-800">Exonéré Gestion</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100 cursor-pointer hover:bg-purple-100 transition-colors">
                        <input
                            type="checkbox"
                            name="exo_men"
                            defaultChecked={initialData?.exo_men}
                            className="w-5 h-5 text-purple-600 rounded"
                        />
                        <span className="font-medium text-purple-800">Exonéré Ménage</span>
                    </label>
                </div>

                {/* Section 4: Contact */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 mb-3 text-slate-600 font-semibold">
                        Coordonnées
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="relative">
                            <Phone size={16} className="absolute left-3 top-2.5 text-slate-400" />
                            <input
                                name="phone"
                                defaultValue={initialData?.phone}
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Téléphone"
                            />
                        </div>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-2.5 text-slate-400" />
                            <input
                                name="email"
                                type="email"
                                defaultValue={initialData?.email}
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Email"
                            />
                        </div>
                    </div>
                    <div className="relative mt-3">
                        <MapPin size={16} className="absolute left-3 top-2.5 text-slate-400" />
                        <input
                            name="address"
                            defaultValue={initialData?.address}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Adresse postale"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-sm text-slate-600">
                        Total tantièmes: <span className="font-bold text-blue-600">{totalTantiemes}‰</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium shadow-sm"
                        >
                            Enregistrer
                        </button>
                    </div>
                </div>
            </form>
        </Modal>
    );
}
