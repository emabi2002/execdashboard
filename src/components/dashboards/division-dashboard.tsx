"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LayoutDashboard,
  Scale,
  Search,
  Building2,
  Database,
  Briefcase,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  FileText,
  Loader2,
  TrendingUp,
  Target,
  Compass,
  Landmark,
  Home,
  RefreshCw,
  Layers,
  Filter,
  ArrowUpDown,
  Eye,
  ChevronLeft,
  ChevronRight,
  XCircle,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getDivisionStats } from "@/lib/ilms-service";
import { subscribeToDivision } from "@/lib/realtime-service";
import type { DivisionStats } from "@/lib/ilms-types";
import type { DivisionTable } from "@/lib/realtime-service";

// Division configuration
const DIVISION_CONFIG = {
  survey: {
    name: 'Surveyor General',
    table: 'survey_submissions' as DivisionTable,
    icon: Compass,
    color: '#10b981',
    fields: ['submission_number', 'title', 'applicant_name', 'survey_type', 'province', 'status', 'priority', 'submitted_at'],
  },
  planning: {
    name: 'Physical Planning',
    table: 'planning_submissions' as DivisionTable,
    icon: Building2,
    color: '#3b82f6',
    fields: ['submission_number', 'title', 'applicant_name', 'application_type', 'province', 'status', 'priority', 'submitted_at'],
  },
  ilg: {
    name: 'Integrated Land Groups',
    table: 'ilg_submissions' as DivisionTable,
    icon: Users,
    color: '#8b5cf6',
    fields: ['submission_number', 'title', 'group_name', 'registration_type', 'province', 'status', 'priority', 'submitted_at'],
  },
  state: {
    name: 'State/Alienated Land',
    table: 'state_submissions' as DivisionTable,
    icon: Landmark,
    color: '#f59e0b',
    fields: ['submission_number', 'title', 'applicant_name', 'lease_type', 'province', 'status', 'priority', 'submitted_at'],
  },
  titles: {
    name: 'Registrar of Titles',
    table: 'titles_submissions' as DivisionTable,
    icon: FileText,
    color: '#ef4444',
    fields: ['submission_number', 'title', 'applicant_name', 'registration_type', 'province', 'status', 'priority', 'submitted_at'],
  },
  customer: {
    name: 'Customer Services',
    table: 'customer_submissions' as DivisionTable,
    icon: Home,
    color: '#ec4899',
    fields: ['submission_number', 'title', 'customer_name', 'service_type', 'province', 'status', 'priority', 'submitted_at'],
  },
  legal: {
    name: 'Legal/Case Management',
    table: 'legal_cases' as DivisionTable,
    icon: Scale,
    color: '#06b6d4',
    fields: ['case_number', 'title', 'case_type', 'plaintiff', 'defendant', 'status', 'priority', 'filed_at'],
  },
  audit: {
    name: 'Audit & Compliance',
    table: 'audit_findings' as DivisionTable,
    icon: Search,
    color: '#14b8a6',
    fields: ['finding_number', 'title', 'finding_type', 'target_division', 'risk_level', 'status', 'identified_at'],
  },
  corporate: {
    name: 'Corporate Services',
    table: 'corporate_matters' as DivisionTable,
    icon: Briefcase,
    color: '#6366f1',
    fields: ['matter_number', 'title', 'matter_type', 'department', 'category', 'status', 'priority', 'submitted_at'],
  },
  ict: {
    name: 'ICT/Systems Admin',
    table: 'system_submissions' as DivisionTable,
    icon: Database,
    color: '#84cc16',
    fields: ['ticket_number', 'title', 'request_type', 'system_affected', 'requester_department', 'status', 'priority', 'submitted_at'],
  },
};

type DivisionCode = keyof typeof DIVISION_CONFIG;

interface DivisionDashboardProps {
  divisionCode: DivisionCode;
  section?: string;
}

interface Submission {
  id: string;
  [key: string]: unknown;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  in_progress: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
  overdue: 'bg-red-500/10 text-red-400 border-red-500/30',
  escalated: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
  on_hold: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
  medium: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  high: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  urgent: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  critical: 'bg-red-500/10 text-red-400 border-red-500/30',
};

