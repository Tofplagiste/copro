/**
 * WaterConfig - Configuration du trimestre et prix (V6)
 *
 * Migration Phase 6 : Utilise useGestionData() au lieu de useCopro.
 * Optimisation : Utilise WaterSettingInput pour éviter le rechargement à chaque frappe.
 */
import { useState, useEffect } from 'react';
import { useGestionData } from '../../context/GestionSupabaseContext';

export default function WaterConfig() {
    const {
        waterSettings,
        activeQuarter,
        setActiveQuarter,
        updateWaterSettings
    } = useGestionData();

    const settings = waterSettings || {};

    // Handle quarter change
    const handleQuarterChange = (e) => {
        const newQuarter = e.target.value;
        setActiveQuarter(newQuarter);
        updateWaterSettings({ active_quarter: newQuarter });
    };

    // Handle price mode change
    const handlePriceModeChange = (e) => {
        updateWaterSettings({ price_mode: e.target.value });
    };

    // Handle field change (Appelé au BLUR via WaterSettingInput)
    const handleFieldChange = (field, value) => {
        const numValue = parseFloat(value) || 0;
        let updates = { [field]: numValue };

        // If annual mode, recalculate quarterly subscription
        if (settings.price_mode === 'annual' && field === 'annual_sub') {
            updates.sub_amount = numValue / 4;
        }

        updateWaterSettings(updates);
    };

    // Calculate price per m³
    const computePrice = () => {
        if (settings.price_mode === 'manual') return settings.manual_price || 0;
        if (settings.price_mode === 'annual') {
            const conso = (settings.annual_total || 0) - (settings.annual_sub || 0);
            return (settings.annual_vol || 0) > 0 ? conso / settings.annual_vol : 0;
        }
        return settings.manual_price || 4.5;
    };

    const pricePerM3 = computePrice();

    return (
        <div className="bg-white rounded-xl shadow-sm border-t-4 border-blue-500 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b flex items-center gap-2">
                <span className="font-bold text-gray-700">Configuration Trimestre</span>
            </div>
            <div className="p-4 space-y-4">
                {/* Trimestre Actif */}
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Trimestre Actif</label>
                    <select
                        value={activeQuarter}
                        onChange={handleQuarterChange}
                        className="w-full mt-1 px-3 py-2 font-bold border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="T1">Trimestre 1</option>
                        <option value="T2">Trimestre 2</option>
                        <option value="T3">Trimestre 3</option>
                        <option value="T4">Trimestre 4</option>
                    </select>
                </div>

                <hr className="border-gray-200" />

                {/* Mode de calcul du prix */}
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">1. Coût au m³</label>
                    <select
                        value={settings.price_mode || 'manual'}
                        onChange={handlePriceModeChange}
                        className="w-full mt-1 px-3 py-2 text-sm border rounded-lg"
                    >
                        <option value="invoice">Facture Trimestre (Réel)</option>
                        <option value="annual">Facture Annuelle (Moyenne)</option>
                        <option value="manual">Prix Fixe (Manuel)</option>
                    </select>
                </div>

                {/* Panel Mode Annuel */}
                {settings.price_mode === 'annual' && (
                    <AnnualModePanel settings={settings} onSave={handleFieldChange} />
                )}

                {/* Panel Mode Manuel */}
                {settings.price_mode === 'manual' && (
                    <ManualModePanel settings={settings} onSave={handleFieldChange} />
                )}

                {/* Prix appliqué */}
                <div className="text-center p-3 bg-gray-50 border rounded-lg">
                    <span className="text-xs text-gray-500 block">Prix appliqué</span>
                    <span className="text-xl font-bold text-blue-600">{pricePerM3.toFixed(4)}</span>
                    <span className="text-sm ml-1">€/m³</span>
                </div>

                <hr className="border-gray-200" />

                {/* Abonnement */}
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">2. Abonnement (Trim.)</label>
                    <div className="flex items-center mt-1">
                        <WaterSettingInput
                            value={settings.sub_amount || 0}
                            onChange={(val) => handleFieldChange('sub_amount', val)}
                            className="flex-1 px-3 py-2 font-bold border rounded-l-lg"
                            step="0.01"
                            disabled={settings.price_mode === 'annual'}
                        />
                        <span className="px-3 py-2 bg-gray-100 border border-l-0 rounded-r-lg">€</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Sub-component: Input with local state & blur save
function WaterSettingInput({ value, onChange, className, step, disabled }) {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleBlur = () => {
        // Convert to number for comparison or just compare string representations roughly
        if (parseFloat(localValue) !== parseFloat(value)) {
            onChange(localValue);
        }
    };

    return (
        <input
            type="number"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            className={className}
            step={step}
            disabled={disabled}
        />
    );
}

// Sub-component: Annual Mode Panel
function AnnualModePanel({ settings, onSave }) {
    return (
        <div className="bg-gray-50 border rounded-lg p-3 space-y-2">
            <div>
                <label className="text-xs text-gray-500">Total Facture Annuelle (€)</label>
                <WaterSettingInput
                    value={settings.annual_total || 0}
                    onChange={(val) => onSave('annual_total', val)}
                    className="w-full mt-1 px-3 py-2 font-bold border border-blue-500 rounded-lg"
                    step="0.01"
                />
            </div>
            <div>
                <label className="text-xs text-gray-500">Dont Abo. Annuel (€)</label>
                <WaterSettingInput
                    value={settings.annual_sub || 0}
                    onChange={(val) => onSave('annual_sub', val)}
                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                    step="0.01"
                />
            </div>
            <div>
                <label className="text-xs text-gray-500">Volume Annuel (m³)</label>
                <WaterSettingInput
                    value={settings.annual_vol || 0}
                    onChange={(val) => onSave('annual_vol', val)}
                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                    step="0.001"
                />
            </div>
        </div>
    );
}

// Sub-component: Manual Mode Panel
function ManualModePanel({ settings, onSave }) {
    return (
        <div className="bg-gray-50 border rounded-lg p-3">
            <label className="text-xs text-gray-500">Prix du m³ (€)</label>
            <WaterSettingInput
                value={settings.manual_price || 0}
                onChange={(val) => onSave('manual_price', val)}
                className="w-full mt-1 px-3 py-2 font-bold border rounded-lg"
                step="0.0001"
            />
        </div>
    );
}
