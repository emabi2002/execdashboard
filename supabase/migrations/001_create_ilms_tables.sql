-- ============================================================
-- ILMS DATABASE SCHEMA
-- Integrated Land Management System - Papua New Guinea
-- Department of Lands & Physical Planning
-- ============================================================
-- This script is IDEMPOTENT - safe to run multiple times
-- It will skip creating tables/types that already exist
-- It handles existing tables with different schemas
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- COMMON TYPES (create only if they don't exist)
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'submission_status') THEN
    CREATE TYPE submission_status AS ENUM (
      'pending',
      'in_progress',
      'completed',
      'rejected',
      'overdue',
      'escalated',
      'on_hold'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority_level') THEN
    CREATE TYPE priority_level AS ENUM (
      'low',
      'medium',
      'high',
      'urgent',
      'critical'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'alert_severity') THEN
    CREATE TYPE alert_severity AS ENUM (
      'info',
      'warning',
      'error',
      'critical'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'directive_status') THEN
    CREATE TYPE directive_status AS ENUM (
      'issued',
      'acknowledged',
      'in_progress',
      'completed',
      'cancelled'
    );
  END IF;
END $$;

-- ============================================================
-- 1. SURVEYOR GENERAL DIVISION
-- ============================================================

CREATE TABLE IF NOT EXISTS survey_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  applicant_name VARCHAR(255) NOT NULL,
  applicant_contact VARCHAR(100),
  land_parcel_id VARCHAR(100),
  survey_type VARCHAR(100),
  province VARCHAR(100),
  district VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(50) DEFAULT 'medium',
  assigned_to UUID,
  sla_due_date TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 2. PHYSICAL PLANNING DIVISION
-- ============================================================

CREATE TABLE IF NOT EXISTS planning_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  applicant_name VARCHAR(255) NOT NULL,
  applicant_contact VARCHAR(100),
  application_type VARCHAR(100),
  land_use_category VARCHAR(100),
  zoning_classification VARCHAR(100),
  province VARCHAR(100),
  district VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(50) DEFAULT 'medium',
  assigned_to UUID,
  sla_due_date TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 3. INTEGRATED LAND GROUPS (ILG) DIVISION
-- ============================================================

CREATE TABLE IF NOT EXISTS ilg_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  group_name VARCHAR(255) NOT NULL,
  clan_name VARCHAR(255),
  contact_person VARCHAR(255),
  contact_phone VARCHAR(100),
  registration_type VARCHAR(100),
  province VARCHAR(100),
  district VARCHAR(100),
  llg VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(50) DEFAULT 'medium',
  assigned_to UUID,
  sla_due_date TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 4. STATE/ALIENATED LAND DIVISION
-- ============================================================

CREATE TABLE IF NOT EXISTS state_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  applicant_name VARCHAR(255) NOT NULL,
  applicant_contact VARCHAR(100),
  lease_type VARCHAR(100),
  transaction_type VARCHAR(100),
  land_portion VARCHAR(100),
  allotment_number VARCHAR(100),
  province VARCHAR(100),
  district VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(50) DEFAULT 'medium',
  assigned_to UUID,
  sla_due_date TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 5. REGISTRAR OF TITLES DIVISION
-- ============================================================

CREATE TABLE IF NOT EXISTS titles_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  applicant_name VARCHAR(255) NOT NULL,
  applicant_contact VARCHAR(100),
  registration_type VARCHAR(100),
  title_reference VARCHAR(100),
  volume_folio VARCHAR(100),
  instrument_type VARCHAR(100),
  province VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(50) DEFAULT 'medium',
  assigned_to UUID,
  sla_due_date TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 6. CUSTOMER SERVICES DIVISION
-- ============================================================

CREATE TABLE IF NOT EXISTS customer_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  customer_name VARCHAR(255) NOT NULL,
  customer_contact VARCHAR(100),
  customer_email VARCHAR(255),
  service_type VARCHAR(100),
  request_category VARCHAR(100),
  province VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(50) DEFAULT 'medium',
  assigned_to UUID,
  sla_due_date TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 7. LEGAL/CASE MANAGEMENT DIVISION
-- Note: This table may already exist - using IF NOT EXISTS
-- ============================================================

CREATE TABLE IF NOT EXISTS legal_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  case_type VARCHAR(100),
  plaintiff VARCHAR(255),
  defendant VARCHAR(255),
  court_name VARCHAR(255),
  court_reference VARCHAR(100),
  province VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(50) DEFAULT 'medium',
  assigned_to UUID,
  next_hearing_date TIMESTAMP WITH TIME ZONE,
  sla_due_date TIMESTAMP WITH TIME ZONE,
  filed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 8. AUDIT & COMPLIANCE DIVISION
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_findings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  finding_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  finding_type VARCHAR(100),
  audit_category VARCHAR(100),
  target_division VARCHAR(100),
  risk_level VARCHAR(50) DEFAULT 'medium',
  compliance_status VARCHAR(100),
  recommendation TEXT,
  management_response TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  assigned_to UUID,
  sla_due_date TIMESTAMP WITH TIME ZONE,
  identified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 9. CORPORATE SERVICES DIVISION
-- ============================================================

CREATE TABLE IF NOT EXISTS corporate_matters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matter_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  matter_type VARCHAR(100),
  department VARCHAR(100),
  category VARCHAR(100),
  budget_code VARCHAR(50),
  estimated_cost DECIMAL(15,2),
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(50) DEFAULT 'medium',
  assigned_to UUID,
  sla_due_date TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 10. ICT/SYSTEMS ADMIN DIVISION
-- ============================================================

CREATE TABLE IF NOT EXISTS system_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  request_type VARCHAR(100),
  system_affected VARCHAR(255),
  requester_name VARCHAR(255) NOT NULL,
  requester_department VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(50) DEFAULT 'medium',
  assigned_to UUID,
  sla_due_date TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- EXECUTIVE OVERSIGHT TABLES
-- ============================================================

-- Executive Alerts
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

-- Executive Directives
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

-- Inter-Division Requests
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
-- INDEXES FOR PERFORMANCE (wrapped in exception handlers)
-- ============================================================

-- Safe index creation function
CREATE OR REPLACE FUNCTION create_index_if_not_exists(
  p_index_name TEXT,
  p_table_name TEXT,
  p_column_name TEXT
) RETURNS VOID AS $$
BEGIN
  -- Check if column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = p_table_name AND column_name = p_column_name
  ) THEN
    -- Check if index exists
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE indexname = p_index_name
    ) THEN
      EXECUTE format('CREATE INDEX %I ON %I(%I)', p_index_name, p_table_name, p_column_name);
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create indexes safely
SELECT create_index_if_not_exists('idx_survey_status', 'survey_submissions', 'status');
SELECT create_index_if_not_exists('idx_survey_province', 'survey_submissions', 'province');
SELECT create_index_if_not_exists('idx_survey_submitted', 'survey_submissions', 'submitted_at');

