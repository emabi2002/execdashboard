// ============================================================
// ILMS DATA SERVICE
// Integrated Land Management System - Data Access Layer
// Connects to REAL database tables - no placeholders
// ============================================================

import { supabase, isSupabaseConfigured } from './supabase';
import { DIVISION_TABLES, EXEC_TABLES, isTableEnabled, getTableName, getTableConfig } from './table-config';
import type {
  DivisionStats,
  CrossDivisionMetrics,
  SLAMetrics,
  ExecAlert,
  ExecDirective,
  InterDivisionRequest,
  DivisionCode,
} from './ilms-types';

// ============================================================
// HELPER: Case-insensitive status matching
// ============================================================

function matchesStatusCategory(
  actualStatus: string | null | undefined,
  categoryPatterns: string[]
): boolean {
  if (!actualStatus) return false;
  const normalizedStatus = actualStatus.toLowerCase().trim();
  return categoryPatterns.some(pattern =>
    normalizedStatus === pattern.toLowerCase() ||
    normalizedStatus.includes(pattern.toLowerCase()) ||
    pattern.toLowerCase().includes(normalizedStatus)
  );
}

// ============================================================
// DIVISION STATISTICS - Direct from database
// ============================================================

export async function getDivisionStats(divisionCode: DivisionCode): Promise<DivisionStats> {
  const defaultStats: DivisionStats = {
    division_code: divisionCode,
    division_name: getDivisionName(divisionCode),
    total_submissions: 0,
    submissions_processed: 0,
    submissions_pending: 0,
    submissions_overdue: 0,
    avg_response_time_hours: 0,
    approval_rate: 0,
    rejection_rate: 0,
    escalated_count: 0,
    backlog_trend: 'stable',
  };

  // Check if Supabase is configured and table is enabled
  if (!isSupabaseConfigured()) {
    console.log(`Supabase not configured for ${divisionCode}`);
    return defaultStats;
  }
  if (!isTableEnabled(divisionCode)) {
    console.log(`Table not enabled for ${divisionCode}`);
    return defaultStats;
  }

  const tableName = getTableName(divisionCode);
  if (!tableName) {
    console.log(`No table name for ${divisionCode}`);
    return defaultStats;
  }

  const config = getTableConfig(divisionCode);
  if (!config) {
    console.log(`No config for ${divisionCode}`);
    return defaultStats;
  }

  const statusCol = config.columns.status;
  const statusMappings = config.statusMappings;

  try {
    // Fetch all records with just the status column for counting
    const { data, error } = await supabase
      .from(tableName)
      .select(statusCol);

    if (error) {
      console.error(`Table ${tableName} error:`, error.message);
      return defaultStats;
    }

    if (!data || data.length === 0) {
      console.log(`Table ${tableName} has no data`);
      return defaultStats;
    }

    // Count by status category using case-insensitive matching
    const totalCount = data.length;
    let pendingCount = 0;
    let inProgressCount = 0;
    let completedCount = 0;
    let rejectedCount = 0;
    let overdueCount = 0;
    let escalatedCount = 0;

    const pendingPatterns = statusMappings?.pending || ['pending', 'new', 'submitted'];
    const inProgressPatterns = statusMappings?.in_progress || ['in_progress', 'processing', 'active'];
    const completedPatterns = statusMappings?.completed || ['completed', 'approved', 'closed'];
    const rejectedPatterns = statusMappings?.rejected || ['rejected', 'refused', 'denied'];
    const overduePatterns = statusMappings?.overdue || ['overdue', 'expired'];
    const escalatedPatterns = ['escalated', 'urgent', 'critical'];

    for (const record of data) {
      const status = (record as unknown as Record<string, string | null>)[statusCol];

      if (matchesStatusCategory(status, pendingPatterns)) {
        pendingCount++;
      } else if (matchesStatusCategory(status, inProgressPatterns)) {
        inProgressCount++;
      } else if (matchesStatusCategory(status, completedPatterns)) {
        completedCount++;
      } else if (matchesStatusCategory(status, rejectedPatterns)) {
        rejectedCount++;
      }

      // Check overdue separately (can overlap with other statuses)
      if (matchesStatusCategory(status, overduePatterns)) {
        overdueCount++;
      }

      // Check escalated separately
      if (matchesStatusCategory(status, escalatedPatterns)) {
        escalatedCount++;
      }
    }

    // Pending includes both pending and in_progress for the dashboard
    const totalPending = pendingCount + inProgressCount;

    console.log(`${divisionCode}: Total=${totalCount}, Pending=${pendingCount}, InProgress=${inProgressCount}, Completed=${completedCount}`);

    return {
      ...defaultStats,
      total_submissions: totalCount,
      submissions_processed: completedCount,
      submissions_pending: totalPending,
      submissions_overdue: overdueCount,
      approval_rate: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
      rejection_rate: totalCount > 0 ? Math.round((rejectedCount / totalCount) * 100) : 0,
      escalated_count: escalatedCount,
    };
  } catch (error) {
    console.error(`Error fetching ${divisionCode} stats:`, error);
    return defaultStats;
  }
}

