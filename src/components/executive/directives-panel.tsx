"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Send,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  MoreHorizontal,
  Calendar,
  User,
  Building2,
  FileText,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Directive {
  id: string;
  directive_number: string;
  title: string;
  content: string;
  issued_by: string;
  issued_to_division: string;
  priority: string;
  status: string;
  due_date: string | null;
  acknowledged_at: string | null;
  completed_at: string | null;
  completion_notes: string | null;
  created_at: string;
}

const DIVISIONS = [
  { code: 'survey', name: 'Surveyor General' },
  { code: 'planning', name: 'Physical Planning' },
  { code: 'ilg', name: 'Integrated Land Groups' },
  { code: 'state', name: 'State/Alienated Land' },
  { code: 'titles', name: 'Registrar of Titles' },
  { code: 'customer', name: 'Customer Services' },
  { code: 'legal', name: 'Legal/Case Management' },
  { code: 'audit', name: 'Audit & Compliance' },
  { code: 'corporate', name: 'Corporate Services' },
  { code: 'ict', name: 'ICT/Systems Admin' },
];

export function DirectivesPanel() {
  const [directives, setDirectives] = useState<Directive[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [newDirective, setNewDirective] = useState({
    title: '',
    content: '',
    issued_to_division: '',
    priority: 'medium',
    due_date: '',
  });

  useEffect(() => {
    fetchDirectives();

    // Set up realtime subscription
    const channel = supabase
      .channel('directives-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'exec_directives' },
        () => {
          fetchDirectives();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDirectives = async () => {
    try {
      const { data, error } = await supabase
        .from('exec_directives')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching directives:', error);
        return;
      }

      setDirectives(data || []);
    } catch (error) {
      console.error('Error fetching directives:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createDirective = async () => {
    if (!newDirective.title || !newDirective.content || !newDirective.issued_to_division) {
      return;
    }

    setIsCreating(true);
    try {
      const directiveNumber = `DIR-${Date.now().toString(36).toUpperCase()}`;

      const { error } = await supabase
        .from('exec_directives')
        .insert({
          directive_number: directiveNumber,
          title: newDirective.title,
          content: newDirective.content,
          issued_to_division: newDirective.issued_to_division,
          priority: newDirective.priority,
          due_date: newDirective.due_date || null,
          issued_by: 'executive', // Would be actual user ID
          status: 'issued',
        });

      if (error) {
        console.error('Error creating directive:', error);
        return;
      }

      // Reset form and close dialog
      setNewDirective({
        title: '',
        content: '',
        issued_to_division: '',
        priority: 'medium',
        due_date: '',
      });
      setDialogOpen(false);
      fetchDirectives();
    } catch (error) {
      console.error('Error creating directive:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      issued: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      acknowledged: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      in_progress: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
      completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      overdue: 'bg-red-500/10 text-red-400 border-red-500/30',
    };
    return styles[status] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30';
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      low: 'bg-emerald-500/10 text-emerald-400',
      medium: 'bg-amber-500/10 text-amber-400',
      high: 'bg-orange-500/10 text-orange-400',
      urgent: 'bg-red-500/10 text-red-400',
    };
    return styles[priority] || 'bg-zinc-500/10 text-zinc-400';
  };

  const getDivisionName = (code: string) => {
    return DIVISIONS.find(d => d.code === code)?.name || code;
  };

  // Stats
  const stats = {
    total: directives.length,
    issued: directives.filter(d => d.status === 'issued').length,
    acknowledged: directives.filter(d => d.status === 'acknowledged').length,
    inProgress: directives.filter(d => d.status === 'in_progress').length,
    completed: directives.filter(d => d.status === 'completed').length,
    overdue: directives.filter(d => d.status === 'overdue').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-black">
              <Plus className="h-4 w-4 mr-2" />
              New Directive
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-zinc-100">Create New Directive</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Issue an executive directive to a specific division
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-zinc-300">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter directive title"
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  value={newDirective.title}
                  onChange={(e) => setNewDirective({ ...newDirective, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="division" className="text-zinc-300">Target Division</Label>
                <Select
                  value={newDirective.issued_to_division}
                  onValueChange={(value) => setNewDirective({ ...newDirective, issued_to_division: value })}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    <SelectValue placeholder="Select division" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {DIVISIONS.map((div) => (
                      <SelectItem key={div.code} value={div.code} className="text-zinc-100">
                        {div.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-zinc-300">Priority</Label>
                  <Select
                    value={newDirective.priority}
                    onValueChange={(value) => setNewDirective({ ...newDirective, priority: value })}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="low" className="text-zinc-100">Low</SelectItem>
                      <SelectItem value="medium" className="text-zinc-100">Medium</SelectItem>
                      <SelectItem value="high" className="text-zinc-100">High</SelectItem>
                      <SelectItem value="urgent" className="text-zinc-100">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due_date" className="text-zinc-300">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                    value={newDirective.due_date}
                    onChange={(e) => setNewDirective({ ...newDirective, due_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="text-zinc-300">Directive Content</Label>
                <Textarea
                  id="content"
                  placeholder="Enter detailed instructions..."
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 min-h-[120px]"
                  value={newDirective.content}
                  onChange={(e) => setNewDirective({ ...newDirective, content: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-zinc-700">
                Cancel
              </Button>
              <Button
                className="bg-amber-500 hover:bg-amber-600 text-black"
                onClick={createDirective}
                disabled={isCreating || !newDirective.title || !newDirective.content || !newDirective.issued_to_division}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Issue Directive
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <p className="text-[10px] font-medium text-zinc-500 uppercase">Total</p>
            <p className="text-2xl font-bold text-zinc-100 mt-1">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-sky-500/5 border-sky-500/20">
          <CardContent className="p-4">
            <p className="text-[10px] font-medium text-sky-400/80 uppercase">Issued</p>
            <p className="text-2xl font-bold text-zinc-100 mt-1">{stats.issued}</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="p-4">
            <p className="text-[10px] font-medium text-amber-400/80 uppercase">Acknowledged</p>
            <p className="text-2xl font-bold text-zinc-100 mt-1">{stats.acknowledged}</p>
          </CardContent>
        </Card>
        <Card className="bg-violet-500/5 border-violet-500/20">
          <CardContent className="p-4">
            <p className="text-[10px] font-medium text-violet-400/80 uppercase">In Progress</p>
            <p className="text-2xl font-bold text-zinc-100 mt-1">{stats.inProgress}</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4">
            <p className="text-[10px] font-medium text-emerald-400/80 uppercase">Completed</p>
            <p className="text-2xl font-bold text-zinc-100 mt-1">{stats.completed}</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/5 border-red-500/20">
          <CardContent className="p-4">
            <p className="text-[10px] font-medium text-red-400/80 uppercase">Overdue</p>
            <p className="text-2xl font-bold text-zinc-100 mt-1">{stats.overdue}</p>
          </CardContent>
        </Card>
      </div>

      {/* Directives List */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-zinc-100 text-sm">All Directives</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
          ) : directives.length > 0 ? (
            <div className="space-y-3">
              {directives.map((directive) => (
                <div
                  key={directive.id}
                  className="p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50 hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-zinc-500 font-mono">
                          {directive.directive_number}
                        </span>
                        <Badge variant="outline" className={getStatusBadge(directive.status)}>
                          {directive.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className={`${getPriorityBadge(directive.priority)} text-[10px]`}>
                          {directive.priority}
                        </Badge>
                      </div>
                      <h3 className="text-sm font-medium text-zinc-100">{directive.title}</h3>
                      <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{directive.content}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {getDivisionName(directive.issued_to_division)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(directive.created_at).toLocaleDateString()}
                        </span>
                        {directive.due_date && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Due: {new Date(directive.due_date).toLocaleDateString()}
                          </span>
                        )}
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
              <Send className="h-16 w-16 text-zinc-600 mb-4" />
              <h3 className="text-lg font-medium text-zinc-300 mb-1">No Directives Issued</h3>
              <p className="text-sm text-center max-w-md">
                Executive directives allow you to issue instructions to specific divisions with tracking and accountability.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
