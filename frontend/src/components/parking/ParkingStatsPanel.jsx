import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { StatCard } from '../stats/StatCard';
import { LineChartCard } from '../charts/LineChartCard';
import { tokens } from '../../styles/tokens';
import { Car, Percent, TrendingUp, Clock, Grid3x3 } from 'lucide-react';

/**
 * ParkingStatsPanel - Parking-specific dashboard metrics
 *
 * Displays genuine parking-lot KPIs computable from the current AGGREGATE ROI approach:
 * - Free spaces remaining (most prominent)
 * - Occupancy rate % and level classification (Low/Moderate/Saturated)
 * - Occupancy trend chart over time
 *
 * Notes what requires per-spot polygon calibration (not currently implemented):
 * - Individual spot status grid
 * - Per-spot dwell time / turnover rate
 *
 * @param {Object} props
 * @param {Object} props.kpis - Parking KPI data from backend
 * @param {Object} props.stats - Raw parking stats (total_spots, occupied_spots, available_spots)
 */
export function ParkingStatsPanel({ kpis, stats }) {
  // Map occupancy level to badge variant (standard parking analytics color scheme)
  const getOccupancyBadgeVariant = (level) => {
    if (level === "Low") return "online";      // Green
    if (level === "Moderate") return "warning"; // Amber
    if (level === "Saturated") return "error";  // Red
    return "info";
  };

  const containerStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.xl,
  };

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: tokens.spacing.md,
  };

  const headerStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    marginBottom: tokens.spacing.lg,
  };

  const headingStyles = {
    fontFamily: tokens.typography.fontFamily.heading,
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
  };

  const levelBadgeContainerStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.md,
    marginTop: tokens.spacing.md,
  };

  const noteStyles = {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary,
    fontStyle: 'italic',
    padding: tokens.spacing.md,
    backgroundColor: tokens.colors.background.grouped, // #F0F8FC - light blue tint
    borderRadius: tokens.borderRadius.md,
    border: `1px solid ${tokens.colors.neutral.border}`, // #E5E7EB
  };

  return (
    <div style={containerStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <Car size={24} color={tokens.colors.infosys.primary} /> {/* #007CC3 - Infosys Blue */}
        <h2 style={headingStyles}>Parking Lot Analytics</h2>
      </div>

      {/* Primary metrics grid */}
      <div style={gridStyles}>
        {/* Most important: Free spaces */}
        <StatCard
          value={kpis.free_spaces || stats.available_spots || 0}
          label="Free Spaces"
          icon={Car}
          trend={null}
        />

        {/* Occupied spaces */}
        <StatCard
          value={kpis.occupied_spaces || stats.occupied_spots || 0}
          label="Occupied"
          icon={Car}
        />

        {/* Total capacity */}
        <StatCard
          value={kpis.total_spaces || stats.total_spots || 0}
          label="Total Spots"
          icon={Grid3x3}
        />

        {/* Occupancy rate percentage */}
        <StatCard
          value={kpis.occupancy_rate || 0}
          label="Occupancy Rate"
          icon={Percent}
          suffix="%"
        />
      </div>

      {/* Occupancy level badge (color-coded: green/amber/red) */}
      <Card padding="lg">
        <div style={levelBadgeContainerStyles}>
          <div style={{
            fontSize: tokens.typography.fontSize.base,
            color: tokens.colors.text.secondary,
            fontWeight: tokens.typography.fontWeight.medium,
          }}>
            Occupancy Level:
          </div>
          <Badge
            variant={getOccupancyBadgeVariant(kpis.occupancy_level)}
            size="lg"
          >
            {kpis.occupancy_level || "N/A"}
          </Badge>
          <div style={{
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.text.tertiary,
            marginLeft: 'auto',
          }}>
            Low: &lt;60% | Moderate: 60-90% | Saturated: &gt;90%
          </div>
        </div>
      </Card>

      {/* Occupancy trend chart */}
      {kpis.occupancy_trend && kpis.occupancy_trend.length > 0 && (
        <LineChartCard
          data={kpis.occupancy_trend}
          lines={[
            {
              dataKey: 'occupancy_rate',
              color: tokens.colors.chart.primary,
              name: 'Occupancy %'
            }
          ]}
          xKey="time"
          title="Occupancy Rate Over Time"
          height={250}
        />
      )}

      {/* Per-spot features note (not available with current aggregate approach) */}
      {!kpis.per_spot_available && (
        <div style={noteStyles}>
          <div style={{ fontWeight: tokens.typography.fontWeight.semibold, marginBottom: tokens.spacing.xs }}>
            📍 Per-Spot Status Grid: Not Available
          </div>
          <div>
            Individual spot-level status (which specific spots are free/occupied) requires per-spot polygon calibration.
            Current implementation uses a single aggregate ROI covering all spots. See backend/parking_stream.py ROI_POLYGON
            for the current detection region.
          </div>
        </div>
      )}

      {/* Turnover rate note */}
      {!kpis.turnover_available && (
        <div style={noteStyles}>
          <div style={{ fontWeight: tokens.typography.fontWeight.semibold, marginBottom: tokens.spacing.xs }}>
            ⏱️ Average Duration & Turnover Rate: Not Available
          </div>
          <div>
            Per-spot parking duration and turnover metrics require tracking individual vehicles to specific spots over time.
            This would need per-spot polygon regions plus vehicle track-to-spot association logic—a follow-up enhancement
            beyond the current aggregate vehicle count approach.
          </div>
        </div>
      )}
    </div>
  );
}
