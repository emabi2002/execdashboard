-- ============================================================
-- EXECUTIVE TABLES ONLY
-- Creates only the exec_alerts, exec_directives, and
-- exec_interdivision_requests tables for the dashboard
-- NO SAMPLE DATA - Real data only
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- EXECUTIVE ALERTS TABLE
-- Stores alerts from all divisions for executive monitoring
-- ============================================================

CREATE TABLE IF NOT EXISTS exec_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(50) DEFAULT 'info',
  source_division VARCHAR(50) NOT NULL,
  source_submission_id UUID,
  alert_type VARCHAR(100) NOT NULL,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- EXECUTIVE DIRECTIVES TABLE
-- Stores directives issued by executives to divisions
-- ============================================================

CREATE TABLE IF NOT EXISTS exec_directives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  directive_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  target_divisions TEXT[] NOT NULL,
  priority VARCHAR(50) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'issued',
  issued_by VARCHAR(255) NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- INTER-DIVISION REQUESTS TABLE
-- Tracks requests between divisions
-- ============================================================

CREATE TABLE IF NOT EXISTS exec_interdivision_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  from_division VARCHAR(50) NOT NULL,
  to_division VARCHAR(50) NOT NULL,
  source_submission_id UUID,
  request_type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(50) DEFAULT 'medium',
  requested_by UUID,
  assigned_to UUID,
  due_date TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  response_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_alerts_severity ON exec_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_division ON exec_alerts(source_division);
CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON exec_alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON exec_alerts(created_at);

CREATE INDEX IF NOT EXISTS idx_directives_status ON exec_directives(status);
CREATE INDEX IF NOT EXISTS idx_directives_priority ON exec_directives(priority);
CREATE INDEX IF NOT EXISTS idx_directives_created ON exec_directives(created_at);

CREATE INDEX IF NOT EXISTS idx_interdiv_from ON exec_interdivision_requests(from_division);
CREATE INDEX IF NOT EXISTS idx_interdiv_to ON exec_interdivision_requests(to_division);
CREATE INDEX IF NOT EXISTS idx_interdiv_status ON exec_interdivision_requests(status);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE exec_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exec_directives ENABLE ROW LEVEL SECURITY;
ALTER TABLE exec_interdivision_requests ENABLE ROW LEVEL SECURITY;

-- Allow read access for dashboard
DROP POLICY IF EXISTS "Allow authenticated read" ON exec_alerts;
DROP POLICY IF EXISTS "Allow anon read" ON exec_alerts;
CREATE POLICY "Allow authenticated read" ON exec_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow anon read" ON exec_alerts FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Allow authenticated read" ON exec_directives;
DROP POLICY IF EXISTS "Allow anon read" ON exec_directives;
CREATE POLICY "Allow authenticated read" ON exec_directives FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow anon read" ON exec_directives FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Allow authenticated read" ON exec_interdivision_requests;
DROP POLICY IF EXISTS "Allow anon read" ON exec_interdivision_requests;
CREATE POLICY "Allow authenticated read" ON exec_interdivision_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow anon read" ON exec_interdivision_requests FOR SELECT TO anon USING (true);

-- Allow insert/update for creating alerts and directives
DROP POLICY IF EXISTS "Allow authenticated insert" ON exec_alerts;
CREATE POLICY "Allow authenticated insert" ON exec_alerts FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated insert" ON exec_directives;
DROP POLICY IF EXISTS "Allow authenticated update" ON exec_directives;
CREATE POLICY "Allow authenticated insert" ON exec_directives FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON exec_directives FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert" ON exec_interdivision_requests;
DROP POLICY IF EXISTS "Allow authenticated update" ON exec_interdivision_requests;
CREATE POLICY "Allow authenticated insert" ON exec_interdivision_requests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON exec_interdivision_requests FOR UPDATE TO authenticated USING (true);

-- Allow anon insert for dashboard (if not using auth)
DROP POLICY IF EXISTS "Allow anon insert" ON exec_alerts;
CREATE POLICY "Allow anon insert" ON exec_alerts FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon insert" ON exec_directives;
DROP POLICY IF EXISTS "Allow anon update" ON exec_directives;
CREATE POLICY "Allow anon insert" ON exec_directives FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update" ON exec_directives FOR UPDATE TO anon USING (true);

-- ============================================================
-- SUCCESS
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE 'Executive tables created successfully!';
  RAISE NOTICE '- exec_alerts';
  RAISE NOTICE '- exec_directives';
  RAISE NOTICE '- exec_interdivision_requests';
END $$;
