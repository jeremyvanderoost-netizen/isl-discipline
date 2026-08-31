import { useState, useCallback } from 'react';
export function useApi() {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const request = useCallback(async (url, options) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options?.headers
                },
                ...options
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Erreur serveur' }));
                throw new Error(errorData.error || `Erreur ${response.status}`);
            }
            const result = await response.json();
            setData(result);
            return result;
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Erreur inconnue';
            setError({ message });
            return null;
        }
        finally {
            setLoading(false);
        }
    }, []);
    return { data, error, loading, request };
}