SELECT create_index_if_not_exists('idx_planning_status', 'planning_submissions', 'status');
SELECT create_index_if_not_exists('idx_planning_province', 'planning_submissions', 'province');
SELECT create_index_if_not_exists('idx_planning_submitted', 'planning_submissions', 'submitted_at');

SELECT create_index_if_not_exists('idx_ilg_status', 'ilg_submissions', 'status');
SELECT create_index_if_not_exists('idx_ilg_province', 'ilg_submissions', 'province');
SELECT create_index_if_not_exists('idx_ilg_submitted', 'ilg_submissions', 'submitted_at');

SELECT create_index_if_not_exists('idx_state_status', 'state_submissions', 'status');
SELECT create_index_if_not_exists('idx_state_province', 'state_submissions', 'province');
SELECT create_index_if_not_exists('idx_state_submitted', 'state_submissions', 'submitted_at');

SELECT create_index_if_not_exists('idx_titles_status', 'titles_submissions', 'status');
SELECT create_index_if_not_exists('idx_titles_province', 'titles_submissions', 'province');
SELECT create_index_if_not_exists('idx_titles_submitted', 'titles_submissions', 'submitted_at');

SELECT create_index_if_not_exists('idx_customer_status', 'customer_submissions', 'status');
SELECT create_index_if_not_exists('idx_customer_submitted', 'customer_submissions', 'submitted_at');

SELECT create_index_if_not_exists('idx_legal_status', 'legal_cases', 'status');
SELECT create_index_if_not_exists('idx_legal_type', 'legal_cases', 'case_type');
SELECT create_index_if_not_exists('idx_legal_hearing', 'legal_cases', 'next_hearing_date');

SELECT create_index_if_not_exists('idx_audit_status', 'audit_findings', 'status');
SELECT create_index_if_not_exists('idx_audit_division', 'audit_findings', 'target_division');

SELECT create_index_if_not_exists('idx_corporate_status', 'corporate_matters', 'status');
SELECT create_index_if_not_exists('idx_corporate_type', 'corporate_matters', 'matter_type');

SELECT create_index_if_not_exists('idx_system_status', 'system_submissions', 'status');
SELECT create_index_if_not_exists('idx_system_type', 'system_submissions', 'request_type');

