import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import ActionBar from './ActionBar';
import PunitionActionBar from './PunitionActionBar';
import StudentRow from './StudentRow';
import AlertDialog from './AlertDialog';
import StudentDetail from './StudentDetail';
export default function ClassDetail({ classId, className, onBack }) {
    const { data: students, error: studentsError, loading, request } = useApi();
    const [studentStats, setStudentStats] = useState(new Map());
    const [selectedStudents, setSelectedStudents] = useState(new Set());
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [screen, setScreen] = useState('class');
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    useEffect(() => {
        request(`/api/students/class/${classId}`, { method: 'GET' });
    }, [classId, request]);
    useEffect(() => {
        if (!students)
            return;
        // Charger les stats pour chaque élève
        students.forEach(student => {
            fetch(`/api/stats/student/${student.id}`)
                .then(r => r.json())
                .then(stats => {
                setStudentStats(prev => new Map(prev).set(student.id, stats));
                // Vérifier si une alerte active existe
                if (stats.active_alert && !stats.active_alert.resolved_at) {
                    setSelectedAlert({
                        alert: stats.active_alert,
                        studentId: student.id,
                        studentName: `${student.last_name} ${student.first_name}`
                    });
                }
            });
        });
    }, [students]);
    useEffect(() => {
        if (!successMessage)
            return;
        const timer = setTimeout(() => setSuccessMessage(''), 3000);
        return () => clearTimeout(timer);
    }, [successMessage]);
    const toggleStudent = (studentId) => {
        const newSelected = new Set(selectedStudents);
        if (newSelected.has(studentId)) {
            newSelected.delete(studentId);
        }
        else {
            newSelected.add(studentId);
        }
        setSelectedStudents(newSelected);
    };
    const toggleAllStudents = () => {
        if (!students)
            return;
        if (selectedStudents.size === students.length) {
            setSelectedStudents(new Set());
        }
        else {
            setSelectedStudents(new Set(students.map(s => s.id)));
        }
    };
    const handleActionSuccess = (message) => {
        setSuccessMessage(message);
        setSelectedStudents(new Set());
        // Recharger les stats
        students?.forEach(student => {
            fetch(`/api/stats/student/${student.id}`)
                .then(r => r.json())
                .then(stats => {
                setStudentStats(prev => new Map(prev).set(student.id, stats));
            });
        });
    };
    const handleResolveAlert = async (comment) => {
        if (!selectedAlert)
            return;
        try {
            const response = await fetch(`/api/alerts/${selectedAlert.alert.id}/resolve`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comment })
            });
            if (!response.ok)
                throw new Error('Erreur');
            setSelectedAlert(null);
            handleActionSuccess('✓ Alerte traitée');
        }
        catch (error) {
            alert('Erreur lors du traitement de l\'alerte');
        }
    };
    const handleViewStudent = (studentId) => {
        setSelectedStudentId(studentId);
        setScreen('student-detail');
    };
    const handleBackFromDetail = () => {
        setSelectedStudentId(null);
        setScreen('class');
    };
    if (screen === 'student-detail' && selectedStudentId) {
        return _jsx(StudentDetail, { studentId: selectedStudentId, onBack: handleBackFromDetail });
    }
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("div", { className: "bg-white border-b border-gray-200 sticky top-0 z-10", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 py-4 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("button", { onClick: onBack, className: "text-indigo-600 hover:text-indigo-800 font-semibold mb-2", children: "\u2190 Retour" }), _jsxs("h1", { className: "text-3xl font-bold text-gray-800", children: ["Classe ", className] })] }), _jsxs("div", { className: "text-right text-gray-600", children: [students && (_jsxs("p", { className: "font-semibold", children: [students.length, " \u00E9l\u00E8ve", students.length > 1 ? 's' : ''] })), selectedStudents.size > 0 && (_jsxs("p", { className: "text-indigo-600", children: [selectedStudents.size, " s\u00E9lectionn\u00E9", selectedStudents.size > 1 ? 's' : ''] }))] })] }) }), successMessage && (_jsx("div", { className: "bg-green-50 border-b border-green-200 text-green-700 px-4 py-3", children: _jsxs("p", { className: "font-semibold max-w-7xl mx-auto", children: ["\u2713 ", successMessage] }) })), studentsError && (_jsx("div", { className: "bg-red-50 border-b border-red-200 text-red-700 px-4 py-3", children: _jsxs("p", { className: "font-semibold max-w-7xl mx-auto", children: ["\u2717 ", studentsError.message] }) })), _jsxs("div", { className: "max-w-7xl mx-auto px-4 py-6", children: [loading && (_jsx("p", { className: "text-center text-gray-600", children: "Chargement des \u00E9l\u00E8ves..." })), students && students.length === 0 && (_jsx("p", { className: "text-center text-gray-600", children: "Aucun \u00E9l\u00E8ve dans cette classe" })), students && students.length > 0 && (_jsxs("div", { className: "bg-white rounded-lg shadow-md overflow-hidden", children: [_jsx("div", { className: "bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center", children: _jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: students.length > 0 && selectedStudents.size === students.length, onChange: toggleAllStudents, className: "w-5 h-5 text-indigo-600 cursor-pointer" }), _jsx("span", { className: "font-semibold text-gray-700", children: "S\u00E9lectionner tous" })] }) }), _jsx("div", { className: "divide-y divide-gray-200", children: students.map(student => (_jsx(StudentRow, { student: student, stats: studentStats.get(student.id) || null, isSelected: selectedStudents.has(student.id), onToggle: toggleStudent, onViewDetail: handleViewStudent }, student.id))) })] }))] }), students && students.length > 0 && (_jsxs(_Fragment, { children: [_jsx(ActionBar, { selectedStudentIds: Array.from(selectedStudents), onSuccess: handleActionSuccess }), _jsx(PunitionActionBar, { selectedStudentIds: Array.from(selectedStudents), onSuccess: handleActionSuccess })] })), selectedAlert && (_jsx(AlertDialog, { alert: selectedAlert.alert, studentName: selectedAlert.studentName, onResolve: handleResolveAlert, onClose: () => setSelectedAlert(null) }))] }));
}
