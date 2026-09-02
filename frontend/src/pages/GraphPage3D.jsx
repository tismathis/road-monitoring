import { useState, useEffect, useRef, useCallback } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { mockGraphNodes, mockGraphLinks } from '../utils/mockData';
import { tokens } from '../styles/tokens';
import { Network, AlertTriangle, RotateCcw, Play, Pause } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

/**
 * GraphPage3D - 3D Neural Network Visualization of City Road System
 * Inspired by neuron systems - each node represents a road, connections turn red when crashes detected
 */
export function GraphPage3D() {
  const { t } = useTranslation();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [simulationRunning, setSimulationRunning] = useState(true);
  const graphRef = useRef();

  // Initialize graph data with 3D positioning
  useEffect(() => {
    const nodes = mockGraphNodes.map(node => ({
      ...node,
      // Random 3D positioning for organic neuron-like spread
      fx: Math.random() * 400 - 200,
      fy: Math.random() * 400 - 200,
      fz: Math.random() * 400 - 200,
    }));

    setGraphData({
      nodes,
      links: mockGraphLinks.map(link => ({ ...link })),
    });
  }, []);

  // Auto-rotate camera
  useEffect(() => {
    if (!autoRotate || !graphRef.current) return;

    const interval = setInterval(() => {
      const camera = graphRef.current.camera();
      const distance = Math.sqrt(
        camera.position.x ** 2 + camera.position.y ** 2 + camera.position.z ** 2
      );

      const angle = Date.now() * 0.0001;
      camera.position.x = distance * Math.sin(angle);
      camera.position.z = distance * Math.cos(angle);
      camera.lookAt(0, 0, 0);
    }, 16);

    return () => clearInterval(interval);
  }, [autoRotate]);

  // Simulate crash alerts (toggle every 5 seconds)
  useEffect(() => {
    if (!simulationRunning) return;

    const interval = setInterval(() => {
      setGraphData(prevData => ({
        ...prevData,
        nodes: prevData.nodes.map(node => ({
          ...node,
          hasAlert: Math.random() < 0.15 ? !node.hasAlert : node.hasAlert,
        })),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [simulationRunning]);

  // Node 3D object - glowing spheres like neurons
  const createNodeObject = useCallback((node) => {
    const isAlert = node.hasAlert;
    const color = isAlert ? tokens.colors.severity.fatal : tokens.colors.primary[500];

    // Create a group for the node
    const group = new THREE.Group();

    // Main sphere (neuron body)
    const geometry = new THREE.SphereGeometry(isAlert ? 8 : 5, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color,
      emissive: color,
      emissiveIntensity: isAlert ? 0.8 : 0.4,
      shininess: 100,
      transparent: true,
      opacity: 0.9,
    });
    const sphere = new THREE.Mesh(geometry, material);
    group.add(sphere);

    // Glow effect (outer sphere)
    const glowGeometry = new THREE.SphereGeometry(isAlert ? 12 : 8, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: isAlert ? 0.3 : 0.2,
      side: THREE.BackSide,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    group.add(glow);

    // Pulsing animation for alerts
    if (isAlert) {
      const time = Date.now() * 0.001;
      const scale = 1 + Math.sin(time * 3) * 0.1;
      glow.scale.set(scale, scale, scale);
    }

    return group;
  }, []);

  // Handle node click
  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);
    if (graphRef.current) {
      // Zoom to node
      const distance = 200;
      graphRef.current.cameraPosition(
        { x: node.x, y: node.y, z: node.z + distance },
        { x: node.x, y: node.y, z: node.z },
        1000
      );
    }
  }, []);

  // Reset camera view
  const resetView = () => {
    if (graphRef.current) {
      graphRef.current.cameraPosition(
        { x: 0, y: 0, z: 400 },
        { x: 0, y: 0, z: 0 },
        1500
      );
    }
    setSelectedNode(null);
  };

  // Toggle node alert
  const toggleNodeAlert = (nodeId) => {
    setGraphData(prevData => ({
      ...prevData,
      nodes: prevData.nodes.map(node =>
        node.id === nodeId ? { ...node, hasAlert: !node.hasAlert } : node
      ),
    }));
  };

  // Count alerts
  const alertCount = graphData.nodes.filter(n => n.hasAlert).length;

  const containerStyles = {
    maxWidth: tokens.layout.maxContentWidth,
    margin: '0 auto',
  };

  const headingStyles = {
    fontSize: tokens.typography.fontSize['3xl'],
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.xl,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.md,
  };

  const controlsGridStyles = {
    display: 'grid',
    gridTemplateColumns: '1fr auto auto auto',
    gap: tokens.spacing.md,
    marginBottom: tokens.spacing.xl,
  };

  const statsStyles = {
    display: 'flex',
    gap: tokens.spacing.md,
    alignItems: 'center',
    padding: tokens.spacing.lg,
    background: 'rgba(31, 31, 36, 0.6)',
    borderRadius: tokens.borderRadius.md,
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary,
    border: `1px solid ${tokens.colors.border.default}`,
  };

  const graphContainerStyles = {
    position: 'relative',
    height: '700px',
    borderRadius: tokens.borderRadius.xl,
    overflow: 'hidden',
    background: '#000000',
    border: `1px solid ${tokens.colors.border.default}`,
  };

  return (
    <div style={containerStyles}>
      <h1 style={headingStyles}>
        <Network size={32} />
        {t('graph.neural3d')}
      </h1>

      {/* Controls */}
      <div style={controlsGridStyles}>
        <div style={statsStyles}>
          <AlertTriangle size={20} color={tokens.colors.severity.fatal} />
          <strong style={{ color: tokens.colors.text.primary }}>{alertCount}</strong>
          <span>{alertCount === 1 ? t('graph.alert') : t('graph.alerts')}</span>
          <span>•</span>
          <strong style={{ color: tokens.colors.text.primary }}>{graphData.nodes.length}</strong>
          <span>{t('graph.roads')}</span>
          <span>•</span>
          <strong style={{ color: tokens.colors.text.primary }}>{graphData.links.length}</strong>
          <span>{t('graph.connections')}</span>
        </div>

        <Button
          variant={autoRotate ? 'primary' : 'secondary'}
          icon={autoRotate ? Pause : Play}
          onClick={() => setAutoRotate(!autoRotate)}
          size="sm"
        >
          {autoRotate ? 'Pause' : 'Rotation'}
        </Button>

        <Button
          variant={simulationRunning ? 'danger' : 'secondary'}
          onClick={() => setSimulationRunning(!simulationRunning)}
          size="sm"
        >
          {simulationRunning ? t('graph.stopSimulation') : t('graph.startSimulation')}
        </Button>

        <Button
          variant="ghost"
          icon={RotateCcw}
          onClick={resetView}
          size="sm"
        >
          {t('graph.reset')}
        </Button>
      </div>

      {/* 3D Neural Network Graph */}
      <Card padding="none">
        <div style={graphContainerStyles}>
          <ForceGraph3D
            ref={graphRef}
            graphData={graphData}
            nodeLabel={node => `${node.name}`}
            nodeThreeObject={createNodeObject}
            nodeThreeObjectExtend={true}
            linkColor={link => {
              const sourceNode = graphData.nodes.find(n => n.id === (link.source.id || link.source));
              const targetNode = graphData.nodes.find(n => n.id === (link.target.id || link.target));
              const hasAlert = sourceNode?.hasAlert || targetNode?.hasAlert;
              return hasAlert ? tokens.colors.severity.fatal : tokens.colors.text.tertiary;
            }}
            linkWidth={link => {
              const sourceNode = graphData.nodes.find(n => n.id === (link.source.id || link.source));
              const targetNode = graphData.nodes.find(n => n.id === (link.target.id || link.target));
              const hasAlert = sourceNode?.hasAlert || targetNode?.hasAlert;
              return hasAlert ? 2 : 0.5;
            }}
            linkOpacity={0.6}
            linkDirectionalParticles={link => {
              const sourceNode = graphData.nodes.find(n => n.id === (link.source.id || link.source));
              const targetNode = graphData.nodes.find(n => n.id === (link.target.id || link.target));
              const hasAlert = sourceNode?.hasAlert || targetNode?.hasAlert;
              return hasAlert ? 4 : 1;
            }}
            linkDirectionalParticleWidth={link => {
              const sourceNode = graphData.nodes.find(n => n.id === (link.source.id || link.source));
              const targetNode = graphData.nodes.find(n => n.id === (link.target.id || link.target));
              const hasAlert = sourceNode?.hasAlert || targetNode?.hasAlert;
              return hasAlert ? 3 : 1;
            }}
            linkDirectionalParticleSpeed={0.005}
            linkDirectionalParticleColor={link => {
              const sourceNode = graphData.nodes.find(n => n.id === (link.source.id || link.source));
              const targetNode = graphData.nodes.find(n => n.id === (link.target.id || link.target));
              const hasAlert = sourceNode?.hasAlert || targetNode?.hasAlert;
              return hasAlert ? tokens.colors.severity.fatal : tokens.colors.primary[500];
            }}
            onNodeClick={handleNodeClick}
            enableNodeDrag={false}
            showNavInfo={false}
            backgroundColor="#000000"
            width={1200}
            height={700}
            d3AlphaDecay={0.01}
            d3VelocityDecay={0.2}
            warmupTicks={100}
            cooldownTicks={500}
          />
        </div>
      </Card>

      {/* Legend */}
      <Card style={{ marginTop: tokens.spacing.xl }}>
        <h3 style={{ color: tokens.colors.text.primary, marginBottom: tokens.spacing.lg }}>{t('map.legend')}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: tokens.spacing.md }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm }}>
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: tokens.colors.severity.fatal,
              boxShadow: `0 0 10px ${tokens.colors.severity.fatal}80`
            }} />
            <span style={{ color: tokens.colors.text.secondary }}>{t('graph.accidentActive')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm }}>
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: tokens.colors.primary[500],
              boxShadow: `0 0 10px ${tokens.colors.primary[500]}80`
            }} />
            <span style={{ color: tokens.colors.text.secondary }}>{t('graph.normalRoad')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm }}>
            <div style={{
              width: '40px',
              height: '2px',
              backgroundColor: tokens.colors.severity.fatal
            }} />
            <span style={{ color: tokens.colors.text.secondary }}>{t('graph.alertConnection')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm }}>
            <div style={{
              width: '40px',
              height: '1px',
              backgroundColor: tokens.colors.text.tertiary
            }} />
            <span style={{ color: tokens.colors.text.secondary }}>{t('graph.normalConnection')}</span>
          </div>
        </div>
      </Card>

      {/* Selected Node Info */}
      {selectedNode && (
        <Card style={{ marginTop: tokens.spacing.xl }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: tokens.spacing.lg }}>
            <div>
              <h3 style={{ color: tokens.colors.text.primary, marginBottom: tokens.spacing.sm }}>
                {selectedNode.name}
              </h3>
              <Badge variant={selectedNode.hasAlert ? 'fatal' : 'online'}>
                {selectedNode.hasAlert ? t('graph.activeAlert') : t('graph.trafficNormal')}
              </Badge>
            </div>
            <Button
              variant={selectedNode.hasAlert ? 'danger' : 'primary'}
              size="sm"
              onClick={() => toggleNodeAlert(selectedNode.id)}
            >
              {selectedNode.hasAlert ? t('graph.disableAlert') : t('graph.simulateAlert')}
            </Button>
          </div>

          <div style={{ display: 'grid', gap: tokens.spacing.md }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: `${tokens.spacing.sm} 0`,
              borderBottom: `1px solid ${tokens.colors.border.default}`
            }}>
              <span style={{ color: tokens.colors.text.secondary }}>{t('graph.roadId')}</span>
              <span style={{ color: tokens.colors.text.primary, fontWeight: tokens.typography.fontWeight.medium }}>
                {selectedNode.id}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: `${tokens.spacing.sm} 0`,
              borderBottom: `1px solid ${tokens.colors.border.default}`
            }}>
              <span style={{ color: tokens.colors.text.secondary }}>{t('graph.type')}</span>
              <span style={{ color: tokens.colors.text.primary, fontWeight: tokens.typography.fontWeight.medium }}>
                {t(`road.${selectedNode.type}`)}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: `${tokens.spacing.sm} 0`
            }}>
              <span style={{ color: tokens.colors.text.secondary }}>{t('graph.state')}</span>
              <span style={{
                color: selectedNode.hasAlert ? tokens.colors.severity.fatal : tokens.colors.primary[500],
                fontWeight: tokens.typography.fontWeight.medium
              }}>
                {selectedNode.hasAlert ? t('graph.detected') : t('graph.normalTraffic')}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Info Card */}
      <Card style={{ marginTop: tokens.spacing.xl, background: 'rgba(16, 185, 129, 0.1)', border: `1px solid ${tokens.colors.primary[500]}40` }}>
        <div style={{ display: 'flex', gap: tokens.spacing.md, alignItems: 'start' }}>
          <Network size={24} color={tokens.colors.primary[500]} />
          <div>
            <h4 style={{ color: tokens.colors.text.primary, marginBottom: tokens.spacing.sm }}>
              {t('graph.neuralVisualization')}
            </h4>
            <p style={{ color: tokens.colors.text.secondary, fontSize: tokens.typography.fontSize.sm, lineHeight: tokens.typography.lineHeight.relaxed }}>
              {t('graph.description')}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
