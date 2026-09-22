/**
 * Shared "crash alert" motion language for the network-graph views
 * (GraphPage's 2D canvas and GraphPage3D's Three.js scene). One authored
 * moment — an ignition flash, then a sustained radar-style pulse — reused
 * identically by both renderers instead of two separate motion languages.
 *
 * The pulse mirrors this app's existing .gb-radar-ring motif (index.css:
 * scale 0.9 -> 2.2, opacity 0.55 -> 0, 2.4s ease-out, used on live/camera
 * indicators elsewhere in the console) rather than inventing a new one.
 */

export const ALERT_RGB = { r: 0xe5, g: 0x48, b: 0x4d };   // --gb-destructive
export const NORMAL_RGB = { r: 0x00, g: 0x7c, b: 0xc3 };  // --gb-primary
export const LINK_RGB = { r: 0xb4, g: 0xcd, b: 0xde };    // base link color

export const COLOR_TRANSITION_MS = 420; // node fill / edge color crossfade
export const IGNITION_MS = 380;         // one-shot scale kick on alert onset
export const PULSE_PERIOD_MS = 2400;    // matches --gb-radar-pulse's cadence

const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const easeOutCubic = (t) => 1 - (1 - t) ** 3;
const easeOutBack = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
};

export function lerpColor(a, b, t) {
  const k = clamp01(t);
  return {
    r: Math.round(a.r + (b.r - a.r) * k),
    g: Math.round(a.g + (b.g - a.g) * k),
    b: Math.round(a.b + (b.b - a.b) * k),
  };
}

export function rgbToCss({ r, g, b }, alpha = 1) {
  return alpha === 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${alpha})`;
}

export function rgbToHex({ r, g, b }) {
  return (r << 16) | (g << 8) | b;
}

/**
 * Given a node's alert-transition timestamps (performance.now()-based) and
 * the current time, returns everything a renderer needs to draw this
 * frame:
 *  - color: interpolated RGB between normal and alert
 *  - colorT: 0-1 "how alerted" this node currently reads (drives glow/edge
 *    intensity smoothly through the crossfade, not just a boolean)
 *  - ignitionScale: a brief >1 scale kick right when the alert fires
 *  - pulsePhase: 0-1 position within the current radar-pulse loop, or null
 *    when not actively pulsing (cleared / still igniting)
 */
export function getAlertMotion(transition, hasAlert, now) {
  const ignitedAt = transition?.ignitedAt ?? null;
  const clearedAt = transition?.clearedAt ?? null;

  let colorT = hasAlert ? 1 : 0;
  if (hasAlert && ignitedAt != null) {
    colorT = easeOutCubic(clamp01((now - ignitedAt) / COLOR_TRANSITION_MS));
  } else if (!hasAlert && clearedAt != null) {
    colorT = 1 - easeOutCubic(clamp01((now - clearedAt) / COLOR_TRANSITION_MS));
  }

  const color = lerpColor(NORMAL_RGB, ALERT_RGB, colorT);

  let ignitionScale = 1;
  if (hasAlert && ignitedAt != null) {
    const p = clamp01((now - ignitedAt) / IGNITION_MS);
    if (p < 1) ignitionScale = 1 + 0.6 * (1 - easeOutBack(p));
  }

  let pulsePhase = null;
  if (hasAlert && ignitedAt != null) {
    const elapsed = now - ignitedAt;
    if (elapsed > IGNITION_MS) {
      pulsePhase = ((elapsed - IGNITION_MS) % PULSE_PERIOD_MS) / PULSE_PERIOD_MS;
    }
  }

  return { color, colorT, ignitionScale, pulsePhase };
}

/**
 * Records when a node's hasAlert last flipped, so getAlertMotion can time
 * the ignition/clear crossfade relative to the real moment it happened
 * rather than restarting on every re-render. Mutates `transitions` (a
 * Map) in place; call once per node whenever fresh signal data lands.
 */
export function recordAlertTransition(transitions, nodeId, prevHasAlert, nextHasAlert, now) {
  if (prevHasAlert === nextHasAlert) return;
  const rec = transitions.get(nodeId) || {};
  if (nextHasAlert) {
    rec.ignitedAt = now;
  } else {
    rec.clearedAt = now;
  }
  transitions.set(nodeId, rec);
}
