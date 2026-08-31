import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';

interface StudentImportProps {
  classId: number;
  className: string;
  onImportSuccess: () => void;
}

interface PreviewStudent {
  first_name: string;
  last_name: string;
}

export default function StudentImport({ classId, className, onImportSuccess }: StudentImportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [preview, setPreview] = useState<PreviewStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result as ArrayBuffer;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<{ [key: string]: string }>(sheet);

        // Chercher les colonnes (flexible: "Prénom", "Nom", "first_name", "last_name", etc.)
        const students: PreviewStudent[] = rows
          .map((row) => {
            const keys = Object.keys(row);
            let firstName = '';
            let lastName = '';

            // Chercher prénom
            for (const key of keys) {
              const lowerKey = key.toLowerCase();
              if (lowerKey.includes('prénom') || lowerKey.includes('first')) {
                firstName = row[key]?.trim() || '';
                break;
              }
            }

            // Chercher nom
            for (const key of keys) {
              const lowerKey = key.toLowerCase();
              if (lowerKey.includes('nom') || lowerKey.includes('last')) {
                lastName = row[key]?.trim() || '';
                break;
              }
            }

            // Si pas trouvé, essayer les 2 premières colonnes
            if (!firstName || !lastName) {
              const vals = Object.values(row).filter(v => v && typeof v === 'string');
              if (vals.length >= 2) {
                if (!firstName) firstName = vals[0]?.trim() || '';
                if (!lastName) lastName = vals[1]?.trim() || '';
              }
            }

            return {
              first_name: firstName,
              last_name: lastName
            };
          })
          .filter(s => s.first_name && s.last_name);

        if (students.length === 0) {
          setError('Aucun élève trouvé. Vérifiez le format du fichier.');
          return;
        }

        setPreview(students);
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      setError('Erreur lors de la lecture du fichier');
    }
  };

  const handleImport = async () => {
    if (preview.length === 0) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/students/batch/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          students: preview,
          class_id: classId
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur');
      }

      const result = await response.json();
      setSuccess(`✓ ${result.imported} élève(s) importé(s)`);
      setPreview([]);
      setIsOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onImportSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm min-h-[44px] flex items-center justify-center"
      >
        📥 Importer Excel
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 space-y-4">
            <h3 className="font-bold text-lg">Importer élèves dans {className}</h3>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded text-sm">
                {success}
              </div>
            )}

            {preview.length === 0 ? (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Fichier Excel (colonnes: Prénom, Nom)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-600 mt-2">
                  Format attendu: Excel/CSV avec colonnes "Prénom" et "Nom"
                </p>
              </div>
            ) : (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">
                  Aperçu ({preview.length} élève{preview.length > 1 ? 's' : ''})
                </h4>
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold">Prénom</th>
                        <th className="px-3 py-2 text-left font-semibold">Nom</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {preview.map((student, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-3 py-2">{student.first_name}</td>
                          <td className="px-3 py-2">{student.last_name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              {preview.length > 0 && (
                <button
                  onClick={handleImport}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] flex items-center justify-center"
                >
                  {loading ? '⏳ Import...' : '✓ Importer'}
                </button>
              )}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setPreview([]);
                  setError('');
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-semibold text-sm min-h-[44px] flex items-center justify-center"
              >
                ✕ Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
