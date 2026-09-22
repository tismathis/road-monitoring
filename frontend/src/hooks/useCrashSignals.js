import { useEffect, useState } from 'react';
import { authGet } from '../utils/authFetch';

/**
 * Polls the real crash-candidate signal (backend/crash_detection.py) for
 * every camera that has an explicit road_node_id mapping in
 * backend/camera_config.py, and returns { [road_node_id]: signal }.
 *
 * Nodes with no camera mapped to them never appear in the returned object —
 * callers must leave those nodes in their normal/neutral state rather than
 * inventing a status for them.
 */
export function useCrashSignals(pollInterval = 2000) {
  const [signalsByNode, setSignalsByNode] = useState({});

  useEffect(() => {
    let cancelled = false;
    let mappedCameras = null; // resolved once from /cameras, reused across polls

    const poll = async () => {
      try {
        if (!mappedCameras) {
          const cameras = await authGet('http://127.0.0.1:8000/cameras');
          mappedCameras = cameras
            .filter((c) => c.road_node_id)
            .map((c) => ({ cameraId: c.id, roadNodeId: c.road_node_id }));
        }

        if (mappedCameras.length === 0) {
          if (!cancelled) setSignalsByNode({});
          return;
        }

        const results = await Promise.all(
          mappedCameras.map(({ cameraId }) => authGet(`http://127.0.0.1:8000/cameras/${cameraId}/crash-signal`))
        );

        if (cancelled) return;
        const next = {};
        mappedCameras.forEach(({ roadNodeId }, i) => {
          next[roadNodeId] = results[i];
        });
        setSignalsByNode(next);
      } catch (err) {
        console.error('Error polling crash signals:', err);
      }
    };

    poll();
    const interval = setInterval(poll, pollInterval);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [pollInterval]);

  return signalsByNode;
}
