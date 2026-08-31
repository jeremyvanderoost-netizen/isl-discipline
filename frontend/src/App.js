import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import ClassList from './components/ClassList';
import ClassDetail from './components/ClassDetail';
import { useApi } from './hooks/useApi';
export default function App() {
    const [screen, setScreen] = useState('classes');
    const [selectedClass, setSelectedClass] = useState(null);
    const { request } = useApi();
    const handleSelectClass = async (classId) => {
        const classData = await request(`/api/classes/${classId}`, { method: 'GET' });
        if (classData) {
            setSelectedClass(classData);
            setScreen('class-detail');
        }
    };
    const handleBack = () => {
        setScreen('classes');
        setSelectedClass(null);
    };
    return (_jsxs(_Fragment, { children: [screen === 'classes' && (_jsx(ClassList, { onSelectClass: handleSelectClass })), screen === 'class-detail' && selectedClass && (_jsx(ClassDetail, { classId: selectedClass.id, className: selectedClass.name, onBack: handleBack }))] }));
}
