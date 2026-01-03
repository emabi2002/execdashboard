-- ============================================================
-- SAMPLE TEST DATA
-- All test records are marked with [TEST] prefix for easy removal
-- Run the DELETE commands at the bottom to remove all test data
-- ============================================================

-- ============================================================
-- DEVELOPMENT APPLICATIONS (Physical Planning)
-- ============================================================

INSERT INTO development_applications (
  application_number, applicant_name, applicant_email, applicant_phone,
  application_type, project_title, project_description, estimated_cost,
  proposed_use, status, priority, submitted_date, review_deadline
) VALUES
  ('DEV-TEST-001', '[TEST] John Kari', 'john.kari@test.pg', '+675 7123 4567',
   'Commercial', '[TEST] Port Moresby Shopping Complex', 'New 3-story commercial building with retail spaces', 2500000,
   'Retail/Commercial', 'pending', 'high', NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days'),

  ('DEV-TEST-002', '[TEST] Mary Teine', 'mary.teine@test.pg', '+675 7234 5678',
   'Residential', '[TEST] Lae Housing Estate Phase 2', 'Residential subdivision with 50 housing lots', 1800000,
   'Residential', 'in_progress', 'medium', NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days'),

  ('DEV-TEST-003', '[TEST] Peter Wamu', 'peter.wamu@test.pg', '+675 7345 6789',
   'Industrial', '[TEST] Madang Fish Processing Plant', 'Industrial facility for fish processing and export', 3200000,
   'Industrial', 'approved', 'high', NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 days'),

  ('DEV-TEST-004', '[TEST] Sarah Kuman', 'sarah.kuman@test.pg', '+675 7456 7890',
   'Mixed Use', '[TEST] Goroka Town Center Redevelopment', 'Mixed use development with offices and retail', 4500000,
   'Mixed Use', 'pending', 'urgent', NOW() - INTERVAL '3 days', NOW() + INTERVAL '27 days'),

  ('DEV-TEST-005', '[TEST] James Yali', 'james.yali@test.pg', '+675 7567 8901',
   'Residential', '[TEST] Mt Hagen Affordable Housing', 'Low-cost housing project with 100 units', 5000000,
   'Residential', 'rejected', 'medium', NOW() - INTERVAL '45 days', NOW() - INTERVAL '15 days'),

  ('DEV-TEST-006', '[TEST] Anna Vele', 'anna.vele@test.pg', '+675 7678 9012',
   'Commercial', '[TEST] Kokopo Waterfront Hotel', 'Beachfront hotel development with 80 rooms', 8000000,
   'Tourism/Hospitality', 'in_progress', 'high', NOW() - INTERVAL '20 days', NOW() + INTERVAL '10 days'),

  ('DEV-TEST-007', '[TEST] Thomas Rea', 'thomas.rea@test.pg', '+675 7789 0123',
   'Infrastructure', '[TEST] Wewak Road Upgrade', 'Main road upgrade and drainage improvements', 1200000,
   'Infrastructure', 'pending', 'low', NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days');


-- ============================================================
-- CUSTOMER SUBMISSIONS (Customer Services)
-- ============================================================

INSERT INTO customer_submissions (
  submission_number, title, description, customer_name, customer_contact,
  customer_email, service_type, request_category, province, status, priority,
  sla_due_date, submitted_at
) VALUES
  ('CS-TEST-001', '[TEST] Title Search Request', 'Request for title search on Allotment 15 Section 42 Boroko',
   '[TEST] Michael Tau', '+675 7111 2222', 'michael.tau@test.pg',
   'Title Search', 'Land Information', 'National Capital District', 'pending', 'medium',
   NOW() + INTERVAL '5 days', NOW() - INTERVAL '2 days'),

  ('CS-TEST-002', '[TEST] Lease Renewal Inquiry', 'Inquiry about lease renewal process for State Lease 123',
   '[TEST] Grace Peni', '+675 7222 3333', 'grace.peni@test.pg',
   'Lease Services', 'State Land', 'Morobe', 'in_progress', 'high',
   NOW() + INTERVAL '3 days', NOW() - INTERVAL '4 days'),

  ('CS-TEST-003', '[TEST] Survey Plan Copy', 'Request for certified copy of survey plan SP-2024-456',
   '[TEST] David Kuri', '+675 7333 4444', 'david.kuri@test.pg',
   'Document Copy', 'Survey Services', 'Eastern Highlands', 'completed', 'low',
   NOW() - INTERVAL '1 day', NOW() - INTERVAL '7 days'),

  ('CS-TEST-004', '[TEST] Land Valuation Request', 'Property valuation needed for bank loan application',
   '[TEST] Ruth Mane', '+675 7444 5555', 'ruth.mane@test.pg',
   'Valuation', 'Property Services', 'Western Highlands', 'pending', 'urgent',
   NOW() + INTERVAL '2 days', NOW() - INTERVAL '1 day'),

  ('CS-TEST-005', '[TEST] Boundary Dispute Complaint', 'Complaint regarding boundary encroachment by neighbor',
   '[TEST] Paul Siki', '+675 7555 6666', 'paul.siki@test.pg',
   'Dispute Resolution', 'Land Disputes', 'East New Britain', 'in_progress', 'high',
   NOW() + INTERVAL '10 days', NOW() - INTERVAL '5 days'),

  ('CS-TEST-006', '[TEST] ILG Registration Query', 'Query about ILG registration requirements',
   '[TEST] Helen Toea', '+675 7666 7777', 'helen.toea@test.pg',
   'General Inquiry', 'Customary Land', 'Gulf', 'completed', 'low',
   NOW() - INTERVAL '2 days', NOW() - INTERVAL '8 days');


-- ============================================================
-- AUDIT FINDINGS (Audit & Compliance)
-- ============================================================

INSERT INTO audit_findings (
  title, condition_found, criteria, cause, effect, risk_rating, status
) VALUES
  ('[TEST] Incomplete Land Title Records',
   'Found 15% of land title records missing required documentation',
   'All title records must have complete chain of custody documentation per Lands Act Section 42',
   'Staff training gaps and backlog in document scanning',
   'Potential disputes and delays in title verification',
   'High', 'open'),

  ('[TEST] Delayed Processing of Applications',
   'Average processing time exceeded SLA by 35% in Q3',
   'Development applications should be processed within 30 working days',
   'Understaffing in Physical Planning division',
   'Customer dissatisfaction and potential legal claims',
   'Medium', 'in_progress'),

  ('[TEST] Inadequate File Security',
   'Physical file storage room lacks proper access controls',
   'Sensitive land records require restricted access per Information Security Policy',
   'Budget constraints for security upgrades',
   'Risk of unauthorized access or document theft',
   'Critical', 'pending'),

  ('[TEST] Survey Plan Numbering Discrepancies',
   'Found duplicate survey plan numbers in 3 districts',
   'Each survey plan must have a unique identifier across all provinces',
   'Legacy system migration issues',
   'Confusion in land parcel identification',
   'Medium', 'closed'),

  ('[TEST] Revenue Collection Gaps',
   'Lease rental collection rate at 68% vs 95% target',
   'All lease rentals should be collected within 30 days of due date',
   'Outdated debtor tracking system',
   'Revenue loss estimated at K2.5 million annually',
   'High', 'open');


-- ============================================================
-- CORPORATE MATTERS (Corporate Services)
-- ============================================================

INSERT INTO corporate_matters (
  matter_number, type_of_matter, request_form, requester_name, requester_position,
  requesting_division, date_requested, date_received, request_type, land_description,
  status, due_date
) VALUES
  ('CM-TEST-001', '[TEST] Staff Recruitment', 'HR-001', '[TEST] Robert Mara', 'Director',
   'Physical Planning', CURRENT_DATE - 10, CURRENT_DATE - 9, 'Urgent',
   'N/A', 'pending', CURRENT_DATE + 5),

  ('CM-TEST-002', '[TEST] Budget Reallocation', 'FIN-002', '[TEST] Susan Kila', 'Manager',
   'Survey Division', CURRENT_DATE - 15, CURRENT_DATE - 14, 'Standard',
   'N/A', 'in_progress', CURRENT_DATE + 10),

  ('CM-TEST-003', '[TEST] Vehicle Procurement', 'PROC-003', '[TEST] Mark Temu', 'Senior Officer',
   'Customer Services', CURRENT_DATE - 20, CURRENT_DATE - 19, 'Standard',
   'N/A', 'approved', CURRENT_DATE - 5),

  ('CM-TEST-004', '[TEST] Office Renovation', 'FAC-004', '[TEST] Janet Wari', 'Director',
   'Registrar of Titles', CURRENT_DATE - 5, CURRENT_DATE - 4, 'Standard',
   'N/A', 'pending', CURRENT_DATE + 20),

  ('CM-TEST-005', '[TEST] IT Equipment Request', 'IT-005', '[TEST] Steven Yama', 'IT Officer',
   'ICT Division', CURRENT_DATE - 8, CURRENT_DATE - 7, 'Urgent',
   'N/A', 'completed', CURRENT_DATE - 2),

  ('CM-TEST-006', '[TEST] Training Program', 'HR-006', '[TEST] Alice Rau', 'HR Manager',
   'Corporate Services', CURRENT_DATE - 12, CURRENT_DATE - 11, 'Standard',
   'N/A', 'in_progress', CURRENT_DATE + 15);


-- ============================================================
-- EXECUTIVE ALERTS
-- ============================================================

INSERT INTO exec_alerts (
  title, message, severity, source_division, alert_type, acknowledged
) VALUES
  ('[TEST] SLA Breach Warning - Physical Planning',
   '5 development applications approaching SLA deadline within 48 hours',
   'warning', 'planning', 'sla_warning', false),

  ('[TEST] Critical Audit Finding Requires Attention',
   'Inadequate file security finding rated as Critical - immediate action required',
   'critical', 'audit', 'audit_finding', false),

  ('[TEST] High Volume Customer Complaints',
   'Customer complaints increased by 40% this week - review required',
   'error', 'customer', 'performance_alert', false),

  ('[TEST] System Maintenance Scheduled',
   'Database maintenance scheduled for Saturday 10PM - 2AM',
   'info', 'ict', 'system_notice', true),

  ('[TEST] Revenue Collection Below Target',
   'Lease rental collection at 68% of quarterly target with 2 weeks remaining',
   'warning', 'state', 'revenue_alert', false);


-- ============================================================
-- EXECUTIVE DIRECTIVES
-- ============================================================

INSERT INTO exec_directives (
  directive_number, title, description, target_divisions, priority, status, issued_by, due_date
) VALUES
  ('DIR-TEST-001', '[TEST] Reduce Application Processing Time',
   'All divisions must implement measures to reduce average processing time by 20% within Q1. Weekly progress reports required.',
   ARRAY['planning', 'survey', 'titles'], 'high', 'issued',
   'Secretary for Lands', NOW() + INTERVAL '30 days'),

  ('DIR-TEST-002', '[TEST] Complete Records Digitization',
   'Prioritize digitization of all physical records older than 10 years. Allocate additional resources as needed.',
   ARRAY['titles', 'survey', 'legal'], 'medium', 'in_progress',
   'Deputy Secretary', NOW() + INTERVAL '90 days'),

  ('DIR-TEST-003', '[TEST] Customer Service Improvement Initiative',
   'Implement customer feedback system and respond to all complaints within 48 hours.',
   ARRAY['customer'], 'urgent', 'acknowledged',
   'Secretary for Lands', NOW() + INTERVAL '14 days'),

  ('DIR-TEST-004', '[TEST] Quarterly Compliance Review',
   'Conduct comprehensive compliance review for all divisions. Submit reports by end of quarter.',
   ARRAY['audit', 'legal', 'corporate'], 'medium', 'issued',
   'Deputy Secretary', NOW() + INTERVAL '60 days');


-- ============================================================
-- INTER-DIVISION REQUESTS
-- ============================================================

INSERT INTO exec_interdivision_requests (
  request_number, title, description, from_division, to_division,
  request_type, status, priority
) VALUES
  ('IDR-TEST-001', '[TEST] Survey Plan Verification',
   'Request verification of survey plan SP-2024-789 for development application',
   'planning', 'survey', 'verification', 'pending', 'high'),

  ('IDR-TEST-002', '[TEST] Legal Opinion Required',
   'Require legal opinion on customary land claim for Allotment 25',
   'ilg', 'legal', 'legal_opinion', 'in_progress', 'medium'),

  ('IDR-TEST-003', '[TEST] Title Search for Audit',
   'Title search required for lease audit - multiple properties',
   'audit', 'titles', 'search', 'completed', 'low'),

  ('IDR-TEST-004', '[TEST] IT System Access Request',
   'New staff require access to land information system',
   'customer', 'ict', 'access_request', 'pending', 'medium');


-- ============================================================
-- HOW TO REMOVE ALL TEST DATA
-- Run these DELETE statements when ready to use real data
-- ============================================================

/*
-- REMOVE ALL TEST DATA (uncomment and run when ready):

DELETE FROM development_applications WHERE applicant_name LIKE '[TEST]%' OR project_title LIKE '[TEST]%';
DELETE FROM customer_submissions WHERE customer_name LIKE '[TEST]%' OR title LIKE '[TEST]%';
DELETE FROM audit_findings WHERE title LIKE '[TEST]%';
DELETE FROM corporate_matters WHERE type_of_matter LIKE '[TEST]%' OR requester_name LIKE '[TEST]%';
DELETE FROM exec_alerts WHERE title LIKE '[TEST]%';
DELETE FROM exec_directives WHERE title LIKE '[TEST]%';
DELETE FROM exec_interdivision_requests WHERE title LIKE '[TEST]%';

-- Verify deletion:
SELECT 'Test data removed successfully!' as status;
*/
