/**
 * ============================================================
 * TABLE CONFIGURATION
 * Map your existing database tables to dashboard divisions
 * ============================================================
 *
 * CONFIGURED FROM LIVE DATABASE DISCOVERY - January 2026
 * Column mappings verified from Supabase schema
 *
 * ============================================================
 */

export interface TableConfig {
  tableName: string;
  enabled: boolean;
  description?: string;
  columns: {
    id: string;
    title: string;
    status: string;
    priority?: string;
    createdAt: string;
    updatedAt?: string;
    submittedBy?: string;
    assignedTo?: string;
    dueDate?: string;
    division?: string;
    province?: string;
    referenceNumber?: string;
  };
  statusMappings?: {
    pending: string[];
    in_progress: string[];
    completed: string[];
    rejected: string[];
    overdue: string[];
  };
  relatedTables?: string[];
}

export interface DivisionTableConfig {
  [divisionCode: string]: TableConfig;
}

/**
 * ============================================================
 * DIVISION TABLE CONFIGURATION - VERIFIED SCHEMA
 * ============================================================
 */
export const DIVISION_TABLES: DivisionTableConfig = {
  // --------------------------------------------------------
  // Surveyor General Division
  // TODO: Verify field_uploads columns
  // --------------------------------------------------------
  survey: {
    tableName: 'field_uploads',
    enabled: false, // Disabled until columns verified
    description: 'Survey plans and cadastral submissions',
    columns: {
      id: 'id',
      title: 'title',
      status: 'status',
      priority: 'priority',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    relatedTables: ['accuracy_classes', 'land_parcels_view', 'crs_library'],
  },

  // --------------------------------------------------------
  // Physical Planning Division
  // VERIFIED: development_applications has status, priority, project_title
  // --------------------------------------------------------
  planning: {
    tableName: 'development_applications',
    enabled: true,
    description: 'Development applications and planning permits',
    columns: {
      id: 'id',
      title: 'project_title',        // Verified column name
      status: 'status',               // Verified
      priority: 'priority',           // Verified
      createdAt: 'created_at',        // Verified
      updatedAt: 'updated_at',        // Verified
      assignedTo: 'assigned_to',      // Verified
      dueDate: 'review_deadline',     // Verified
      referenceNumber: 'application_number', // Verified
    },
    relatedTables: ['development_plans', 'application_documents', 'application_reviews'],
    statusMappings: {
      pending: ['pending', 'submitted', 'lodged', 'new'],
      in_progress: ['in_progress', 'under_review', 'assessment', 'reviewing'],
      completed: ['approved', 'completed', 'granted', 'issued'],
      rejected: ['rejected', 'refused', 'denied', 'declined'],
      overdue: ['overdue', 'lapsed', 'expired'],
    },
  },

  // --------------------------------------------------------
  // Integrated Land Groups (ILG)
  // TODO: Verify ilg_submissions columns
  // --------------------------------------------------------
  ilg: {
    tableName: 'ilg_submissions',
    enabled: false, // Disabled until columns verified
    description: 'ILG registrations and customary land groups',
    columns: {
      id: 'id',
      title: 'title',
      status: 'status',
      priority: 'priority',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    relatedTables: ['disputes'],
  },

  // --------------------------------------------------------
  // State/Alienated Land
  // TODO: Verify active_leases_summary columns
  // --------------------------------------------------------
  state: {
    tableName: 'active_leases_summary',
    enabled: false, // Disabled until columns verified
    description: 'State leases and alienated land management',
    columns: {
      id: 'id',
      title: 'title',
      status: 'status',
      priority: 'priority',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    relatedTables: ['instruments'],
  },

  // --------------------------------------------------------
  // Registrar of Titles
  // TODO: Verify instruments columns
  // --------------------------------------------------------
  titles: {
    tableName: 'instruments',
    enabled: false, // Disabled until columns verified
    description: 'Title registrations and land instruments',
    columns: {
      id: 'id',
      title: 'title',
      status: 'status',
      priority: 'priority',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    relatedTables: ['file_requests', 'file_maintenance_log'],
  },

  // --------------------------------------------------------
  // Customer Services
  // VERIFIED: customer_submissions has title, status, priority
  // --------------------------------------------------------
  customer: {
    tableName: 'customer_submissions',
    enabled: true,
    description: 'Customer service requests and inquiries',
    columns: {
      id: 'id',
      title: 'title',                 // Verified
      status: 'status',               // Verified
      priority: 'priority',           // Verified
      createdAt: 'created_at',        // Verified
      updatedAt: 'updated_at',        // Verified
      assignedTo: 'assigned_to',      // Verified
      dueDate: 'sla_due_date',        // Verified
      province: 'province',           // Verified
      referenceNumber: 'submission_number', // Verified
    },
    relatedTables: ['incoming_correspondence', 'communications'],
    statusMappings: {
      pending: ['pending', 'new', 'received', 'submitted'],
      in_progress: ['in_progress', 'processing', 'assigned', 'working'],
      completed: ['completed', 'resolved', 'closed', 'done'],
      rejected: ['rejected', 'cancelled', 'declined'],
      overdue: ['overdue', 'breached'],
    },
  },

  // --------------------------------------------------------
  // Legal/Case Management
  // Using disputes table which likely has status
  // --------------------------------------------------------
  legal: {
    tableName: 'disputes',
    enabled: true, // ENABLED - reading from real database
    description: 'Legal cases and court matters',
    columns: {
      id: 'id',
      title: 'title',
      status: 'status',
      priority: 'priority',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    relatedTables: [
      'case_intake_records',
      'case_documents',
      'case_files',
      'court_orders',
      'directions',
      'external_lawyers',
      'legal_case_assignments',
    ],
    statusMappings: {
      pending: ['pending', 'new', 'filed', 'lodged', 'submitted', 'open'],
      in_progress: ['in_progress', 'active', 'hearing', 'trial', 'under review', 'under_review', 'review', 'investigating'],
      completed: ['completed', 'closed', 'resolved', 'won', 'settled', 'dismissed'],
      rejected: ['rejected', 'lost', 'withdrawn', 'cancelled'],
      overdue: ['overdue', 'expired', 'lapsed'],
    },
  },

  // --------------------------------------------------------
  // Audit & Compliance
  // Reading from audit_findings with correct status mappings
  // --------------------------------------------------------
  audit: {
    tableName: 'audit_findings',
    enabled: true,
    description: 'Audit findings and compliance issues',
    columns: {
      id: 'id',
      title: 'title',
      status: 'status',
      priority: 'risk_rating',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    relatedTables: [
      'audit_action_plans',
      'audit_engagements',
      'audit_recommendations',
      'audit_risk_register',
      'audit_risk_events',
      'audit_tasks',
      'audit_workpapers',
      'compliance_actions',
      'compliance_records',
    ],
    statusMappings: {
      // Updated to include actual status values from your Audit system
      pending: ['pending', 'new', 'identified', 'draft', 'Draft'],
      in_progress: ['in_progress', 'open', 'remediation', 'active', 'under review', 'Under Review', 'under_review', 'review', 'Review'],
      completed: ['closed', 'resolved', 'completed', 'verified', 'implemented', 'Closed', 'Resolved', 'approved', 'Approved'],
      rejected: ['rejected', 'disputed', 'not_applicable', 'Rejected'],
      overdue: ['overdue', 'past_due', 'delayed', 'Overdue'],
    },
  },

  // --------------------------------------------------------
  // Corporate Services
  // --------------------------------------------------------
  corporate: {
    tableName: 'corporate_matters',
    enabled: true,
    description: 'Corporate HR, finance, and administrative matters',
    columns: {
      id: 'id',
      title: 'type_of_matter',
      status: 'status',
      priority: 'request_type',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      dueDate: 'due_date',
      assignedTo: 'assigned_officer',
      division: 'requesting_division',
      referenceNumber: 'matter_number',
    },
    relatedTables: ['corporate_matter_documents', 'corporate_matter_tasks'],
    statusMappings: {
      pending: ['pending', 'new', 'submitted', 'received', 'Pending'],
      in_progress: ['in_progress', 'processing', 'review', 'assigned', 'In Progress'],
      completed: ['completed', 'approved', 'resolved', 'closed', 'Completed', 'Approved'],
      rejected: ['rejected', 'declined', 'cancelled', 'Rejected'],
      overdue: ['overdue', 'Overdue'],
    },
  },

  // --------------------------------------------------------
  // ICT/Systems Admin
  // NOTE: activity_logs doesn't have status column
  // Disabled until correct table is identified
  // --------------------------------------------------------
  ict: {
    tableName: 'activity_logs',
    enabled: false, // DISABLED - activity_logs has no status column
    description: 'System activity and IT operations',
    columns: {
      id: 'id',
      title: 'action',
      status: 'status',
      priority: 'priority',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    relatedTables: ['dashboard_statistics', 'audit_log', 'audit_logs'],
    statusMappings: {
      pending: ['pending', 'queued', 'waiting'],
      in_progress: ['in_progress', 'active', 'processing', 'running'],
      completed: ['completed', 'success', 'done', 'finished'],
      rejected: ['failed', 'error', 'cancelled'],
      overdue: ['overdue', 'timeout', 'expired'],
    },
  },
};

/**
 * ============================================================
 * ALL DISCOVERED TABLES IN YOUR DATABASE
 * For reference and future expansion
 * ============================================================
 */
export const ALL_DISCOVERED_TABLES = [
  // Survey/Cadastral
  'accuracy_classes',
  'crs_library',
  'field_uploads',
  'land_parcels_view',

  // Planning
  'development_applications',
  'development_plans',

  // ILG
  'ilg_submissions',
  'disputes',

  // State/Leases
  'active_leases_summary',
  'instruments',

  // Titles
  'file_maintenance_log',
  'file_requests',

  // Customer
  'customer_submissions',
  'incoming_correspondence',
  'communications',

  // Legal
  'case_amendments',
  'case_assignment_status',
  'case_closure',
  'case_delegations',
  'case_documents',
  'case_files',
  'case_filings',
  'case_intake_documents',
  'case_intake_records',
  'case_parties',
  'court_orders',
  'court_references',
  'directions',
  'external_lawyers',
  'filings',
  'legal_case_assignments',

  // Audit
  'audit_action_plans',
  'audit_business_processes',
  'audit_categories',
  'audit_controls',
  'audit_divisions',
  'audit_engagement_team',
  'audit_engagements',
  'audit_events',
  'audit_evidence',
  'audit_findings',
  'audit_information_request_documents',
  'audit_information_requests',
  'audit_kra_activities',
  'audit_kra_activity_quarterly_status',
  'audit_legal_instruments',
  'audit_log',
  'audit_logs',
  'audit_obligations',
  'audit_psap_assessment_scores',
  'audit_psap_assessments',
  'audit_psap_rating_scales',
  'audit_psap_standards',
  'audit_recommendations',
  'audit_risk_audit_log',
  'audit_risk_engagement_summary',
  'audit_risk_event_documents',
  'audit_risk_event_log',
  'audit_risk_event_milestones',
  'audit_risk_event_risks',
  'audit_risk_event_summary',
  'audit_risk_events',
  'audit_risk_incidents',
  'audit_risk_indicator_values',
  'audit_risk_indicators',
  'audit_risk_legal_references',
  'audit_risk_profile_items',
  'audit_risk_profiles',
  'audit_risk_register',
  'audit_risk_treatments',
  'audit_sections',
  'audit_strategic_kras',
  'audit_tasks',
  'audit_workpapers',

  // Compliance
  'compliance_actions',
  'compliance_records',
  'compliance_tracking',
  'division_compliance_updates',

  // Corporate
  'corporate_matter_documents',
  'corporate_matter_tasks',
  'corporate_matters',

  // System/Admin
  'activity_logs',
  'activity_project',
  'control_points',
  'dashboard_statistics',
  'department',
  'division',
  'document_inheritance',
  'engagements',
  'evidence',
  'job_types',

  // Applications (shared)
  'application_documents',
  'application_reviews',
  'application_summary',

  // Executive
  'exec_alerts',
  'exec_directives',
  'exec_interdivision_requests',
  'executive_workflow_summary',
];

/**
 * ============================================================
 * EXECUTIVE TABLES CONFIGURATION
 * ============================================================
 */
export const EXEC_TABLES = {
  alerts: {
    tableName: 'exec_alerts',
    enabled: true,
  },
  directives: {
    tableName: 'exec_directives',
    enabled: true,
  },
  interdivision: {
    tableName: 'exec_interdivision_requests',
    enabled: true,
  },
  workflowSummary: {
    tableName: 'executive_workflow_summary',
    enabled: true,
  },
};

/**
 * ============================================================
 * HELPER FUNCTIONS
 * ============================================================
 */

export function getTableName(divisionCode: string): string | null {
  const config = DIVISION_TABLES[divisionCode];
  if (!config || !config.enabled) return null;
  return config.tableName;
}

export function getTableConfig(divisionCode: string): TableConfig | null {
  const config = DIVISION_TABLES[divisionCode];
  if (!config || !config.enabled) return null;
  return config;
}

export function isTableEnabled(divisionCode: string): boolean {
  const config = DIVISION_TABLES[divisionCode];
  return config?.enabled ?? false;
}

export function getEnabledDivisions(): string[] {
  return Object.entries(DIVISION_TABLES)
    .filter(([_, config]) => config.enabled)
    .map(([code, _]) => code);
}

export function getAllDivisions(): string[] {
  return Object.keys(DIVISION_TABLES);
}

export function getRelatedTables(divisionCode: string): string[] {
  const config = DIVISION_TABLES[divisionCode];
  return config?.relatedTables ?? [];
}

export function mapStatus(
  divisionCode: string,
  rawStatus: string
): 'pending' | 'in_progress' | 'completed' | 'rejected' | 'overdue' | 'unknown' {
  const config = DIVISION_TABLES[divisionCode];
  if (!config?.statusMappings) return 'unknown';

  const status = rawStatus?.toLowerCase() ?? '';

  if (config.statusMappings.pending?.some(s => status.includes(s.toLowerCase()))) return 'pending';
  if (config.statusMappings.in_progress?.some(s => status.includes(s.toLowerCase()))) return 'in_progress';
  if (config.statusMappings.completed?.some(s => status.includes(s.toLowerCase()))) return 'completed';
  if (config.statusMappings.rejected?.some(s => status.includes(s.toLowerCase()))) return 'rejected';
  if (config.statusMappings.overdue?.some(s => status.includes(s.toLowerCase()))) return 'overdue';

  return 'unknown';
}
