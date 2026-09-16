import { Card } from '../ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { tokens } from '../../styles/tokens';

/**
 * BarChartCard component - Bar chart for operational monitoring
 * Light theme with Infosys Blue default color
 * Compact padding for information density
 * @param {Object} props
 * @param {Array} props.data - Chart data array
 * @param {string} props.dataKey - Key for bar values
 * @param {string} props.xKey - Key for X-axis values
 * @param {string} props.title - Chart title
 * @param {string} props.color - Bar color (default: Infosys Blue)
 * @param {number} props.height - Chart height in pixels (default: 300)
 */
export function BarChartCard({
  data,
  dataKey,
  xKey,
  title,
  color = tokens.colors.chart.primary, // #007CC3 - Infosys Blue
  height = 300
}) {
  const titleStyles = {
    fontFamily: tokens.typography.fontFamily.heading,
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.md, // Compact spacing
  };

  return (
    <Card padding="lg">
      {title && <div style={titleStyles}>{title}</div>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          {/* Light theme grid */}
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={tokens.colors.neutral.border} // #E5E7EB
            opacity={0.5}
          />

          {/* X-axis */}
          <XAxis
            dataKey={xKey}
            tick={{ fill: tokens.colors.text.secondary, fontSize: 12 }}
            stroke={tokens.colors.neutral.border}
            tickLine={{ stroke: tokens.colors.neutral.border }}
          />

          {/* Y-axis with tabular numbers */}
          <YAxis
            tick={{ fill: tokens.colors.text.secondary, fontSize: 12 }}
            stroke={tokens.colors.neutral.border}
            tickLine={{ stroke: tokens.colors.neutral.border }}
            style={{ fontVariantNumeric: 'tabular-nums' }}
          />

          {/* Light theme tooltip */}
          <Tooltip
            contentStyle={{
              backgroundColor: tokens.colors.background.elevated, // White
              border: `1px solid ${tokens.colors.neutral.border}`,
              borderRadius: tokens.borderRadius.sm,
              boxShadow: tokens.shadows.lg,
              color: tokens.colors.text.primary,
              fontSize: tokens.typography.fontSize.sm,
            }}
            labelStyle={{
              color: tokens.colors.text.primary,
              fontWeight: tokens.typography.fontWeight.medium,
              marginBottom: tokens.spacing.xs,
            }}
            itemStyle={{
              color: tokens.colors.text.secondary,
              fontSize: tokens.typography.fontSize.sm,
            }}
            cursor={{ fill: tokens.colors.background.grouped, opacity: 0.5 }} // #F0F8FC
          />

          {/* Bars with subtle rounded tops */}
          <Bar
            dataKey={dataKey}
            fill={color}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
