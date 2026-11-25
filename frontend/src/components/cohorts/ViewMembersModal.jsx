import React from "react";
import { X, Crown } from "lucide-react";

function studentName(student) {
  const named =
    student?.full_name ||
    `${student?.first_name || ""} ${student?.last_name || ""}`.trim();
  if (named) return named;
  const email = student?.email || student?.username || "";
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
  return student?.username || "Student";
}

export default function ViewMembersModal({ cohort, isOpen, onClose }) {
  if (!isOpen || !cohort) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-background rounded-t-xl sm:rounded-lg shadow-xl w-full max-w-4xl h-[92dvh] sm:h-auto sm:max-h-[88dvh] overflow-hidden flex flex-col">
        <div className="px-4 py-3 sm:p-5 border-b flex justify-between items-center shrink-0 bg-background">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold truncate">Cohort Members</h2>
            <p className="text-sm text-muted-foreground truncate">{cohort.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-md transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-5 overflow-y-auto flex-1 min-h-0">
          <div className="min-w-0 flex flex-col min-h-0">
            <h4 className="text-base font-semibold mb-3 shrink-0">
              All Students ({cohort.students?.length || 0})
            </h4>
            {cohort.students && cohort.students.length > 0 ? (
              <div className="border rounded-xl overflow-hidden flex-1 min-h-0 max-h-[50dvh] md:max-h-none overflow-y-auto bg-card">
                <ul className="divide-y divide-border">
                  {cohort.students.map((student, index) => (
                    <li
                      key={student.id}
                      className="px-3.5 py-2.5 flex items-start gap-3 hover:bg-muted/30 transition-colors"
                    >
                      <span className="w-6 shrink-0 text-xs font-bold text-muted-foreground tabular-nums pt-0.5">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-foreground truncate">
                          {studentName(student)}
                        </p>
                        {student.email && (
                          <p className="text-xs text-muted-foreground break-all mt-0.5 select-all font-medium">
                            {student.email}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No members yet.</p>
            )}
          </div>

          <div className="min-w-0 flex flex-col min-h-0">
            <h4 className="text-base font-semibold mb-3 shrink-0">
              Teams ({cohort.teams?.length || 0})
            </h4>
            {cohort.teams && cohort.teams.length > 0 ? (
              <div className="space-y-3 overflow-y-auto max-h-[50dvh] md:max-h-none pr-1">
                {cohort.teams.map((team) => (
                  <div key={team.id} className="border rounded-xl p-3 bg-muted/20">
                    <h5 className="font-bold mb-2 border-b border-border pb-2 text-sm text-foreground">{team.name}</h5>
                    <div className="space-y-1 mt-1">
                      {team.students?.map((s) => {
                        const isLeader = team.team_leader?.id === s.id;
                        return (
                          <div
                            key={s.id}
                            className="flex flex-col py-1 text-sm border-b border-border/30 last:border-0"
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              {isLeader ? (
                                <Crown className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                              ) : (
                                <span className="w-3.5 shrink-0" />
                              )}
                              <span className="truncate font-semibold text-foreground">{studentName(s)}</span>
                              {isLeader && (
                                <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold rounded shrink-0">
                                  Leader
                                </span>
                              )}
                            </div>
                            {s.email && (
                              <p className="text-xs text-muted-foreground break-all pl-5 mt-0.5 select-all font-medium">
                                {s.email}
                              </p>
                            )}
                          </div>
                        );
                      })}
                      {(!team.students || team.students.length === 0) && (
                        <p className="text-xs text-muted-foreground italic">Empty team</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No teams formed yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
