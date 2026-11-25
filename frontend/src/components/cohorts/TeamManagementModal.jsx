import { SearchableSelect } from "@/components/ui/SearchableSelect";
import React, { useState } from "react";
import { X, UserPlus, Users, Crown, ArrowRightLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiFetch } from "@/api/client/apiClient";
import { Trash } from "lucide-react";

export default function TeamManagementModal({ cohort, isOpen, onClose, onRefresh }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [targetTeam, setTargetTeam] = useState("");

  if (!isOpen || !cohort) return null;

  const handleAutoPair = async () => {
    if (!window.confirm("This will automatically generate new teams for unassigned students. Proceed?")) return;
    
    setIsProcessing(true);
    try {
      const res = await apiFetch("/api/cohort-teams/auto_pair/", {
        method: "POST",
        body: JSON.stringify({ cohort_id: cohort.id })
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(data.message || "Teams created successfully.");
        onRefresh();
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Failed to auto-pair teams.");
      }
    } catch (error) {
      toast.error("Network error occurred.");
    }
    setIsProcessing(false);
  };

  const handleMoveStudent = async () => {
    if (!selectedStudent || !targetTeam) {
      toast.error("Please select a student and a target team.");
      return;
    }
    setIsProcessing(true);
    try {
      const res = await apiFetch("/api/cohort-teams/move_student/", {
        method: "POST",
        body: JSON.stringify({
          cohort_id: cohort.id,
          student_id: selectedStudent,
          target_team_id: targetTeam
        })
      });
      if (res.ok) {
        toast.success("Student moved successfully.");
        onRefresh();
        setSelectedStudent("");
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Failed to move student.");
      }
    } catch (error) {
      toast.error("Network error occurred.");
    }
    setIsProcessing(false);
  };

  const handleRenameTeam = async (team) => {
    const newName = window.prompt(`Enter a new name for ${team.name}:`, team.name);
    if (!newName || newName.trim() === "" || newName === team.name) return;
    
    setIsProcessing(true);
    try {
      const res = await apiFetch("/api/cohort-teams/rename_team/", {
        method: "POST",
        body: JSON.stringify({ team_id: team.id, new_name: newName })
      });
      if (res.ok) {
        toast.success("Team renamed successfully.");
        onRefresh();
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Failed to rename team.");
      }
    } catch (error) {
      toast.error("Network error occurred.");
    }
    setIsProcessing(false);
  };

  const handleDissolveTeam = async (team) => {
    if (!window.confirm(`Are you sure you want to dissolve ${team.name}? All members will become unassigned.`)) return;
    
    setIsProcessing(true);
    try {
      const res = await apiFetch(`/api/cohort-teams/${team.id}/`, {
        method: "DELETE"
      });
      if (res.ok) {
        toast.success("Team dissolved successfully.");
        onRefresh();
      } else {
        toast.error("Failed to dissolve team.");
      }
    } catch (error) {
      toast.error("Network error occurred.");
    }
    setIsProcessing(false);
  };

  const studentLabel = (s) => {
    const named =
      s.full_name ||
      `${s.first_name || ""} ${s.last_name || ""}`.trim();
    if (named) return named;
    const email = s.email || s.username || "";
    if (email.includes("@")) {
      return email
        .split("@")[0]
        .replace(/[._+\-]+/g, " ")
        .replace(/\d+/g, " ")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
    }
    return s.username || "Student";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-background rounded-t-xl sm:rounded-lg shadow-xl w-full max-w-4xl h-[92dvh] sm:h-auto sm:max-h-[88dvh] overflow-hidden flex flex-col">
        <div className="px-4 py-3 sm:p-5 border-b flex justify-between items-center shrink-0 bg-background">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold truncate">Team Management</h2>
            <p className="text-sm text-muted-foreground truncate">{cohort.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-md transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-5 overflow-y-auto flex-1 min-h-0">
          <div className="flex flex-col sm:flex-row gap-4 justify-between bg-muted/30 p-3 sm:p-4 rounded-md border">
            <div className="flex-1 space-y-2 min-w-0">
              <h3 className="font-semibold text-sm">Move Student</h3>
              <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                <SearchableSelect
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="bg-background border rounded-md px-3 py-2 text-sm flex-1 min-w-0 sm:min-w-[150px]"
                >
                  <option value="">-- Select Student --</option>
                  {cohort.students?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {studentLabel(s)}
                    </option>
                  ))}
                </SearchableSelect>
                <SearchableSelect
                  value={targetTeam}
                  onChange={(e) => setTargetTeam(e.target.value)}
                  className="bg-background border rounded-md px-3 py-2 text-sm flex-1 min-w-0 sm:min-w-[150px]"
                >
                  <option value="">-- Target Team --</option>
                  {cohort.teams?.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </SearchableSelect>
                <Button onClick={handleMoveStudent} disabled={isProcessing || !selectedStudent || !targetTeam} variant="secondary">
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Move
                </Button>
              </div>
            </div>
            <div className="sm:border-l sm:pl-4 flex flex-col justify-end">
              <Button onClick={handleAutoPair} disabled={isProcessing} className="w-full sm:w-auto">
                <Users className="w-4 h-4 mr-2" />
                Auto-Pair Unassigned
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold mb-3">Current Teams ({cohort.teams?.length || 0})</h3>
            {cohort.teams?.length === 0 ? (
              <p className="text-muted-foreground text-sm">No teams have been created yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {cohort.teams?.map((team) => (
                  <div key={team.id} className="border rounded-md p-3 bg-card shadow-sm">
                    <h4 className="font-bold text-sm mb-2 flex items-center border-b pb-2 group gap-1 min-w-0">
                      <span className="truncate">{team.name}</span>
                      <button
                        onClick={() => handleRenameTeam(team)}
                        className="ml-1 text-muted-foreground opacity-70 sm:opacity-0 group-hover:opacity-100 hover:text-foreground transition-opacity shrink-0"
                        title="Rename team"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDissolveTeam(team)}
                        className="text-muted-foreground opacity-70 sm:opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity shrink-0"
                        title="Dissolve team"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                      <span className="ml-auto text-[10px] font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-md shrink-0">
                        {team.students?.length || 0}
                      </span>
                    </h4>
                    <div className="space-y-1.5 mt-1">
                      {team.students?.map((student) => {
                        const isLeader = team.team_leader?.id === student.id;
                        return (
                          <div
                            key={student.id}
                            className={`flex items-center justify-between p-2 rounded-md text-sm gap-2 ${
                              isLeader ? "bg-primary/10 border border-primary/20" : "bg-muted/50 hover:bg-muted"
                            }`}
                          >
                            <div className="flex items-center min-w-0">
                              {isLeader && <Crown className="w-4 h-4 text-primary mr-2 shrink-0" />}
                              <span className={`truncate ${isLeader ? "font-semibold text-primary" : "text-foreground"}`}>
                                {studentLabel(student)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {(team.change_request_ids || []).includes(student.id) && (
                                <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-400 font-semibold px-2 py-0.5 rounded-full border border-amber-500/30">
                                  <ArrowRightLeft className="w-2.5 h-2.5" />
                                  Change Requested
                                </span>
                              )}
                              {isLeader && (
                                <span className="text-[10px] uppercase tracking-wider text-primary font-bold">
                                  Leader
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {(!team.students || team.students.length === 0) && (
                        <p className="text-xs text-muted-foreground italic p-2">Empty team</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
