import { useState, useEffect, useRef, useCallback } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import { Network, AlertTriangle, RotateCcw, Play, Pause, Video, VideoOff } from 'lucide-react';

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
  rgbToHex,
} from '../utils/graphAlertMotion';

const NODE_NORMAL_HEX = rgbToHex(NORMAL_RGB);
const NODE_ALERT_HEX = rgbToHex(ALERT_RGB);

/**
 * Builds the group of THREE objects for one node: a solid core sphere, a
 * soft backside glow shell (the existing motif), and a radar-pulse shell —
 * the 3D analogue of the 2D canvas's expanding ring / .gb-radar-ring.
 * A flat 2D ring has no single "facing" once the camera can orbit freely,
 * so the pulse is an expanding, fading wireframe shell instead — same
 * timing/easing as the 2D view, adapted to a true-3D renderer.
 */
function createAlertVisualObjects(initialHex) {
  const coreGeom = new THREE.SphereGeometry(5, 32, 32);
  const coreMat = new THREE.MeshPhongMaterial({
    color: initialHex,
    emissive: initialHex,
    emissiveIntensity: 0.4,
    shininess: 100,
    transparent: true,
    opacity: 0.9,
  });
  const core = new THREE.Mesh(coreGeom, coreMat);

  const glowGeom = new THREE.SphereGeometry(8, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({
    color: initialHex,
    transparent: true,
    opacity: 0.2,
    side: THREE.BackSide,
  });
  const glow = new THREE.Mesh(glowGeom, glowMat);

  const shellGeom = new THREE.SphereGeometry(5, 24, 24);
  const shellMat = new THREE.MeshBasicMaterial({
    color: NODE_ALERT_HEX,
    transparent: true,
    opacity: 0,
    wireframe: true,
    depthWrite: false,
  });
  const shell = new THREE.Mesh(shellGeom, shellMat);

  const group = new THREE.Group();
  group.add(glow, core, shell);

  return { group, core, coreMat, glow, glowMat, shell, shellMat };
}

export function GraphPage3D() {
  const { t } = useTranslation();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const graphRef = useRef();
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ w: 1200, h: 700 });

  const graphDataRef = useRef(graphData);
  const nodeObjectsRef = useRef(new Map()); // nodeId -> THREE objects from createAlertVisualObjects
  const alertTransitionsRef = useRef(new Map());
  const monitoredNodeIdsRef = useRef(new Set());

  const signalsByNode = useCrashSignals(2000);

  useEffect(() => {
    graphDataRef.current = graphData;
  }, [graphData]);

  useEffect(() => {
    const nodes = mockGraphNodes.map((node) => ({
      ...node,
      fx: Math.random() * 400 - 200,
      fy: Math.random() * 400 - 200,
      fz: Math.random() * 400 - 200,
    }));
    setGraphData({ nodes, links: mockGraphLinks.map((link) => ({ ...link })) });
  }, []);

  // Real crash-candidate signal replaces all simulated/random alert data.
  // Only nodes with a camera actually mapped to them change state — every
  // other node stays neutral, permanently.
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

  useEffect(() => {
    if (!autoRotate || !graphRef.current) return;
    const interval = setInterval(() => {
      const camera = graphRef.current.camera();
      const distance = Math.sqrt(camera.position.x ** 2 + camera.position.y ** 2 + camera.position.z ** 2);
      const angle = Date.now() * 0.0001;
      camera.position.x = distance * Math.sin(angle);
      camera.position.z = distance * Math.cos(angle);
      camera.lookAt(0, 0, 0);
    }, 16);
    return () => clearInterval(interval);
  }, [autoRotate]);

  // Drives the alert ignition/pulse/crossfade on every created node's THREE
  // objects, every frame — independent of graph physics or camera rotation,
  // and using the same motion language as the 2D canvas view.
  useEffect(() => {
    let raf;
    const tick = () => {
      const now = performance.now();
      const nodesById = new Map(graphDataRef.current.nodes.map((n) => [n.id, n]));

      nodeObjectsRef.current.forEach((objs, nodeId) => {
        const node = nodesById.get(nodeId);
        if (!node) return;

        const { color, colorT, ignitionScale, pulsePhase } = getAlertMotion(
          alertTransitionsRef.current.get(nodeId),
          node.hasAlert,
          now
        );
        const hex = rgbToHex(color);

        objs.coreMat.color.setHex(hex);
        objs.coreMat.emissive.setHex(hex);
        objs.coreMat.emissiveIntensity = 0.4 + 0.5 * colorT;
        objs.glowMat.color.setHex(hex);
        objs.glowMat.opacity = 0.2 + 0.3 * colorT;

        objs.core.scale.setScalar(ignitionScale);
        objs.glow.scale.setScalar(ignitionScale);

        if (pulsePhase != null) {
          objs.shell.scale.setScalar(1 + 1.8 * pulsePhase);
          objs.shellMat.opacity = 0.45 * (1 - pulsePhase);
        } else {
          objs.shellMat.opacity = 0;
        }
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const createNodeObject = useCallback((node) => {
    const initialHex = node.hasAlert ? NODE_ALERT_HEX : NODE_NORMAL_HEX;
    const objs = createAlertVisualObjects(initialHex);
    nodeObjectsRef.current.set(node.id, objs);
    return objs.group;
  }, []);

  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);
    if (graphRef.current) {
      const distance = 200;
      graphRef.current.cameraPosition({ x: node.x, y: node.y, z: node.z + distance }, { x: node.x, y: node.y, z: node.z }, 1000);
    }
  }, []);

  const resetView = () => {
    if (graphRef.current) {
      graphRef.current.cameraPosition({ x: 0, y: 0, z: 400 }, { x: 0, y: 0, z: 0 }, 1500);
    }
    setSelectedNode(null);
  };

  const alertCount = graphData.nodes.filter((n) => n.hasAlert).length;
  const monitoredCount = Object.keys(signalsByNode).length;

  const nodeColorT = useCallback(
    (endpoint) => {
      const id = endpoint?.id ?? endpoint;
      const node = graphData.nodes.find((n) => n.id === id);
      if (!node) return 0;
      return getAlertMotion(alertTransitionsRef.current.get(id), node.hasAlert, performance.now()).colorT;
    },
    [graphData.nodes]
  );
  const linkAlertT = useCallback((link) => Math.max(nodeColorT(link.source), nodeColorT(link.target)), [nodeColorT]);

  const linkColor = useCallback((link) => rgbToCss(lerpColor(LINK_RGB, ALERT_RGB, linkAlertT(link))), [linkAlertT]);
  const linkWidth = useCallback((link) => 0.5 + 2 * linkAlertT(link), [linkAlertT]);
  const linkParticleCount = useCallback((link) => (linkAlertT(link) > 0.4 ? 4 : 1), [linkAlertT]);
  const linkParticleWidth = useCallback((link) => (linkAlertT(link) > 0.4 ? 3 : 1), [linkAlertT]);
  const linkParticleColor = useCallback((link) => rgbToCss(lerpColor(NORMAL_RGB, ALERT_RGB, linkAlertT(link))), [linkAlertT]);

  return (
    <ConsoleLayout title={t('graph.neural3d')}>
      <div className="mx-auto flex max-w-[1440px] flex-col gap-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-[8px] border border-gb-border bg-gb-card px-4 py-3 text-[12.5px] text-gb-muted-foreground">
            <AlertTriangle size={16} className="text-gb-destructive" />
            <span className="gb-num font-semibold text-gb-foreground">{alertCount}</span>
            <span>{alertCount === 1 ? t('graph.alert') : t('graph.alerts')}</span>
            <span className="text-gb-border">•</span>
            <span className="gb-num font-semibold text-gb-foreground">{graphData.nodes.length}</span>
            <span>{t('graph.roads')}</span>
            <span className="text-gb-border">•</span>
            <span className="gb-num font-semibold text-gb-foreground">{graphData.links.length}</span>
            <span>{t('graph.connections')}</span>
            <span className="text-gb-border">•</span>
            <Video size={14} />
            <span className="gb-num font-semibold text-gb-foreground">{monitoredCount}</span>
            <span>{t('graph.liveMonitored')}</span>
          </div>
          <Button variant={autoRotate ? 'default' : 'outline'} size="sm" onClick={() => setAutoRotate(!autoRotate)}>
            {autoRotate ? <Pause size={14} /> : <Play size={14} />}
            {autoRotate ? 'Pause' : 'Rotation'}
          </Button>
          <Button variant="outline" size="sm" onClick={resetView}>
            <RotateCcw size={14} />
            {t('graph.reset')}
          </Button>
        </div>

        <div ref={containerRef} className="relative h-[700px] overflow-hidden rounded-[8px] border border-gb-border bg-black">
          <ForceGraph3D
            ref={graphRef}
            graphData={graphData}
            nodeLabel={(node) => `${node.name}`}
            nodeThreeObject={createNodeObject}
            nodeThreeObjectExtend
            linkColor={linkColor}
            linkWidth={linkWidth}
            linkOpacity={0.6}
            linkDirectionalParticles={linkParticleCount}
            linkDirectionalParticleWidth={linkParticleWidth}
            linkDirectionalParticleSpeed={0.005}
            linkDirectionalParticleColor={linkParticleColor}
            onNodeClick={handleNodeClick}
            enableNodeDrag={false}
            showNavInfo={false}
            backgroundColor="#000000"
            width={dims.w}
            height={dims.h}
            d3AlphaDecay={0.01}
            d3VelocityDecay={0.2}
            warmupTicks={100}
            cooldownTicks={500}
          />
        </div>

        <div className="rounded-[8px] border border-gb-border bg-gb-card p-5">
          <SectionHeader title={t('map.legend')} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="flex items-center gap-2 text-[12.5px] text-gb-muted-foreground">
              <span className="size-2.5 rounded-full" style={{ background: rgbToCss(ALERT_RGB), boxShadow: `0 0 8px ${rgbToCss(ALERT_RGB, 0.5)}` }} />
              {t('graph.accidentActive')}
            </div>
            <div className="flex items-center gap-2 text-[12.5px] text-gb-muted-foreground">
              <span className="size-2.5 rounded-full" style={{ background: rgbToCss(NORMAL_RGB), boxShadow: `0 0 8px ${rgbToCss(NORMAL_RGB, 0.5)}` }} />
              {t('graph.normalRoad')}
            </div>
            <div className="flex items-center gap-2 text-[12.5px] text-gb-muted-foreground">
              <span className="h-[2px] w-8" style={{ background: rgbToCss(ALERT_RGB) }} />
              {t('graph.alertConnection')}
            </div>
            <div className="flex items-center gap-2 text-[12.5px] text-gb-muted-foreground">
              <span className="h-px w-8" style={{ background: rgbToCss(LINK_RGB) }} />
              {t('graph.normalConnection')}
            </div>
          </div>
        </div>

        {selectedNode && (
          <div className="rounded-[8px] border border-gb-border bg-gb-card p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="mb-2 text-[15px] font-semibold text-gb-foreground">{selectedNode.name}</h3>
                <Badge variant={selectedNode.hasAlert ? 'destructive' : 'success'}>
                  {selectedNode.hasAlert ? t('graph.activeAlert') : t('graph.trafficNormal')}
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
            <DetailRow label={t('graph.roadId')} value={<span className="gb-num">{selectedNode.id}</span>} />
            <DetailRow label={t('graph.type')} value={t(`road.${selectedNode.type}`)} />
            <DetailRow
              label={t('graph.state')}
              value={selectedNode.hasAlert ? t('graph.detected') : t('graph.normalTraffic')}
              valueClassName={selectedNode.hasAlert ? 'text-gb-destructive' : 'text-gb-success'}
            />
            {selectedNode.crashSignal && selectedNode.crashSignal.components && (
              <DetailRow
                label={t('graph.confidence')}
                value={<span className="gb-num">{Math.round(selectedNode.crashSignal.confidence * 100)}%</span>}
              />
            )}
          </div>
        )}

        <div className="flex gap-3 rounded-[8px] border border-gb-primary/25 bg-gb-primary/8 p-5">
          <Network size={22} className="mt-0.5 shrink-0 text-gb-primary" />
          <div>
            <h4 className="mb-1.5 text-[13.5px] font-semibold text-gb-foreground">{t('graph.neuralVisualization')}</h4>
            <p className="text-[12.5px] leading-relaxed text-gb-muted-foreground">{t('graph.description')}</p>
          </div>
        </div>
      </div>
    </ConsoleLayout>
  );
}
