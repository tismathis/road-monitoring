import { useState, useEffect, useRef, useCallback } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import { Network, AlertTriangle, RotateCcw, Play, Pause } from 'lucide-react';

import { ConsoleLayout } from '../layouts/ConsoleLayout';
import { mockGraphNodes, mockGraphLinks } from '../utils/mockData';
import { useTranslation } from '../i18n/LanguageContext';
import { Button } from '../components/console-ui/button';
import { Badge } from '../components/console-ui/badge';
import { DetailRow, SectionHeader } from '../components/console-ui/panel';

const NODE_NORMAL = '#007CC3';
const NODE_ALERT = '#E5484D';
const LINK_NORMAL = '#5A6B75';

export function GraphPage3D() {
  const { t } = useTranslation();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [simulationRunning, setSimulationRunning] = useState(true);
  const graphRef = useRef();
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ w: 1200, h: 700 });

  useEffect(() => {
    const nodes = mockGraphNodes.map((node) => ({
      ...node,
      fx: Math.random() * 400 - 200,
      fy: Math.random() * 400 - 200,
      fz: Math.random() * 400 - 200,
    }));
    setGraphData({ nodes, links: mockGraphLinks.map((link) => ({ ...link })) });
  }, []);

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

  useEffect(() => {
    if (!simulationRunning) return;
    const interval = setInterval(() => {
      setGraphData((prev) => ({
        ...prev,
        nodes: prev.nodes.map((node) => ({
          ...node,
          hasAlert: Math.random() < 0.15 ? !node.hasAlert : node.hasAlert,
        })),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, [simulationRunning]);

  const createNodeObject = useCallback((node) => {
    const isAlert = node.hasAlert;
    const color = isAlert ? NODE_ALERT : NODE_NORMAL;

    const group = new THREE.Group();

    const geometry = new THREE.SphereGeometry(isAlert ? 8 : 5, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color,
      emissive: color,
      emissiveIntensity: isAlert ? 0.8 : 0.4,
      shininess: 100,
      transparent: true,
      opacity: 0.9,
    });
    group.add(new THREE.Mesh(geometry, material));

    const glowGeometry = new THREE.SphereGeometry(isAlert ? 12 : 8, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: isAlert ? 0.3 : 0.2,
      side: THREE.BackSide,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    group.add(glow);

    if (isAlert) {
      const time = Date.now() * 0.001;
      const scale = 1 + Math.sin(time * 3) * 0.1;
      glow.scale.set(scale, scale, scale);
    }

    return group;
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

  const toggleNodeAlert = (nodeId) => {
    setGraphData((prev) => ({
      ...prev,
      nodes: prev.nodes.map((node) => (node.id === nodeId ? { ...node, hasAlert: !node.hasAlert } : node)),
    }));
  };

  const alertCount = graphData.nodes.filter((n) => n.hasAlert).length;

  const linkColor = (link) => {
    const s = graphData.nodes.find((n) => n.id === (link.source.id || link.source));
    const tg = graphData.nodes.find((n) => n.id === (link.target.id || link.target));
    return s?.hasAlert || tg?.hasAlert ? NODE_ALERT : LINK_NORMAL;
  };
  const linkAlert = (link) => {
    const s = graphData.nodes.find((n) => n.id === (link.source.id || link.source));
    const tg = graphData.nodes.find((n) => n.id === (link.target.id || link.target));
    return !!(s?.hasAlert || tg?.hasAlert);
  };

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
          </div>
          <Button variant={autoRotate ? 'default' : 'outline'} size="sm" onClick={() => setAutoRotate(!autoRotate)}>
            {autoRotate ? <Pause size={14} /> : <Play size={14} />}
            {autoRotate ? 'Pause' : 'Rotation'}
          </Button>
          <Button variant={simulationRunning ? 'destructive' : 'outline'} size="sm" onClick={() => setSimulationRunning(!simulationRunning)}>
            {simulationRunning ? t('graph.stopSimulation') : t('graph.startSimulation')}
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
            linkWidth={(link) => (linkAlert(link) ? 2 : 0.5)}
            linkOpacity={0.6}
            linkDirectionalParticles={(link) => (linkAlert(link) ? 4 : 1)}
            linkDirectionalParticleWidth={(link) => (linkAlert(link) ? 3 : 1)}
            linkDirectionalParticleSpeed={0.005}
            linkDirectionalParticleColor={(link) => (linkAlert(link) ? NODE_ALERT : NODE_NORMAL)}
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
              <span className="size-2.5 rounded-full" style={{ background: NODE_ALERT, boxShadow: `0 0 8px ${NODE_ALERT}80` }} />
              {t('graph.accidentActive')}
            </div>
            <div className="flex items-center gap-2 text-[12.5px] text-gb-muted-foreground">
              <span className="size-2.5 rounded-full" style={{ background: NODE_NORMAL, boxShadow: `0 0 8px ${NODE_NORMAL}80` }} />
              {t('graph.normalRoad')}
            </div>
            <div className="flex items-center gap-2 text-[12.5px] text-gb-muted-foreground">
              <span className="h-[2px] w-8" style={{ background: NODE_ALERT }} />
              {t('graph.alertConnection')}
            </div>
            <div className="flex items-center gap-2 text-[12.5px] text-gb-muted-foreground">
              <span className="h-px w-8" style={{ background: LINK_NORMAL }} />
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
              <Button
                variant={selectedNode.hasAlert ? 'destructive' : 'default'}
                size="sm"
                onClick={() => toggleNodeAlert(selectedNode.id)}
              >
                {selectedNode.hasAlert ? t('graph.disableAlert') : t('graph.simulateAlert')}
              </Button>
            </div>
            <DetailRow label={t('graph.roadId')} value={<span className="gb-num">{selectedNode.id}</span>} />
            <DetailRow label={t('graph.type')} value={t(`road.${selectedNode.type}`)} />
            <DetailRow
              label={t('graph.state')}
              value={selectedNode.hasAlert ? t('graph.detected') : t('graph.normalTraffic')}
              valueClassName={selectedNode.hasAlert ? 'text-gb-destructive' : 'text-gb-success'}
            />
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
