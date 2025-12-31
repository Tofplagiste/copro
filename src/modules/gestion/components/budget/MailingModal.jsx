import { useState, useEffect, useCallback } from 'react';
import { X, Send, Mail, Paperclip, FileText } from 'lucide-react';

export default function MailingModal({
    isOpen,
    onClose,
    owners,
    initialOwnerId,
    currentQuarter,
    year,
    dueDate,
    computeOwnerCall,
    onGeneratePDF // NEW: function to generate and download PDF
}) {
    const [selectedOwnerId, setSelectedOwnerId] = useState(null);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');
    const [status, setStatus] = useState('');
    const [displayAmount, setDisplayAmount] = useState('—');
    const [attachPdf, setAttachPdf] = useState(true); // Checkbox state

    // Find owner by ID (handle both string and number)
    const findOwner = useCallback((id) => {
        if (!id || !owners?.length) return null;
        return owners.find(o => String(o.id) === String(id));
    }, [owners]);

    // Initialize when modal opens & Lock Scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            if (owners?.length > 0) {
                const initId = initialOwnerId || owners[0]?.id;
                setSelectedOwnerId(initId);
                setStatus('');
                setAttachPdf(true);
            }
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen, initialOwnerId, owners]);

    // Format money
    const formatMoney = (val) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2
        }).format(val || 0);
    };

    // Format date
    const formatDate = (dateStr) => {
        if (!dateStr) return '[à préciser]';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Update email content when owner or dates change
    useEffect(() => {
        if (!selectedOwnerId || !owners?.length) return;

        const owner = findOwner(selectedOwnerId);
        if (!owner) return;

        // Compute the actual call amount for this owner
        let totalAmount = 0;
        if (computeOwnerCall) {
            try {
                const call = computeOwnerCall(owner);
                totalAmount = call?.total || 0;
            } catch (e) {
                console.warn('Could not compute owner call:', e);
            }
        }

        const formattedAmount = formatMoney(totalAmount);
        const formattedDueDate = formatDate(dueDate);

        setDisplayAmount(formattedAmount);

        const subject = `Appel de fonds ${currentQuarter} ${year} - ${owner.name}`;
        const body = `Bonjour ${owner.name},

Veuillez trouver ci-joint votre appel de fonds pour le ${currentQuarter} ${year}.

Détails du paiement :
- Montant à régler : ${formattedAmount}
- Date limite : ${formattedDueDate}
- Mode de règlement : Virement ou chèque

RIB pour virement :
IBAN : FR76 3000 4028 3700 0100 4307 218
BIC : BNPAFRPP

Pour tout renseignement, n'hésitez pas à me contacter.

Cordialement,
Le Syndic Bénévole
Copropriété Les Pyrénées
9 rue André Leroux - 33780 Soulac-sur-Mer`;

        setEmailSubject(subject);
        setEmailBody(body);
    }, [selectedOwnerId, currentQuarter, year, dueDate, owners, computeOwnerCall, findOwner]);

    // Handle owner selection change
    const handleOwnerChange = (e) => {
        const newId = e.target.value;
        setSelectedOwnerId(newId);
    };

    // Send email via Gmail
    const handleSendMail = () => {
        const owner = findOwner(selectedOwnerId);
        const email = owner?.email || '';

        if (!email) {
            setStatus('❌ Pas d\'adresse email pour ce copropriétaire');
            return;
        }

        // If PDF attachment is checked, download it first
        if (attachPdf && onGeneratePDF) {
            setStatus('📄 Téléchargement du PDF...');
            try {
                onGeneratePDF(owner.id);
            } catch (e) {
                console.error('PDF error:', e);
            }
        }

        // Small delay to let PDF download start, then open Gmail
        setTimeout(() => {
            const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
            window.open(gmailUrl, '_blank');

            if (attachPdf) {
                setStatus('✅ PDF téléchargé + Gmail ouvert - Pensez à joindre le PDF !');
            } else {
                setStatus('✅ Gmail ouvert dans un nouvel onglet');
            }
        }, attachPdf ? 500 : 0);
    };

    if (!isOpen) return null;

    const selectedOwner = findOwner(selectedOwnerId);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fadeIn" onClick={(e) => e.stopPropagation()}>
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
                    {/* Owner Selector with amount preview */}
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Destinataire</label>
                            <select
                                value={selectedOwnerId || ''}
                                onChange={handleOwnerChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-lg"
                            >
                                {owners.map(o => (
                                    <option key={o.id} value={o.id}>{o.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-44">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Montant Total</label>
                            <div className="px-4 py-3 bg-green-100 border-2 border-green-500 rounded-xl text-lg font-bold text-green-700 text-center">
                                {displayAmount}
                            </div>
                        </div>
                    </div>

                    {/* Attach PDF Checkbox */}
                    <div className="flex items-center gap-3 p-3 bg-blue-50 border-2 border-blue-200 rounded-xl">
                        <input
                            type="checkbox"
                            id="attachPdf"
                            checked={attachPdf}
                            onChange={(e) => setAttachPdf(e.target.checked)}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="attachPdf" className="flex items-center gap-2 cursor-pointer font-medium text-blue-800">
                            <FileText size={18} />
                            Télécharger le PDF pour pièce jointe
                        </label>
                        {attachPdf && (
                            <span className="ml-auto text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                📎 Le PDF sera téléchargé avant d'ouvrir Gmail
                            </span>
                        )}
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
                        <div className={`text-center py-2 rounded-lg font-medium ${status.includes('❌') ? 'bg-red-50 text-red-600' :
                            status.includes('📄') ? 'bg-blue-50 text-blue-600' :
                                'bg-green-50 text-green-600'
                            }`}>
                            {status}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-5 flex justify-between items-center border-t">
                    <div className="text-sm text-gray-500">
                        {selectedOwner?.email ? (
                            <span className="text-green-600 font-medium">📧 {selectedOwner.email}</span>
                        ) : (
                            <span className="text-red-500">⚠️ Aucun email configuré pour {selectedOwner?.name || 'ce copropriétaire'}</span>
                        )}
                    </div>
                    <button
                        onClick={handleSendMail}
                        disabled={!selectedOwner?.email}
                        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 flex items-center gap-3 font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <Send size={20} />
                        {attachPdf ? 'PDF + Email' : 'Envoyer Email'}
                    </button>
                </div>
            </div>
        </div>
    );
}
