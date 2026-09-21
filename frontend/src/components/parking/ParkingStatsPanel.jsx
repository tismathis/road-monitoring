import { Car, Percent, Grid3x3 } from 'lucide-react';

import { StatTile, SectionHeader } from '../console-ui/panel';
import { Badge } from '../console-ui/badge';
import { GbLineChart } from '../console-ui/charts';

const OCCUPANCY_BADGE = { Low: 'success', Moderate: 'warning', Saturated: 'destructive' };

/**
 * ParkingStatsPanel — parking-camera KPIs (free/occupied/total spaces,
 * occupancy rate + level, trend chart). Reskinned to the console's dark
 * idiom; data and honesty notes about what isn't implemented are unchanged.
 */
export function ParkingStatsPanel({ kpis, stats }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <Car size={18} className="text-gb-primary" />
        <h2 className="text-[15px] font-semibold text-gb-foreground">Parking Lot Analytics</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatTile value={kpis.free_spaces ?? stats.available_spots ?? 0} label="Free Spaces" icon={Car} valueClassName="text-gb-success" />
        <StatTile value={kpis.occupied_spaces ?? stats.occupied_spots ?? 0} label="Occupied" icon={Car} />
        <StatTile value={kpis.total_spaces ?? stats.total_spots ?? 0} label="Total Spots" icon={Grid3x3} />
        <StatTile value={kpis.occupancy_rate ?? 0} suffix="%" label="Occupancy Rate" icon={Percent} />
      </div>

      <div className="flex items-center gap-3 rounded-[8px] border border-gb-border bg-gb-card p-4">
        <span className="text-[12.5px] text-gb-muted-foreground">Occupancy Level:</span>
        <Badge variant={OCCUPANCY_BADGE[kpis.occupancy_level] || 'default'}>{kpis.occupancy_level || 'N/A'}</Badge>
        <span className="ml-auto text-[11px] text-gb-muted-foreground/70">Low &lt;60% · Moderate 60–90% · Saturated &gt;90%</span>
      </div>

      {kpis.occupancy_trend && kpis.occupancy_trend.length > 0 && (
        <div className="rounded-[8px] border border-gb-border bg-gb-card p-5">
          <GbLineChart
            data={kpis.occupancy_trend}
            lines={[{ dataKey: 'occupancy_rate', color: 'var(--gb-primary)', name: 'Occupancy %' }]}
            xKey="time"
            title="Occupancy Rate Over Time"
            height={220}
            showLegend={false}
          />
        </div>
      )}

      {!kpis.per_spot_available && (
        <div className="rounded-[8px] border border-gb-border bg-gb-background-2 p-4 text-[12px] text-gb-muted-foreground">
          <div className="mb-1 font-semibold text-gb-foreground">Per-spot status grid — not available</div>
          Individual spot-level status requires per-spot polygon calibration. Current implementation uses a single
          aggregate ROI covering all spots.
        </div>
      )}

      {!kpis.turnover_available && (
        <div className="rounded-[8px] border border-gb-border bg-gb-background-2 p-4 text-[12px] text-gb-muted-foreground">
          <div className="mb-1 font-semibold text-gb-foreground">Average duration & turnover rate — not available</div>
          Requires per-spot polygon regions plus vehicle track-to-spot association — a follow-up enhancement beyond
          the current aggregate vehicle count approach.
        </div>
      )}
    </div>
  );
}
