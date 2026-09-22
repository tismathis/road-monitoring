import { useState, useEffect } from 'react';
import { endpoints } from '../utils/api';
import { authGet } from '../utils/authFetch';

/**
 * Hook to fetch real, cited Botswana road-safety statistics.
 * @returns {Object} {
 *   byYear,              // full year series, 2012-latest (real data — see each row's `source`)
 *   verifiedByYear,      // subset: complete, officially-published years only (is_estimate === false)
 *   bySeverity,          // 2021 crash-severity breakdown (fatal/serious/minor/damage-only)
 *   roadUserFatalities,  // 2021 fatality share by road-user type
 *   greaterGaborone,     // 2021 Greater Gaborone district crash counts
 *   totalCrashes, totalFatalities,  // summed over verifiedByYear only
 *   loading,
 * }
 */
export function useStatsData() {
  const [byYear, setByYear] = useState([]);
  const [bySeverity, setBySeverity] = useState([]);
  const [roadUserFatalities, setRoadUserFatalities] = useState(null);
  const [greaterGaborone, setGreaterGaborone] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      authGet(endpoints.crashesByYear),
      authGet(endpoints.crashesBySeverity),
      authGet(endpoints.roadUserFatalities),
      authGet(endpoints.greaterGaboroneCrashes),
    ])
      .then(([yearData, severityData, roadUserData, gaboroneData]) => {
        setByYear(yearData);
        setBySeverity(severityData);
        setRoadUserFatalities(roadUserData);
        setGreaterGaborone(gaboroneData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching stats data:', err);
        setLoading(false);
      });
  }, []);

  const verifiedByYear = byYear.filter((row) => !row.is_estimate);

  const totalCrashes = verifiedByYear.reduce((sum, row) => sum + row.total, 0);
  const totalFatalities = verifiedByYear.reduce((sum, row) => sum + row.fatalities, 0);

  return {
    byYear,
    verifiedByYear,
    bySeverity,
    roadUserFatalities,
    greaterGaborone,
    totalCrashes,
    totalFatalities,
    loading,
  };
}
