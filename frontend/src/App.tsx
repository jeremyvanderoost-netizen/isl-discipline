import { useEffect, useState } from 'react'

interface HealthResponse {
  status: string
  timestamp: string
  timezone: string
}

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('/api/health')
        if (!response.ok) throw new Error('Serveur non disponible')
        const data = await response.json()
        setHealth(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      } finally {
        setLoading(false)
      }
    }

    checkHealth()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Gestion Disciplinaire
        </h1>

        {loading && (
          <p className="text-center text-gray-600">Vérification du serveur...</p>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="font-semibold">✗ Erreur</p>
            <p>{error}</p>
          </div>
        )}

        {health && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              <p className="font-semibold">✓ Application fonctionnelle</p>
            </div>
            <div className="bg-gray-50 p-4 rounded border border-gray-200 space-y-2 text-sm">
              <div>
                <span className="font-semibold text-gray-700">Statut :</span>
                <span className="text-gray-600 ml-2">{health.status}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Fuseau horaire :</span>
                <span className="text-gray-600 ml-2">{health.timezone}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Heure serveur :</span>
                <span className="text-gray-600 ml-2">
                  {new Date(health.timestamp).toLocaleString('fr-BE')}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-xs text-gray-500">
            Version 0.1.0 • Frontend + Backend connectés
          </p>
        </div>
      </div>
    </div>
  )
}