export function DivisionDashboard({ divisionCode, section = "overview" }: DivisionDashboardProps) {
  const config = DIVISION_CONFIG[divisionCode];
  const Icon = config.icon;

  const [stats, setStats] = useState<DivisionStats | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch division stats
      const divStats = await getDivisionStats(divisionCode);
      setStats(divStats);

      // Fetch submissions from Supabase
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from(config.table)
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (!error && data) {
          setSubmissions(data as Submission[]);
        }
      }

      setLastRefresh(new Date());
    } catch (error) {
      console.error(`Error fetching ${divisionCode} data:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToDivision(config.table, () => {
      fetchData();
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [divisionCode]);

  // Filter submissions
  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch = searchQuery === "" ||
      Object.values(sub).some(val =>
        String(val).toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Paginate
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const paginatedSubmissions = filteredSubmissions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3 text-zinc-400">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: config.color }} />
          <span>Loading {config.name}...</span>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-zinc-800/50 p-6">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" style={{ backgroundColor: `${config.color}10` }} />

        <div className="relative flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl border" style={{ backgroundColor: `${config.color}15`, borderColor: `${config.color}30` }}>
                <Icon className="h-7 w-7" style={{ color: config.color }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-zinc-100">{config.name}</h1>
                <p className="text-sm text-zinc-400">Division Dashboard</p>
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-2">Last refresh: {lastRefresh.toLocaleTimeString()}</p>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-9 bg-zinc-800/50 border-zinc-700/50 text-zinc-300 hover:bg-zinc-700"
            onClick={fetchData}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase">Total</p>
                <p className="text-2xl font-bold text-zinc-100">{stats?.total_submissions || 0}</p>
              </div>
              <Layers className="h-5 w-5 text-zinc-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-500/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-amber-400/80 uppercase">Pending</p>
                <p className="text-2xl font-bold text-zinc-100">{stats?.submissions_pending || 0}</p>
              </div>
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-sky-500/10 border-sky-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-sky-400/80 uppercase">In Progress</p>
                <p className="text-2xl font-bold text-zinc-100">
                  {submissions.filter(s => s.status === 'in_progress').length}
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-sky-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/10 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-emerald-400/80 uppercase">Completed</p>
                <p className="text-2xl font-bold text-zinc-100">{stats?.submissions_processed || 0}</p>
              </div>
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-red-400/80 uppercase">Overdue</p>
                <p className="text-2xl font-bold text-zinc-100">{stats?.submissions_overdue || 0}</p>
              </div>
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-violet-500/10 border-violet-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-violet-400/80 uppercase">Escalated</p>
                <p className="text-2xl font-bold text-zinc-100">{stats?.escalated_count || 0}</p>
              </div>
              <XCircle className="h-5 w-5 text-violet-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Efficiency Card */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-zinc-100 text-sm flex items-center gap-2">
            <Target className="h-4 w-4" style={{ color: config.color }} />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-zinc-800/50 rounded-lg">
              <p className="text-xs text-zinc-500 mb-1">Approval Rate</p>
              <p className="text-xl font-bold" style={{ color: config.color }}>{stats?.approval_rate || 0}%</p>
            </div>
            <div className="p-4 bg-zinc-800/50 rounded-lg">
              <p className="text-xs text-zinc-500 mb-1">Rejection Rate</p>
              <p className="text-xl font-bold text-red-400">{stats?.rejection_rate || 0}%</p>
            </div>
            <div className="p-4 bg-zinc-800/50 rounded-lg">
              <p className="text-xs text-zinc-500 mb-1">Avg Response Time</p>
              <p className="text-xl font-bold text-zinc-100">{Math.round((stats?.avg_response_time_hours || 0) / 24)} days</p>
            </div>
            <div className="p-4 bg-zinc-800/50 rounded-lg">
              <p className="text-xs text-zinc-500 mb-1">SLA Compliance</p>
              <p className="text-xl font-bold text-emerald-400">
                {stats?.total_submissions
                  ? Math.round(((stats.total_submissions - stats.submissions_overdue) / stats.total_submissions) * 100)
                  : 100}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Submissions */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-zinc-100 text-sm">Recent Submissions</CardTitle>
            <Badge variant="outline" className="bg-zinc-800/50 text-zinc-400 border-zinc-700">
              {submissions.length} Total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {submissions.length > 0 ? (
            <div className="space-y-2">
              {submissions.slice(0, 5).map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${config.color}15` }}>
                      <FileText className="h-4 w-4" style={{ color: config.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-100">
                        {String(sub.title || sub.submission_number || sub.case_number || sub.finding_number || sub.matter_number || sub.ticket_number)}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {String(sub.submission_number || sub.case_number || sub.finding_number || sub.matter_number || sub.ticket_number || '')}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={STATUS_COLORS[String(sub.status)] || STATUS_COLORS.pending}>
                    {String(sub.status)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
              <FileText className="h-12 w-12 text-zinc-600 mb-3" />
              <span className="text-sm">No submissions yet</span>
              <span className="text-xs text-zinc-600 mt-1">Submissions will appear here when added</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderSubmissions = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${config.color}15` }}>
            <Icon className="h-6 w-6" style={{ color: config.color }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-zinc-100">{config.name}</h2>
            <p className="text-zinc-400 text-sm">All Submissions</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-9 bg-zinc-800/50 border-zinc-700/50 text-zinc-300 hover:bg-zinc-700"
          onClick={fetchData}
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Search submissions..."
                  className="pl-9 bg-zinc-800/50 border-zinc-700 text-zinc-100"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-40 bg-zinc-800/50 border-zinc-700 text-zinc-100">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-0">
          {paginatedSubmissions.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-zinc-400">Reference</TableHead>
                    <TableHead className="text-zinc-400">Title</TableHead>
                    <TableHead className="text-zinc-400">Type</TableHead>
                    <TableHead className="text-zinc-400">Status</TableHead>
                    <TableHead className="text-zinc-400">Priority</TableHead>
                    <TableHead className="text-zinc-400">Date</TableHead>
                    <TableHead className="text-zinc-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSubmissions.map((sub) => (
                    <TableRow key={sub.id} className="border-zinc-800 hover:bg-zinc-800/50">
                      <TableCell className="text-zinc-100 font-medium">
                        {String(sub.submission_number || sub.case_number || sub.finding_number || sub.matter_number || sub.ticket_number || '-')}
                      </TableCell>
                      <TableCell className="text-zinc-300 max-w-[200px] truncate">
                        {String(sub.title || '-')}
                      </TableCell>
                      <TableCell className="text-zinc-400">
                        {String(sub.survey_type || sub.application_type || sub.registration_type || sub.lease_type || sub.service_type || sub.case_type || sub.finding_type || sub.matter_type || sub.request_type || '-')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={STATUS_COLORS[String(sub.status)] || STATUS_COLORS.pending}>
                          {String(sub.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={PRIORITY_COLORS[String(sub.priority || sub.risk_level)] || PRIORITY_COLORS.medium}>
                          {String(sub.priority || sub.risk_level || '-')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-zinc-400 text-sm">
                        {sub.submitted_at || sub.filed_at || sub.identified_at
                          ? new Date(String(sub.submitted_at || sub.filed_at || sub.identified_at)).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-100">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between p-4 border-t border-zinc-800">
                <p className="text-sm text-zinc-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredSubmissions.length)} of {filteredSubmissions.length}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="bg-zinc-800/50 border-zinc-700"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-zinc-400">
                    Page {currentPage} of {totalPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="bg-zinc-800/50 border-zinc-700"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <FileText className="h-12 w-12 text-zinc-600 mb-3" />
              <span className="text-sm">No submissions found</span>
              <span className="text-xs text-zinc-600 mt-1">
                {searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Data will appear when available'}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Route based on section
  switch (section) {
    case "overview":
      return renderOverview();
    case "submissions":
    case "registrations":
    case "leases":
    case "transactions":
    case "applications":
    case "permits":
    case "zones":
    case "disputes":
    case "cases":
    case "tasks":
    case "documents":
    case "events":
    case "findings":
    case "reports":
    case "matters":
    case "hr":
    case "finance":
    case "requests":
    case "queue":
    case "searches":
    case "plans":
    case "parcels":
      return renderSubmissions();
    default:
      return renderOverview();
  }
}