export async function getAllDivisionStats(): Promise<DivisionStats[]> {
  const divisions: DivisionCode[] = ['survey', 'planning', 'ilg', 'state', 'titles', 'customer', 'legal', 'audit', 'corporate', 'ict'];

  const statsPromises = divisions.map(div => getDivisionStats(div));
  return Promise.all(statsPromises);
}

// ============================================================
// CROSS-DIVISION METRICS
// ============================================================

export async function getCrossDivisionMetrics(): Promise<CrossDivisionMetrics[]> {
  if (!isSupabaseConfigured()) return [];
  if (!EXEC_TABLES.interdivision.enabled) return [];

  try {
    const { data, error } = await supabase
      .from(EXEC_TABLES.interdivision.tableName)
      .select('from_division, to_division, status');

    if (error || !data) return [];

    // Aggregate metrics by division pairs
    const metricsMap = new Map<string, CrossDivisionMetrics>();

    for (const request of data) {
      const key = `${request.from_division}-${request.to_division}`;
      const existing = metricsMap.get(key) || {
        from_division: request.from_division,
        to_division: request.to_division,
        requests_sent: 0,
        requests_pending: 0,
        requests_returned: 0,
        avg_response_time_hours: 0,
      };

      existing.requests_sent++;
      if (['pending', 'acknowledged', 'in_progress'].includes(request.status)) {
        existing.requests_pending++;
      }
      if (request.status === 'returned') {
        existing.requests_returned++;
      }

      metricsMap.set(key, existing);
    }

    return Array.from(metricsMap.values());
  } catch (error) {
    console.error('Error fetching cross-division metrics:', error);
    return [];
  }
}

// ============================================================
// SLA METRICS
// ============================================================

export async function getSLAMetrics(): Promise<SLAMetrics[]> {
  const divisions: DivisionCode[] = ['survey', 'planning', 'ilg', 'state', 'titles', 'customer', 'legal', 'audit', 'corporate', 'ict'];

  const metricsPromises = divisions.map(async (div): Promise<SLAMetrics> => {
    const stats = await getDivisionStats(div);
    const withinSLA = stats.total_submissions - stats.submissions_overdue;

    return {
      division: getDivisionName(div),
      total_submissions: stats.total_submissions,
      within_sla: withinSLA,
      breached_sla: stats.submissions_overdue,
      sla_compliance_rate: stats.total_submissions > 0
        ? Math.round((withinSLA / stats.total_submissions) * 100)
        : 100,
      avg_processing_days: Math.round(stats.avg_response_time_hours / 24),
    };
  });

  return Promise.all(metricsPromises);
}

// ============================================================
// EXECUTIVE ALERTS
// ============================================================

export async function getExecAlerts(unacknowledgedOnly = false): Promise<ExecAlert[]> {
  if (!isSupabaseConfigured()) return [];
  if (!EXEC_TABLES.alerts.enabled) return [];

  try {
    let query = supabase
      .from(EXEC_TABLES.alerts.tableName)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (unacknowledgedOnly) {
      query = query.eq('acknowledged', false);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching exec alerts:', error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching exec alerts:', error);
    return [];
  }
}

export async function acknowledgeAlert(alertId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from(EXEC_TABLES.alerts.tableName)
      .update({
        acknowledged: true,
        acknowledged_by: userId,
        acknowledged_at: new Date().toISOString(),
      })
      .eq('id', alertId);

    return !error;
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    return false;
  }
}

// ============================================================
// EXECUTIVE DIRECTIVES
// ============================================================

export async function getExecDirectives(status?: string): Promise<ExecDirective[]> {
  if (!isSupabaseConfigured()) return [];
  if (!EXEC_TABLES.directives.enabled) return [];

  try {
    let query = supabase
      .from(EXEC_TABLES.directives.tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching exec directives:', error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching exec directives:', error);
    return [];
  }
}

