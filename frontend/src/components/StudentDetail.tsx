import { useEffect } from 'react';
import { useApi } from '../hooks/useApi';

interface StudentDetailProps {
  studentId: number;
  onBack: () => void;
}

interface StudentData {
  student: { id: number; first_name: string; last_name: string; class: string };
  punishment_count: number;
  active_alert: any | null;
  resolved_alerts: any[];
  events: any[];
  punitions: any[];
}

export default function StudentDetail({ studentId, onBack }: StudentDetailProps) {
  const { data: studentData, loading, error, request } = useApi<StudentData>();

  useEffect(() => {
    request(`/api/students-detail/${studentId}/complete`, { method: 'GET' });
  }, [studentId, request]);

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`/api/export/student/${studentId}/pdf`);
      if (!response.ok) throw new Error('Erreur lors du téléchargement');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `historique-${studentData?.student.last_name}-${studentData?.student.first_name}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Erreur lors du téléchargement du PDF');
    }
  };

  if (loading) {
    return <div className="p-4">Chargement...</div>;
  }

  if (error || !studentData) {
    return (
      <div className="p-4">
        <button onClick={onBack} className="text-indigo-600 hover:underline mb-4">
          ← Retour
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error?.message || 'Erreur lors du chargement'}
        </div>
      </div>
    );
  }

  const { student, punishment_count, active_alert, resolved_alerts, events, punitions } = studentData;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-BE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="text-indigo-600 hover:underline mb-4 font-semibold">
          ← Retour
        </button>

        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {student.last_name} {student.first_name}
              </h1>
              <p className="text-gray-600">Classe: {student.class}</p>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
            >
              📥 Exporter en PDF
            </button>
          </div>

          {/* Statistiques */}
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total des retenues</p>
              <p className="text-2xl font-bold text-gray-800">{punishment_count}</p>
            </div>
            {active_alert && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm font-semibold text-red-700">ALERTE ACTIVE</p>
                <p className="text-sm text-red-600">{active_alert.punishment_count_at_trigger} retenues</p>
              </div>
            )}
          </div>
        </div>

        {/* Alertes résolues */}
        {resolved_alerts.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Historique des alertes traitées</h2>
            <div className="space-y-3">
              {resolved_alerts.map(alert => (
                <div key={alert.id} className="border-l-4 border-orange-400 pl-4 py-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">{formatDate(alert.triggered_at)}</span> - {alert.punishment_count_at_trigger} retenues
                  </p>
                  <p className="text-sm text-gray-600">
                    Traitée le {formatDate(alert.resolved_at)}
                  </p>
                  {alert.resolution_comment && (
                    <p className="text-sm text-gray-500 italic mt-1">"{alert.resolution_comment}"</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Historique chronologique */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Historique chronologique</h2>

          {events.length === 0 && punitions.length === 0 ? (
            <p className="text-gray-500 italic">Aucun historique</p>
          ) : (
            <div className="space-y-3">
              {/* Combiner et trier */}
              {[
                ...events.map(e => ({
                  type: 'event' as const,
                  date: new Date(e.event_date),
                  title: `Événement: ${e.event_type}`,
                  comment: e.comment
                })),
                ...punitions.map(p => ({
                  type: 'punition' as const,
                  date: new Date(p.detention_date),
                  title: `Retenue ${p.reason ? '- ' + p.reason : ''}`,
                  comment: null
                }))
              ]
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .map((item, idx) => (
                  <div key={idx} className={`border-l-4 pl-4 py-2 ${
                    item.type === 'event' ? 'border-blue-400' : 'border-purple-400'
                  }`}>
                    <p className="text-sm font-semibold text-gray-800">{formatDate(item.date.toISOString())}</p>
                    <p className="text-sm text-gray-700">{item.title}</p>
                    {item.comment && (
                      <p className="text-sm text-gray-600 italic">"{item.comment}"</p>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
