"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MetricCard } from "@/components/charts/metric-card";
import { DonutChart } from "@/components/charts/donut-chart";
import { AreaChart } from "@/components/charts/area-chart";
import { BarChartComponent } from "@/components/charts/bar-chart";
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
  TrendingDown,
  Target,
  BarChart3,
  ChevronRight,
  Compass,
  Landmark,
  Home,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Bell,
  Send,
  Eye,
  RefreshCw,
  Layers,
  Network,
  MapPin,
  Timer,
  CheckSquare,
  XCircle,
} from "lucide-react";
import {
  getSystemStats,
  getLegalCasesCount,
  getAuditFindingsCount,
  getCorporateMattersCount,
  getCaseTrends,
} from "@/lib/lands-data-service";
import {
  getAllDivisionStats,
  getExecAlerts,
  getExecutiveSummary,
  getBottleneckAnalysis,
  getSLAMetrics,
  DIVISION_COLORS,
  getExecDirectives,
} from "@/lib/ilms-service";
import { subscribeToExecutiveDashboard, unsubscribeAll } from "@/lib/realtime-service";
import { DirectiveForm } from "@/components/forms/directive-form";
import type { DivisionStats, ExecAlert, SLAMetrics, ExecDirective } from "@/lib/ilms-types";
import type { BottleneckAnalysis, ExecutiveSummary } from "@/lib/ilms-service";
import type { SystemStats } from "@/lib/types";
import { emptyStats } from "@/lib/mock-data";

interface ExecutiveDashboardProps {
  section?: string;
}

// Division configuration with icons and colors
const DIVISIONS = [
  { code: 'survey', name: 'Surveyor General', icon: Compass, color: '#10b981' },
  { code: 'planning', name: 'Physical Planning', icon: Building2, color: '#3b82f6' },
  { code: 'ilg', name: 'Integrated Land Groups', icon: Users, color: '#8b5cf6' },
  { code: 'state', name: 'State/Alienated Land', icon: Landmark, color: '#f59e0b' },
  { code: 'titles', name: 'Registrar of Titles', icon: FileText, color: '#ef4444' },
  { code: 'customer', name: 'Customer Services', icon: Home, color: '#ec4899' },
  { code: 'legal', name: 'Legal/Case Management', icon: Scale, color: '#06b6d4' },
  { code: 'audit', name: 'Audit & Compliance', icon: Search, color: '#14b8a6' },
  { code: 'corporate', name: 'Corporate Services', icon: Briefcase, color: '#6366f1' },
  { code: 'ict', name: 'ICT/Systems Admin', icon: Database, color: '#84cc16' },
];

