import { useMemo, useRef } from 'react';
import { Lottie } from 'lottie-react';
import animationData from '../../assets/lottie/nemopoint.json';

// Past every scale-in/draw keyframe (all settle by frame 34 of 0-49) —
// the fully-formed, linked mark, held as a single frame when `static`.
const SETTLED_FRAME = 46;

// Dark-grey stand-in for the mark's baked-in blue/pink palette.
const GREY_RGB = [0.47, 0.47, 0.5];

// Lottie color properties are always keyed "c": {a, k:[r,g,b(,a)]} with
// 0-1 float components — walk the tree and repaint every one of them.
function recolorDeep(node, key, rgb) {
  if (Array.isArray(node)) {
    return node.map((item) => recolorDeep(item, key, rgb));
  }
  if (node && typeof node === 'object') {
    if (key === 'c' && Array.isArray(node.k) && (node.k.length === 3 || node.k.length === 4)) {
      return { ...node, k: node.k.length === 4 ? [...rgb, node.k[3]] : [...rgb] };
    }
    const out = {};
    for (const k in node) {
      out[k] = recolorDeep(node[k], k, rgb);
    }
    return out;
  }
  return node;
}

/**
 * NemopointMark — the "Nemopoint" Lottie mark (two nodes linking, scaling
 * in): two circles joined by drawn connector lines.
 *
 * - default: plays once on mount, holds on its last frame
 * - `loop`: repeats
 * - `static`: renders paused on its fully-formed frame — no play/draw
 *   animation at all, just the finished mark
 * - `size`: pixel number, or `"fill"` to size to 100% of the parent
 * - `grey`: repaints the mark's baked-in colors to a neutral dark grey
 */
export function NemopointMark({ size = 64, loop = false, static: isStatic = false, grey = false, className = '' }) {
  const lottieRef = useRef(null);

  const src = useMemo(() => (grey ? recolorDeep(animationData, null, GREY_RGB) : animationData), [grey]);

  const dimensionStyle = size === 'fill' ? { width: '100%', height: '100%' } : { width: size, height: size };

  return (
    <Lottie
      src={src}
      loop={!isStatic && loop}
      autoplay={!isStatic}
      lottieRef={lottieRef}
      subscriptions={
        isStatic
          ? {
              ready: () => lottieRef.current?.seek({ frame: SETTLED_FRAME }),
            }
          : undefined
      }
      style={dimensionStyle}
      className={className}
    />
  );
}
