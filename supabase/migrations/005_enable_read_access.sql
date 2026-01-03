-- ============================================================
-- ENABLE READ ACCESS FOR DASHBOARD
-- Run this in Supabase SQL Editor to allow the dashboard
-- to read from your division tables
-- ============================================================

-- ============================================================
-- OPTION 1: Disable RLS (Simplest - for internal dashboards)
-- ============================================================

-- Uncomment these lines to completely disable RLS on division tables:
/*
ALTER TABLE audit_findings DISABLE ROW LEVEL SECURITY;
ALTER TABLE disputes DISABLE ROW LEVEL SECURITY;
ALTER TABLE development_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE customer_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_matters DISABLE ROW LEVEL SECURITY;
ALTER TABLE ilg_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE active_leases_summary DISABLE ROW LEVEL SECURITY;
ALTER TABLE instruments DISABLE ROW LEVEL SECURITY;
ALTER TABLE field_uploads DISABLE ROW LEVEL SECURITY;
*/

-- ============================================================
-- OPTION 2: Add Read Policies (Better for production)
-- ============================================================

-- First, make sure RLS is enabled
ALTER TABLE audit_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE development_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_matters ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow dashboard read" ON audit_findings;
DROP POLICY IF EXISTS "Allow dashboard read" ON disputes;
DROP POLICY IF EXISTS "Allow dashboard read" ON development_applications;
DROP POLICY IF EXISTS "Allow dashboard read" ON customer_submissions;
DROP POLICY IF EXISTS "Allow dashboard read" ON corporate_matters;

-- Create policies allowing anonymous and authenticated read access

-- Audit Findings
CREATE POLICY "Allow dashboard read" ON audit_findings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Disputes (Legal)
CREATE POLICY "Allow dashboard read" ON disputes
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Development Applications (Planning)
CREATE POLICY "Allow dashboard read" ON development_applications
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Customer Submissions
CREATE POLICY "Allow dashboard read" ON customer_submissions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Corporate Matters
CREATE POLICY "Allow dashboard read" ON corporate_matters
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================================
-- VERIFY ACCESS
-- ============================================================

-- Check that policies are created
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE tablename IN ('audit_findings', 'disputes', 'development_applications', 'customer_submissions', 'corporate_matters')
ORDER BY tablename;

-- Verify data is accessible
SELECT 'audit_findings' as table_name, COUNT(*) as count FROM audit_findings
UNION ALL SELECT 'disputes', COUNT(*) FROM disputes
UNION ALL SELECT 'development_applications', COUNT(*) FROM development_applications
UNION ALL SELECT 'customer_submissions', COUNT(*) FROM customer_submissions
UNION ALL SELECT 'corporate_matters', COUNT(*) FROM corporate_matters;
