/**
 * PrestaEditModal - Modal d'édition de prestataire avec ListInput
 */
import { useState } from 'react';
import { Phone, Mail } from 'lucide-react';
import Modal from '../../../../components/Modal';
import ListInput from '../../../../components/ListInput';

export default function PrestaEditModal({ isOpen, onClose, initialData, onSave }) {
    const [phones, setPhones] = useState(initialData?.phones || []);
    const [emails, setEmails] = useState(initialData?.emails || []);

    const handleSubmit = (e) => {
        e.preventDefault();
        const form = e.target;

        const data = {
            name: form.name.value,
            contrat: form.contrat.value,
            contact: form.contact.value,
            phones,
            emails,
            address: form.address.value,
            codes: {
                id: form.codeId.value,
                mdp: form.codeMdp.value
            }
        };

        onSave(data);
    };

    const isEdit = !!initialData?.id;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? 'Modifier Prestataire' : 'Nouveau Prestataire'}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nom & Contrat */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-1">Nom</label>
                        <input
                            name="name"
                            defaultValue={initialData?.name}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-1">N° Contrat</label>
                        <input
                            name="contrat"
                            defaultValue={initialData?.contrat}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                    </div>
                </div>

                {/* Interlocuteur */}
                <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">Interlocuteur</label>
                    <input
                        name="contact"
                        defaultValue={initialData?.contact}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                </div>

                {/* Téléphones & Emails avec ListInput */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
                            <Phone size={14} />
                            Téléphones
                        </label>
                        <ListInput
                            value={phones}
                            onChange={setPhones}
                            placeholder="Ajouter un numéro..."
                            type="tel"
                            maxVisible={3}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
                            <Mail size={14} />
                            Emails
                        </label>
                        <ListInput
                            value={emails}
                            onChange={setEmails}
                            placeholder="Ajouter un email..."
                            type="email"
                            maxVisible={3}
                        />
                    </div>
                </div>

                {/* Adresse */}
                <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">Adresse</label>
                    <input
                        name="address"
                        defaultValue={initialData?.address}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                </div>

                {/* Codes d'accès */}
                <div className="border-t pt-4 mt-4">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-3">Codes d'accès</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Identifiant</label>
                            <input
                                name="codeId"
                                defaultValue={initialData?.codes?.id}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Mot de passe</label>
                            <input
                                name="codeMdp"
                                defaultValue={initialData?.codes?.mdp}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                    >
                        Enregistrer
                    </button>
                </div>
            </form>
        </Modal>
    );
}
