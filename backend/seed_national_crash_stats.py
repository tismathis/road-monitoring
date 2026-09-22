#!/usr/bin/env python3
"""
Loads the real, cited national road-safety statistics from
national_road_safety_data.py into the national_crash_stats table.

Idempotent - safe to re-run; each row is upserted by year.
Requires migrations/002_create_national_crash_stats.sql to have been run
first.
"""
import psycopg2

from national_road_safety_data import NATIONAL_CRASH_STATS

conn = psycopg2.connect(
    host="localhost",
    port=5433,
    dbname="gaborone_twin",
    user="mathismaomuhlebui"
)
cur = conn.cursor()

UPSERT = """
    INSERT INTO national_crash_stats (
        year, accidents, casualties, fatalities, serious_injuries, minor_injuries,
        fatal_crashes, serious_crashes, minor_crashes, damage_only_crashes,
        registered_vehicles, population_estimate, is_estimate, is_partial_year, source
    ) VALUES (
        %(year)s, %(accidents)s, %(casualties)s, %(fatalities)s, %(serious_injuries)s, %(minor_injuries)s,
        %(fatal_crashes)s, %(serious_crashes)s, %(minor_crashes)s, %(damage_only_crashes)s,
        %(registered_vehicles)s, %(population_estimate)s, %(is_estimate)s, %(is_partial_year)s, %(source)s
    )
    ON CONFLICT (year) DO UPDATE SET
        accidents = EXCLUDED.accidents,
        casualties = EXCLUDED.casualties,
        fatalities = EXCLUDED.fatalities,
        serious_injuries = EXCLUDED.serious_injuries,
        minor_injuries = EXCLUDED.minor_injuries,
        fatal_crashes = EXCLUDED.fatal_crashes,
        serious_crashes = EXCLUDED.serious_crashes,
        minor_crashes = EXCLUDED.minor_crashes,
        damage_only_crashes = EXCLUDED.damage_only_crashes,
        registered_vehicles = EXCLUDED.registered_vehicles,
        population_estimate = EXCLUDED.population_estimate,
        is_estimate = EXCLUDED.is_estimate,
        is_partial_year = EXCLUDED.is_partial_year,
        source = EXCLUDED.source;
"""

for row in NATIONAL_CRASH_STATS:
    cur.execute(UPSERT, row)

conn.commit()
print(f"✅ Seeded/updated {len(NATIONAL_CRASH_STATS)} rows in national_crash_stats "
      f"({NATIONAL_CRASH_STATS[0]['year']}-{NATIONAL_CRASH_STATS[-1]['year']}).")

cur.close()
conn.close()
