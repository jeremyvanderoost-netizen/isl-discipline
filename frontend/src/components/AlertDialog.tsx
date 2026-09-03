import { useState } from 'react';
import { Alert } from '../types';

interface AlertDialogProps {
  alert: Alert | null;
  studentName: string;
  onResolve: (comment: string) => Promise<void>;
  onClose: () => void;
}

export default function AlertDialog({ alert, studentName, onResolve, onClose }: AlertDialogProps) {
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  if (!alert) return null;

  const handleResolve = async () => {
    setLoading(true);
    try {
      await onResolve(comment);
      onClose();
      setComment('');
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="bg-red-50 border-b border-red-200 p-4">
          <h2 className="text-xl font-bold text-red-700">⚠️ Alerte - {studentName}</h2>
        </div>

        <div className="p-4 space-y-3">
          <p className="text-gray-700">
            <span className="font-semibold">Nombre de punitions :</span>{' '}
            {alert.punishment_count_at_trigger}
          </p>
          <p className="text-gray-600 text-sm">
            Cet élève a atteint {alert.punishment_count_at_trigger} punitions.
            Les parents doivent être contactés.
          </p>

          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-semibold"
            >
              ☎ Contacter les parents
            </button>
          ) : (
            <div className="space-y-3">
              <label className="block">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Commentaire sur le traitement (facultatif)
                </p>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ex: Parents contactés le..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                />
              </label>

              <div className="flex gap-2">
                <button
                  onClick={handleResolve}
                  disabled={loading}
                  className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-semibold disabled:opacity-50"
                >
                  {loading ? '⏳ Traitement...' : '✓ Alerte traitée'}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                >
                  ✕ Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
