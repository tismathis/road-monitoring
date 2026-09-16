import { useState, useEffect } from 'react';
import { endpoints } from '../utils/api';
import { authGet } from '../utils/authFetch';

/**
 * Hook to fetch historical crash data
 * @returns {Object} { crashes, loading, error }
 */
export function useCrashData() {
  const [crashes, setCrashes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    authGet(endpoints.historicalCrashes)
      .then(data => {
        setCrashes(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching crash data:', err);
        setError(err);
        setLoading(false);
      });
  }, []);

  return { crashes, loading, error };
}
