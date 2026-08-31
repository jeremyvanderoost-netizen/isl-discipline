import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useApi } from '../hooks/useApi';
export default function StudentDetail({ studentId, onBack }) {
    const { data: studentData, loading, error, request } = useApi();
    useEffect(() => {
        request(`/api/students-detail/${studentId}/complete`, { method: 'GET' });
    }, [studentId, request]);
    const handleDownloadPDF = async () => {
        try {
            const response = await fetch(`/api/export/student/${studentId}/pdf`);
            if (!response.ok)
                throw new Error('Erreur lors du téléchargement');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `historique-${studentData?.student.last_name}-${studentData?.student.first_name}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }
        catch (err) {
            alert('Erreur lors du téléchargement du PDF');
        }
    };
    if (loading) {
        return _jsx("div", { className: "p-4", children: "Chargement..." });
    }
    if (error || !studentData) {
        return (_jsxs("div", { className: "p-4", children: [_jsx("button", { onClick: onBack, className: "text-indigo-600 hover:underline mb-4", children: "\u2190 Retour" }), _jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded", children: error?.message || 'Erreur lors du chargement' })] }));
    }
    const { student, punishment_count, active_alert, resolved_alerts, events, punitions } = studentData;
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fr-BE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };
    return (_jsx("div", { className: "min-h-screen bg-gray-50 p-4", children: _jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsx("button", { onClick: onBack, className: "text-indigo-600 hover:underline mb-4 font-semibold", children: "\u2190 Retour" }), _jsxs("div", { className: "bg-white rounded-lg shadow-md p-6 mb-6", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-3xl font-bold text-gray-800", children: [student.last_name, " ", student.first_name] }), _jsxs("p", { className: "text-gray-600", children: ["Classe: ", student.class] })] }), _jsx("button", { onClick: handleDownloadPDF, className: "px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold", children: "\uD83D\uDCE5 Exporter en PDF" })] }), _jsxs("div", { className: "mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Total des retenues" }), _jsx("p", { className: "text-2xl font-bold text-gray-800", children: punishment_count })] }), active_alert && (_jsxs("div", { className: "bg-red-50 border border-red-200 rounded p-3", children: [_jsx("p", { className: "text-sm font-semibold text-red-700", children: "ALERTE ACTIVE" }), _jsxs("p", { className: "text-sm text-red-600", children: [active_alert.punishment_count_at_trigger, " retenues"] })] }))] })] }), resolved_alerts.length > 0 && (_jsxs("div", { className: "bg-white rounded-lg shadow-md p-6 mb-6", children: [_jsx("h2", { className: "text-xl font-bold text-gray-800 mb-4", children: "Historique des alertes trait\u00E9es" }), _jsx("div", { className: "space-y-3", children: resolved_alerts.map(alert => (_jsxs("div", { className: "border-l-4 border-orange-400 pl-4 py-2", children: [_jsxs("p", { className: "text-sm text-gray-600", children: [_jsx("span", { className: "font-semibold", children: formatDate(alert.triggered_at) }), " - ", alert.punishment_count_at_trigger, " retenues"] }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Trait\u00E9e le ", formatDate(alert.resolved_at)] }), alert.resolution_comment && (_jsxs("p", { className: "text-sm text-gray-500 italic mt-1", children: ["\"", alert.resolution_comment, "\""] }))] }, alert.id))) })] })), _jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsx("h2", { className: "text-xl font-bold text-gray-800 mb-4", children: "Historique chronologique" }), events.length === 0 && punitions.length === 0 ? (_jsx("p", { className: "text-gray-500 italic", children: "Aucun historique" })) : (_jsx("div", { className: "space-y-3", children: [
                                ...events.map(e => ({
                                    type: 'event',
                                    date: new Date(e.event_date),
                                    title: `Événement: ${e.event_type}`,
                                    comment: e.comment
                                })),
                                ...punitions.map(p => ({
                                    type: 'punition',
                                    date: new Date(p.detention_date),
                                    title: `Retenue ${p.reason ? '- ' + p.reason : ''}`,
                                    comment: null
                                }))
                            ]
                                .sort((a, b) => b.date.getTime() - a.date.getTime())
                                .map((item, idx) => (_jsxs("div", { className: `border-l-4 pl-4 py-2 ${item.type === 'event' ? 'border-blue-400' : 'border-purple-400'}`, children: [_jsx("p", { className: "text-sm font-semibold text-gray-800", children: formatDate(item.date.toISOString()) }), _jsx("p", { className: "text-sm text-gray-700", children: item.title }), item.comment && (_jsxs("p", { className: "text-sm text-gray-600 italic", children: ["\"", item.comment, "\""] }))] }, idx))) }))] })] }) }));
}
