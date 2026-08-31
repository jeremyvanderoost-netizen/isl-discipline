import { useState } from 'react';
import { DisciplineEventType, DisciplineSubcategory } from '../types';

interface ActionBarProps {
  selectedStudentIds: number[];
  onSuccess: (message: string) => void;
}

const EVENT_TYPES: { value: DisciplineEventType; label: string }[] = [
  { value: 'retard', label: 'Retard' },
  { value: 'matériel_manquant', label: 'Matériel manquant' },
  { value: 'travail_non_fait', label: 'Travail non fait' }
];

const SUBCATEGORIES: { value: DisciplineSubcategory; label: string }[] = [
  { value: null, label: 'Aucune' },
  { value: 'préparation', label: 'Préparation à domicile' },
  { value: 'document_oublié', label: 'Document oublié' },
  { value: 'évaluation_non_signée', label: 'Évaluation non signée' }
];

export default function ActionBar({ selectedStudentIds, onSuccess }: ActionBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [eventType, setEventType] = useState<DisciplineEventType>('retard');
  const [subcategory, setSubcategory] = useState<DisciplineSubcategory>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const isHidden = selectedStudentIds.length === 0;

  const handleAddEvent = async () => {
    if (selectedStudentIds.length === 0) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/events/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_ids: selectedStudentIds,
          event_type: eventType,
          subcategory: subcategory || undefined,
          comment: comment || undefined
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de l\'ajout de l\'événement');
      }

      const selectedCount = selectedStudentIds.length;
      const message = `${selectedCount} événement${selectedCount > 1 ? 's' : ''} ${eventType} ajouté${selectedCount > 1 ? 's' : ''}`;
      onSuccess(message);
      setIsOpen(false);
      setComment('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  if (isHidden) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {!isOpen ? (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-gray-800">
                {selectedStudentIds.length} élève{selectedStudentIds.length > 1 ? 's' : ''} sélectionné{selectedStudentIds.length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => { setEventType('retard'); setIsOpen(true); }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
              >
                ➕ Retard
              </button>
              <button
                onClick={() => { setEventType('matériel_manquant'); setIsOpen(true); }}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
              >
                ➕ Matériel
              </button>
              <button
                onClick={() => { setEventType('travail_non_fait'); setIsOpen(true); }}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-semibold"
              >
                ➕ Travail
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Ajouter un événement</h3>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Event Type Display */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type d'événement</label>
                <div className="bg-gray-100 px-3 py-2 rounded border border-gray-300 text-gray-800 font-semibold">
                  {EVENT_TYPES.find(t => t.value === eventType)?.label}
                </div>
              </div>

              {/* Subcategory */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sous-catégorie</label>
                <select
                  value={subcategory || ''}
                  onChange={(e) => setSubcategory((e.target.value || null) as DisciplineSubcategory)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {SUBCATEGORIES.map(sub => (
                    <option key={String(sub.value)} value={String(sub.value)}>
                      {sub.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Comment */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Commentaire (facultatif)</label>
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Détails supplémentaires..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleAddEvent}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '⏳ Enregistrement...' : '✓ Valider'}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
              >
                ✕ Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
