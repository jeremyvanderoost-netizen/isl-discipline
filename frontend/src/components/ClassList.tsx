import { useEffect } from 'react';
import { Class } from '../types';
import { useApi } from '../hooks/useApi';

interface ClassListProps {
  onSelectClass: (classId: number) => void;
}

export default function ClassList({ onSelectClass }: ClassListProps) {
  const { data: classes, error, loading, request } = useApi<Class[]>();

  useEffect(() => {
    request('/api/classes', { method: 'GET' });
  }, [request]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Gestion Disciplinaire</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-semibold">✗ Erreur</p>
            <p>{error.message}</p>
          </div>
        )}

        {loading && (
          <div className="text-center text-gray-600">Chargement des classes...</div>
        )}

        {classes && classes.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded text-center">
            <p className="font-semibold">Aucune classe disponible</p>
            <p className="text-sm mt-1">Utilise <code className="bg-white px-2 py-1 rounded">npm run seed</code> pour créer des données de démonstration</p>
          </div>
        )}

        {classes && classes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map(cls => (
              <button
                key={cls.id}
                onClick={() => onSelectClass(cls.id)}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 text-left cursor-pointer"
              >
                <h2 className="text-2xl font-bold text-indigo-600 mb-2">{cls.name}</h2>
                <p className="text-gray-600 text-sm">Classe {cls.name}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
