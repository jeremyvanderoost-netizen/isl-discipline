import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
export default function AlertDialog({ alert, studentName, onResolve, onClose }) {
    const [loading, setLoading] = useState(false);
    const [comment, setComment] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    if (!alert)
        return null;
    const handleResolve = async () => {
        setLoading(true);
        try {
            await onResolve(comment);
            onClose();
            setComment('');
            setShowConfirm(false);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-lg shadow-lg max-w-md w-full", children: [_jsx("div", { className: "bg-red-50 border-b border-red-200 p-4", children: _jsxs("h2", { className: "text-xl font-bold text-red-700", children: ["\u26A0\uFE0F Alerte - ", studentName] }) }), _jsxs("div", { className: "p-4 space-y-3", children: [_jsxs("p", { className: "text-gray-700", children: [_jsx("span", { className: "font-semibold", children: "Nombre de retenues :" }), ' ', alert.punishment_count_at_trigger] }), _jsxs("p", { className: "text-gray-600 text-sm", children: ["Cet \u00E9l\u00E8ve a atteint ", alert.punishment_count_at_trigger, " retenues. Les parents doivent \u00EAtre contact\u00E9s."] }), !showConfirm ? (_jsx("button", { onClick: () => setShowConfirm(true), className: "w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-semibold", children: "\u260E Contacter les parents" })) : (_jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "block", children: [_jsx("p", { className: "text-sm font-semibold text-gray-700 mb-2", children: "Commentaire sur le traitement (facultatif)" }), _jsx("textarea", { value: comment, onChange: (e) => setComment(e.target.value), placeholder: "Ex: Parents contact\u00E9s le...", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500", rows: 3 })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: handleResolve, disabled: loading, className: "flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-semibold disabled:opacity-50", children: loading ? '⏳ Traitement...' : '✓ Alerte traitée' }), _jsx("button", { onClick: () => setShowConfirm(false), className: "flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors font-semibold", children: "\u2715 Annuler" })] })] }))] })] }) }));
}
