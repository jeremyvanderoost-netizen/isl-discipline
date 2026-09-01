import { useEffect, useRef, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { DisciplineEventType, DisciplineSubcategory } from '../types';
import EditPunitionDialog from './EditPunitionDialog';

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

const EVENT_TYPES: { value: DisciplineEventType; label: string; color: string }[] = [
  { value: 'retard', label: 'Retard', color: 'bg-red-500 hover:bg-red-600' },
  { value: 'matériel_manquant', label: 'Matériel manquant', color: 'bg-orange-500 hover:bg-orange-600' },
  { value: 'travail_non_fait', label: 'Travail non fait', color: 'bg-yellow-500 hover:bg-yellow-600' }
];

const SUBCATEGORIES: { value: DisciplineSubcategory; label: string }[] = [
  { value: null, label: 'Aucune' },
  { value: 'préparation', label: 'Préparation à domicile' },
  { value: 'document_oublié', label: 'Document oublié' },
  { value: 'évaluation_non_signée', label: 'Évaluation non signée' }
];

export default function StudentDetail({ studentId, onBack }: StudentDetailProps) {
  const { data: studentData, loading, error, request } = useApi<StudentData>();
  const [eventType, setEventType] = useState<DisciplineEventType | null>(null);
  const [subcategory, setSubcategory] = useState<DisciplineSubcategory>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const submittingRef = useRef(false);
  const [editingPunition, setEditingPunition] = useState<{ id: number; detention_date: string; reason: string | null } | null>(null);
  const cancellingRef = useRef(false);

  const loadStudent = () => {
    request(`/api/students-detail/${studentId}/complete`, { method: 'GET' });
  };

  useEffect(() => {
    loadStudent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(''), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const handleAddEvent = async () => {
    if (!eventType) return;
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          event_type: eventType,
          subcategory: subcategory || undefined,
          comment: comment || undefined
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de l\'ajout de l\'événement');
      }

      setSuccessMessage(`✓ ${EVENT_TYPES.find(t => t.value === eventType)?.label} ajouté`);
      setEventType(null);
      setSubcategory(null);
      setComment('');
      loadStudent();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  };

  const handleCancelPunition = async (punitionId: number) => {
    if (cancellingRef.current) return;
    if (!confirm('Annuler cette retenue ? Cette action est définitive.')) return;
    cancellingRef.current = true;

    try {
      const response = await fetch(`/api/punitions/${punitionId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Erreur lors de l\'annulation');
      setSuccessMessage('✓ Retenue annulée');
      loadStudent();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de l\'annulation');
    } finally {
      cancellingRef.current = false;
    }
  };

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

        {/* Ajouter un événement disciplinaire */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Ajouter un événement</h2>

          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded mb-4 font-semibold text-sm">
              {successMessage}
            </div>
          )}

          {!eventType ? (
            <div className="flex gap-2 flex-wrap">
              {EVENT_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => setEventType(type.value)}
                  className={`px-4 py-2 text-white rounded-lg transition-colors font-semibold text-sm min-h-[44px] ${type.color}`}
                >
                  ➕ {type.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                  {submitError}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                <div className="bg-gray-100 px-3 py-2 rounded border border-gray-300 text-gray-800 font-semibold text-sm">
                  {EVENT_TYPES.find(t => t.value === eventType)?.label}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sous-catégorie</label>
                <select
                  value={subcategory || ''}
                  onChange={(e) => setSubcategory((e.target.value || null) as DisciplineSubcategory)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
                >
                  {SUBCATEGORIES.map(sub => (
                    <option key={String(sub.value)} value={String(sub.value)}>
                      {sub.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Commentaire (facultatif)</label>
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Détails..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAddEvent}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm disabled:opacity-50 min-h-[44px]"
                >
                  {submitting ? '⏳ Enregistrement...' : '✓ Valider'}
                </button>
                <button
                  onClick={() => { setEventType(null); setSubmitError(''); }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-semibold text-sm min-h-[44px]"
                >
                  ✕ Annuler
                </button>
              </div>
            </div>
          )}
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
                  comment: e.comment as string | null
                })),
                ...punitions.map(p => ({
                  type: 'punition' as const,
                  id: p.id as number,
                  date: new Date(p.detention_date),
                  title: `Retenue${p.reason ? ' - ' + p.reason : ''}`,
                  comment: null as string | null,
                  detention_date: p.detention_date as string,
                  reason: (p.reason ?? null) as string | null
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
                    {item.type === 'punition' && (
                      <div className="flex gap-3 mt-2">
                        <button
                          onClick={() => setEditingPunition({ id: item.id, detention_date: item.detention_date, reason: item.reason })}
                          className="text-purple-600 hover:text-purple-800 font-semibold text-xs min-h-[32px] flex items-center"
                        >
                          ✏️ Modifier
                        </button>
                        <button
                          onClick={() => handleCancelPunition(item.id)}
                          className="text-red-600 hover:text-red-800 font-semibold text-xs min-h-[32px] flex items-center"
                        >
                          🗑️ Annuler
                        </button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {editingPunition && (
        <EditPunitionDialog
          punition={editingPunition}
          onClose={() => setEditingPunition(null)}
          onSaved={() => { setSuccessMessage('✓ Retenue modifiée'); loadStudent(); }}
        />
      )}
    </div>
  );
}
