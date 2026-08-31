import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
export default function PunitionActionBar({ selectedStudentIds, onSuccess }) {
    const [isOpen, setIsOpen] = useState(false);
    const [detentionDate, setDetentionDate] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const isHidden = selectedStudentIds.length === 0;
    const handleAddPunition = async () => {
        if (selectedStudentIds.length === 0 || !detentionDate)
            return;
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/punitions/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    student_ids: selectedStudentIds,
                    detention_date: detentionDate,
                    reason: reason || undefined
                })
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erreur lors de l\'ajout de la retenue');
            }
            const selectedCount = selectedStudentIds.length;
            const message = `${selectedCount} retenue${selectedCount > 1 ? 's' : ''} ajoutée${selectedCount > 1 ? 's' : ''}`;
            onSuccess(message);
            setIsOpen(false);
            setDetentionDate('');
            setReason('');
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        }
        finally {
            setLoading(false);
        }
    };
    if (isHidden) {
        return null;
    }
    return (_jsx("div", { className: "fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 py-4", children: !isOpen ? (_jsxs("div", { className: "flex items-center justify-between gap-4", children: [_jsx("div", { children: _jsxs("p", { className: "font-semibold text-gray-800", children: [selectedStudentIds.length, " \u00E9l\u00E8ve", selectedStudentIds.length > 1 ? 's' : '', " s\u00E9lectionn\u00E9", selectedStudentIds.length > 1 ? 's' : ''] }) }), _jsx("button", { onClick: () => setIsOpen(true), className: "px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold", children: "\u2795 Donner une retenue" })] })) : (_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "font-bold text-lg", children: "Ajouter une retenue" }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm", children: error })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Date et heure de retenue" }), _jsx("input", { type: "datetime-local", value: detentionDate, onChange: (e) => setDetentionDate(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Motif (facultatif)" }), _jsx("input", { type: "text", value: reason, onChange: (e) => setReason(e.target.value), placeholder: "Ex: Travail non fait", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: handleAddPunition, disabled: loading || !detentionDate, className: "px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed", children: loading ? '⏳ Enregistrement...' : '✓ Valider' }), _jsx("button", { onClick: () => setIsOpen(false), className: "px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-semibold", children: "\u2715 Annuler" })] })] })) }) }));
}
