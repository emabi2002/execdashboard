// ============================================================
// INTEGRATED LAND MANAGEMENT SYSTEM (ILMS) - TYPE DEFINITIONS
// Department of Lands & Physical Planning - Papua New Guinea
// ============================================================

// Common types used across all divisions
export type SubmissionStatus = 'pending' | 'in_progress' | 'completed' | 'rejected' | 'escalated' | 'overdue';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

// Base interface for all submissions
export interface BaseSubmission {
  id: string;
  reference_number: string;
  title: string;
  description: string | null;
  status: SubmissionStatus;
  priority: Priority;
  submitted_by: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  due_date: string | null;
  completed_at: string | null;
}

// ============================================================
// SURVEYOR GENERAL DIVISION (survey_ prefix)
// ============================================================

export interface SurveySubmission extends BaseSubmission {
  survey_type: 'cadastral' | 'topographic' | 'boundary' | 'subdivision' | 'consolidation' | 'other';
  parcel_number: string | null;
  location: string | null;
  coordinates: { lat: number; lng: number } | null;
  area_hectares: number | null;
  surveyor_id: string | null;
  field_notes: string | null;
}

export interface SurveyPlan {
  id: string;
  plan_number: string;
  submission_id: string;
  plan_type: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  file_url: string | null;
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
}

// ============================================================
// PHYSICAL PLANNING DIVISION (planning_ prefix)
// ============================================================

export interface PlanningSubmission extends BaseSubmission {
  application_type: 'development_permit' | 'subdivision' | 'rezoning' | 'variance' | 'environmental' | 'other';
  property_address: string | null;
  zone_current: string | null;
  zone_proposed: string | null;
  land_use: string | null;
  building_type: string | null;
  floor_area: number | null;
}

export interface PlanningPermit {
  id: string;
  permit_number: string;
  submission_id: string;
  permit_type: string;
  status: 'pending' | 'approved' | 'conditional' | 'rejected' | 'expired';
  conditions: string | null;
  valid_from: string | null;
  valid_until: string | null;
  issued_by: string | null;
  created_at: string;
}

// ============================================================
// INTEGRATED LAND GROUPS (ilg_ prefix)
// ============================================================

export interface ILGSubmission extends BaseSubmission {
  ilg_name: string;
  clan_name: string | null;
  province: string;
  district: string | null;
  llg: string | null;
  registration_type: 'new' | 'amendment' | 'dissolution' | 'dispute';
  members_count: number | null;
  land_area_hectares: number | null;
}

export interface ILGRegistration {
  id: string;
  ilg_number: string;
  ilg_name: string;
  status: 'pending' | 'registered' | 'suspended' | 'dissolved';
  registration_date: string | null;
  province: string;
  district: string | null;
  chairperson: string | null;
  members_count: number;
  created_at: string;
  updated_at: string;
}

// ============================================================
// STATE / ALIENATED LAND DIVISION (state_ prefix)
// ============================================================

export interface StateSubmission extends BaseSubmission {
  land_type: 'urban' | 'rural' | 'agricultural' | 'commercial' | 'industrial' | 'special_purpose';
  transaction_type: 'lease' | 'purchase' | 'transfer' | 'resumption' | 'allocation';
  parcel_id: string | null;
  land_area: number | null;
  estimated_value: number | null;
  current_holder: string | null;
  proposed_holder: string | null;
}

export interface StateLease {
  id: string;
  lease_number: string;
  parcel_id: string;
  lessee_name: string;
  lease_type: 'urban' | 'rural' | 'special' | 'agricultural';
  status: 'active' | 'expired' | 'terminated' | 'pending_renewal';
  commencement_date: string;
  expiry_date: string;
  annual_rent: number | null;
  land_area: number | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// REGISTRAR OF TITLES (titles_ prefix)
// ============================================================

export interface TitlesSubmission extends BaseSubmission {
  transaction_type: 'registration' | 'transfer' | 'mortgage' | 'discharge' | 'caveat' | 'correction';
  title_reference: string | null;
  property_address: string | null;
  registered_owner: string | null;
  new_owner: string | null;
  consideration: number | null;
}

export interface TitleRecord {
  id: string;
  title_reference: string;
  volume: string;
  folio: string;
  property_description: string;
  registered_owner: string;
  registration_date: string;
  status: 'active' | 'cancelled' | 'superseded';
  encumbrances: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// CUSTOMER LAND REGISTRATION SERVICES (customer_ prefix)
// ============================================================

export interface CustomerSubmission extends BaseSubmission {
  service_type: 'title_search' | 'certified_copy' | 'valuation' | 'inspection' | 'consultation' | 'other';
  customer_name: string;
  customer_contact: string | null;
  customer_email: string | null;
  property_reference: string | null;
  fee_amount: number | null;
  payment_status: 'pending' | 'paid' | 'waived' | 'refunded';
}

export interface CustomerRequest {
  id: string;
  request_number: string;
  customer_id: string;
  service_type: string;
  status: 'received' | 'processing' | 'ready' | 'collected' | 'cancelled';
  fee_amount: number | null;
  payment_received: boolean;
  created_at: string;
  completed_at: string | null;
}

// ============================================================
// LEGAL / CASE MANAGEMENT (legal_ prefix) - Extended
// ============================================================

export interface LegalSubmission extends BaseSubmission {
  case_type: 'dispute' | 'appeal' | 'enforcement' | 'advisory' | 'litigation' | 'mediation';
  court_reference: string | null;
  opposing_party: string | null;
  hearing_date: string | null;
  legal_officer_id: string | null;
  outcome: string | null;
}

// ============================================================
// AUDIT & COMPLIANCE (audit_ prefix) - Extended
// ============================================================

export interface AuditSubmission extends BaseSubmission {
  audit_type: 'internal' | 'external' | 'compliance' | 'investigation' | 'review';
  finding_severity: 'minor' | 'moderate' | 'major' | 'critical';
  division_audited: string;
  recommendations: string | null;
  management_response: string | null;
  follow_up_date: string | null;
}

// ============================================================
// CORPORATE SERVICES (corporate_ prefix) - Extended
// ============================================================

export interface CorporateSubmission extends BaseSubmission {
  category: 'hr' | 'finance' | 'procurement' | 'administration' | 'policy' | 'other';
  budget_code: string | null;
  amount: number | null;
  approval_level: 'officer' | 'manager' | 'director' | 'secretary';
}

// ============================================================
// ICT / SYSTEMS ADMINISTRATION (system_ prefix)
// ============================================================

export interface SystemSubmission extends BaseSubmission {
  request_type: 'access' | 'support' | 'development' | 'infrastructure' | 'security' | 'other';
  system_affected: string | null;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  resolution_notes: string | null;
}

export interface SystemUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  division: string;
  status: 'active' | 'inactive' | 'suspended';
  last_login: string | null;
  created_at: string;
}

// ============================================================
// EXECUTIVE / OVERSIGHT (exec_ prefix)
// ============================================================

export interface ExecDirective {
  id: string;
  directive_number: string;
  title: string;
  description: string;
  content?: string; // Legacy field
  issued_by: string;
  issued_to_division?: string; // Legacy field
  target_divisions: string[];
  priority: Priority;
  status: 'issued' | 'acknowledged' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  due_date: string | null;
  notes?: string;
  created_at: string;
  updated_at?: string;
  acknowledged_at: string | null;
  completed_at: string | null;
}

export interface ExecAlert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  source_division: string;
  source_submission_id: string | null;
  alert_type: 'sla_breach' | 'high_priority' | 'legal_flag' | 'audit_finding' | 'system_issue' | 'dependency_delay';
  acknowledged: boolean;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  created_at: string;
}

