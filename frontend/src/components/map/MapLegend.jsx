import { useTranslation } from '../../i18n/LanguageContext';

/**
 * MapLegend — crash severity legend for the command console map.
 * Solid panel, hairline border, no blur/glass — matches the console's
 * restrained-GIS-software guardrails.
 */
export function MapLegend() {
  const { t } = useTranslation();

  const items = [
    { key: 'fatal', color: 'var(--gb-destructive)' },
    { key: 'serious', color: 'var(--gb-warning)' },
    { key: 'minor', color: '#F2C94C' },
    { key: 'signal', color: 'var(--gb-primary)' },
  ];

  return (
    <div className="absolute bottom-4 right-4 z-[1000] w-[168px] rounded-md border border-gb-border bg-gb-card/95 p-3">
      <div className="mb-2 text-[10px] font-semibold tracking-wide text-gb-muted-foreground">
        {t('map.legend')}
      </div>
      <div className="flex flex-col gap-1.5">
        {items.map((item) => (
          <div key={item.key} className="flex items-center gap-2">
            <span
              className="inline-block size-2 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[11px] text-gb-foreground/90">{t(`map.${item.key}`)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