export function ExecutiveDashboard({ section = "overview" }: ExecutiveDashboardProps) {
  const [stats, setStats] = useState<SystemStats>(emptyStats);
  const [divisionStats, setDivisionStats] = useState<DivisionStats[]>([]);
  const [execSummary, setExecSummary] = useState<ExecutiveSummary | null>(null);
  const [execAlerts, setExecAlerts] = useState<ExecAlert[]>([]);
  const [execDirectives, setExecDirectives] = useState<ExecDirective[]>([]);
  const [slaMetrics, setSlaMetrics] = useState<SLAMetrics[]>([]);
  const [bottlenecks, setBottlenecks] = useState<BottleneckAnalysis[]>([]);
  const [caseTrends, setCaseTrends] = useState<{ date: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isConnected, setIsConnected] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [
        statsData,
        trends,
        allDivStats,
        summary,
        alerts,
        directives,
        sla,
        bottleneckData,
      ] = await Promise.all([
        getSystemStats(),
        getCaseTrends(30),
        getAllDivisionStats(),
        getExecutiveSummary(),
        getExecAlerts(true),
        getExecDirectives(),
        getSLAMetrics(),
        getBottleneckAnalysis(),
      ]);

      setStats(statsData);
      setCaseTrends(trends);
      setDivisionStats(allDivStats);
      setExecSummary(summary);
      setExecAlerts(alerts);
      setExecDirectives(directives);
      setSlaMetrics(sla);
      setBottlenecks(bottleneckData);
      setLastRefresh(new Date());

      // Check if we have actual data from the database
      const hasData = allDivStats.some(d => d.total_submissions > 0) || alerts.length > 0;
      setIsConnected(hasData);
    } catch (error) {
      console.error('Error fetching executive dashboard data:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up auto-refresh interval
    const interval = setInterval(fetchData, 2 * 60 * 1000);

    // Subscribe to real-time updates
    const unsubscribe = subscribeToExecutiveDashboard({
      onAlert: () => fetchData(),
      onDirective: () => fetchData(),
      onDivisionChange: () => fetchData(),
    });

    return () => {
      clearInterval(interval);
      if (unsubscribe) unsubscribe();
      unsubscribeAll();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3 text-zinc-400">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <span>Loading Executive Command Center...</span>
        </div>
      </div>
    );
  }

  // Render Command Center (Overview)
  const renderCommandCenter = () => {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-PG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Calculate totals from live database data
    const totalSubmissions = divisionStats.reduce((sum, d) => sum + d.total_submissions, 0);
    const totalPending = divisionStats.reduce((sum, d) => sum + d.submissions_pending, 0);
    const totalOverdue = divisionStats.reduce((sum, d) => sum + d.submissions_overdue, 0);
    const totalProcessed = divisionStats.reduce((sum, d) => sum + d.submissions_processed, 0);
    const overallSLA = totalSubmissions > 0
      ? Math.round(((totalSubmissions - totalOverdue) / totalSubmissions) * 100)
      : 100;

    return (
      <div className="space-y-6">
        {/* Executive Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-zinc-800/50 p-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <LayoutDashboard className="h-7 w-7 text-amber-500" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-zinc-100">Executive Command Center</h1>
                  <p className="text-sm text-zinc-400">Integrated Land Management System - Papua New Guinea</p>
                </div>
              </div>
              <p className="text-xs text-zinc-500 mt-2">{formattedDate} | Last refresh: {lastRefresh.toLocaleTimeString()}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                <div className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className="text-xs text-zinc-300">{isConnected ? 'Live Data Connected' : 'Awaiting Data'}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                <Timer className="h-3.5 w-3.5 text-zinc-400" />
                <span className="text-xs text-zinc-300">Auto-refresh: 2min</span>
              </div>
              {execAlerts.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 rounded-lg border border-red-500/30">
                  <Bell className="h-3.5 w-3.5 text-red-500" />
                  <span className="text-xs text-red-400">{execAlerts.length} Active Alerts</span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="h-9 bg-zinc-800/50 border-zinc-700/50 text-zinc-300 hover:bg-zinc-700"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Executive KPIs - All from live database */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card className="bg-gradient-to-br from-zinc-900 to-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Total Submissions</p>
                  <p className="text-2xl font-bold text-zinc-100 mt-1">{totalSubmissions.toLocaleString()}</p>
                  <p className="text-[10px] text-zinc-500 mt-1">Across all divisions</p>
                </div>
                <div className="p-2 bg-zinc-800/50 rounded-lg">
                  <Layers className="h-4 w-4 text-zinc-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20 hover:border-amber-500/40 transition-all">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-medium text-amber-400/80 uppercase tracking-wider">Pending Action</p>
                  <p className="text-2xl font-bold text-zinc-100 mt-1">{totalPending.toLocaleString()}</p>
                  <p className="text-[10px] text-amber-400/60 mt-1">Awaiting processing</p>
                </div>
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <Clock className="h-4 w-4 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20 hover:border-red-500/40 transition-all">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-medium text-red-400/80 uppercase tracking-wider">SLA Breaches</p>
                  <p className="text-2xl font-bold text-zinc-100 mt-1">{totalOverdue}</p>
                  <p className="text-[10px] text-red-400/60 mt-1">Requires attention</p>
                </div>
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 hover:border-emerald-500/40 transition-all">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-medium text-emerald-400/80 uppercase tracking-wider">Completed</p>
                  <p className="text-2xl font-bold text-zinc-100 mt-1">{totalProcessed.toLocaleString()}</p>
                  <p className="text-[10px] text-emerald-400/60 mt-1">Successfully processed</p>
                </div>
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-sky-500/10 to-sky-600/5 border-sky-500/20 hover:border-sky-500/40 transition-all">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-medium text-sky-400/80 uppercase tracking-wider">SLA Compliance</p>
                  <p className="text-2xl font-bold text-zinc-100 mt-1">{overallSLA}%</p>
                  <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2">
                    <div
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${overallSLA}%`,
                        backgroundColor: overallSLA >= 90 ? '#10b981' : overallSLA >= 70 ? '#f59e0b' : '#ef4444'
                      }}
                    />
                  </div>
                </div>
                <div className="p-2 bg-sky-500/20 rounded-lg">
                  <Target className="h-4 w-4 text-sky-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-violet-500/10 to-violet-600/5 border-violet-500/20 hover:border-violet-500/40 transition-all">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-medium text-violet-400/80 uppercase tracking-wider">Active Alerts</p>
                  <p className="text-2xl font-bold text-zinc-100 mt-1">{execAlerts.length}</p>
                  <p className="text-[10px] text-violet-400/60 mt-1">Unacknowledged</p>
                </div>
                <div className="p-2 bg-violet-500/20 rounded-lg">
                  <Bell className="h-4 w-4 text-violet-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Division Performance Grid - Live database data */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
              <Layers className="h-5 w-5 text-amber-500" />
              Division Performance Overview
            </h2>
            <Badge variant="outline" className="bg-zinc-800/50 text-zinc-400 border-zinc-700">
              {DIVISIONS.length} Divisions
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {DIVISIONS.map((div) => {
              const stats = divisionStats.find(d => d.division_code === div.code) || {
                total_submissions: 0,
                submissions_pending: 0,
                submissions_overdue: 0,
                submissions_processed: 0,
                approval_rate: 0,
              };
              const Icon = div.icon;
              const hasIssues = stats.submissions_overdue > 0;

              return (
                <Card
                  key={div.code}
                  className={`bg-zinc-900/50 border-zinc-800/50 hover:bg-zinc-900/70 transition-all cursor-pointer ${
                    hasIssues ? 'border-l-2' : ''
                  }`}
                  style={{ borderLeftColor: hasIssues ? '#ef4444' : undefined }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${div.color}20` }}>
                        <Icon className="h-4 w-4" style={{ color: div.color }} />
                      </div>
                      <span className="text-xs font-medium text-zinc-300 truncate">{div.name}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500">Total</span>
                        <span className="text-zinc-100 font-medium">{stats.total_submissions}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500">Pending</span>
                        <span className="text-amber-400">{stats.submissions_pending}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500">Overdue</span>
                        <span className={stats.submissions_overdue > 0 ? 'text-red-400 font-medium' : 'text-zinc-400'}>
                          {stats.submissions_overdue}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-zinc-800">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-zinc-500">Efficiency</span>
                          <Badge
                            variant="outline"
                            className="text-[10px]"
                            style={{
                              backgroundColor: `${div.color}15`,
                              color: div.color,
                              borderColor: `${div.color}40`
                            }}
                          >
                            {stats.approval_rate}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Alerts & Bottlenecks Row - Live database data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Alerts */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-red-500/10 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </div>
                  <CardTitle className="text-zinc-100 text-sm">Priority Alerts</CardTitle>
                </div>
                <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 text-[10px]">
                  {execAlerts.length} Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="max-h-64 overflow-y-auto">
              {execAlerts.length > 0 ? (
                <div className="space-y-2">
                  {execAlerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all hover:bg-zinc-800/50 ${
                        alert.severity === 'critical' ? 'bg-red-500/5 border-red-500/20' :
                        alert.severity === 'error' ? 'bg-orange-500/5 border-orange-500/20' :
                        alert.severity === 'warning' ? 'bg-yellow-500/5 border-yellow-500/20' :
                        'bg-sky-500/5 border-sky-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                          alert.severity === 'critical' || alert.severity === 'error'
                            ? 'bg-red-500/10' : alert.severity === 'warning'
                            ? 'bg-yellow-500/10' : 'bg-sky-500/10'
                        }`}>
                          <AlertCircle className={`h-3.5 w-3.5 ${
                            alert.severity === 'critical' || alert.severity === 'error'
                              ? 'text-red-500' : alert.severity === 'warning'
                              ? 'text-yellow-500' : 'text-sky-500'
                          }`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-zinc-100 truncate">{alert.title}</p>
                          <p className="text-xs text-zinc-500 truncate">{alert.message}</p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] flex-shrink-0 ml-2"
                        style={{
                          backgroundColor: DIVISION_COLORS[alert.source_division as keyof typeof DIVISION_COLORS] + '15',
                          color: DIVISION_COLORS[alert.source_division as keyof typeof DIVISION_COLORS],
                          borderColor: DIVISION_COLORS[alert.source_division as keyof typeof DIVISION_COLORS] + '40',
                        }}
                      >
                        {alert.source_division}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
                  <CheckCircle className="h-8 w-8 text-emerald-500 mb-2" />
                  <span className="text-sm">No active alerts</span>
                  <span className="text-xs text-zinc-600 mt-1">All systems operating normally</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bottleneck Analysis - Live database data */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500/10 rounded-lg">
                    <Network className="h-4 w-4 text-amber-500" />
                  </div>
                  <CardTitle className="text-zinc-100 text-sm">Bottleneck Analysis</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="max-h-64 overflow-y-auto">
              {bottlenecks.filter(b => b.pending_requests > 0).length > 0 ? (
                <div className="space-y-2">
                  {bottlenecks.filter(b => b.pending_requests > 0).slice(0, 5).map((bottleneck, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        bottleneck.severity === 'critical' ? 'bg-red-500/5 border-red-500/20' :
                        bottleneck.severity === 'high' ? 'bg-orange-500/5 border-orange-500/20' :
                        bottleneck.severity === 'medium' ? 'bg-yellow-500/5 border-yellow-500/20' :
                        'bg-zinc-800/30 border-zinc-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${
                          bottleneck.severity === 'critical' ? 'bg-red-500' :
                          bottleneck.severity === 'high' ? 'bg-orange-500' :
                          bottleneck.severity === 'medium' ? 'bg-yellow-500' :
                          'bg-zinc-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-zinc-100">{bottleneck.division}</p>
                          <p className="text-xs text-zinc-500">
                            {bottleneck.pending_requests} pending | Avg {bottleneck.avg_wait_days} days
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] capitalize ${
                          bottleneck.severity === 'critical' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                          bottleneck.severity === 'high' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' :
                          bottleneck.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                          'bg-zinc-800/50 text-zinc-400 border-zinc-700'
                        }`}
                      >
                        {bottleneck.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
                  <CheckCircle className="h-8 w-8 text-emerald-500 mb-2" />
                  <span className="text-sm">No bottlenecks detected</span>
                  <span className="text-xs text-zinc-600 mt-1">All divisions operating efficiently</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* SLA Compliance Table - Live database data */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-sky-500/10 rounded-lg">
                  <Target className="h-4 w-4 text-sky-500" />
                </div>
                <CardTitle className="text-zinc-100 text-sm">SLA Compliance by Division</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {slaMetrics.map((metric, idx) => {
                const div = DIVISIONS.find(d => metric.division.includes(d.name.split('/')[0])) || DIVISIONS[idx % DIVISIONS.length];
                return (
                  <div key={metric.division} className="flex items-center gap-4">
                    <div className="w-36 flex items-center gap-2 flex-shrink-0">
                      <div className="p-1 rounded" style={{ backgroundColor: `${div.color}20` }}>
                        <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: div.color }} />
                      </div>
                      <span className="text-xs text-zinc-400 truncate">{metric.division}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-zinc-800 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${metric.sla_compliance_rate}%`,
                              backgroundColor: metric.sla_compliance_rate >= 90 ? '#10b981' :
                                              metric.sla_compliance_rate >= 70 ? '#f59e0b' : '#ef4444'
                            }}
                          />
                        </div>
                        <span className={`text-xs font-medium w-10 text-right ${
                          metric.sla_compliance_rate >= 90 ? 'text-emerald-400' :
                          metric.sla_compliance_rate >= 70 ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {metric.sla_compliance_rate}%
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-4 text-xs flex-shrink-0">
                      <div className="text-center">
                        <p className="text-zinc-500">Total</p>
                        <p className="text-zinc-100 font-medium">{metric.total_submissions}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-zinc-500">Breach</p>
                        <p className={metric.breached_sla > 0 ? 'text-red-400 font-medium' : 'text-zinc-400'}>
                          {metric.breached_sla}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render All Divisions View - Live database data
  const renderDivisionsView = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-500/10 rounded-lg">
          <Layers className="h-6 w-6 text-amber-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">All Divisions</h2>
          <p className="text-zinc-400 text-sm">Detailed performance metrics for each ILMS division</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DIVISIONS.map((div) => {
          const stats = divisionStats.find(d => d.division_code === div.code) || {
            total_submissions: 0,
            submissions_pending: 0,
            submissions_overdue: 0,
            submissions_processed: 0,
            approval_rate: 0,
            escalated_count: 0,
          };
          const Icon = div.icon;

          return (
            <Card key={div.code} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${div.color}20` }}>
                      <Icon className="h-5 w-5" style={{ color: div.color }} />
                    </div>
                    <div>
                      <CardTitle className="text-zinc-100 text-base">{div.name}</CardTitle>
                      <CardDescription className="text-xs">{stats.total_submissions} total submissions</CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-xs"
                    style={{
                      backgroundColor: `${div.color}15`,
                      color: div.color,
                      borderColor: `${div.color}40`
                    }}
                  >
                    {stats.approval_rate}% Efficiency
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center p-2 bg-zinc-800/50 rounded-lg">
                    <p className="text-lg font-bold text-zinc-100">{stats.submissions_processed}</p>
                    <p className="text-[10px] text-zinc-500">Processed</p>
                  </div>
                  <div className="text-center p-2 bg-amber-500/10 rounded-lg">
                    <p className="text-lg font-bold text-amber-400">{stats.submissions_pending}</p>
                    <p className="text-[10px] text-amber-400/60">Pending</p>
                  </div>
                  <div className="text-center p-2 bg-red-500/10 rounded-lg">
                    <p className="text-lg font-bold text-red-400">{stats.submissions_overdue}</p>
                    <p className="text-[10px] text-red-400/60">Overdue</p>
                  </div>
                  <div className="text-center p-2 bg-violet-500/10 rounded-lg">
                    <p className="text-lg font-bold text-violet-400">{stats.escalated_count}</p>
                    <p className="text-[10px] text-violet-400/60">Escalated</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  // Render Alerts View - Live database data only
  const renderAlertsView = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-500/10 rounded-lg">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">Alerts & SLA Management</h2>
          <p className="text-zinc-400 text-sm">Monitor SLA breaches and system alerts across all divisions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts List */}
        <Card className="bg-zinc-900/50 border-zinc-800 lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-zinc-100 text-sm">Active Alerts</CardTitle>
              <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30">
                {execAlerts.length} Alerts
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            {execAlerts.length > 0 ? (
              <div className="space-y-2">
                {execAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${
                      alert.severity === 'critical' ? 'bg-red-500/5 border-red-500/20' :
                      alert.severity === 'error' ? 'bg-orange-500/5 border-orange-500/20' :
                      alert.severity === 'warning' ? 'bg-yellow-500/5 border-yellow-500/20' :
                      'bg-sky-500/5 border-sky-500/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg mt-0.5 ${
                          alert.severity === 'critical' || alert.severity === 'error'
                            ? 'bg-red-500/10' : alert.severity === 'warning'
                            ? 'bg-yellow-500/10' : 'bg-sky-500/10'
                        }`}>
                          <AlertCircle className={`h-4 w-4 ${
                            alert.severity === 'critical' || alert.severity === 'error'
                              ? 'text-red-500' : alert.severity === 'warning'
                              ? 'text-yellow-500' : 'text-sky-500'
                          }`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-100">{alert.title}</p>
                          <p className="text-xs text-zinc-500 mt-1">{alert.message}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-[10px] bg-zinc-800/50 text-zinc-400 border-zinc-700">
                              {alert.source_division}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] bg-zinc-800/50 text-zinc-400 border-zinc-700">
                              {alert.alert_type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-100">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                <CheckCircle className="h-12 w-12 text-emerald-500 mb-3" />
                <span className="text-sm">All clear - no active alerts</span>
                <span className="text-xs text-zinc-600 mt-1">Alerts will appear here when triggered</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alert Summary */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-zinc-100 text-sm">Alert Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
              <div className="flex items-center justify-between">
                <span className="text-xs text-red-400">Critical</span>
                <span className="text-lg font-bold text-red-400">
                  {execAlerts.filter(a => a.severity === 'critical').length}
                </span>
              </div>
            </div>
            <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <div className="flex items-center justify-between">
                <span className="text-xs text-orange-400">Error</span>
                <span className="text-lg font-bold text-orange-400">
                  {execAlerts.filter(a => a.severity === 'error').length}
                </span>
              </div>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <div className="flex items-center justify-between">
                <span className="text-xs text-yellow-400">Warning</span>
                <span className="text-lg font-bold text-yellow-400">
                  {execAlerts.filter(a => a.severity === 'warning').length}
                </span>
              </div>
            </div>
            <div className="p-3 bg-sky-500/10 rounded-lg border border-sky-500/20">
              <div className="flex items-center justify-between">
                <span className="text-xs text-sky-400">Info</span>
                <span className="text-lg font-bold text-sky-400">
                  {execAlerts.filter(a => a.severity === 'info').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Render Cross-Division Workflows - Live database data
  const renderWorkflowsView = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-violet-500/10 rounded-lg">
          <Network className="h-6 w-6 text-violet-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">Cross-Division Workflows</h2>
          <p className="text-zinc-400 text-sm">Inter-departmental requests and coordination tracking</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100 text-sm">Workflow Bottlenecks</CardTitle>
            <CardDescription>Divisions with delayed inter-departmental responses</CardDescription>
          </CardHeader>
          <CardContent>
            {bottlenecks.filter(b => b.pending_requests > 0).length > 0 ? (
              <div className="space-y-3">
                {bottlenecks.filter(b => b.pending_requests > 0).map((b, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-zinc-100">{b.division}</p>
                      <p className="text-xs text-zinc-500">{b.pending_requests} pending requests</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-amber-400">{b.avg_wait_days} days avg</p>
                      <p className="text-xs text-zinc-500">wait time</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                <CheckCircle className="h-8 w-8 text-emerald-500 mb-2" />
                <span className="text-sm">No workflow bottlenecks detected</span>
                <span className="text-xs text-zinc-600 mt-1">All inter-division workflows running smoothly</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100 text-sm">Division Dependencies</CardTitle>
            <CardDescription>Common inter-division request patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
              <Network className="h-12 w-12 text-zinc-600 mb-3" />
              <span className="text-sm">Awaiting workflow data</span>
              <span className="text-xs text-zinc-600 mt-1">Dependency maps will populate with live data</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Render Directives View - Live database data only
  // Render Directives View - Live database data with form
  const renderDirectivesView = () => {
    const STATUS_COLORS: Record<string, string> = {
      issued: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      acknowledged: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      in_progress: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
      completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      cancelled: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
    };

    const PRIORITY_COLORS: Record<string, string> = {
      low: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
      medium: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      high: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      urgent: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      critical: 'bg-red-500/10 text-red-400 border-red-500/30',
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Send className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-100">Executive Directives</h2>
              <p className="text-zinc-400 text-sm">Issue and track directives to divisions</p>
            </div>
          </div>
          <DirectiveForm onSuccess={() => fetchData()} />
        </div>

        {/* Directive Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-4">
              <p className="text-[10px] text-zinc-500 uppercase">Total</p>
              <p className="text-2xl font-bold text-zinc-100">{execDirectives.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-500/10 border-amber-500/20">
            <CardContent className="p-4">
              <p className="text-[10px] text-amber-400/80 uppercase">Issued</p>
              <p className="text-2xl font-bold text-zinc-100">{execDirectives.filter(d => d.status === 'issued').length}</p>
            </CardContent>
          </Card>
          <Card className="bg-violet-500/10 border-violet-500/20">
            <CardContent className="p-4">
              <p className="text-[10px] text-violet-400/80 uppercase">In Progress</p>
              <p className="text-2xl font-bold text-zinc-100">{execDirectives.filter(d => d.status === 'in_progress').length}</p>
            </CardContent>
          </Card>
          <Card className="bg-emerald-500/10 border-emerald-500/20">
            <CardContent className="p-4">
              <p className="text-[10px] text-emerald-400/80 uppercase">Completed</p>
              <p className="text-2xl font-bold text-zinc-100">{execDirectives.filter(d => d.status === 'completed').length}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-800/50 border-zinc-700">
            <CardContent className="p-4">
              <p className="text-[10px] text-zinc-400 uppercase">Cancelled</p>
              <p className="text-2xl font-bold text-zinc-100">{execDirectives.filter(d => d.status === 'cancelled').length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Directives List */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-zinc-100 text-sm">All Directives</CardTitle>
              <Badge variant="outline" className="bg-zinc-800/50 text-zinc-400 border-zinc-700">
                {execDirectives.length} Total
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {execDirectives.length > 0 ? (
              <div className="space-y-3">
                {execDirectives.map((directive) => (
                  <div
                    key={directive.id}
                    className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50 hover:bg-zinc-800 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-zinc-500 font-mono">{directive.directive_number}</span>
                          <Badge variant="outline" className={STATUS_COLORS[directive.status] || STATUS_COLORS.issued}>
                            {directive.status}
                          </Badge>
                          <Badge variant="outline" className={PRIORITY_COLORS[directive.priority] || PRIORITY_COLORS.medium}>
                            {directive.priority}
                          </Badge>
                        </div>
                        <h4 className="text-sm font-medium text-zinc-100">{directive.title}</h4>
                      </div>
                      {directive.due_date && (
                        <div className="text-right">
                          <p className="text-[10px] text-zinc-500 uppercase">Due</p>
                          <p className="text-xs text-zinc-300">{new Date(directive.due_date).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-2">{directive.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {directive.target_divisions.map((div) => (
                        <Badge
                          key={div}
                          variant="outline"
                          className="text-[10px] bg-zinc-700/50 text-zinc-300 border-zinc-600"
                        >
                          {div}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                <Send className="h-16 w-16 text-zinc-600 mb-4" />
                <h3 className="text-lg font-medium text-zinc-300 mb-1">No Active Directives</h3>
                <p className="text-sm text-center max-w-md">
                  Executive directives will appear here when issued. Create a new directive to assign tasks to specific divisions.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // Route to appropriate view based on section
  switch (section) {
    case "overview":
      return renderCommandCenter();
    case "divisions":
      return renderDivisionsView();
    case "workflows":
      return renderWorkflowsView();
    case "alerts":
      return renderAlertsView();
    case "directives":
      return renderDirectivesView();
    default:
      return renderCommandCenter();
  }
}
