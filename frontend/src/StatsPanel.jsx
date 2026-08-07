import { useEffect, useState } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
         XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const API_URL = 'http://127.0.0.1:8000'
const SEVERITY_COLORS = { fatal: '#e74c3c', serious_injury: '#e67e22', minor: '#f1c40f' }

function StatsPanel() {
  const [byYear, setByYear] = useState([])
  const [bySeverity, setBySeverity] = useState([])

  useEffect(() => {
    fetch(`${API_URL}/stats/crashes-by-year`).then(res => res.json()).then(setByYear)
    fetch(`${API_URL}/stats/crashes-by-severity`).then(res => res.json()).then(setBySeverity)
  }, [])

  const totalCrashes = byYear.reduce((sum, row) => sum + row.total, 0)
  const totalFatalities = byYear.reduce((sum, row) => sum + row.fatalities, 0)

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: '16px',
      padding: '16px',
      background: '#f4f5f7',
      height: '100%',
      overflowY: 'auto',
      boxSizing: 'border-box'
    }}>

      {/* Card 1: total crashes counter */}
      <div style={cardStyle}>
        <div style={cardTitle}>Total Crashes Logged</div>
        <div style={{ fontSize: '42px', fontWeight: 'bold', color: '#2F5496' }}>{totalCrashes}</div>
      </div>

      {/* Card 2: total fatalities counter */}
      <div style={cardStyle}>
        <div style={cardTitle}>Total Fatalities</div>
        <div style={{ fontSize: '42px', fontWeight: 'bold', color: '#e74c3c' }}>{totalFatalities}</div>
      </div>

      {/* Card 3: crashes by year - bar chart */}
      <div style={{ ...cardStyle, gridColumn: 'span 2' }}>
        <div style={cardTitle}>Crashes by Year</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={byYear}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#3388ff" name="Total crashes" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Card 4: fatalities trend - line chart */}
      <div style={{ ...cardStyle, gridColumn: 'span 2' }}>
        <div style={cardTitle}>Fatalities Trend</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={byYear}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="fatalities" stroke="#e74c3c" name="Fatalities" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Card 5: severity distribution - pie chart */}
      <div style={cardStyle}>
        <div style={cardTitle}>Severity Distribution</div>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={bySeverity} dataKey="total" nameKey="severity" cx="50%" cy="50%" outerRadius={70} label>
              {bySeverity.map((entry, index) => (
                <Cell key={index} fill={SEVERITY_COLORS[entry.severity] || '#999'} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}

const cardStyle = {
  background: 'white',
  borderRadius: '10px',
  padding: '16px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.15)'
}

const cardTitle = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#555',
  marginBottom: '10px'
}

export default StatsPanel