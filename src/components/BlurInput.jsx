/**
 * BlurInput - Input qui sauvegarde uniquement au blur (perte de focus)
 * Permet de taper un nombre complet sans blocage pendant la saisie
 */
import { useState } from 'react';

/**
 * @param {Object} props
 * @param {number} props.value - Valeur initiale
 * @param {Function} props.onSave - Callback (numericValue) => void
 * @param {string} props.className - Classes CSS
 */
export default function BlurInput({ value, onSave, className, ...props }) {
    const [localValue, setLocalValue] = useState(value || '');
    const [hasFocus, setHasFocus] = useState(false);

    // Sync avec la valeur DB uniquement si on n'est pas en train d'éditer
    const displayValue = hasFocus ? localValue : (value || '');

    const handleFocus = () => {
        setHasFocus(true);
        setLocalValue(value || '');
    };

    const handleBlur = () => {
        setHasFocus(false);
        const numValue = parseFloat(localValue) || 0;
        // Ne sauvegarder que si la valeur a changé
        if (numValue !== (parseFloat(value) || 0)) {
            onSave(numValue);
        }
    };

    return (
        <input
            type="number"
            value={displayValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={className}
            {...props}
        />
    );
}
