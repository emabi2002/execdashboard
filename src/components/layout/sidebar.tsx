"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Scale,
  Search,
  Building2,
  Bell,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Briefcase,
  CheckSquare,
  FileText,
  Calendar,
  Map,
  AlertTriangle,
  Users,
  TrendingUp,
  Compass,
  MapPin,
  Home,
  Landmark,
  ClipboardList,
  UserCheck,
  Layers,
  Network,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  color?: string;
  children?: { id: string; label: string; icon: React.ReactNode }[];
}

interface SidebarProps {
  activeLayer: string;
  activeSection?: string;
  onNavigate: (layer: string, section?: string) => void;
  alertCount?: number;
}

const navItems: NavItem[] = [
  {
    id: "executive",
    label: "Executive Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    color: "#f59e0b",
    children: [
      { id: "overview", label: "Command Center", icon: <TrendingUp className="h-4 w-4" /> },
      { id: "divisions", label: "All Divisions", icon: <Layers className="h-4 w-4" /> },
      { id: "workflows", label: "Cross-Division", icon: <Network className="h-4 w-4" /> },
      { id: "alerts", label: "Alerts & SLA", icon: <AlertTriangle className="h-4 w-4" /> },
      { id: "directives", label: "Directives", icon: <ClipboardList className="h-4 w-4" /> },
    ],
  },
  {
    id: "survey",
    label: "Surveyor General",
    icon: <Compass className="h-5 w-5" />,
    color: "#10b981",
    children: [
      { id: "overview", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
      { id: "submissions", label: "Submissions", icon: <FileText className="h-4 w-4" /> },
      { id: "plans", label: "Survey Plans", icon: <Map className="h-4 w-4" /> },
      { id: "parcels", label: "Land Parcels", icon: <MapPin className="h-4 w-4" /> },
    ],
  },
  {
    id: "planning",
    label: "Physical Planning",
    icon: <Building2 className="h-5 w-5" />,
    color: "#3b82f6",
    children: [
      { id: "overview", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
      { id: "applications", label: "Applications", icon: <FileText className="h-4 w-4" /> },
      { id: "permits", label: "Permits", icon: <CheckSquare className="h-4 w-4" /> },
      { id: "zones", label: "Zoning", icon: <Map className="h-4 w-4" /> },
    ],
  },
  {
    id: "ilg",
    label: "Integrated Land Groups",
    icon: <Users className="h-5 w-5" />,
    color: "#8b5cf6",
    children: [
      { id: "overview", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
      { id: "registrations", label: "Registrations", icon: <UserCheck className="h-4 w-4" /> },
      { id: "disputes", label: "Disputes", icon: <AlertTriangle className="h-4 w-4" /> },
    ],
  },
  {
    id: "state",
    label: "State/Alienated Land",
    icon: <Landmark className="h-5 w-5" />,
    color: "#f59e0b",
    children: [
      { id: "overview", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
      { id: "leases", label: "Leases", icon: <FileText className="h-4 w-4" /> },
      { id: "transactions", label: "Transactions", icon: <Briefcase className="h-4 w-4" /> },
    ],
  },
  {
    id: "titles",
    label: "Registrar of Titles",
    icon: <FileText className="h-5 w-5" />,
    color: "#ef4444",
    children: [
      { id: "overview", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
      { id: "registrations", label: "Registrations", icon: <CheckSquare className="h-4 w-4" /> },
      { id: "searches", label: "Title Searches", icon: <Search className="h-4 w-4" /> },
    ],
  },
  {
    id: "customer",
    label: "Customer Services",
    icon: <Home className="h-5 w-5" />,
    color: "#ec4899",
    children: [
      { id: "overview", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
      { id: "requests", label: "Service Requests", icon: <ClipboardList className="h-4 w-4" /> },
      { id: "queue", label: "Service Queue", icon: <Users className="h-4 w-4" /> },
    ],
  },
  {
    id: "legal",
    label: "Legal/Case Management",
    icon: <Scale className="h-5 w-5" />,
    color: "#06b6d4",
    children: [
      { id: "overview", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
      { id: "cases", label: "Cases", icon: <Briefcase className="h-4 w-4" /> },
      { id: "tasks", label: "Tasks", icon: <CheckSquare className="h-4 w-4" /> },
      { id: "documents", label: "Documents", icon: <FileText className="h-4 w-4" /> },
      { id: "events", label: "Calendar", icon: <Calendar className="h-4 w-4" /> },
    ],
  },
  {
    id: "audit",
    label: "Audit & Compliance",
    icon: <Search className="h-5 w-5" />,
    color: "#14b8a6",
    children: [
      { id: "overview", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
      { id: "findings", label: "Findings", icon: <AlertTriangle className="h-4 w-4" /> },
      { id: "reports", label: "Reports", icon: <FileText className="h-4 w-4" /> },
    ],
  },
  {
    id: "corporate",
    label: "Corporate Services",
    icon: <Briefcase className="h-5 w-5" />,
    color: "#6366f1",
    children: [
      { id: "overview", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
      { id: "matters", label: "Matters", icon: <Briefcase className="h-4 w-4" /> },
      { id: "hr", label: "HR", icon: <Users className="h-4 w-4" /> },
      { id: "finance", label: "Finance", icon: <TrendingUp className="h-4 w-4" /> },
    ],
  },

];

export function Sidebar({
  activeLayer,
  activeSection,
  onNavigate,
  alertCount = 0,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([activeLayer]);

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <TooltipProvider>
      <div
        className={cn(
          "flex flex-col h-full bg-zinc-950 border-r border-zinc-800/50 transition-all duration-300",
          isCollapsed ? "w-16" : "w-72"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800/50">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Landmark className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-zinc-100">ILMS</h1>
                <p className="text-[10px] text-zinc-500">Lands Department PNG</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-100"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-3">
          <nav className="space-y-0.5 px-2">
            {navItems.map((item) => {
              const isActive = activeLayer === item.id;
              const isExpanded = expandedItems.includes(item.id);

              return (
                <div key={item.id}>
                  {isCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-center h-10",
                            isActive
                              ? "bg-zinc-800 text-zinc-100"
                              : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                          )}
                          onClick={() => {
                            onNavigate(item.id);
                            if (item.children?.[0]) {
                              onNavigate(item.id, item.children[0].id);
                            }
                          }}
                        >
                          <div style={{ color: isActive ? item.color : undefined }}>
                            {item.icon}
                          </div>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{item.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-3 h-9 px-3",
                          isActive
                            ? "bg-zinc-800/80 text-zinc-100"
                            : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                        )}
                        onClick={() => {
                          toggleExpanded(item.id);
                          onNavigate(item.id);
                        }}
                      >
                        <div
                          className="flex-shrink-0"
                          style={{ color: isActive ? item.color : undefined }}
                        >
                          {item.icon}
                        </div>
                        <span className="text-sm truncate flex-1 text-left">{item.label}</span>
                        {item.children && (
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform flex-shrink-0",
                              isExpanded ? "rotate-180" : ""
                            )}
                          />
                        )}
                        {item.badge && (
                          <Badge
                            variant="outline"
                            className="ml-auto text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/20"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                      {item.children && isExpanded && (
                        <div className="ml-5 mt-0.5 space-y-0.5 border-l border-zinc-800 pl-3">
                          {item.children.map((child) => (
                            <Button
                              key={child.id}
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "w-full justify-start gap-2 h-7 text-xs px-2",
                                activeSection === child.id && activeLayer === item.id
                                  ? "bg-zinc-800/60 text-zinc-100"
                                  : "text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800/30"
                              )}
                              onClick={() => onNavigate(item.id, child.id)}
                            >
                              {child.icon}
                              {child.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-800/50 p-2">
          {isCollapsed ? (
            <div className="space-y-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-center h-10 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 relative"
                  >
                    <Bell className="h-5 w-5" />
                    {alertCount > 0 && (
                      <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Alerts ({alertCount})</p>
                </TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-9 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                onClick={() => onNavigate('executive', 'alerts')}
              >
                <Bell className="h-5 w-5" />
                <span className="text-sm">Alerts</span>
                {alertCount > 0 && (
                  <Badge
                    variant="outline"
                    className="ml-auto text-[10px] bg-red-500/10 text-red-400 border-red-500/20"
                  >
                    {alertCount}
                  </Badge>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
