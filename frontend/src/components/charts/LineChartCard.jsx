import { Card } from '../ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { tokens } from '../../styles/tokens';

/**
 * LineChartCard component - Line chart for operational monitoring
 * Light theme with Infosys Blue primary color
 * Compact padding for information density
 * @param {Object} props
 * @param {Array} props.data - Chart data array
 * @param {Array} props.lines - Array of line configs: [{ dataKey, color, name }]
 * @param {string} props.xKey - Key for X-axis values
 * @param {string} props.title - Chart title
 * @param {number} props.height - Chart height in pixels (default: 300)
 */
export function LineChartCard({
  data,
  lines,
  xKey,
  title,
  height = 300
}) {
  const titleStyles = {
    fontFamily: tokens.typography.fontFamily.heading,
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.md, // Compact spacing
  };

  // Chart color palette - Infosys Blue primary
  const defaultColors = [
    tokens.colors.chart.primary,     // #007CC3 - Infosys Blue
    tokens.colors.chart.secondary,   // #059669 - Green
    tokens.colors.chart.tertiary,    // #3B82F6 - Light blue
    tokens.colors.chart.quaternary,  // #8B5CF6 - Purple
    tokens.colors.chart.amber,       // #F59E0B - Amber
  ];

  return (
    <Card padding="lg">
      {title && <div style={titleStyles}>{title}</div>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          {/* Light theme grid */}
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={tokens.colors.neutral.border} // #E5E7EB
            opacity={0.5}
          />

          {/* X-axis with asphalt gray labels */}
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
          />

          {/* Legend */}
          <Legend
            wrapperStyle={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.text.secondary,
              paddingTop: tokens.spacing.sm,
            }}
            iconType="line"
          />

          {/* Lines */}
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.color || defaultColors[index % defaultColors.length]}
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
              name={line.name || line.dataKey}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
