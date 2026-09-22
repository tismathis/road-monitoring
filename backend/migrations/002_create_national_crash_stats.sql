-- National Road-Safety Statistics (real, cited data) - national_crash_stats
-- =============================================================================
-- One row per calendar year of real, sourced Botswana road-accident
-- statistics (Statistics Botswana / Botswana Police Service, cross-checked
-- against WHO where possible). Populated by seed_national_crash_stats.py
-- from backend/national_road_safety_data.py, the single source of truth.
--
-- Distinct from the existing `historical_crashes` table: that table holds
-- individually geocoded (and explicitly is_fake) point incidents for the
-- map view. This table holds real, non-geocoded yearly aggregate national
-- statistics for the Statistics page's charts. Neither table pretends to
-- be the other.
--
-- Run this migration once:
--   psql -h localhost -p 5433 -U mathismaomuhlebui -d gaborone_twin -f backend/migrations/002_create_national_crash_stats.sql

CREATE TABLE IF NOT EXISTS national_crash_stats (
    year INTEGER PRIMARY KEY,
    accidents INTEGER NOT NULL,
    casualties INTEGER,
    fatalities INTEGER,
    serious_injuries INTEGER,
    minor_injuries INTEGER,
    -- Crash-level severity (not casualty-level) - only populated for years
    -- the source report breaks crashes down this way (currently just 2021).
    fatal_crashes INTEGER,
    serious_crashes INTEGER,
    minor_crashes INTEGER,
    damage_only_crashes INTEGER,
    registered_vehicles INTEGER,
    population_estimate INTEGER,
    is_estimate BOOLEAN NOT NULL DEFAULT false,
    is_partial_year BOOLEAN NOT NULL DEFAULT false,
    source TEXT NOT NULL
);

DO $$
BEGIN
    RAISE NOTICE 'national_crash_stats table created successfully!';
    RAISE NOTICE 'Next step: run backend/seed_national_crash_stats.py to load the real data';
END $$;
