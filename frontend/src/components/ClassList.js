import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useApi } from '../hooks/useApi';
export default function ClassList({ onSelectClass }) {
    const { data: classes, error, loading, request } = useApi();
    useEffect(() => {
        request('/api/classes', { method: 'GET' });
    }, [request]);
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4", children: _jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-800 mb-8 text-center", children: "Gestion Disciplinaire" }), error && (_jsxs("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4", children: [_jsx("p", { className: "font-semibold", children: "\u2717 Erreur" }), _jsx("p", { children: error.message })] })), loading && (_jsx("div", { className: "text-center text-gray-600", children: "Chargement des classes..." })), classes && classes.length === 0 && (_jsxs("div", { className: "bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded text-center", children: [_jsx("p", { className: "font-semibold", children: "Aucune classe disponible" }), _jsxs("p", { className: "text-sm mt-1", children: ["Utilise ", _jsx("code", { className: "bg-white px-2 py-1 rounded", children: "npm run seed" }), " pour cr\u00E9er des donn\u00E9es de d\u00E9monstration"] })] })), classes && classes.length > 0 && (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: classes.map(cls => (_jsxs("button", { onClick: () => onSelectClass(cls.id), className: "bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 text-left cursor-pointer", children: [_jsx("h2", { className: "text-2xl font-bold text-indigo-600 mb-2", children: cls.name }), _jsxs("p", { className: "text-gray-600 text-sm", children: ["Classe ", cls.name] })] }, cls.id))) }))] }) }));
}
