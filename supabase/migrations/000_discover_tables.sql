-- ============================================================
-- DISCOVER YOUR EXISTING TABLES
-- Run this in Supabase SQL Editor to see all your tables
-- ============================================================

-- List all tables in your database
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================================
-- View columns for specific tables (uncomment and modify as needed)
-- ============================================================

-- Legal cases table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'legal_cases'
ORDER BY ordinal_position;

-- External lawyers table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'external_lawyers'
ORDER BY ordinal_position;

-- Directions table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'directions'
ORDER BY ordinal_position;

-- ============================================================
-- Count records in known tables
-- ============================================================

SELECT 'legal_cases' as table_name, COUNT(*) as record_count FROM legal_cases
UNION ALL
SELECT 'external_lawyers', COUNT(*) FROM external_lawyers
UNION ALL
SELECT 'directions', COUNT(*) FROM directions;
