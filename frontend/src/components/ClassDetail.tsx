import { useEffect, useState } from 'react';
import { Student } from '../types';
import { useApi } from '../hooks/useApi';
import ActionBar from './ActionBar';

interface ClassDetailProps {
  classId: number;
  className: string;
  onBack: () => void;
}

export default function ClassDetail({ classId, className, onBack }: ClassDetailProps) {
  const { data: students, error: studentsError, loading, request } = useApi<Student[]>();
  const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    request(`/api/students/class/${classId}`, { method: 'GET' });
  }, [classId, request]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(''), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const toggleStudent = (studentId: number) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const toggleAllStudents = () => {
    if (!students) return;
    if (selectedStudents.size === students.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(students.map(s => s.id)));
    }
  };

  const handleActionSuccess = (message: string) => {
    setSuccessMessage(message);
    setSelectedStudents(new Set());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <button
              onClick={onBack}
              className="text-indigo-600 hover:text-indigo-800 font-semibold mb-2"
            >
              ← Retour
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Classe {className}</h1>
          </div>
          <div className="text-right text-gray-600">
            {students && (
              <p className="font-semibold">{students.length} élève{students.length > 1 ? 's' : ''}</p>
            )}
            {selectedStudents.size > 0 && (
              <p className="text-indigo-600">{selectedStudents.size} sélectionné{selectedStudents.size > 1 ? 's' : ''}</p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="bg-green-50 border-b border-green-200 text-green-700 px-4 py-3">
          <p className="font-semibold max-w-7xl mx-auto">✓ {successMessage}</p>
        </div>
      )}

      {studentsError && (
        <div className="bg-red-50 border-b border-red-200 text-red-700 px-4 py-3">
          <p className="font-semibold max-w-7xl mx-auto">✗ {studentsError.message}</p>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading && (
          <p className="text-center text-gray-600">Chargement des élèves...</p>
        )}

        {students && students.length === 0 && (
          <p className="text-center text-gray-600">Aucun élève dans cette classe</p>
        )}

        {students && students.length > 0 && (
          <>
            {/* Student List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Header - Select All */}
              <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={students.length > 0 && selectedStudents.size === students.length}
                    onChange={toggleAllStudents}
                    className="w-5 h-5 text-indigo-600 cursor-pointer"
                  />
                  <span className="font-semibold text-gray-700">Sélectionner tous</span>
                </label>
              </div>

              {/* Student rows */}
              <div className="divide-y divide-gray-200">
                {students.map(student => (
                  <label
                    key={student.id}
                    className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-indigo-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudents.has(student.id)}
                      onChange={() => toggleStudent(student.id)}
                      className="w-5 h-5 text-indigo-600 cursor-pointer"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{student.last_name} {student.first_name}</p>
                      <p className="text-sm text-gray-600">ID: {student.id}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Action Bar */}
      {students && students.length > 0 && (
        <ActionBar
          selectedStudentIds={Array.from(selectedStudents)}
          onSuccess={handleActionSuccess}
        />
      )}
    </div>
  );
}
