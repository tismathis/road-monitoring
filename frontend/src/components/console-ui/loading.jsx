import OrbBand from './particle-dome';

/**
 * GbLoading — the console's shared loading state: Originkit's Particle Dome
 * (OrbBand) retinted to the console palette, with an optional label underneath.
 */
export function GbLoading({ label, size = 88, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div style={{ width: size, height: size }}>
        <OrbBand dotColor="var(--gb-border)" accentColor="#007CC3" density={190} dotSize={220} speed={55} />
      </div>
      {label && <span className="text-[12px] text-gb-muted-foreground">{label}</span>}
    </div>
  );
}
