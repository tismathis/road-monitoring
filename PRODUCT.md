# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are two audiences the product must serve at once:
- **Operators/monitors** using the app day-to-day to watch live road conditions in Gaborone: reviewing camera feeds with live object detection, checking the interactive road/incident map, scanning statistics, and managing incidents. Roles are modeled explicitly in the backend as `admin`, `operator`, and `viewer` (see `backend/models.py`), implying differing levels of access/control.
- **Demo/review audiences** (e.g. an Infosys project review, academic submission, or portfolio presentation) who assess the product's credibility and polish in a presentation setting, not just its day-to-day usability.
Design and product decisions should hold up under both continuous operational use and first-impression scrutiny.

## Product Purpose

A real-time road-safety "digital twin" for Gaborone, Botswana: it combines live camera video with on-device/edge object detection (YOLO), an interactive GeoJSON map of the road network, historical crash data, and incident management into one monitoring application, so operators can see current road/traffic conditions and historical safety patterns in one place.

## Positioning

Unlike a plain traffic camera viewer or a static crash-data report, this product fuses three things live in one interface: real-time object detection/tracking on live video (via YOLO + OpenCV over a YouTube stream), a geospatial view of the road network and historical crashes, and rolling statistics/heatmaps derived from live detections. The "digital twin" framing — a continuously updated model of Gaborone's road situation, not a static dashboard — is the core differentiator.

## Operating Context

- Live video ingestion: YouTube stream → OpenCV → YOLO detection → MJPEG stream served to the frontend (`backend/camera_stream.py`, `camera_manager.py`).
- Frontend polls backend endpoints on different cadences (e.g. `/camera/stats` every 3s, `/camera/heatmap-points` every 1s) to stay near-real-time without a persistent socket.
- Interactive map (Leaflet/react-leaflet) renders GeoJSON layers for roads, road-network points/signage, and historical crashes (color-coded by severity), plus a live camera marker.
- Separate parking-monitoring stream/components exist alongside the main road-safety flow (`parking_stream.py`, `frontend/src/components/parking`, `parking_slot_test/`).
- Authenticated access with role-based accounts (`admin`, `operator`, `viewer`) via `backend/auth.py`.
- Bilingual UI: an existing `LanguageContext` (`frontend/src/i18n/LanguageContext.jsx`) drives English/French as first-class, equally supported languages — not a translated afterthought.

## Capabilities and Constraints

- Pages already implemented: Dashboard, Live Map, Live Camera (with heatmap overlay), Camera Wall, Statistics, Graph (2D and 3D via `react-force-graph`), Incidents, Settings, Login.
- Existing design system in code (`frontend/src/styles/tokens.js`, CSS custom properties in `index.css`) — confirmed **not binding**; the user is open to a visual overhaul rather than refining within it.
- Real historical crash data exists as GIS shapefiles (`gaborone_digital_twin/historical_crashes.*`), not placeholder data.
- Object-detection models are bundled locally (`backend/yolo26n.pt`, `yolov8n.pt`); detection classes currently referenced include person/car/bus-style categories.
- No deploy target or hosting constraint has been established yet; treat as undecided rather than inferred.

## Brand Commitments

None confirmed yet. No fixed name beyond the working "Gaborone [road-safety] digital twin," no locked logo, palette, or typography. An `inspo/` folder contains visual references (including a traffic-management dashboard example) to draw on, not commitments to follow.

## Evidence on Hand

- Real historical crash records as shapefiles under `gaborone_digital_twin/` (`.shp`/`.dbf`/`.shx`/`.prj`), including a QGIS project file.
- Live camera feed sourced from a real YouTube stream of Gaborone traffic.
- Screenshots of prior UI states in `project_screenshots/` (dated Aug 2026), useful as before/after evidence but not as an authoritative design record.
- A detailed (French-language) architecture write-up at `frontend/ROADMAP.md` documenting data flow, file structure, and the original design-system intent — treat as historical/technical reference, not a current source of truth for either product or visual decisions.
- No testimonials, case studies, pricing, or third-party press exist; none should be fabricated.

## Product Principles

- Real-time first: every view should reflect the live state of the road network, not a static snapshot, wherever data supports it.
- One coherent situational picture: live video, map, and statistics describe the same underlying reality and should feel like facets of one system, not separate tools bolted together.
- Operationally trustworthy, presentation-credible: the interface must work as a daily monitoring tool for operators and hold up as a polished piece of work in front of a reviewing/demo audience.
- Bilingual by default: English and French are both first-class, not a primary language with a bolted-on translation.
- Evidence over invention: real crash data, real video, and real roles exist — design and copy should reflect that reality rather than generic placeholder content.
