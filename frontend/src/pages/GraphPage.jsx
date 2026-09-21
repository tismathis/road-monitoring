import { useState, useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Network, AlertTriangle } from 'lucide-react';

import { ConsoleLayout } from '../layouts/ConsoleLayout';
import { mockGraphNodes, mockGraphLinks } from '../utils/mockData';
import { useTranslation } from '../i18n/LanguageContext';
import { Button } from '../components/console-ui/button';
import { Badge } from '../components/console-ui/badge';
import { DetailRow, SectionHeader } from '../components/console-ui/panel';

const NODE_NORMAL = '#007CC3';
const NODE_ALERT = '#E5484D';
const LINK_COLOR = 'rgba(180, 205, 222, 0.35)';

export function GraphPage() {
  const { t } = useTranslation();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const graphRef = useRef();
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ w: 1200, h: 600 });

  useEffect(() => {
    setGraphData({
      nodes: mockGraphNodes.map((node) => ({ ...node })),
      links: mockGraphLinks.map((link) => ({ ...link })),
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setGraphData((prev) => ({
        ...prev,
        nodes: prev.nodes.map((node) => ({
          ...node,
          hasAlert: Math.random() < 0.1 ? !node.hasAlert : node.hasAlert,
        })),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setDims({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleNodeClick = (node) => setSelectedNode(node);

  const toggleNodeAlert = (nodeId) => {
    setGraphData((prev) => ({
      ...prev,
      nodes: prev.nodes.map((node) => (node.id === nodeId ? { ...node, hasAlert: !node.hasAlert } : node)),
    }));
  };

  const resetView = () => {
    if (graphRef.current) {
      graphRef.current.centerAt(0, 0, 1000);
      graphRef.current.zoom(1, 1000);
    }
    setSelectedNode(null);
  };

  const getNodeColor = (node) => (node.hasAlert ? NODE_ALERT : NODE_NORMAL);
  const alertCount = graphData.nodes.filter((n) => n.hasAlert).length;

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
            nodeColor={getNodeColor}
            nodeRelSize={6}
            nodeVal={(node) => (node.hasAlert ? 1.5 : 1)}
            linkColor={() => LINK_COLOR}
            linkWidth={1.5}
            linkDirectionalParticles={2}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleColor={() => NODE_NORMAL}
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
              <span className="size-2.5 rounded-full" style={{ background: NODE_ALERT }} />
              {t('graph.accidentAlert')}
            </div>
            <div className="flex items-center gap-2 text-[12.5px] text-gb-muted-foreground">
              <span className="size-2.5 rounded-full" style={{ background: NODE_NORMAL }} />
              {t('graph.normalRoad')}
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
              <Button
                variant={selectedNode.hasAlert ? 'destructive' : 'default'}
                size="sm"
                onClick={() => toggleNodeAlert(selectedNode.id)}
              >
                {selectedNode.hasAlert ? t('graph.disableAlert') : t('graph.simulateAlert')}
              </Button>
            </div>

            <DetailRow label={t('graph.segmentId')} value={<span className="gb-num">{selectedNode.id}</span>} />
            <DetailRow label={t('graph.roadType')} value={t(`road.${selectedNode.type}`)} />
            <DetailRow
              label={t('graph.state')}
              value={selectedNode.hasAlert ? t('graph.accidentDetected') : t('graph.normalTraffic')}
              valueClassName={selectedNode.hasAlert ? 'text-gb-destructive' : 'text-gb-success'}
            />
          </div>
        )}
      </div>
    </ConsoleLayout>
  );
}
