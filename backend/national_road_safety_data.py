"""
Real Botswana / Greater Gaborone road-safety statistics
==========================================================
Every number in this module is transcribed from a named, dated, publicly
published report — not estimated, not synthetic. This is the single source
of truth: `seed_national_crash_stats.py` loads NATIONAL_CRASH_STATS into
Postgres from here, and `main.py`'s /stats endpoints serve it and the two
supplementary datasets below directly.

Compare with backend/camera_config.py's CAMERAS registry and the existing
`historical_crashes` table's `is_fake` column — this project already has a
convention of being explicit about real vs. placeholder data. This module
is the real side of that line for road-safety statistics.

PRIMARY SOURCE (2012-2021, complete calendar years):
  Statistics Botswana, "Transport & Infrastructure Statistics Report 2021"
  (published November 2022), Table 2.1 / Table 8 / Table 10.
  Underlying data collected by the Botswana Police Service Road Traffic
  Accident Unit; casualty/injury figures are police-reported, so they
  undercount incidents never reported to police.
  https://statsbots.org.bw/sites/default/files/publications/Transport%20&%20Infrastructure%20Statistics%20Report%202021.pdf

CROSS-CHECK: WHO's "Global status report on road safety 2023" country
profile for Botswana independently reports 413 fatalities for 2021 —
an exact match to Statistics Botswana's police-reported figure, and its
sex breakdown (71% male / 29% female) matches Table 11 of the same report
(294/413 = 71.2%, 119/413 = 28.8%) to within rounding. This cross-validation
is why 2021 is used as the "snapshot" year for the supplementary panels
below, rather than a more recent but single-sourced year.
  https://cdn.who.int/media/docs/default-source/country-profiles/road-safety/road-safety-2023-bwa.pdf

RECENT EXTENSION (2022-2024, lower confidence — see per-row notes):
  Botswana Daily News (government news service), "BPS records over 16 000
  road accidents" (accessed 2026), reporting figures given by BPS Assistant
  Superintendent Itumeleng Maruru at the MVA Fund Regional Case Management
  conference, Gaborone, 24 November 2024.
  https://dailynews.gov.bw/news-detail/83280
  2024's figures are for 1 January - 24 November 2024 only — a partial
  year, not a full-year total, and are NOT comparable to the complete-year
  rows above without accounting for that.
"""

