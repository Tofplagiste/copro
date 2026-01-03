/**
 * AuthFormField - Champ de formulaire réutilisable pour les pages d'auth
 */

/**
 * @param {Object} props
 * @param {string} props.label
 * @param {boolean} props.required
 * @param {React.ComponentType} props.Icon
 * @param {string} props.type
 * @param {string} props.name
 * @param {string} props.value
 * @param {Function} props.onChange
 * @param {string} props.placeholder
 * @param {string} props.autoComplete
 * @param {string} props.helpText
 */
export default function AuthFormField({
    label,
    required = false,
    // eslint-disable-next-line no-unused-vars
    Icon,
    type = 'text',
    name,
    value,
    onChange,
    placeholder,
    autoComplete,
    helpText
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                />
            </div>
            {helpText && <p className="text-xs text-slate-500 mt-1">{helpText}</p>}
        </div>
    );
}
