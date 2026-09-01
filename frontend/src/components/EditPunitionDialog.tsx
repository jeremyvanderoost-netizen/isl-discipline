import { useRef, useState } from 'react';

interface EditPunitionDialogProps {
  punition: { id: number; detention_date: string; reason: string | null };
  onClose: () => void;
  onSaved: () => void;
}

function toDatetimeLocalValue(isoString: string): string {
  const date = new Date(isoString);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function EditPunitionDialog({ punition, onClose, onSaved }: EditPunitionDialogProps) {
  const [detentionDate, setDetentionDate] = useState(toDatetimeLocalValue(punition.detention_date));
  const [reason, setReason] = useState(punition.reason || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const submittingRef = useRef(false);

  const handleSave = async () => {
    if (!detentionDate) return;
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/punitions/${punition.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          detention_date: new Date(detentionDate).toISOString(),
          reason: reason || null
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la modification');
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="bg-purple-50 border-b border-purple-200 p-4">
          <h2 className="text-xl font-bold text-purple-700">✏️ Modifier la retenue</h2>
        </div>

        <div className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date et heure</label>
            <input
              type="datetime-local"
              value={detentionDate}
              onChange={(e) => setDetentionDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Motif (facultatif)</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Travail non fait"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading || !detentionDate}
              className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50 min-h-[44px]"
            >
              {loading ? '⏳ Enregistrement...' : '✓ Enregistrer'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors font-semibold min-h-[44px]"
            >
              ✕ Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
