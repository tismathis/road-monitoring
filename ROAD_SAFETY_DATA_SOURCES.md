# Road-Safety Statistics — Data Sources

The Statistics page's charts are backed by real, cited Botswana road-accident
data — not the app's synthetic demo data. This document is the source list
and research trail behind `backend/national_road_safety_data.py`, which is
the single source of truth the database is seeded from.

## Why a separate dataset from `historical_crashes`

`historical_crashes` (PostGIS, feeds the Live Map's crash markers) holds
individually geocoded incident points and is explicitly flagged
`is_fake = yes` on every row — it was seeded as illustrative demo data for
the map, not sourced from real incident reports, and this change doesn't
touch it or the map.

`national_crash_stats` (new table, feeds the Statistics page's charts) holds
real yearly aggregate national statistics with no fabricated geocoding —
these numbers are real, but they were never available as individually
geolocated incidents, so no coordinates are invented for them.

## Sources

1. **Statistics Botswana — Transport & Infrastructure Statistics Report
   2021** (published November 2022). Primary source for the complete
   2012–2021 series: total accidents, casualties, fatalities, and — for
   2021 — the crash-severity split (fatal/serious/minor/damage-only) and
   the Greater Gaborone district breakdown. Underlying data collected by
   the Botswana Police Service Road Traffic Accident Unit, so it only
   covers accidents actually reported to police.
   https://statsbots.org.bw/sites/default/files/publications/Transport%20&%20Infrastructure%20Statistics%20Report%202021.pdf
   Tables used: 2.1 (accident trend), 2.3 (2021 crash severity), 8 (2012–2021
   trend with vehicles/population), 9 (2021 crashes by district), 10
   (2012–2021 casualties by severity), 11 (2021 casualties by sex/district).

2. **WHO — Global Status Report on Road Safety 2023, Botswana country
   profile.** Used as an independent cross-check, not a primary number
   source: its "reported fatalities" figure for 2021 (413) is an exact
   match to Statistics Botswana's police-reported figure for the same year,
   and its sex breakdown (71% male / 29% female) matches Table 11 of the
   same Statistics Botswana report (294/413 = 71.2%, 119/413 = 28.8%) to
   within rounding — two independently published sources agreeing gave
   confidence to use 2021 as the "snapshot" year for the road-user-type and
   severity panels. Also the direct source for the 2021 road-user-type
   fatality distribution (car occupants 63%, pedestrians 25%, other/unknown
   10%, cyclists 2%, motorcyclists 0%).
   https://cdn.who.int/media/docs/default-source/country-profiles/road-safety/road-safety-2023-bwa.pdf

3. **Botswana Daily News — "BPS records over 16 000 road accidents."**
   Government news-service article reporting figures given by BPS Assistant
   Superintendent Itumeleng Maruru at the MVA Fund Regional Case Management
   conference in Gaborone, 24 November 2024. Used only to extend the series
   to 2022–2024, since Statistics Botswana had not yet published a report
   covering those years at research time. This is a **lower-confidence,
   secondary source** — a press report of a spoken conference figure, not a
   reviewed statistical publication — and is marked `is_estimate = true` in
   the database for exactly that reason. The 2024 figure additionally
   covers only 1 January – 24 November 2024 (`is_partial_year = true`) and
   is not a complete-year total.
   https://dailynews.gov.bw/news-detail/83280

## What was deliberately not used

- A `Statistics Botswana` search also surfaced 2009, 2015, 2017, and 2019
  editions of the same Transport & Infrastructure Statistics Report. The
  2021 edition was used because it's the most recent one with a full
  2012–2021 trend table (Table 8) covering everything needed in one
  internally-consistent source, rather than splicing series from multiple
  report editions that could use different methodology vintages.
- MVA Fund (Botswana's Motor Vehicle Accident Fund) publishes its own
  annual "Crash and Claims Report," and a Ministry of Health official is
  quoted (via the same Daily News article) giving a rough "~1,200 injured
  claimants, ~400 fatalities per year" average — this is consistent with,
  but not more precise than, the Statistics Botswana series, so it wasn't
  used as a primary number source. It's cited in the app's Data Sources
  panel context only qualitatively.
- No individually geolocated real crash-site data was found publicly
  published for Gaborone. Rather than approximate coordinates for real
  incidents (which would misrepresent precision the source data doesn't
  have), the Live Map's crash markers remain the existing, explicitly
  `is_fake` demo data — completely unchanged by this work.
- A true multi-year "Gaborone only" time series doesn't exist in a single
  published table — the 2021 district table has blank rows for the
  "Gaborone" and "Gaborone West" police districts specifically (data
  gap in that year's source, not an omission on this project's part),
  with only their *2020* figures available as a reference column. The
  Greater Gaborone panel therefore uses Mogoditshane and Broadhurst — the
  two districts that do have complete 2021 figures and that, together,
  cover the Greater Gaborone conurbation — rather than presenting a
  city-level number that isn't actually published for that year.

## Updating this data later

When Statistics Botswana publishes a newer Transport & Infrastructure
Statistics Report (they appear roughly every 1–2 years), replace the
2022–2024 "recent extension" rows in `national_road_safety_data.py` with
the newer report's real figures, set `is_estimate = False` for whichever
years it covers as complete official data, and re-run
`python3 backend/seed_national_crash_stats.py` to upsert the database.
