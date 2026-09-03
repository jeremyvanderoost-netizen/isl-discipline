import { useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { DisciplineItem, getDisciplineLabel } from '../utils/disciplineLabels';

export default function TodayDashboard() {
  const { data: items, request } = useApi<DisciplineItem[]>();

  useEffect(() => {
    request('/api/dashboard/today', { method: 'GET' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 pt-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-red-50 border-b border-red-200 px-4 py-3">
          <h2 className="text-lg font-bold text-red-700">⚠️ Aujourd'hui</h2>
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
              {items.map((item, idx) => (
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
    </div>
  );
}
