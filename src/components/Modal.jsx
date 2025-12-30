/**
 * Modal - Composant de dialogue modal réutilisable
 */
import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    // Fermer avec Escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size]} animate-fadeIn`}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b">
                    <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-5 py-4">
                    {children}
                </div>
            </div>
        </div>
    );
}

/**
 * ConfirmModal - Modal de confirmation
 */
export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmer', cancelText = 'Annuler', variant = 'danger' }) {
    const variantStyles = {
        danger: 'bg-red-600 hover:bg-red-500',
        warning: 'bg-amber-500 hover:bg-amber-400',
        success: 'bg-green-600 hover:bg-green-500'
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex justify-end gap-3">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50 font-medium"
                >
                    {cancelText}
                </button>
                <button
                    onClick={() => { onConfirm?.(); onClose?.(); }}
                    className={`px-4 py-2 text-white rounded-lg font-medium ${variantStyles[variant]}`}
                >
                    {confirmText}
                </button>
            </div>
        </Modal>
    );
}

/**
 * PromptModal - Modal avec input
 */
export function PromptModal({ isOpen, onClose, onSubmit, title, message, placeholder = '', defaultValue = '' }) {
    const handleSubmit = (e) => {
        e.preventDefault();
        const value = e.target.elements.promptInput.value;
        onSubmit?.(value);
        onClose?.();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <form onSubmit={handleSubmit}>
                <p className="text-gray-600 mb-3">{message}</p>
                <input
                    name="promptInput"
                    type="number"
                    defaultValue={defaultValue}
                    placeholder={placeholder}
                    className="w-full px-4 py-2 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                    step="0.01"
                />
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50 font-medium"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500"
                    >
                        Valider
                    </button>
                </div>
            </form>
        </Modal>
    );
}
