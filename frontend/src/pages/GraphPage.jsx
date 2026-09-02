import { useState, useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { mockGraphNodes, mockGraphLinks } from '../utils/mockData';
import { tokens } from '../styles/tokens';
import { Network, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

/**
 * GraphPage - 2D Network Graph of Road System
 * Nodes represent road segments, turn red when crash alerts detected
 */
export function GraphPage() {
  const { t } = useTranslation();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const graphRef = useRef();

  // Initialize graph data
  useEffect(() => {
    setGraphData({
      nodes: mockGraphNodes.map(node => ({ ...node })),
      links: mockGraphLinks.map(link => ({ ...link })),
    });
  }, []);

  // Simulate random crash alerts (toggle every 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setGraphData(prevData => ({
        ...prevData,
        nodes: prevData.nodes.map(node => ({
          ...node,
          // Randomly toggle alerts (10% chance per update)
          hasAlert: Math.random() < 0.1 ? !node.hasAlert : node.hasAlert,
        })),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Handle node click
  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  // Toggle alert manually
  const toggleNodeAlert = (nodeId) => {
    setGraphData(prevData => ({
      ...prevData,
      nodes: prevData.nodes.map(node =>
        node.id === nodeId ? { ...node, hasAlert: !node.hasAlert } : node
      ),
    }));
  };

  // Reset view
  const resetView = () => {
    if (graphRef.current) {
      graphRef.current.centerAt(0, 0, 1000);
      graphRef.current.zoom(1, 1000);
    }
    setSelectedNode(null);
  };

  // Get node color - green for all, red for alerts
  const getNodeColor = (node) => {
    if (node.hasAlert) return tokens.colors.severity.fatal; // Red for alerts
    return tokens.colors.primary[500]; // Green for all normal nodes
  };

  // Get link color - gray for all links
  const getLinkColor = () => {
    return tokens.colors.neutral[700]; // Dark gray for all links
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
    color: tokens.colors.neutral[900],
    marginBottom: tokens.spacing.xl,
  };

  const controlsContainerStyles = {
    display: 'flex',
    gap: tokens.spacing.lg,
    marginBottom: tokens.spacing.xl,
  };

  const statsStyles = {
    display: 'flex',
    gap: tokens.spacing.md,
    alignItems: 'center',
    padding: tokens.spacing.lg,
    backgroundColor: tokens.colors.neutral[100],
    borderRadius: tokens.borderRadius.md,
    fontSize: tokens.typography.fontSize.sm,
  };

  const graphContainerStyles = {
    position: 'relative',
    height: '600px',
    borderRadius: tokens.borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  };

  const infoCardStyles = {
    marginTop: tokens.spacing.xl,
  };

  const detailItemStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: `${tokens.spacing.sm} 0`,
    borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
  };

  const legendStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: tokens.spacing.md,
    marginTop: tokens.spacing.lg,
  };

  const legendItemStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    fontSize: tokens.typography.fontSize.sm,
  };

  const colorDotStyles = (color) => ({
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: color,
  });

  return (
    <div style={containerStyles}>
      <h1 style={headingStyles}>
        <Network size={32} style={{ display: 'inline', marginRight: tokens.spacing.md, verticalAlign: 'middle' }} />
        {t('graph.road2d')}
      </h1>

      {/* Controls */}
      <div style={controlsContainerStyles}>
        <div style={{ ...statsStyles, flex: 1 }}>
          <AlertTriangle size={20} color={tokens.colors.severity.fatal} />
          <strong>{alertCount}</strong> {alertCount === 1 ? t('graph.alert') : t('graph.alerts')} {t('graph.active')}
          {' • '}
          <strong>{graphData.nodes.length}</strong> {t('graph.segments')}
          {' • '}
          <strong>{graphData.links.length}</strong> {t('graph.connections')}
        </div>

        <Button
          variant="ghost"
          onClick={resetView}
        >
          {t('graph.resetView')}
        </Button>
      </div>

      {/* 2D Graph */}
      <Card padding="sm">
        <div style={graphContainerStyles}>
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            nodeLabel={node => `${node.name} (${node.id})`}
            nodeColor={getNodeColor}
            nodeRelSize={6}
            nodeVal={node => node.hasAlert ? 1.5 : 1}
            linkColor={getLinkColor}
            linkWidth={1.5}
            linkDirectionalParticles={2}
            linkDirectionalParticleWidth={2}
            onNodeClick={handleNodeClick}
            enableNodeDrag={true}
            enablePanInteraction={true}
            enableZoomInteraction={true}
            backgroundColor="#ffffff"
            width={1200}
            height={600}
            cooldownTicks={100}
            d3VelocityDecay={0.3}
            onEngineStop={() => {
              if (graphRef.current) {
                graphRef.current.zoomToFit(400);
                // Stop the simulation completely after it settles
                graphRef.current.d3Force('charge').strength(0);
                graphRef.current.d3Force('link').strength(0);
              }
            }}
          />
        </div>
      </Card>

      {/* Legend */}
      <Card style={infoCardStyles}>
        <h3 style={{ marginBottom: tokens.spacing.lg }}>{t('map.legend')}</h3>
        <div style={legendStyles}>
          <div style={legendItemStyles}>
            <div style={colorDotStyles(tokens.colors.severity.fatal)} />
            <span>{t('graph.accidentAlert')}</span>
          </div>
          <div style={legendItemStyles}>
            <div style={colorDotStyles(tokens.colors.primary[500])} />
            <span>{t('graph.normalRoad')}</span>
          </div>
        </div>
      </Card>

      {/* Selected Node Info */}
      {selectedNode && (
        <Card style={infoCardStyles}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: tokens.spacing.lg }}>
            <div>
              <h3 style={{ marginBottom: tokens.spacing.sm }}>{selectedNode.name}</h3>
              <Badge variant={selectedNode.hasAlert ? 'fatal' : 'info'}>
                {selectedNode.hasAlert ? t('graph.activeAlert') : t('graph.normal')}
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

          <div style={detailItemStyles}>
            <span style={{ color: tokens.colors.neutral[500] }}>{t('graph.segmentId')}</span>
            <span style={{ fontWeight: tokens.typography.fontWeight.medium }}>{selectedNode.id}</span>
          </div>
          <div style={detailItemStyles}>
            <span style={{ color: tokens.colors.neutral[500] }}>{t('graph.roadType')}</span>
            <span style={{ fontWeight: tokens.typography.fontWeight.medium }}>
              {t(`road.${selectedNode.type}`)}
            </span>
          </div>
          <div style={detailItemStyles}>
            <span style={{ color: tokens.colors.neutral[500] }}>{t('graph.state')}</span>
            <span style={{ fontWeight: tokens.typography.fontWeight.medium, color: selectedNode.hasAlert ? tokens.colors.severity.fatal : tokens.colors.primary[500] }}>
              {selectedNode.hasAlert ? t('graph.accidentDetected') : t('graph.normalTraffic')}
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}