export interface ExecNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'alert' | 'directive' | 'escalation' | 'update' | 'reminder';
  priority: Priority;
  read: boolean;
  action_url: string | null;
  created_at: string;
  read_at: string | null;
}

// ============================================================
// CROSS-DIVISION WORKFLOW TYPES
// ============================================================

export interface InterDivisionRequest {
  id: string;
  request_number: string;
  from_division: string;
  to_division: string;
  request_type: string;
  subject: string;
  description: string | null;
  status: 'pending' | 'acknowledged' | 'in_progress' | 'completed' | 'returned' | 'escalated';
  priority: Priority;
  source_submission_id: string | null;
  requested_by: string;
  assigned_to: string | null;
  created_at: string;
  acknowledged_at: string | null;
  completed_at: string | null;
  due_date: string | null;
  response_notes: string | null;
}

export interface WorkflowStep {
  id: string;
  workflow_id: string;
  step_number: number;
  division: string;
  action: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  assigned_to: string | null;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
}

// ============================================================
// DIVISION STATISTICS TYPES
// ============================================================

export interface DivisionStats {
  division_code: string;
  division_name: string;
  total_submissions: number;
  submissions_processed: number;
  submissions_pending: number;
  submissions_overdue: number;
  avg_response_time_hours: number;
  approval_rate: number;
  rejection_rate: number;
  escalated_count: number;
  backlog_trend: 'increasing' | 'stable' | 'decreasing';
}

export interface CrossDivisionMetrics {
  from_division: string;
  to_division: string;
  requests_sent: number;
  requests_pending: number;
  requests_returned: number;
  avg_response_time_hours: number;
}

export interface SLAMetrics {
  division: string;
  total_submissions: number;
  within_sla: number;
  breached_sla: number;
  sla_compliance_rate: number;
  avg_processing_days: number;
}

// ============================================================
// DIVISION CONFIGURATION
// ============================================================

export const ILMS_DIVISIONS = {
  survey: { code: 'survey', name: 'Surveyor General Division', prefix: 'survey_', color: '#10b981' },
  planning: { code: 'planning', name: 'Physical Planning Division', prefix: 'planning_', color: '#3b82f6' },
  ilg: { code: 'ilg', name: 'Integrated Land Groups', prefix: 'ilg_', color: '#8b5cf6' },
  state: { code: 'state', name: 'State / Alienated Land Division', prefix: 'state_', color: '#f59e0b' },
  titles: { code: 'titles', name: 'Registrar of Titles', prefix: 'titles_', color: '#ef4444' },
  customer: { code: 'customer', name: 'Customer Land Registration', prefix: 'customer_', color: '#ec4899' },
  legal: { code: 'legal', name: 'Legal / Case Management', prefix: 'legal_', color: '#06b6d4' },
  audit: { code: 'audit', name: 'Audit & Compliance', prefix: 'audit_', color: '#14b8a6' },
  corporate: { code: 'corporate', name: 'Corporate Services', prefix: 'corporate_', color: '#6366f1' },
  ict: { code: 'ict', name: 'ICT / Systems Administration', prefix: 'system_', color: '#84cc16' },
} as const;

export type DivisionCode = keyof typeof ILMS_DIVISIONS;

// ============================================================
// AUDIT TRAIL TYPES
// ============================================================

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: 'create' | 'update' | 'delete';
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  performed_by: string;
  performed_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

export interface ExecActionLog {
  id: string;
  action_type: 'view' | 'comment' | 'directive' | 'escalation' | 'approval' | 'rejection';
  target_division: string;
  target_submission_id: string | null;
  performed_by: string;
  details: string | null;
  created_at: string;
}
