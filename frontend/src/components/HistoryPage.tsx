import { useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { DisciplineItem, getDisciplineLabel } from '../utils/disciplineLabels';

interface HistoryDay {
  date: string;
  items: DisciplineItem[];
}

interface HistoryPageProps {
  onBack: () => void;
}

function formatDayHeading(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const formatted = new Intl.DateTimeFormat('fr-BE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export default function HistoryPage({ onBack }: HistoryPageProps) {
  const { data: days, loading, error, request } = useApi<HistoryDay[]>();

  useEffect(() => {
    request('/api/dashboard/history', { method: 'GET' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="text-indigo-600 hover:underline mb-4 font-semibold">
          ← Retour
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-6">Historique des punitions</h1>

        {loading && <div className="text-gray-600">Chargement...</div>}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error.message}
          </div>
        )}

        {days && days.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded text-center">
            Aucune punition n'a encore été enregistrée.
          </div>
        )}

        {days && days.length > 0 && (
          <div className="space-y-6">
            {days.map(day => (
              <div key={day.date} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-indigo-50 border-b border-indigo-200 px-4 py-3">
                  <h2 className="text-base font-bold text-indigo-700">{formatDayHeading(day.date)}</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-gray-200">
                        <th className="px-4 py-2 font-semibold">Classe</th>
                        <th className="px-4 py-2 font-semibold">Nom</th>
                        <th className="px-4 py-2 font-semibold">Prénom</th>
                        <th className="px-4 py-2 font-semibold">Punition</th>
                      </tr>
                    </thead>
                    <tbody>
                      {day.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100 last:border-b-0">
                          <td className="px-4 py-2 font-semibold text-indigo-600 whitespace-nowrap">{item.class_name}</td>
                          <td className="px-4 py-2 text-gray-800 whitespace-nowrap">{item.last_name}</td>
                          <td className="px-4 py-2 text-gray-800 whitespace-nowrap">{item.first_name}</td>
                          <td className="px-4 py-2 text-gray-700">{getDisciplineLabel(item)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
