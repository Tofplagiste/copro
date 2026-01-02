/**
 * ListInput - Composant pour gérer une liste de valeurs (téléphones, emails, etc.)
 * Affiche les éléments comme une liste avec bouton pour ajouter/supprimer
 */
import { useState } from 'react';
import { Plus, X } from 'lucide-react';

/**
 * @param {Object} props
 * @param {Array} props.value - Liste des valeurs
 * @param {Function} props.onChange - Callback quand la liste change
 * @param {string} props.placeholder - Placeholder pour le champ d'ajout
 * @param {string} props.type - Type du input (text, email, tel)
 * @param {number} props.maxVisible - Nombre d'éléments visibles avant scroll (default: 3)
 */
export default function ListInput({ value = [], onChange, placeholder = "Ajouter...", type = "text", maxVisible = 3 }) {
    const [inputValue, setInputValue] = useState('');

    const handleAdd = () => {
        if (inputValue.trim()) {
            onChange([...value, inputValue.trim()]);
            setInputValue('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    const handleRemove = (index) => {
        onChange(value.filter((_, i) => i !== index));
    };

    const needsScroll = value.length > maxVisible;

    return (
        <div className="space-y-2">
            {/* Liste des éléments */}
            {value.length > 0 && (
                <div className={`space-y-1 ${needsScroll ? 'max-h-24 overflow-y-auto pr-1' : ''}`}>
                    {value.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg group"
                        >
                            <span className="text-sm text-slate-700">{item}</span>
                            <button
                                type="button"
                                onClick={() => handleRemove(index)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 text-red-500 rounded transition-all"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Champ d'ajout */}
            <div className="flex gap-2">
                <input
                    type={type}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                />
                <button
                    type="button"
                    onClick={handleAdd}
                    disabled={!inputValue.trim()}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Plus size={16} />
                </button>
            </div>
        </div>
    );
}
