-- ============================================================
-- ILMS DATABASE SCHEMA MIGRATION
-- Integrated Land Management System - Papua New Guinea
-- Department of Lands & Physical Planning
-- ============================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- COMMON ENUMS
-- ============================================================

CREATE TYPE submission_status AS ENUM ('pending', 'in_progress', 'completed', 'rejected', 'escalated', 'overdue');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'error', 'critical');

-- ============================================================
-- SURVEYOR GENERAL DIVISION (survey_ prefix)
-- ============================================================

CREATE TABLE survey_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status submission_status DEFAULT 'pending',
    priority priority_level DEFAULT 'medium',
    survey_type VARCHAR(50) NOT NULL, -- cadastral, topographic, boundary, subdivision, consolidation, other
    parcel_number VARCHAR(100),
    location TEXT,
    coordinates JSONB,
    area_hectares DECIMAL(12,4),
    surveyor_id UUID,
    field_notes TEXT,
    submitted_by UUID,
    assigned_to UUID,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE survey_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_number VARCHAR(50) UNIQUE NOT NULL,
    submission_id UUID REFERENCES survey_submissions(id),
    plan_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'draft',
    file_url TEXT,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PHYSICAL PLANNING DIVISION (planning_ prefix)
-- ============================================================

CREATE TABLE planning_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status submission_status DEFAULT 'pending',
    priority priority_level DEFAULT 'medium',
    application_type VARCHAR(50) NOT NULL, -- development_permit, subdivision, rezoning, variance, environmental, other
    property_address TEXT,
    zone_current VARCHAR(50),
    zone_proposed VARCHAR(50),
    land_use VARCHAR(100),
    building_type VARCHAR(100),
    floor_area DECIMAL(12,2),
    submitted_by UUID,
    assigned_to UUID,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE planning_permits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    permit_number VARCHAR(50) UNIQUE NOT NULL,
    submission_id UUID REFERENCES planning_submissions(id),
    permit_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    conditions TEXT,
    valid_from DATE,
    valid_until DATE,
    issued_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INTEGRATED LAND GROUPS (ilg_ prefix)
-- ============================================================

CREATE TABLE ilg_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status submission_status DEFAULT 'pending',
    priority priority_level DEFAULT 'medium',
    ilg_name VARCHAR(255) NOT NULL,
    clan_name VARCHAR(255),
    province VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    llg VARCHAR(100),
    registration_type VARCHAR(50) NOT NULL, -- new, amendment, dissolution, dispute
    members_count INTEGER,
    land_area_hectares DECIMAL(12,4),
    submitted_by UUID,
    assigned_to UUID,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ilg_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ilg_number VARCHAR(50) UNIQUE NOT NULL,
    ilg_name VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    registration_date DATE,
    province VARCHAR(100),
    district VARCHAR(100),
    chairperson VARCHAR(255),
    members_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STATE / ALIENATED LAND DIVISION (state_ prefix)
-- ============================================================

CREATE TABLE state_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status submission_status DEFAULT 'pending',
    priority priority_level DEFAULT 'medium',
    land_type VARCHAR(50) NOT NULL, -- urban, rural, agricultural, commercial, industrial, special_purpose
    transaction_type VARCHAR(50) NOT NULL, -- lease, purchase, transfer, resumption, allocation
    parcel_id VARCHAR(100),
    land_area DECIMAL(12,4),
    estimated_value DECIMAL(15,2),
    current_holder VARCHAR(255),
    proposed_holder VARCHAR(255),
    submitted_by UUID,
    assigned_to UUID,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE state_leases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lease_number VARCHAR(50) UNIQUE NOT NULL,
    parcel_id VARCHAR(100),
    lessee_name VARCHAR(255) NOT NULL,
    lease_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    commencement_date DATE,
    expiry_date DATE,
    annual_rent DECIMAL(12,2),
    land_area DECIMAL(12,4),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REGISTRAR OF TITLES (titles_ prefix)
-- ============================================================

CREATE TABLE titles_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status submission_status DEFAULT 'pending',
    priority priority_level DEFAULT 'medium',
    transaction_type VARCHAR(50) NOT NULL, -- registration, transfer, mortgage, discharge, caveat, correction
    title_reference VARCHAR(100),
    property_address TEXT,
    registered_owner VARCHAR(255),
    new_owner VARCHAR(255),
    consideration DECIMAL(15,2),
    submitted_by UUID,
    assigned_to UUID,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE titles_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_reference VARCHAR(50) UNIQUE NOT NULL,
    volume VARCHAR(20),
    folio VARCHAR(20),
    property_description TEXT,
    registered_owner VARCHAR(255),
    registration_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    encumbrances TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CUSTOMER LAND REGISTRATION SERVICES (customer_ prefix)
-- ============================================================

CREATE TABLE customer_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status submission_status DEFAULT 'pending',
    priority priority_level DEFAULT 'medium',
    service_type VARCHAR(50) NOT NULL, -- title_search, certified_copy, valuation, inspection, consultation, other
    customer_name VARCHAR(255) NOT NULL,
    customer_contact VARCHAR(100),
    customer_email VARCHAR(255),
    property_reference VARCHAR(100),
    fee_amount DECIMAL(10,2),
    payment_status VARCHAR(20) DEFAULT 'pending',
    submitted_by UUID,
    assigned_to UUID,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ICT / SYSTEMS ADMINISTRATION (system_ prefix)
