/**
 * Toast - Composant de notification toast
 * Affiche un message temporaire puis disparaît
 */
import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const VARIANTS = {
    success: {
        icon: CheckCircle,
        bg: 'bg-green-100 border-green-400',
        text: 'text-green-800',
        iconColor: 'text-green-500'
    },
    error: {
        icon: AlertCircle,
        bg: 'bg-red-100 border-red-400',
        text: 'text-red-800',
        iconColor: 'text-red-500'
    },
    info: {
        icon: Info,
        bg: 'bg-blue-100 border-blue-400',
        text: 'text-blue-800',
        iconColor: 'text-blue-500'
    }
};

/**
 * @param {Object} props
 * @param {string} props.message - Message à afficher
 * @param {'success'|'error'|'info'} props.variant - Type de toast
 * @param {Function} props.onClose - Callback à la fermeture
 * @param {number} [props.duration=3000] - Durée en ms
 */
export default function Toast({ message, variant = 'info', onClose, duration = 3000 }) {
    const [visible, setVisible] = useState(true);
    const config = VARIANTS[variant] || VARIANTS.info;
    const Icon = config.icon;

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 300); // Attend animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div
            className={`
                fixed top-4 right-4 z-[100] flex items-center gap-3 p-4 rounded-lg border shadow-lg
                transition-all duration-300
                ${config.bg} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
            `}
        >
            <Icon className={`w-5 h-5 ${config.iconColor}`} />
            <span className={`font-medium ${config.text}`}>{message}</span>
            <button
                onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
                className={`ml-2 ${config.text} hover:opacity-70`}
            >
                <X size={16} />
            </button>
        </div>
    );
}