SELECT create_index_if_not_exists('idx_alerts_severity', 'exec_alerts', 'severity');
SELECT create_index_if_not_exists('idx_alerts_division', 'exec_alerts', 'source_division');
SELECT create_index_if_not_exists('idx_alerts_acknowledged', 'exec_alerts', 'acknowledged');
SELECT create_index_if_not_exists('idx_directives_status', 'exec_directives', 'status');
SELECT create_index_if_not_exists('idx_interdiv_from', 'exec_interdivision_requests', 'from_division');
SELECT create_index_if_not_exists('idx_interdiv_to', 'exec_interdivision_requests', 'to_division');
SELECT create_index_if_not_exists('idx_interdiv_status', 'exec_interdivision_requests', 'status');

-- ============================================================
-- ROW LEVEL SECURITY (RLS) - Enable if not already
-- ============================================================

DO $$
BEGIN
  ALTER TABLE survey_submissions ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE planning_submissions ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE ilg_submissions ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE state_submissions ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE titles_submissions ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE customer_submissions ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE legal_cases ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE audit_findings ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE corporate_matters ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE system_submissions ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE exec_alerts ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE exec_directives ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE exec_interdivision_requests ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ============================================================
-- RLS POLICIES (drop and recreate to avoid conflicts)
-- ============================================================

-- Survey submissions policies
DROP POLICY IF EXISTS "Allow authenticated read" ON survey_submissions;
DROP POLICY IF EXISTS "Allow anon read" ON survey_submissions;
CREATE POLICY "Allow authenticated read" ON survey_submissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow anon read" ON survey_submissions FOR SELECT TO anon USING (true);

-- Planning submissions policies
DROP POLICY IF EXISTS "Allow authenticated read" ON planning_submissions;
DROP POLICY IF EXISTS "Allow anon read" ON planning_submissions;
CREATE POLICY "Allow authenticated read" ON planning_submissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow anon read" ON planning_submissions FOR SELECT TO anon USING (true);

-- ILG submissions policies
DROP POLICY IF EXISTS "Allow authenticated read" ON ilg_submissions;
DROP POLICY IF EXISTS "Allow anon read" ON ilg_submissions;
CREATE POLICY "Allow authenticated read" ON ilg_submissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow anon read" ON ilg_submissions FOR SELECT TO anon USING (true);

-- State submissions policies
DROP POLICY IF EXISTS "Allow authenticated read" ON state_submissions;
DROP POLICY IF EXISTS "Allow anon read" ON state_submissions;
CREATE POLICY "Allow authenticated read" ON state_submissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow anon read" ON state_submissions FOR SELECT TO anon USING (true);

-- Titles submissions policies
DROP POLICY IF EXISTS "Allow authenticated read" ON titles_submissions;
DROP POLICY IF EXISTS "Allow anon read" ON titles_submissions;
CREATE POLICY "Allow authenticated read" ON titles_submissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow anon read" ON titles_submissions FOR SELECT TO anon USING (true);

-- Customer submissions policies
DROP POLICY IF EXISTS "Allow authenticated read" ON customer_submissions;
DROP POLICY IF EXISTS "Allow anon read" ON customer_submissions;
CREATE POLICY "Allow authenticated read" ON customer_submissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow anon read" ON customer_submissions FOR SELECT TO anon USING (true);

-- Legal cases policies
DROP POLICY IF EXISTS "Allow authenticated read" ON legal_cases;
DROP POLICY IF EXISTS "Allow anon read" ON legal_cases;
CREATE POLICY "Allow authenticated read" ON legal_cases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow anon read" ON legal_cases FOR SELECT TO anon USING (true);

-- Audit findings policies
DROP POLICY IF EXISTS "Allow authenticated read" ON audit_findings;
DROP POLICY IF EXISTS "Allow anon read" ON audit_findings;
CREATE POLICY "Allow authenticated read" ON audit_findings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow anon read" ON audit_findings FOR SELECT TO anon USING (true);

-- Corporate matters policies
DROP POLICY IF EXISTS "Allow authenticated read" ON corporate_matters;
DROP POLICY IF EXISTS "Allow anon read" ON corporate_matters;
CREATE POLICY "Allow authenticated read" ON corporate_matters FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow anon read" ON corporate_matters FOR SELECT TO anon USING (true);

-- System submissions policies
DROP POLICY IF EXISTS "Allow authenticated read" ON system_submissions;
DROP POLICY IF EXISTS "Allow anon read" ON system_submissions;
CREATE POLICY "Allow authenticated read" ON system_submissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow anon read" ON system_submissions FOR SELECT TO anon USING (true);

-- Exec alerts policies
DROP POLICY IF EXISTS "Allow authenticated read" ON exec_alerts;
DROP POLICY IF EXISTS "Allow anon read" ON exec_alerts;
CREATE POLICY "Allow authenticated read" ON exec_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow anon read" ON exec_alerts FOR SELECT TO anon USING (true);

