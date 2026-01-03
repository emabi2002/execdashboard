"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Send,
  AlertCircle,
  Loader2,
  X,
  Calendar,
} from "lucide-react";
import { createDirective } from "@/lib/ilms-service";
import type { ExecDirective } from "@/lib/ilms-types";

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

interface DirectiveFormProps {
  onSuccess?: (directive: ExecDirective) => void;
  trigger?: React.ReactNode;
}

export function DirectiveForm({ onSuccess, trigger }: DirectiveFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<string>("medium");
  const [targetDivisions, setTargetDivisions] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!description.trim()) {
      setError("Description is required");
      return;
    }
    if (targetDivisions.length === 0) {
      setError("Select at least one target division");
      return;
    }

    setIsSubmitting(true);

    try {
      const directive = await createDirective({
        title: title.trim(),
        description: description.trim(),
        priority: priority as ExecDirective['priority'],
        target_divisions: targetDivisions,
        due_date: dueDate || undefined,
        issued_by: 'executive-user', // Would be actual user ID
      });

      if (directive) {
        onSuccess?.(directive);
        resetForm();
        setIsOpen(false);
      } else {
        setError("Failed to create directive. Please try again.");
      }
    } catch (err) {
      console.error("Error creating directive:", err);
      setError("An error occurred while creating the directive.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setTargetDivisions([]);
    setDueDate("");
    setError(null);
  };

  const toggleDivision = (code: string) => {
    setTargetDivisions(prev =>
      prev.includes(code)
        ? prev.filter(d => d !== code)
        : [...prev, code]
    );
  };

  const selectAllDivisions = () => {
    setTargetDivisions(DIVISIONS.map(d => d.code));
  };

  const clearAllDivisions = () => {
    setTargetDivisions([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-amber-500 hover:bg-amber-600 text-black">
            <Send className="h-4 w-4 mr-2" />
            New Directive
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-zinc-100 flex items-center gap-2">
            <Send className="h-5 w-5 text-amber-500" />
            Issue Executive Directive
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Create a new directive to assign tasks or instructions to one or more divisions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Error Alert */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-zinc-300">
              Directive Title <span className="text-red-400">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a clear, concise title"
              className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-zinc-300">
              Description / Instructions <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide detailed instructions for the directive..."
              className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 min-h-[120px]"
            />
          </div>

          {/* Priority & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-zinc-300">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-zinc-100">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate" className="text-zinc-300">Due Date (Optional)</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="pl-9 bg-zinc-800/50 border-zinc-700 text-zinc-100"
                />
              </div>
            </div>
          </div>

          {/* Target Divisions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-zinc-300">
                Target Divisions <span className="text-red-400">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={selectAllDivisions}
                  className="text-xs text-zinc-400 hover:text-zinc-100"
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearAllDivisions}
                  className="text-xs text-zinc-400 hover:text-zinc-100"
                >
                  Clear
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {DIVISIONS.map((division) => (
                <div
                  key={division.code}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    targetDivisions.includes(division.code)
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-zinc-800/30 border-zinc-700/50 hover:bg-zinc-800/50'
                  }`}
                  onClick={() => toggleDivision(division.code)}
                >
                  <Checkbox
                    checked={targetDivisions.includes(division.code)}
                    onCheckedChange={() => toggleDivision(division.code)}
                    className="border-zinc-600 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                  />
                  <span className={`text-sm ${
                    targetDivisions.includes(division.code) ? 'text-zinc-100' : 'text-zinc-400'
                  }`}>
                    {division.name}
                  </span>
                </div>
              ))}
            </div>

            {targetDivisions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {targetDivisions.map((code) => {
                  const div = DIVISIONS.find(d => d.code === code);
                  return (
                    <Badge
                      key={code}
                      variant="outline"
                      className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs"
                    >
                      {div?.name}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleDivision(code); }}
                        className="ml-1.5 hover:text-amber-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        </form>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="bg-zinc-800/50 border-zinc-700 text-zinc-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-amber-500 hover:bg-amber-600 text-black"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Issuing...
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
  );
}
