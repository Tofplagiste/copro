import { useState, useEffect } from 'react';
import { X, Copy, ExternalLink, Mail } from 'lucide-react';
import { fmtMoney } from '../../utils/formatters';

export default function MailingModal({ isOpen, onClose, owners, initialOwnerId, currentQuarter, year }) {
    const [selectedOwnerId, setSelectedOwnerId] = useState(initialOwnerId || '');
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');

    useEffect(() => {
        if (isOpen) {
            setSelectedOwnerId(initialOwnerId || (owners.length > 0 ? owners[0].id : ''));
        }
    }, [isOpen, initialOwnerId, owners]);

    useEffect(() => {
        updateEmailContent();
    }, [selectedOwnerId, currentQuarter, year]);

    const updateEmailContent = () => {
        if (!selectedOwnerId) return;
        const owner = owners.find(o => o.id === selectedOwnerId);
        if (!owner) return;

        // Note: Real amount calculation would require passing the full computed call data
        // For now we will use a placeholder or handle it if we pass computed data
        // Ideally we pass "computedCalls" map or similar to this modal

        const subject = `Appel de fonds ${currentQuarter} ${year} - ${owner.name}`;
        const body = `Bonjour ${owner.name},

Veuillez trouver ci-joint votre appel de fonds pour le ${currentQuarter} ${year}.

Cordialement,
Le Syndic Bénévole`;

        setEmailSubject(subject);
        setEmailBody(body);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(`${emailSubject}\n\n${emailBody}`);
        alert("Texte copié !");
    };

    const handleOpenMail = () => {
        const owner = owners.find(o => o.id === selectedOwnerId);
        const email = owner?.email || '';
        const href = `mailto:${email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        window.open(href, '_blank');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn">
                {/* Header */}
                <div className="bg-amber-500 px-4 py-3 text-white flex justify-between items-center">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Mail size={20} /> Mailing Propriétaires
                    </h3>
                    <button onClick={onClose} className="hover:bg-amber-600 rounded p-1 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    {/* Owner Selector */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Déstinataire</label>
                        <select
                            value={selectedOwnerId}
                            onChange={(e) => setSelectedOwnerId(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                        >
                            {owners.map(o => (
                                <option key={o.id} value={o.id}>{o.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Preview */}
                    <div className="space-y-2">
                        <div>
                            <label className="text-xs font-bold text-gray-500">Sujet</label>
                            <input
                                type="text"
                                value={emailSubject}
                                readOnly
                                className="w-full px-3 py-2 bg-gray-50 border rounded text-sm text-gray-700"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500">Message</label>
                            <textarea
                                value={emailBody}
                                readOnly
                                rows={6}
                                className="w-full px-3 py-2 bg-gray-50 border rounded text-sm text-gray-700 font-mono"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end border-t">
                    <button
                        onClick={handleCopy}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white flex items-center gap-2 font-medium"
                    >
                        <Copy size={16} /> Copier Texte
                    </button>
                    <button
                        onClick={handleOpenMail}
                        className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center gap-2 font-bold shadow-sm"
                    >
                        <ExternalLink size={16} /> Ouvrir Email
                    </button>
                </div>
            </div>
        </div>
    );
}
