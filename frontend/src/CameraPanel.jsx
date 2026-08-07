import { useEffect, useState, useRef } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
         Tooltip, Legend, ResponsiveContainer } from 'recharts'

const API_URL = 'http://127.0.0.1:8000'

function CameraPanel({ onClose }) {
  const [stats, setStats] = useState({})
  const [history, setHistory] = useState([])
  const [heatmapOn, setHeatmapOn] = useState(false)
  const [heatmapPoints, setHeatmapPoints] = useState([])
  const imgRef = useRef(null)
  const canvasRef = useRef(null)

  // Poll stats + history (existing behavior)
  useEffect(() => {
    const fetchData = () => {
      fetch(`${API_URL}/camera/stats`).then(res => res.json()).then(setStats)
      fetch(`${API_URL}/camera/history`).then(res => res.json()).then(setHistory)
    }
    fetchData()
    const interval = setInterval(fetchData, 3000)
    return () => clearInterval(interval)
  }, [])

  // Poll heatmap points, only while the toggle is on
  useEffect(() => {
    if (!heatmapOn) return
    const fetchPoints = () => fetch(`${API_URL}/camera/heatmap-points`).then(res => res.json()).then(setHeatmapPoints)
    fetchPoints()
    const interval = setInterval(fetchPoints, 1000)
    return () => clearInterval(interval)
  }, [heatmapOn])

  // Draw the heatmap onto the canvas whenever new points arrive
 useEffect(() => {
  if (!heatmapOn || !canvasRef.current || !imgRef.current) return
  const canvas = canvasRef.current
  const img = imgRef.current
  canvas.width = img.clientWidth
  canvas.height = img.clientHeight

  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.globalCompositeOperation = 'lighter'

  heatmapPoints.forEach(p => {
    const x = p.x * canvas.width
    const y = p.y * canvas.height
    const rx = Math.max(p.w * canvas.width, 20) / 2.5
    const ry = Math.max(p.h * canvas.height, 20) / 2.5
    const radius = Math.max(rx, ry)

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
    gradient.addColorStop(0,    'rgba(255, 0, 0, 0.22)')
    gradient.addColorStop(0.3,  'rgba(255, 165, 0, 0.16)')
    gradient.addColorStop(0.55, 'rgba(255, 255, 0, 0.10)')
    gradient.addColorStop(0.75, 'rgba(0, 255, 100, 0.06)')
    gradient.addColorStop(1,    'rgba(0, 100, 255, 0)')

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
    ctx.fill()
  })

  ctx.globalCompositeOperation = 'source-over'
}, [heatmapPoints, heatmapOn])
  const totalObjects = Object.values(stats).reduce((a, b) => a + b, 0)
  const barData = Object.entries(stats).map(([name, count]) => ({ name, count }))

  return (
    <div style={overlayStyle}>
      <div style={windowStyle}>

        {/* Header */}
        <div style={headerStyle}>
          <h2 style={{ margin: 0 }}>📹 Live Camera Analytics</h2>
          <button onClick={onClose} style={closeBtnStyle}>✕ Close</button>
        </div>

        {/* Main content: video left, analytics right */}
        <div style={contentStyle}>

          {/* Left: live feed */}
          <div style={videoColumnStyle}>
            <div style={{ position: 'relative' }}>
              <img
                ref={imgRef}
                src={`${API_URL}/camera/stream`}
                style={{ width: '100%', borderRadius: '10px', background: '#000', display: 'block' }}
                alt="Live camera feed with detection overlay"
              />
              {heatmapOn && (
                <canvas
                  ref={canvasRef}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', borderRadius: '10px' }}
                />
              )}
            </div>

            <button
              onClick={() => setHeatmapOn(!heatmapOn)}
              style={{
                marginTop: '10px', padding: '6px 14px', borderRadius: '6px', border: 'none',
                cursor: 'pointer', background: heatmapOn ? '#e74c3c' : '#2F5496', color: 'white', fontSize: '13px'
              }}
            >
              {heatmapOn ? 'Hide Heatmap' : 'Show Heatmap'}
            </button>

            <div style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>
              Live detection & tracking — objects are counted once per unique tracked ID.
              {heatmapOn && ' Heatmap reflects recent detection density (rolling window), not historical accumulation.'}
            </div>
          </div>

          {/* Right: analytics */}
          <div style={analyticsColumnStyle}>

            {/* Top summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginBottom: '16px' }}>
              <div style={statCard}>
                <div style={statLabel}>Total Objects</div>
                <div style={statValue}>{totalObjects}</div>
              </div>
              {Object.entries(stats).map(([cls, count]) => (
                <div key={cls} style={statCard}>
                  <div style={{ ...statLabel, textTransform: 'capitalize' }}>{cls}</div>
                  <div style={statValue}>{count}</div>
                </div>
              ))}
            </div>

            {/* Bar chart: current counts by class */}
            <div style={chartCard}>
              <div style={cardTitle}>Objects Detected by Type</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3388ff" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Line chart: totals over time */}
            <div style={chartCard}>
              <div style={cardTitle}>Traffic Volume Over Time</div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="car" stroke="#3388ff" name="Cars" dot={false} />
                  <Line type="monotone" dataKey="bus" stroke="#e67e22" name="Buses" dot={false} />
                  <Line type="monotone" dataKey="person" stroke="#2ecc71" name="Pedestrians" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.6)', zIndex: 2000,
  display: 'flex', alignItems: 'center', justifyContent: 'center'
}

const windowStyle = {
  background: '#f4f5f7', borderRadius: '14px',
  width: '95vw', height: '90vh', maxWidth: '1400px',
  display: 'flex', flexDirection: 'column',
  boxShadow: '0 10px 40px rgba(0,0,0,0.4)', overflow: 'hidden'
}

const headerStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '16px 24px', background: '#2F5496', color: 'white', flexShrink: 0
}

const closeBtnStyle = {
  border: 'none', background: 'rgba(255,255,255,0.15)', color: 'white',
  padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px'
}

const contentStyle = {
  flex: 1, display: 'flex', gap: '20px', padding: '20px', overflow: 'auto'
}

const videoColumnStyle = { flex: 1.2, minWidth: '400px' }
const analyticsColumnStyle = { flex: 1, minWidth: '400px', overflowY: 'auto' }

const statCard = {
  background: 'white', borderRadius: '8px', padding: '12px', textAlign: 'center',
  boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
}
const statLabel = { fontSize: '12px', color: '#666' }
const statValue = { fontSize: '24px', fontWeight: 'bold', color: '#2F5496' }

const chartCard = {
  background: 'white', borderRadius: '10px', padding: '14px', marginBottom: '16px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
}
const cardTitle = { fontSize: '13px', fontWeight: 'bold', color: '#555', marginBottom: '8px' }

export default CameraPanel