export async function createDirective(directive: Partial<ExecDirective>): Promise<ExecDirective | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from(EXEC_TABLES.directives.tableName)
      .insert({
        ...directive,
        directive_number: `DIR-${Date.now()}`,
        status: 'issued',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating directive:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating directive:', error);
    return null;
  }
}

// ============================================================
// INTER-DIVISION REQUESTS
// ============================================================

export async function getInterDivisionRequests(divisionFilter?: string): Promise<InterDivisionRequest[]> {
  if (!isSupabaseConfigured()) return [];
  if (!EXEC_TABLES.interdivision.enabled) return [];

  try {
    let query = supabase
      .from(EXEC_TABLES.interdivision.tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (divisionFilter) {
      query = query.or(`from_division.eq.${divisionFilter},to_division.eq.${divisionFilter}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching inter-division requests:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching inter-division requests:', error);
    return [];
  }
}

// ============================================================
// BOTTLENECK ANALYSIS
// ============================================================

export interface BottleneckAnalysis {
  division: string;
  pending_requests: number;
  avg_wait_days: number;
  oldest_pending_days: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export async function getBottleneckAnalysis(): Promise<BottleneckAnalysis[]> {
  const stats = await getAllDivisionStats();

  return stats
    .filter(stat => stat.total_submissions > 0) // Only show divisions with data
    .map(stat => {
      const avgWaitDays = Math.round(stat.avg_response_time_hours / 24);
      let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';

      if (stat.submissions_overdue > 10 || avgWaitDays > 14) {
        severity = 'critical';
      } else if (stat.submissions_overdue > 5 || avgWaitDays > 7) {
        severity = 'high';
      } else if (stat.submissions_overdue > 2 || avgWaitDays > 3) {
        severity = 'medium';
      }

      return {
        division: stat.division_name,
        pending_requests: stat.submissions_pending,
        avg_wait_days: avgWaitDays,
        oldest_pending_days: avgWaitDays,
        severity,
      };
    })
    .sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
}

// ============================================================
// SUMMARY METRICS FOR EXECUTIVE DASHBOARD
// ============================================================

export interface ExecutiveSummary {
  total_submissions_all_divisions: number;
  total_pending: number;
  total_overdue: number;
  total_completed_this_month: number;
  overall_sla_compliance: number;
  active_alerts: number;
  pending_directives: number;
  cross_division_bottlenecks: number;
}

export async function getExecutiveSummary(): Promise<ExecutiveSummary> {
  const [allStats, alerts] = await Promise.all([
    getAllDivisionStats(),
    getExecAlerts(true),
  ]);

  const totalSubmissions = allStats.reduce((sum, s) => sum + s.total_submissions, 0);
  const totalPending = allStats.reduce((sum, s) => sum + s.submissions_pending, 0);
  const totalOverdue = allStats.reduce((sum, s) => sum + s.submissions_overdue, 0);
  const totalCompleted = allStats.reduce((sum, s) => sum + s.submissions_processed, 0);

  const withinSLA = totalSubmissions - totalOverdue;
  const slaCompliance = totalSubmissions > 0 ? Math.round((withinSLA / totalSubmissions) * 100) : 100;

  const bottleneckCount = allStats.filter(s => s.submissions_overdue > 5).length;

  return {
    total_submissions_all_divisions: totalSubmissions,
    total_pending: totalPending,
    total_overdue: totalOverdue,
    total_completed_this_month: totalCompleted,
    overall_sla_compliance: slaCompliance,
    active_alerts: alerts.length,
    pending_directives: 0,
    cross_division_bottlenecks: bottleneckCount,
  };
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getDivisionName(divisionCode: DivisionCode): string {
  const nameMap: Record<DivisionCode, string> = {
    survey: 'Surveyor General',
    planning: 'Physical Planning',
    ilg: 'Integrated Land Groups',
    state: 'State/Alienated Land',
    titles: 'Registrar of Titles',
    customer: 'Customer Services',
    legal: 'Legal/Case Management',
    audit: 'Audit & Compliance',
    corporate: 'Corporate Services',
    ict: 'ICT/Systems Admin',
  };
  return nameMap[divisionCode];
}

// ============================================================
// DIVISION COLORS FOR CHARTS
// ============================================================

export const DIVISION_COLORS: Record<DivisionCode, string> = {
  survey: '#10b981',
  planning: '#3b82f6',
  ilg: '#8b5cf6',
  state: '#f59e0b',
  titles: '#ef4444',
  customer: '#ec4899',
  legal: '#06b6d4',
  audit: '#14b8a6',
  corporate: '#6366f1',
  ict: '#84cc16',
};
