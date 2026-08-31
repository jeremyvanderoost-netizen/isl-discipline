import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
const EVENT_TYPES = [
    { value: 'retard', label: 'Retard' },
    { value: 'matériel_manquant', label: 'Matériel manquant' },
    { value: 'travail_non_fait', label: 'Travail non fait' }
];
const SUBCATEGORIES = [
    { value: null, label: 'Aucune' },
    { value: 'préparation', label: 'Préparation à domicile' },
    { value: 'document_oublié', label: 'Document oublié' },
    { value: 'évaluation_non_signée', label: 'Évaluation non signée' }
];
export default function ActionBar({ selectedStudentIds, onSuccess }) {
    const [isOpen, setIsOpen] = useState(false);
    const [eventType, setEventType] = useState('retard');
    const [subcategory, setSubcategory] = useState(null);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const isHidden = selectedStudentIds.length === 0;
    const handleAddEvent = async () => {
        if (selectedStudentIds.length === 0)
            return;
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/events/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    student_ids: selectedStudentIds,
                    event_type: eventType,
                    subcategory: subcategory || undefined,
                    comment: comment || undefined
                })
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erreur lors de l\'ajout de l\'événement');
            }
            const selectedCount = selectedStudentIds.length;
            const message = `${selectedCount} événement${selectedCount > 1 ? 's' : ''} ${eventType} ajouté${selectedCount > 1 ? 's' : ''}`;
            onSuccess(message);
            setIsOpen(false);
            setComment('');
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
    return (_jsx("div", { className: "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 py-4", children: !isOpen ? (_jsxs("div", { className: "flex items-center justify-between gap-4", children: [_jsx("div", { children: _jsxs("p", { className: "font-semibold text-gray-800", children: [selectedStudentIds.length, " \u00E9l\u00E8ve", selectedStudentIds.length > 1 ? 's' : '', " s\u00E9lectionn\u00E9", selectedStudentIds.length > 1 ? 's' : ''] }) }), _jsxs("div", { className: "flex gap-2 flex-wrap", children: [_jsx("button", { onClick: () => { setEventType('retard'); setIsOpen(true); }, className: "px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold", children: "\u2795 Retard" }), _jsx("button", { onClick: () => { setEventType('matériel_manquant'); setIsOpen(true); }, className: "px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold", children: "\u2795 Mat\u00E9riel" }), _jsx("button", { onClick: () => { setEventType('travail_non_fait'); setIsOpen(true); }, className: "px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-semibold", children: "\u2795 Travail" })] })] })) : (_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "font-bold text-lg", children: "Ajouter un \u00E9v\u00E9nement" }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm", children: error })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Type d'\u00E9v\u00E9nement" }), _jsx("div", { className: "bg-gray-100 px-3 py-2 rounded border border-gray-300 text-gray-800 font-semibold", children: EVENT_TYPES.find(t => t.value === eventType)?.label })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Sous-cat\u00E9gorie" }), _jsx("select", { value: subcategory || '', onChange: (e) => setSubcategory((e.target.value || null)), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500", children: SUBCATEGORIES.map(sub => (_jsx("option", { value: String(sub.value), children: sub.label }, String(sub.value)))) })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Commentaire (facultatif)" }), _jsx("input", { type: "text", value: comment, onChange: (e) => setComment(e.target.value), placeholder: "D\u00E9tails suppl\u00E9mentaires...", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: handleAddEvent, disabled: loading, className: "px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed", children: loading ? '⏳ Enregistrement...' : '✓ Valider' }), _jsx("button", { onClick: () => setIsOpen(false), className: "px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-semibold", children: "\u2715 Annuler" })] })] })) }) }));
}
