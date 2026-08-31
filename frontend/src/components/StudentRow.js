import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function StudentRow({ student, stats, isSelected, onToggle, onViewDetail }) {
    const punishmentCount = stats?.punishment_count || 0;
    const hasActiveAlert = stats?.active_alert && !stats.active_alert.resolved_at;
    return (_jsxs("div", { className: "flex items-center gap-4 px-4 py-3 hover:bg-indigo-50 transition-colors border-b border-gray-200 last:border-b-0", children: [_jsx("input", { type: "checkbox", checked: isSelected, onChange: () => onToggle(student.id), className: "w-5 h-5 text-indigo-600 cursor-pointer" }), _jsxs("div", { className: "flex-1 cursor-pointer", onClick: () => onViewDetail?.(student.id), children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("p", { className: "font-semibold text-indigo-600 hover:text-indigo-800", children: [student.last_name, " ", student.first_name] }), hasActiveAlert && (_jsx("span", { className: "bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold", children: "\u260E ALERTE" })), punishmentCount > 0 && (_jsxs("span", { className: `text-xs px-2 py-1 rounded-full font-semibold ${punishmentCount >= 3
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-orange-100 text-orange-700'}`, children: [punishmentCount, " retenue", punishmentCount > 1 ? 's' : ''] }))] }), _jsxs("p", { className: "text-sm text-gray-600", children: ["ID: ", student.id] })] })] }));
}
