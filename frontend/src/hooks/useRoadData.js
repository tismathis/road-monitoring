import { useState, useEffect } from 'react';
import { endpoints } from '../utils/api';

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
      fetch(endpoints.roads).then(res => res.json()),
      fetch(endpoints.points).then(res => res.json())
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