-- ============================================================

CREATE TABLE system_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status submission_status DEFAULT 'pending',
    priority priority_level DEFAULT 'medium',
    request_type VARCHAR(50) NOT NULL, -- access, support, development, infrastructure, security, other
    system_affected VARCHAR(100),
    urgency VARCHAR(20) DEFAULT 'medium',
    resolution_notes TEXT,
    submitted_by UUID,
    assigned_to UUID,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EXECUTIVE / OVERSIGHT (exec_ prefix)
-- ============================================================

CREATE TABLE exec_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity alert_severity DEFAULT 'info',
    source_division VARCHAR(50) NOT NULL,
    source_submission_id UUID,
    alert_type VARCHAR(50) NOT NULL, -- sla_breach, high_priority, legal_flag, audit_finding, system_issue, dependency_delay
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by UUID,
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE exec_directives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    directive_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    issued_by UUID NOT NULL,
    issued_to_division VARCHAR(50) NOT NULL,
    priority priority_level DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'issued', -- issued, acknowledged, in_progress, completed, overdue
    due_date TIMESTAMPTZ,
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID,
    completed_at TIMESTAMPTZ,
    completion_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE exec_interdivision_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_number VARCHAR(50) UNIQUE NOT NULL,
    from_division VARCHAR(50) NOT NULL,
    to_division VARCHAR(50) NOT NULL,
    request_type VARCHAR(100),
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, acknowledged, in_progress, completed, returned, escalated
    priority priority_level DEFAULT 'medium',
    source_submission_id UUID,
    requested_by UUID,
    assigned_to UUID,
    due_date TIMESTAMPTZ,
    acknowledged_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    response_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================

CREATE TABLE exec_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL, -- create, update, delete
    old_values JSONB,
    new_values JSONB,
    performed_by UUID,
    performed_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

CREATE TABLE exec_action_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action_type VARCHAR(50) NOT NULL, -- view, comment, directive, escalation, approval, rejection
    target_division VARCHAR(50),
    target_submission_id UUID,
    performed_by UUID NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

-- Survey
CREATE INDEX idx_survey_submissions_status ON survey_submissions(status);
CREATE INDEX idx_survey_submissions_created ON survey_submissions(created_at);

-- Planning
CREATE INDEX idx_planning_submissions_status ON planning_submissions(status);
CREATE INDEX idx_planning_submissions_created ON planning_submissions(created_at);

-- ILG
CREATE INDEX idx_ilg_submissions_status ON ilg_submissions(status);
CREATE INDEX idx_ilg_submissions_province ON ilg_submissions(province);

-- State
CREATE INDEX idx_state_submissions_status ON state_submissions(status);
CREATE INDEX idx_state_leases_status ON state_leases(status);

-- Titles
CREATE INDEX idx_titles_submissions_status ON titles_submissions(status);
CREATE INDEX idx_titles_records_status ON titles_records(status);

-- Customer
CREATE INDEX idx_customer_submissions_status ON customer_submissions(status);

-- System
CREATE INDEX idx_system_submissions_status ON system_submissions(status);

-- Executive
CREATE INDEX idx_exec_alerts_acknowledged ON exec_alerts(acknowledged);
CREATE INDEX idx_exec_alerts_severity ON exec_alerts(severity);
CREATE INDEX idx_exec_directives_status ON exec_directives(status);
CREATE INDEX idx_exec_interdivision_status ON exec_interdivision_requests(status);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE survey_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE planning_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ilg_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE state_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE titles_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exec_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exec_directives ENABLE ROW LEVEL SECURITY;
ALTER TABLE exec_interdivision_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (adjust based on your auth setup)
CREATE POLICY "Allow all for authenticated users" ON survey_submissions FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON planning_submissions FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON ilg_submissions FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON state_submissions FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON titles_submissions FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON customer_submissions FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON system_submissions FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON exec_alerts FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON exec_directives FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON exec_interdivision_requests FOR ALL USING (true);

-- ============================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_survey_submissions_updated_at BEFORE UPDATE ON survey_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_planning_submissions_updated_at BEFORE UPDATE ON planning_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ilg_submissions_updated_at BEFORE UPDATE ON ilg_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_state_submissions_updated_at BEFORE UPDATE ON state_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_titles_submissions_updated_at BEFORE UPDATE ON titles_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_submissions_updated_at BEFORE UPDATE ON customer_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_submissions_updated_at BEFORE UPDATE ON system_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exec_directives_updated_at BEFORE UPDATE ON exec_directives FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exec_interdivision_updated_at BEFORE UPDATE ON exec_interdivision_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- REALTIME SUBSCRIPTIONS
-- ============================================================

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE exec_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE exec_directives;
ALTER PUBLICATION supabase_realtime ADD TABLE exec_interdivision_requests;
