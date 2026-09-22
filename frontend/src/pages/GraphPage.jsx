import { useState, useEffect, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { AlertTriangle, Video, VideoOff } from 'lucide-react';

import { ConsoleLayout } from '../layouts/ConsoleLayout';
import { mockGraphNodes, mockGraphLinks } from '../utils/mockData';
import { useCrashSignals } from '../hooks/useCrashSignals';
import { useTranslation } from '../i18n/LanguageContext';
import { Button } from '../components/console-ui/button';
import { Badge } from '../components/console-ui/badge';
import { DetailRow, SectionHeader } from '../components/console-ui/panel';
import {
  ALERT_RGB,
  NORMAL_RGB,
  LINK_RGB,
  getAlertMotion,
  recordAlertTransition,
  lerpColor,
  rgbToCss,
} from '../utils/graphAlertMotion';

const NODE_BASE_RADIUS = 5;

export function GraphPage() {
  const { t } = useTranslation();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const graphRef = useRef();
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ w: 1200, h: 600 });

  // nodeId -> { ignitedAt?, clearedAt? } in performance.now() ms, read every
  // draw frame by getAlertMotion() to time the ignition/pulse/crossfade.
  const alertTransitionsRef = useRef(new Map());
  const monitoredNodeIdsRef = useRef(new Set());

  const signalsByNode = useCrashSignals(2000);

  useEffect(() => {
    setGraphData({
      nodes: mockGraphNodes.map((node) => ({ ...node })),
      links: mockGraphLinks.map((link) => ({ ...link })),
    });
  }, []);

  // Real crash-candidate signal replaces all simulated/random alert data.
  // Only nodes with a camera actually mapped to them (backend
  // camera_config.py road_node_id) ever change state here — every other
  // node stays neutral, permanently.
  useEffect(() => {
    monitoredNodeIdsRef.current = new Set(Object.keys(signalsByNode));
    const now = performance.now();
    setGraphData((prev) => ({
      ...prev,
      nodes: prev.nodes.map((node) => {
        const signal = signalsByNode[node.id];
        if (!signal) return node;
        const nextAlert = !!signal.crash_detected;
        recordAlertTransition(alertTransitionsRef.current, node.id, node.hasAlert, nextAlert, now);
        return { ...node, hasAlert: nextAlert, crashSignal: signal };
      }),
    }));
  }, [signalsByNode]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setDims({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleNodeClick = (node) => setSelectedNode(node);

  const resetView = () => {
    if (graphRef.current) {
      graphRef.current.centerAt(0, 0, 1000);
      graphRef.current.zoom(1, 1000);
    }
    setSelectedNode(null);
  };

  const nodeRadius = (node) => {
    const now = performance.now();
    const { ignitionScale } = getAlertMotion(alertTransitionsRef.current.get(node.id), node.hasAlert, now);
    return NODE_BASE_RADIUS * (node.hasAlert ? 1.3 : 1) * ignitionScale;
  };

  const nodeCanvasObject = useCallback((node, ctx, globalScale) => {
    const now = performance.now();
    const { color, colorT, ignitionScale, pulsePhase } = getAlertMotion(
      alertTransitionsRef.current.get(node.id),
      node.hasAlert,
      now
    );
    const r = NODE_BASE_RADIUS * (node.hasAlert ? 1.3 : 1) * ignitionScale;

    // Radar-style expanding ring while actively alerting — the same
    // 2.4s ease-out cadence as .gb-radar-ring elsewhere in the console.
    if (pulsePhase != null) {
      const ringR = r * (1 + 1.6 * pulsePhase);
      ctx.beginPath();
      ctx.arc(node.x, node.y, ringR, 0, 2 * Math.PI);
      ctx.strokeStyle = rgbToCss(ALERT_RGB, 0.5 * (1 - pulsePhase));
      ctx.lineWidth = 1.5 / globalScale;
      ctx.stroke();
    }

    // Soft radial glow, only while alerting or crossfading — not a flat
    // color swap, and not present on normal nodes.
    if (colorT > 0.02) {
      const glowR = r * 2.6;
      const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowR);
      grad.addColorStop(0, rgbToCss(ALERT_RGB, 0.32 * colorT));
      grad.addColorStop(1, rgbToCss(ALERT_RGB, 0));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(node.x, node.y, glowR, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Small "live camera" ring for a monitored node, independent of alert
    // state — an honest visual cue for which nodes even have real data.
    if (monitoredNodeIdsRef.current.has(node.id)) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, r + 2.5 / globalScale, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(241,246,248,0.35)';
      ctx.lineWidth = 1 / globalScale;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
    ctx.fillStyle = rgbToCss(color);
    ctx.fill();
    ctx.lineWidth = 1 / globalScale;
    ctx.strokeStyle = 'rgba(11,15,18,0.55)';
    ctx.stroke();
  }, []);

  const nodePointerAreaPaint = useCallback((node, color, ctx) => {
    const r = nodeRadius(node) + 3;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
    ctx.fill();
  }, []);

  const linkNodeColorT = useCallback(
    (endpoint) => {
      const id = endpoint?.id ?? endpoint;
      const node = graphData.nodes.find((n) => n.id === id);
      if (!node) return 0;
      return getAlertMotion(alertTransitionsRef.current.get(id), node.hasAlert, performance.now()).colorT;
    },
    [graphData.nodes]
  );

  const linkAlertT = useCallback(
    (link) => Math.max(linkNodeColorT(link.source), linkNodeColorT(link.target)),
    [linkNodeColorT]
  );

  const linkColor = useCallback((link) => rgbToCss(lerpColor(LINK_RGB, ALERT_RGB, linkAlertT(link)), 0.35 + 0.45 * linkAlertT(link)), [linkAlertT]);
  const linkWidth = useCallback((link) => 1.5 + 1.5 * linkAlertT(link), [linkAlertT]);
  const linkParticleCount = useCallback((link) => (linkAlertT(link) > 0.4 ? 4 : 2), [linkAlertT]);
  const linkParticleColor = useCallback((link) => rgbToCss(lerpColor(NORMAL_RGB, ALERT_RGB, linkAlertT(link))), [linkAlertT]);

  const alertCount = graphData.nodes.filter((n) => n.hasAlert).length;
  const monitoredCount = Object.keys(signalsByNode).length;

  return (
    <ConsoleLayout title={t('graph.road2d')}>
      <div className="mx-auto flex max-w-[1440px] flex-col gap-5">
        <div className="flex items-center gap-4">
          <div className="flex flex-1 items-center gap-2 rounded-[8px] border border-gb-border bg-gb-card px-4 py-3 text-[12.5px] text-gb-muted-foreground">
            <AlertTriangle size={16} className="text-gb-destructive" />
            <span className="gb-num font-semibold text-gb-foreground">{alertCount}</span>
            <span>{alertCount === 1 ? t('graph.alert') : t('graph.alerts')} {t('graph.active')}</span>
            <span className="text-gb-border">•</span>
            <span className="gb-num font-semibold text-gb-foreground">{graphData.nodes.length}</span>
            <span>{t('graph.segments')}</span>
            <span className="text-gb-border">•</span>
            <span className="gb-num font-semibold text-gb-foreground">{graphData.links.length}</span>
            <span>{t('graph.connections')}</span>
            <span className="text-gb-border">•</span>
            <Video size={14} />
            <span className="gb-num font-semibold text-gb-foreground">{monitoredCount}</span>
            <span>{t('graph.liveMonitored')}</span>
          </div>
          <Button variant="outline" onClick={resetView}>
            {t('graph.resetView')}
          </Button>
        </div>

        <div ref={containerRef} className="gb-grid-texture relative h-[600px] overflow-hidden rounded-[8px] border border-gb-border bg-gb-background-2">
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            nodeLabel={(node) => `${node.name} (${node.id})`}
            nodeCanvasObject={nodeCanvasObject}
            nodePointerAreaPaint={nodePointerAreaPaint}
            linkColor={linkColor}
            linkWidth={linkWidth}
            linkDirectionalParticles={linkParticleCount}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleColor={linkParticleColor}
            onNodeClick={handleNodeClick}
            enableNodeDrag
            enablePanInteraction
            enableZoomInteraction
            backgroundColor="rgba(0,0,0,0)"
            width={dims.w}
            height={dims.h}
            cooldownTicks={100}
            d3VelocityDecay={0.3}
            onEngineStop={() => {
              if (graphRef.current) {
                graphRef.current.zoomToFit(400);
                graphRef.current.d3Force('charge').strength(0);
                graphRef.current.d3Force('link').strength(0);
              }
            }}
          />
        </div>

        <div className="rounded-[8px] border border-gb-border bg-gb-card p-5">
          <SectionHeader title={t('map.legend')} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="flex items-center gap-2 text-[12.5px] text-gb-muted-foreground">
              <span className="size-2.5 rounded-full" style={{ background: rgbToCss(ALERT_RGB) }} />
              {t('graph.accidentAlert')}
            </div>
            <div className="flex items-center gap-2 text-[12.5px] text-gb-muted-foreground">
              <span className="size-2.5 rounded-full" style={{ background: rgbToCss(NORMAL_RGB) }} />
              {t('graph.normalRoad')}
            </div>
            <div className="flex items-center gap-2 text-[12.5px] text-gb-muted-foreground">
              <span className="size-2.5 rounded-full border border-white/35" />
              {t('graph.liveMonitoredRing')}
            </div>
          </div>
        </div>

        {selectedNode && (
          <div className="rounded-[8px] border border-gb-border bg-gb-card p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="mb-2 text-[15px] font-semibold text-gb-foreground">{selectedNode.name}</h3>
                <Badge variant={selectedNode.hasAlert ? 'destructive' : 'default'}>
                  {selectedNode.hasAlert ? t('graph.activeAlert') : t('graph.normal')}
                </Badge>
              </div>
              <Badge variant="outline" className="flex items-center gap-1.5">
                {monitoredNodeIdsRef.current.has(selectedNode.id) ? (
                  <>
                    <Video size={12} /> {t('graph.liveMonitored')}
                  </>
                ) : (
                  <>
                    <VideoOff size={12} /> {t('graph.noCamera')}
                  </>
                )}
              </Badge>
            </div>

            <DetailRow label={t('graph.segmentId')} value={<span className="gb-num">{selectedNode.id}</span>} />
            <DetailRow label={t('graph.roadType')} value={t(`road.${selectedNode.type}`)} />
            <DetailRow
              label={t('graph.state')}
              value={selectedNode.hasAlert ? t('graph.accidentDetected') : t('graph.normalTraffic')}
              valueClassName={selectedNode.hasAlert ? 'text-gb-destructive' : 'text-gb-success'}
            />
            {selectedNode.crashSignal && selectedNode.crashSignal.components && (
              <>
                <DetailRow
                  label={t('graph.confidence')}
                  value={<span className="gb-num">{Math.round(selectedNode.crashSignal.confidence * 100)}%</span>}
                />
                <DetailRow
                  label={t('graph.accelerationAnomaly')}
                  value={<span className="gb-num">{selectedNode.crashSignal.components.acceleration_anomaly.toFixed(2)}</span>}
                />
                <DetailRow
                  label={t('graph.trajectoryAnomaly')}
                  value={<span className="gb-num">{selectedNode.crashSignal.components.trajectory_anomaly.toFixed(2)}</span>}
                />
                <DetailRow
                  label={t('graph.angleChangeAnomaly')}
                  value={<span className="gb-num">{selectedNode.crashSignal.components.angle_change_anomaly.toFixed(2)}</span>}
                />
              </>
            )}
          </div>
        )}
      </div>
    </ConsoleLayout>
  );
}
