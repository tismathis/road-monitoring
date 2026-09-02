import { useState, useEffect } from 'react';
import { endpoints } from '../utils/api';

/**
 * Hook to fetch crash statistics data
 * @returns {Object} { byYear, bySeverity, totalCrashes, totalFatalities, loading }
 */
export function useStatsData() {
  const [byYear, setByYear] = useState([]);
  const [bySeverity, setBySeverity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(endpoints.crashesByYear).then(res => res.json()),
      fetch(endpoints.crashesBySeverity).then(res => res.json())
    ])
      .then(([yearData, severityData]) => {
        setByYear(yearData);
        setBySeverity(severityData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching stats data:', err);
        setLoading(false);
      });
  }, []);

  // Calculate totals
  const totalCrashes = byYear.reduce((sum, row) => sum + row.total, 0);
  const totalFatalities = byYear.reduce((sum, row) => sum + row.fatalities, 0);

  return { byYear, bySeverity, totalCrashes, totalFatalities, loading };
}