# ---------------------------------------------------------------------------
# NATIONAL_CRASH_STATS — one row per calendar year.
#
# fatal_crashes / serious_crashes / minor_crashes / damage_only_crashes
# (crash-severity, not casualty-severity) are only published, per-crash, for
# 2021 in the source report (Table 2.3) — left None for every other year
# rather than estimated.
# ---------------------------------------------------------------------------
NATIONAL_CRASH_STATS = [
    # year, accidents, casualties, fatalities, serious_injuries, minor_injuries,
    # fatal_crashes, serious_crashes, minor_crashes, damage_only_crashes,
    # registered_vehicles, population_estimate, is_estimate, is_partial_year, source
    dict(year=2012, accidents=17527, casualties=6035, fatalities=404, serious_injuries=1285, minor_injuries=4346,
         fatal_crashes=None, serious_crashes=None, minor_crashes=None, damage_only_crashes=None,
         registered_vehicles=401015, population_estimate=2066000,
         is_estimate=False, is_partial_year=False,
         source="Statistics Botswana, Transport & Infrastructure Statistics Report 2021, Tables 2.1 & 8 (Source: Botswana Police Service)"),
    dict(year=2013, accidents=17062, casualties=6157, fatalities=411, serious_injuries=1308, minor_injuries=4438,
         fatal_crashes=None, serious_crashes=None, minor_crashes=None, damage_only_crashes=None,
         registered_vehicles=417015, population_estimate=2107000,
         is_estimate=False, is_partial_year=False,
         source="Statistics Botswana, Transport & Infrastructure Statistics Report 2021, Tables 2.1 & 8 (Source: Botswana Police Service)"),
    dict(year=2014, accidents=16641, casualties=6065, fatalities=377, serious_injuries=1234, minor_injuries=4454,
         fatal_crashes=None, serious_crashes=None, minor_crashes=None, damage_only_crashes=None,
         registered_vehicles=435750, population_estimate=2147000,
         is_estimate=False, is_partial_year=False,
         source="Statistics Botswana, Transport & Infrastructure Statistics Report 2021, Tables 2.1 & 8 (Source: Botswana Police Service)"),
    dict(year=2015, accidents=17654, casualties=6303, fatalities=411, serious_injuries=1364, minor_injuries=4528,
         fatal_crashes=None, serious_crashes=None, minor_crashes=None, damage_only_crashes=None,
         registered_vehicles=469664, population_estimate=2187000,
         is_estimate=False, is_partial_year=False,
         source="Statistics Botswana, Transport & Infrastructure Statistics Report 2021, Tables 2.1 & 8 (Source: Botswana Police Service)"),
    dict(year=2016, accidents=18373, casualties=6687, fatalities=450, serious_injuries=1243, minor_injuries=4994,
         fatal_crashes=None, serious_crashes=None, minor_crashes=None, damage_only_crashes=None,
         registered_vehicles=500316, population_estimate=2226000,
         is_estimate=False, is_partial_year=False,
         source="Statistics Botswana, Transport & Infrastructure Statistics Report 2021, Tables 2.1 & 8 (Source: Botswana Police Service)"),
    dict(year=2017, accidents=17786, casualties=6335, fatalities=444, serious_injuries=1152, minor_injuries=4739,
         fatal_crashes=None, serious_crashes=None, minor_crashes=None, damage_only_crashes=None,
         registered_vehicles=527901, population_estimate=2264000,
         is_estimate=False, is_partial_year=False,
         source="Statistics Botswana, Transport & Infrastructure Statistics Report 2021, Tables 2.1 & 8 (Source: Botswana Police Service)"),
    dict(year=2018, accidents=17341, casualties=6243, fatalities=462, serious_injuries=1099, minor_injuries=4682,
         fatal_crashes=None, serious_crashes=None, minor_crashes=None, damage_only_crashes=None,
         registered_vehicles=553648, population_estimate=2303000,
         is_estimate=False, is_partial_year=False,
         source="Statistics Botswana, Transport & Infrastructure Statistics Report 2021, Tables 2.1 & 8 (Source: Botswana Police Service)"),
    dict(year=2019, accidents=18623, casualties=6442, fatalities=457, serious_injuries=1183, minor_injuries=4802,
         fatal_crashes=None, serious_crashes=None, minor_crashes=None, damage_only_crashes=None,
         registered_vehicles=588567, population_estimate=2343000,
         is_estimate=False, is_partial_year=False,
         source="Statistics Botswana, Transport & Infrastructure Statistics Report 2021, Tables 2.1 & 8 (Source: Botswana Police Service)"),
    dict(year=2020, accidents=15075, casualties=5052, fatalities=325, serious_injuries=819, minor_injuries=3908,
         fatal_crashes=None, serious_crashes=None, minor_crashes=None, damage_only_crashes=None,
         registered_vehicles=579789, population_estimate=2375000,
         is_estimate=False, is_partial_year=False,
         source="Statistics Botswana, Transport & Infrastructure Statistics Report 2021, Tables 2.1 & 8 (Source: Botswana Police Service) — sharp drop reflects COVID-19 mobility restrictions"),
    dict(year=2021, accidents=17277, casualties=5219, fatalities=413, serious_injuries=913, minor_injuries=3893,
         fatal_crashes=325, serious_crashes=551, minor_crashes=2458, damage_only_crashes=13943,
         registered_vehicles=613845, population_estimate=2346000,
         is_estimate=False, is_partial_year=False,
         source="Statistics Botswana, Transport & Infrastructure Statistics Report 2021, Tables 2.1, 2.3 & 8 (Source: Botswana Police Service); fatalities cross-checked against WHO Global Status Report on Road Safety 2023 country profile for Botswana (413 reported fatalities, 2021 — exact match)"),
    dict(year=2022, accidents=16404, casualties=None, fatalities=404, serious_injuries=None, minor_injuries=None,
         fatal_crashes=None, serious_crashes=None, minor_crashes=None, damage_only_crashes=None,
         registered_vehicles=None, population_estimate=None,
         is_estimate=True, is_partial_year=False,
         source="Botswana Daily News, \"BPS records over 16 000 road accidents\" (accessed 2026), figures given by BPS Asst. Supt. Itumeleng Maruru, MVA Fund Regional Case Management conference, 24 Nov 2024 — not an official Statistics Botswana publication; treat as provisional"),
    dict(year=2023, accidents=15331, casualties=None, fatalities=396, serious_injuries=None, minor_injuries=None,
         fatal_crashes=None, serious_crashes=None, minor_crashes=None, damage_only_crashes=None,
         registered_vehicles=None, population_estimate=None,
         is_estimate=True, is_partial_year=False,
         source="Botswana Daily News, \"BPS records over 16 000 road accidents\" (accessed 2026), figures given by BPS Asst. Supt. Itumeleng Maruru, MVA Fund Regional Case Management conference, 24 Nov 2024 — not an official Statistics Botswana publication; treat as provisional"),
    dict(year=2024, accidents=13277, casualties=None, fatalities=266, serious_injuries=None, minor_injuries=None,
         fatal_crashes=None, serious_crashes=None, minor_crashes=None, damage_only_crashes=None,
         registered_vehicles=None, population_estimate=None,
         is_estimate=True, is_partial_year=True,
         source="Botswana Daily News, \"BPS records over 16 000 road accidents\" (accessed 2026) — figures cover 1 Jan - 24 Nov 2024 ONLY, not a full calendar year; do not compare directly to complete-year totals above"),
]


