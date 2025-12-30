import { useState, useEffect } from 'react';
import { X, Send, Mail } from 'lucide-react';

export default function MailingModal({ isOpen, onClose, owners, initialOwnerId, currentQuarter, year }) {
    const [selectedOwnerId, setSelectedOwnerId] = useState(initialOwnerId || '');
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [status, setStatus] = useState('');

    useEffect(() => {
        if (isOpen) {
            setSelectedOwnerId(initialOwnerId || (owners.length > 0 ? owners[0].id : ''));
            setStatus('');
        }
    }, [isOpen, initialOwnerId, owners]);

    useEffect(() => {
        updateEmailContent();
    }, [selectedOwnerId, currentQuarter, year]);

    const updateEmailContent = () => {
        if (!selectedOwnerId) return;
        const owner = owners.find(o => o.id === selectedOwnerId);
        if (!owner) return;

        const subject = `Appel de fonds ${currentQuarter} ${year} - ${owner.name}`;
        const body = `Bonjour ${owner.name},

Veuillez trouver ci-joint votre appel de fonds pour le ${currentQuarter} ${year}.

Détails du paiement :
- Montant à régler : [voir détail joint]
- Date limite : [à préciser]
- Mode de règlement : Virement ou chèque

RIB pour virement :
IBAN : FR76 XXXX XXXX XXXX XXXX XXXX XXX
BIC : XXXXXXXX

Pour tout renseignement, n'hésitez pas à me contacter.

Cordialement,
Le Syndic Bénévole
Copropriété Les Pyrénées`;

        setEmailSubject(subject);
        setEmailBody(body);
    };

    const handleSendMail = () => {
        const owner = owners.find(o => o.id === selectedOwnerId);
        const email = owner?.email || '';

        if (!email) {
            setStatus('❌ Pas d\'adresse email pour ce copropriétaire');
            return;
        }

        // Open mailto link - this is the only reliable way without a backend
        const href = `mailto:${email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        window.location.href = href;

        setStatus('✅ Client email ouvert');
    };

    if (!isOpen) return null;

    const selectedOwner = owners.find(o => o.id === selectedOwnerId);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fadeIn">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 text-white flex justify-between items-center">
                    <h3 className="font-bold text-xl flex items-center gap-3">
                        <Mail size={24} /> Envoi Email Propriétaire
                    </h3>
                    <button onClick={onClose} className="hover:bg-white/20 rounded-lg p-2 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    {/* Owner Selector */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Destinataire</label>
                        <select
                            value={selectedOwnerId}
                            onChange={(e) => setSelectedOwnerId(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-lg"
                        >
                            {owners.map(o => (
                                <option key={o.id} value={o.id}>{o.name} - {o.email || 'Pas d\'email'}</option>
                            ))}
                        </select>
                    </div>

                    {/* Email Preview */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-bold text-gray-600 mb-1 block">Sujet</label>
                            <input
                                type="text"
                                value={emailSubject}
                                onChange={(e) => setEmailSubject(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 font-medium"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-600 mb-1 block">Message</label>
                            <textarea
                                value={emailBody}
                                onChange={(e) => setEmailBody(e.target.value)}
                                rows={12}
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-700 font-mono text-sm leading-relaxed resize-none"
                            />
                        </div>
                    </div>

                    {/* Status */}
                    {status && (
                        <div className={`text-center py-2 rounded-lg ${status.includes('❌') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'} font-medium`}>
                            {status}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-5 flex justify-between items-center border-t">
                    <div className="text-sm text-gray-500">
                        {selectedOwner?.email ? (
                            <span>📧 {selectedOwner.email}</span>
                        ) : (
                            <span className="text-red-500">⚠️ Aucun email configuré</span>
                        )}
                    </div>
                    <button
                        onClick={handleSendMail}
                        disabled={!selectedOwner?.email}
                        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 flex items-center gap-3 font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <Send size={20} /> Envoyer Email
                    </button>
                </div>
            </div>
        </div>
    );
}
