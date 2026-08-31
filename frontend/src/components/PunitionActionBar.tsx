import { useState } from 'react';

interface PunitionActionBarProps {
  selectedStudentIds: number[];
  onSuccess: (message: string) => void;
}

export default function PunitionActionBar({ selectedStudentIds, onSuccess }: PunitionActionBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [detentionDate, setDetentionDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const isHidden = selectedStudentIds.length === 0;

  const handleAddPunition = async () => {
    if (selectedStudentIds.length === 0 || !detentionDate) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/punitions/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_ids: selectedStudentIds,
          detention_date: detentionDate,
          reason: reason || undefined
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de l\'ajout de la retenue');
      }

      const selectedCount = selectedStudentIds.length;
      const message = `${selectedCount} retenue${selectedCount > 1 ? 's' : ''} ajoutée${selectedCount > 1 ? 's' : ''}`;
      onSuccess(message);
      setIsOpen(false);
      setDetentionDate('');
      setReason('');
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
    <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {!isOpen ? (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-gray-800">
                {selectedStudentIds.length} élève{selectedStudentIds.length > 1 ? 's' : ''} sélectionné{selectedStudentIds.length > 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(true)}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold"
            >
              ➕ Donner une retenue
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Ajouter une retenue</h3>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date et heure de retenue
                </label>
                <input
                  type="datetime-local"
                  value={detentionDate}
                  onChange={(e) => setDetentionDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Motif (facultatif)
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex: Travail non fait"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddPunition}
                disabled={loading || !detentionDate}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
