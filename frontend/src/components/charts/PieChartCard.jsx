import { Card } from '../ui/Card';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { tokens } from '../../styles/tokens';

/**
 * PieChartCard component - Recharts pie chart wrapped in a card
 * Apple-style dark mode with frosted glass tooltip
 * @param {Object} props
 * @param {Array} props.data - Chart data array
 * @param {string} props.dataKey - Key for pie values
 * @param {string} props.nameKey - Key for pie labels
 * @param {string} props.title - Chart title
 * @param {Array<string>} props.colors - Array of colors for pie slices (optional)
 * @param {number} props.height - Chart height in pixels (default: 300)
 */
export function PieChartCard({
  data,
  dataKey,
  nameKey,
  title,
  colors,
  height = 300
}) {
  const titleStyles = {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.lg,
  };

  // Default colors from chart palette
  const defaultColors = colors || [
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
        <PieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={{
              fill: tokens.colors.text.primary,
              fontSize: 12,
            }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={defaultColors[index % defaultColors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(26, 26, 31, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: `1px solid ${tokens.colors.neutral.border}`,
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
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
