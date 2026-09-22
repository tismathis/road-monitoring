import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const GB_CHART_PALETTE = [
  'var(--gb-primary)',
  'var(--gb-success)',
  'var(--gb-warning)',
  'var(--gb-destructive)',
  '#8B7FD9',
];

const axisTick = { fill: 'var(--gb-muted-foreground)', fontSize: 11 };
const gridStroke = 'var(--gb-border)';

const tooltipStyle = {
  contentStyle: {
    background: 'var(--gb-card)',
    border: '1px solid var(--gb-border)',
    borderRadius: 6,
    boxShadow: 'none',
    color: 'var(--gb-foreground)',
    fontSize: 12,
    padding: '8px 10px',
  },
  labelStyle: { color: 'var(--gb-foreground)', fontWeight: 600, marginBottom: 4 },
  itemStyle: { color: 'var(--gb-muted-foreground)', fontSize: 12 },
};

export function ChartHeader({ title, action }) {
  if (!title && !action) return null;
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="h-3 w-[3px] rounded-full bg-gb-primary" />
      <span className="flex-1 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-gb-foreground/80">
        {title}
      </span>
      {action}
    </div>
  );
}

export function GbBarChart({ data, dataKey, xKey, title, color = 'var(--gb-primary)', height = 260, getOpacity, action }) {
  return (
    <div>
      <ChartHeader title={title} action={action} />
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis dataKey={xKey} tick={axisTick} stroke={gridStroke} tickLine={false} axisLine={{ stroke: gridStroke }} />
          <YAxis tick={axisTick} stroke={gridStroke} tickLine={false} axisLine={false} />
          <Tooltip {...tooltipStyle} cursor={{ fill: 'var(--gb-accent)' }} />
          <Bar dataKey={dataKey} fill={color} radius={[3, 3, 0, 0]} maxBarSize={40}>
            {getOpacity && data.map((entry, index) => (
              <Cell key={`cell-${index}`} fillOpacity={getOpacity(entry)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function GbStackedBarChart({ data, bars, xKey, title, height = 260, action }) {
  return (
    <div>
      <ChartHeader title={title} action={action} />
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis dataKey={xKey} tick={axisTick} stroke={gridStroke} tickLine={false} axisLine={{ stroke: gridStroke }} />
          <YAxis tick={axisTick} stroke={gridStroke} tickLine={false} axisLine={false} />
          <Tooltip {...tooltipStyle} cursor={{ fill: 'var(--gb-accent)' }} />
          <Legend wrapperStyle={{ fontSize: 11, color: 'var(--gb-muted-foreground)', paddingTop: 8 }} iconType="circle" iconSize={8} />
          {bars.map((bar, index) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name || bar.dataKey}
              stackId="stack"
              fill={bar.color || GB_CHART_PALETTE[index % GB_CHART_PALETTE.length]}
              radius={index === bars.length - 1 ? [3, 3, 0, 0] : 0}
              maxBarSize={40}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function GbLineChart({ data, lines, xKey, title, height = 260, showLegend = true }) {
  return (
    <div>
      <ChartHeader title={title} />
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis dataKey={xKey} tick={axisTick} stroke={gridStroke} tickLine={false} axisLine={{ stroke: gridStroke }} />
          <YAxis tick={axisTick} stroke={gridStroke} tickLine={false} axisLine={false} />
          <Tooltip {...tooltipStyle} />
          {showLegend && (
            <Legend wrapperStyle={{ fontSize: 11, color: 'var(--gb-muted-foreground)', paddingTop: 8 }} iconType="line" iconSize={10} />
          )}
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.color || GB_CHART_PALETTE[index % GB_CHART_PALETTE.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              name={line.name || line.dataKey}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function GbPieChart({ data, dataKey, nameKey, title, colors = GB_CHART_PALETTE, height = 260 }) {
  return (
    <div>
      <ChartHeader title={title} />
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} dataKey={dataKey} nameKey={nameKey} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke="var(--gb-card)" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11, color: 'var(--gb-muted-foreground)' }} iconType="circle" iconSize={8} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Sparkline({ data, color = 'var(--gb-primary)', height = 32, width = 100 }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="block">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
