import { Card } from '../ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { tokens } from '../../styles/tokens';

/**
 * LineChartCard component - Recharts line chart wrapped in a card
 * Apple-style dark mode with frosted glass tooltip
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
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.lg,
  };

  // Default colors from chart palette (updated for dark mode)
  const defaultColors = [
    tokens.colors.chart.primary,
    tokens.colors.chart.secondary,
    tokens.colors.chart.tertiary,
    tokens.colors.chart.quaternary,
    tokens.colors.chart.quinary,
  ];

  return (
    <Card>
      {title && <div style={titleStyles}>{title}</div>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis
            dataKey={xKey}
            tick={{ fill: tokens.colors.text.secondary, fontSize: 12 }}
            stroke="rgba(255, 255, 255, 0.1)"
          />
          <YAxis
            tick={{ fill: tokens.colors.text.secondary, fontSize: 12 }}
            stroke="rgba(255, 255, 255, 0.1)"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(26, 26, 31, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: `1px solid ${tokens.colors.border.default}`,
              borderRadius: tokens.borderRadius.md,
              boxShadow: tokens.shadows.xl,
              color: tokens.colors.text.primary,
            }}
            labelStyle={{ color: tokens.colors.text.primary }}
            itemStyle={{ color: tokens.colors.text.secondary }}
          />
          <Legend
            wrapperStyle={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.text.secondary,
            }}
          />
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.color || defaultColors[index % defaultColors.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              name={line.name || line.dataKey}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
