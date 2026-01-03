-- ============================================================
-- DISCOVER COLUMN NAMES FOR CONFIGURED TABLES
-- Run this in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- LEGAL: case_intake_records
-- ============================================================
SELECT 'case_intake_records' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'case_intake_records'
ORDER BY ordinal_position;

-- ============================================================
-- AUDIT: audit_findings
-- ============================================================
SELECT 'audit_findings' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'audit_findings'
ORDER BY ordinal_position;

-- ============================================================
-- CORPORATE: corporate_matters
-- ============================================================
SELECT 'corporate_matters' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'corporate_matters'
ORDER BY ordinal_position;

-- ============================================================
-- CUSTOMER: customer_submissions
-- ============================================================
SELECT 'customer_submissions' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'customer_submissions'
ORDER BY ordinal_position;

-- ============================================================
-- ILG: ilg_submissions
-- ============================================================
SELECT 'ilg_submissions' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'ilg_submissions'
ORDER BY ordinal_position;

-- ============================================================
-- PLANNING: development_applications
-- ============================================================
SELECT 'development_applications' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'development_applications'
ORDER BY ordinal_position;

-- ============================================================
-- STATE: active_leases_summary
-- ============================================================
SELECT 'active_leases_summary' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'active_leases_summary'
ORDER BY ordinal_position;

-- ============================================================
-- TITLES: instruments
-- ============================================================
SELECT 'instruments' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'instruments'
ORDER BY ordinal_position;

-- ============================================================
-- SURVEY: field_uploads
-- ============================================================
SELECT 'field_uploads' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'field_uploads'
ORDER BY ordinal_position;

-- ============================================================
-- ICT: activity_logs
-- ============================================================
SELECT 'activity_logs' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'activity_logs'
ORDER BY ordinal_position;

-- ============================================================
-- RECORD COUNTS
-- ============================================================
SELECT 'case_intake_records' as table_name, COUNT(*) as count FROM case_intake_records
UNION ALL SELECT 'audit_findings', COUNT(*) FROM audit_findings
UNION ALL SELECT 'corporate_matters', COUNT(*) FROM corporate_matters
UNION ALL SELECT 'customer_submissions', COUNT(*) FROM customer_submissions
UNION ALL SELECT 'ilg_submissions', COUNT(*) FROM ilg_submissions
UNION ALL SELECT 'development_applications', COUNT(*) FROM development_applications
UNION ALL SELECT 'active_leases_summary', COUNT(*) FROM active_leases_summary
UNION ALL SELECT 'instruments', COUNT(*) FROM instruments
UNION ALL SELECT 'field_uploads', COUNT(*) FROM field_uploads
UNION ALL SELECT 'activity_logs', COUNT(*) FROM activity_logs;

-- ============================================================
-- SAMPLE STATUS VALUES (to see what statuses exist)
-- ============================================================

-- Legal cases status values
SELECT DISTINCT status, COUNT(*) as count
FROM case_intake_records
GROUP BY status
ORDER BY count DESC
LIMIT 10;

-- Audit findings status values
SELECT DISTINCT status, COUNT(*) as count
FROM audit_findings
GROUP BY status
ORDER BY count DESC
LIMIT 10;
