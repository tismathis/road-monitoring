import { Card } from '../ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { tokens } from '../../styles/tokens';

/**
 * BarChartCard component - Recharts bar chart wrapped in a card
 * Apple-style dark mode with frosted glass tooltip
 * @param {Object} props
 * @param {Array} props.data - Chart data array
 * @param {string} props.dataKey - Key for bar values
 * @param {string} props.xKey - Key for X-axis values
 * @param {string} props.title - Chart title
 * @param {string} props.color - Bar color (default: primary green from tokens)
 * @param {number} props.height - Chart height in pixels (default: 300)
 */
export function BarChartCard({
  data,
  dataKey,
  xKey,
  title,
  color = tokens.colors.chart.primary,
  height = 300
}) {
  const titleStyles = {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.lg,
  };

  return (
    <Card>
      {title && <div style={titleStyles}>{title}</div>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
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
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
          />
          <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
