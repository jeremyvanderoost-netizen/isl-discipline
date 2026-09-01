import { useEffect, useState } from 'react';
import { Class } from '../types';
import { useApi } from '../hooks/useApi';

interface ClassListProps {
  onSelectClass: (classId: number) => void;
}

export default function ClassList({ onSelectClass }: ClassListProps) {
  const { data: classes, error, loading, request } = useApi<Class[]>();
  const { error: createError, loading: creating, request: createRequest } = useApi<Class>();
  const [newClassName, setNewClassName] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    request('/api/classes', { method: 'GET' });
  }, [request]);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const result = await createRequest('/api/classes', {
      method: 'POST',
      body: JSON.stringify({ name: newClassName.trim() })
    });

    if (result) {
      setNewClassName('');
      setShowForm(false);
      request('/api/classes', { method: 'GET' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Gestion Disciplinaire</h1>

        <div className="mb-6">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full min-h-[44px] bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors px-6 py-3 font-semibold"
            >
              + Ajouter une classe
            </button>
          ) : (
            <form onSubmit={handleCreateClass} className="bg-white rounded-lg shadow-md p-4 flex flex-col gap-3">
              <label htmlFor="newClassName" className="font-semibold text-gray-700">
                Nom de la nouvelle classe
              </label>
              <input
                id="newClassName"
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="Ex: 5A"
                autoFocus
                className="w-full min-h-[44px] text-base border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {createError && (
                <p className="text-red-600 text-sm">{createError.message}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={creating || !newClassName.trim()}
                  className="flex-1 min-h-[44px] bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors px-4 py-2 font-semibold disabled:opacity-50"
                >
                  {creating ? 'Création...' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setNewClassName(''); }}
                  className="flex-1 min-h-[44px] bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors px-4 py-2 font-semibold"
                >
                  Annuler
                </button>
              </div>
            </form>
          )}
        </div>

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
            <p className="text-sm mt-1">Cliquez sur "+ Ajouter une classe" ci-dessus pour commencer</p>
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
