import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import StatsPanel from './StatsPanel'
import CameraPanel from './CameraPanel'

const API_URL = 'http://127.0.0.1:8000'

// Replace these with your camera's actual real-world coordinates
const CAMERA_LOCATION = [-24.6539, 25.9010]

function App() {
  const [roads, setRoads] = useState(null)
  const [points, setPoints] = useState(null)
  const [crashes, setCrashes] = useState(null)
  const [view, setView] = useState('map')  // 'map' or 'stats'
  const [cameraOpen, setCameraOpen] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/roads`).then(res => res.json()).then(setRoads)
    fetch(`${API_URL}/points`).then(res => res.json()).then(setPoints)
    fetch(`${API_URL}/historical_crashes`).then(res => res.json()).then(setCrashes)
  }, [])

  const crashPointStyle = (feature) => {
    const severity = feature.properties.severity
    let color = 'yellow'
    if (severity === 'fatal') color = 'red'
    else if (severity === 'serious_injury') color = 'orange'
    return { radius: 6, fillColor: color, color: 'black', weight: 1, fillOpacity: 0.8 }
  }

  return (
    <div style={{ height: '100vh', width: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* Tab bar */}
      <div style={{ display: 'flex', background: '#2F5496', padding: '8px 16px', gap: '10px', flexShrink: 0 }}>
        <button onClick={() => setView('map')} style={tabStyle(view === 'map')}>Map View</button>
        <button onClick={() => setView('stats')} style={tabStyle(view === 'stats')}>Stats Dashboard</button>
      </div>

      {/* Content area */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        {view === 'map' ? (
          <>
            <MapContainer center={[-24.6539, 25.9010]} zoom={15} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              {roads && <GeoJSON data={roads} style={{ color: '#3388ff', weight: 3 }} />}
              {points && <GeoJSON data={points} pointToLayer={(feature, latlng) =>
                L.circleMarker(latlng, { radius: 4, fillColor: 'gray', color: 'black', weight: 1, fillOpacity: 0.6 })
              } />}
              {crashes && <GeoJSON
                data={crashes}
                pointToLayer={(feature, latlng) => L.circleMarker(latlng, crashPointStyle(feature))}
                onEachFeature={(feature, layer) => {
                  const p = feature.properties
                  layer.bindPopup(`<b>${p.severity}</b><br/>Year: ${p.year}<br/>Fatalities: ${p.fatalities}<br/>Source: ${p.source}`)
                }}
              />}

              {/* Live camera marker */}
              <Marker position={CAMERA_LOCATION}>
                  <Popup>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ marginBottom: '8px' }}>📹 Live traffic camera</div>
                      <button
                        onClick={() => setCameraOpen(true)}
                        style={{
                          background: '#2F5496', color: 'white', border: 'none',
                          padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
                        }}
                      >
                        Open Window
                      </button>
                    </div>
                  </Popup>
                </Marker>
            </MapContainer>

            {/* Legend — only shown in map view */}
            <div style={{
              position: 'absolute',
              bottom: '30px',
              right: '10px',
              zIndex: 1000,
              background: 'white',
              padding: '10px 14px',
              borderRadius: '8px',
              boxShadow: '0 1px 5px rgba(0,0,0,0.4)',
              fontFamily: 'sans-serif',
              fontSize: '13px'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>Legend</div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'red', display: 'inline-block', marginRight: 6 }}></span>
                Fatal crash
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'orange', display: 'inline-block', marginRight: 6 }}></span>
                Serious injury
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'yellow', display: 'inline-block', marginRight: 6 }}></span>
                Minor crash
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'gray', display: 'inline-block', marginRight: 6 }}></span>
                Traffic signal / crossing
              </div>
            </div>

            {/* Live camera panel — opens when marker is clicked */}
            {cameraOpen && <CameraPanel onClose={() => setCameraOpen(false)} />}
          </>
        ) : (
          <StatsPanel />
        )}
      </div>

    </div>
  )
}

function tabStyle(active) {
  return {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    background: active ? 'white' : 'transparent',
    color: active ? '#2F5496' : 'white',
    fontWeight: active ? 'bold' : 'normal'
  }
}

export default App