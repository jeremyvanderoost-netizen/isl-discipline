import { useEffect, useState } from 'react';
import { Student, StudentStats, Alert } from '../types';
import { useApi } from '../hooks/useApi';
import ActionBar from './ActionBar';
import PunitionActionBar from './PunitionActionBar';
import StudentRow from './StudentRow';
import AlertDialog from './AlertDialog';
import StudentDetail from './StudentDetail';
import StudentManagement from './StudentManagement';

type Screen = 'class' | 'student-detail';

interface ClassDetailProps {
  classId: number;
  className: string;
  onBack: () => void;
}

export default function ClassDetail({ classId, className, onBack }: ClassDetailProps) {
  const { data: students, error: studentsError, loading, request } = useApi<Student[]>();
  const [studentStats, setStudentStats] = useState<Map<number, StudentStats>>(new Map());
  const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [selectedAlert, setSelectedAlert] = useState<{ alert: Alert; studentId: number; studentName: string } | null>(null);
  const [screen, setScreen] = useState<Screen>('class');
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  useEffect(() => {
    request(`/api/students/class/${classId}`, { method: 'GET' });
  }, [classId, request]);

  useEffect(() => {
    if (!students) return;
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
    // Recharger les stats
    students?.forEach(student => {
      fetch(`/api/stats/student/${student.id}`)
        .then(r => r.json())
        .then(stats => {
          setStudentStats(prev => new Map(prev).set(student.id, stats));
        });
    });
  };

  const handleResolveAlert = async (comment: string) => {
    if (!selectedAlert) return;
    try {
      const response = await fetch(`/api/alerts/${selectedAlert.alert.id}/resolve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment })
      });
      if (!response.ok) throw new Error('Erreur');
      setSelectedAlert(null);
      handleActionSuccess('✓ Alerte traitée');
    } catch (error) {
      alert('Erreur lors du traitement de l\'alerte');
    }
  };

  const handleViewStudent = (studentId: number) => {
    setSelectedStudentId(studentId);
    setScreen('student-detail');
  };

  const handleBackFromDetail = () => {
    setSelectedStudentId(null);
    setScreen('class');
  };

  const handleDeleteStudent = async (studentId: number) => {
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erreur');
      handleActionSuccess('✓ Élève supprimé');
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleReloadStudents = () => {
    request(`/api/students/class/${classId}`, { method: 'GET' });
  };

  if (screen === 'student-detail' && selectedStudentId) {
    return <StudentDetail studentId={selectedStudentId} onBack={handleBackFromDetail} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <button
                onClick={onBack}
                className="text-indigo-600 hover:text-indigo-800 font-semibold mb-2 text-base min-h-[44px] inline-flex items-center"
              >
                ← Retour
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Classe {className}</h1>
            </div>
            <div className="text-right text-gray-600">
              {students && (
                <p className="font-semibold text-sm">{students.length} élève{students.length > 1 ? 's' : ''}</p>
              )}
              {selectedStudents.size > 0 && (
                <p className="text-indigo-600 text-sm font-semibold">{selectedStudents.size} sélectionné{selectedStudents.size > 1 ? 's' : ''}</p>
              )}
            </div>
          </div>
          {/* Management buttons */}
          <div className="flex gap-2 flex-wrap">
            <StudentManagement classId={classId} className={className} onStudentAdded={handleReloadStudents} />
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
      <div className="px-4 py-4 sm:py-6">
        {loading && (
          <p className="text-center text-gray-600">Chargement des élèves...</p>
        )}

        {students && students.length === 0 && (
          <p className="text-center text-gray-600">Aucun élève dans cette classe</p>
        )}

        {students && students.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header */}
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
                <StudentRow
                  key={student.id}
                  student={student}
                  stats={studentStats.get(student.id) || null}
                  isSelected={selectedStudents.has(student.id)}
                  onToggle={toggleStudent}
                  onViewDetail={handleViewStudent}
                  onDelete={handleDeleteStudent}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Bars */}
      {students && students.length > 0 && (
        <>
          <ActionBar
            selectedStudentIds={Array.from(selectedStudents)}
            onSuccess={handleActionSuccess}
          />
          <PunitionActionBar
            selectedStudentIds={Array.from(selectedStudents)}
            onSuccess={handleActionSuccess}
          />
        </>
      )}

      {/* Alert Dialog */}
      {selectedAlert && (
        <AlertDialog
          alert={selectedAlert.alert}
          studentName={selectedAlert.studentName}
          onResolve={handleResolveAlert}
          onClose={() => setSelectedAlert(null)}
        />
      )}
    </div>
  );
}
