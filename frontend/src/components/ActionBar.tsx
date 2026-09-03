import { useRef, useState } from 'react';
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
  const submittingRef = useRef(false);

  const isHidden = selectedStudentIds.length === 0;

  const handleAddEvent = async () => {
    if (selectedStudentIds.length === 0) return;
    // Verrou synchrone : le state React (loading) ne se répercute qu'au
    // prochain rendu, ce qui laisse une fenêtre où deux clics rapprochés
    // déclenchent chacun une requête. La ref bloque dès le premier appel.
    if (submittingRef.current) return;
    submittingRef.current = true;

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
      submittingRef.current = false;
    }
  };

  if (isHidden) {
    return null;
  }

  return (
    <div className="bg-white border-t border-gray-200">
      <div className="px-4 py-4">
        {!isOpen ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-semibold text-gray-800 text-sm sm:text-base">
                {selectedStudentIds.length} élève{selectedStudentIds.length > 1 ? 's' : ''} sélectionné{selectedStudentIds.length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => { setEventType('retard'); setIsOpen(true); }}
                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold text-xs sm:text-sm min-h-[44px] flex items-center justify-center"
              >
                ➕ Retard
              </button>
              <button
                onClick={() => { setEventType('matériel_manquant'); setIsOpen(true); }}
                className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold text-xs sm:text-sm min-h-[44px] flex items-center justify-center"
              >
                ➕ Matériel
              </button>
              <button
                onClick={() => { setEventType('travail_non_fait'); setIsOpen(true); }}
                className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-semibold text-xs sm:text-sm min-h-[44px] flex items-center justify-center"
              >
                ➕ Travail
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <h3 className="font-bold text-base sm:text-lg">Ajouter un événement</h3>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs sm:text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Event Type Display */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                <div className="bg-gray-100 px-3 py-2 rounded border border-gray-300 text-gray-800 font-semibold text-sm">
                  {EVENT_TYPES.find(t => t.value === eventType)?.label}
                </div>
              </div>

              {/* Subcategory */}
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

              {/* Comment */}
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
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleAddEvent}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] flex items-center justify-center"
              >
                {loading ? '⏳ Enregistrement...' : '✓ Valider'}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-semibold text-sm min-h-[44px] flex items-center justify-center"
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