# ---------------------------------------------------------------------------
# Fatalities by road-user type, Botswana, 2021 (single-year snapshot — this
# breakdown isn't published per-year across the series, only for 2021).
# WHO Global Status Report on Road Safety 2023, Botswana country profile,
# "Reported fatalities user distribution": 4-wheelers 63%, powered 2/3-
# wheelers 0%, pedestrians 25%, cyclists 2%, other/unknown 10%.
# ---------------------------------------------------------------------------
ROAD_USER_FATALITY_SHARE_2021 = {
    "year": 2021,
    "source": "WHO Global Status Report on Road Safety 2023, Botswana country profile — \"Reported fatalities user distribution\"",
    "shares": [
        {"user_type": "car_occupant", "percent": 63},
        {"user_type": "pedestrian", "percent": 25},
        {"user_type": "other_unknown", "percent": 10},
        {"user_type": "cyclist", "percent": 2},
        {"user_type": "motorcyclist", "percent": 0},
    ],
}


# ---------------------------------------------------------------------------
# Greater Gaborone district crash counts, 2021 — the source report doesn't
# publish a single "Gaborone" multi-year time series (Gaborone-city and
# Gaborone-West district rows are blank in the 2021 table; only their 2020
# figures are given as a reference column), so this is the most honest
# Gaborone-specific figure available: the two busiest policing districts
# that make up the Greater Gaborone conurbation, for the one year they're
# both fully reported.
# Statistics Botswana, Transport & Infrastructure Statistics Report 2021,
# Table 9 ("Motor Vehicle Accidents by District and Time of Occurrence, 2021").
# ---------------------------------------------------------------------------
GREATER_GABORONE_DISTRICT_CRASHES_2021 = {
    "year": 2021,
    "national_total_accidents": 17277,
    "source": "Statistics Botswana, Transport & Infrastructure Statistics Report 2021, Table 9 (Source: Botswana Police Service)",
    "districts": [
        {"district": "Mogoditshane", "accidents": 4593, "percent_of_national": 26.6},
        {"district": "Broadhurst", "accidents": 4514, "percent_of_national": 26.1},
    ],
    "note": "Mogoditshane and Broadhurst are the two Botswana Police districts covering the Greater Gaborone conurbation and, together, recorded more crashes in 2021 than the rest of the country combined (52.7% of the national total) despite the city itself covering a small fraction of Botswana's land area.",
}