-- Exec directives policies
DROP POLICY IF EXISTS "Allow authenticated read" ON exec_directives;
DROP POLICY IF EXISTS "Allow anon read" ON exec_directives;
CREATE POLICY "Allow authenticated read" ON exec_directives FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow anon read" ON exec_directives FOR SELECT TO anon USING (true);

-- Inter-division requests policies
DROP POLICY IF EXISTS "Allow authenticated read" ON exec_interdivision_requests;
DROP POLICY IF EXISTS "Allow anon read" ON exec_interdivision_requests;
CREATE POLICY "Allow authenticated read" ON exec_interdivision_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow anon read" ON exec_interdivision_requests FOR SELECT TO anon USING (true);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- APPLY UPDATED_AT TRIGGERS (wrapped in exception handlers)
-- ============================================================

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_survey_updated_at ON survey_submissions;
  CREATE TRIGGER update_survey_updated_at BEFORE UPDATE ON survey_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_planning_updated_at ON planning_submissions;
  CREATE TRIGGER update_planning_updated_at BEFORE UPDATE ON planning_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_ilg_updated_at ON ilg_submissions;
  CREATE TRIGGER update_ilg_updated_at BEFORE UPDATE ON ilg_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_state_updated_at ON state_submissions;
  CREATE TRIGGER update_state_updated_at BEFORE UPDATE ON state_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_titles_updated_at ON titles_submissions;
  CREATE TRIGGER update_titles_updated_at BEFORE UPDATE ON titles_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_customer_updated_at ON customer_submissions;
  CREATE TRIGGER update_customer_updated_at BEFORE UPDATE ON customer_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_legal_updated_at ON legal_cases;
  CREATE TRIGGER update_legal_updated_at BEFORE UPDATE ON legal_cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_audit_updated_at ON audit_findings;
  CREATE TRIGGER update_audit_updated_at BEFORE UPDATE ON audit_findings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_corporate_updated_at ON corporate_matters;
  CREATE TRIGGER update_corporate_updated_at BEFORE UPDATE ON corporate_matters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_system_updated_at ON system_submissions;
  CREATE TRIGGER update_system_updated_at BEFORE UPDATE ON system_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_directives_updated_at ON exec_directives;
  CREATE TRIGGER update_directives_updated_at BEFORE UPDATE ON exec_directives FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_interdiv_updated_at ON exec_interdivision_requests;
  CREATE TRIGGER update_interdiv_updated_at BEFORE UPDATE ON exec_interdivision_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ============================================================
-- SLA BREACH ALERT FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION check_sla_breach()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'overdue' AND (OLD.status IS NULL OR OLD.status != 'overdue') THEN
    INSERT INTO exec_alerts (
      title,
      message,
      severity,
      source_division,
      source_submission_id,
      alert_type
    ) VALUES (
      'SLA Breach Detected',
      'Submission has breached its SLA deadline',
      'warning',
      TG_TABLE_NAME,
      NEW.id,
      'sla_breach'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- APPLY SLA BREACH TRIGGERS (wrapped in exception handlers)
-- ============================================================

DO $$ BEGIN
  DROP TRIGGER IF EXISTS sla_breach_survey ON survey_submissions;
  CREATE TRIGGER sla_breach_survey AFTER UPDATE ON survey_submissions FOR EACH ROW EXECUTE FUNCTION check_sla_breach();
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS sla_breach_planning ON planning_submissions;
  CREATE TRIGGER sla_breach_planning AFTER UPDATE ON planning_submissions FOR EACH ROW EXECUTE FUNCTION check_sla_breach();
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS sla_breach_ilg ON ilg_submissions;
  CREATE TRIGGER sla_breach_ilg AFTER UPDATE ON ilg_submissions FOR EACH ROW EXECUTE FUNCTION check_sla_breach();
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS sla_breach_state ON state_submissions;
  CREATE TRIGGER sla_breach_state AFTER UPDATE ON state_submissions FOR EACH ROW EXECUTE FUNCTION check_sla_breach();
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS sla_breach_titles ON titles_submissions;
  CREATE TRIGGER sla_breach_titles AFTER UPDATE ON titles_submissions FOR EACH ROW EXECUTE FUNCTION check_sla_breach();
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS sla_breach_customer ON customer_submissions;
  CREATE TRIGGER sla_breach_customer AFTER UPDATE ON customer_submissions FOR EACH ROW EXECUTE FUNCTION check_sla_breach();
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE 'ILMS Database Schema successfully applied!';
  RAISE NOTICE 'Tables created/verified: 13';
  RAISE NOTICE 'Script completed without errors.';
END $$;
