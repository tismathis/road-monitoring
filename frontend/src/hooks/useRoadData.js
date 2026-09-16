import { useState, useEffect } from 'react';
import { endpoints } from '../utils/api';
import { authGet } from '../utils/authFetch';

/**
 * Hook to fetch road network and point data
 * @returns {Object} { roads, points, loading, error }
 */
export function useRoadData() {
  const [roads, setRoads] = useState(null);
  const [points, setPoints] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      authGet(endpoints.roads),
      authGet(endpoints.points)
    ])
      .then(([roadsData, pointsData]) => {
        setRoads(roadsData);
        setPoints(pointsData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching road data:', err);
        setError(err);
        setLoading(false);
      });
  }, []);

  return { roads, points, loading, error };
}
