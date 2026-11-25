import React, { useState } from "react";
import useSWR from "swr";
import { apiFetch, swrFetcher } from "@/api/client/apiClient";
import { toast } from "sonner";
import { CopyMinus, Check, Trash2, ShieldAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DuplicateAccountScanner({ onMerged }) {
  const { data, error, mutate } = useSWR("/api/admin/users/duplicates/", swrFetcher, {
    shouldRetryOnError: false, // 403 means not superadmin
  });
  
  const [merging, setMerging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [dismissedGroups, setDismissedGroups] = useState([]);

  if (error || !data) return null;

  const activeData = data.filter(group => !dismissedGroups.includes(group.name));

  if (activeData.length === 0) {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-card w-full max-w-sm rounded-xl shadow-2xl border border-border p-6 flex flex-col items-center justify-center gap-4 text-center animate-in zoom-in-95 duration-200">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
            <Check className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="text-xl font-bold">All Caught Up!</h3>
          <p className="text-sm text-muted-foreground">There are no duplicate accounts left to resolve.</p>
          <Button onClick={() => setIsOpen(false)} className="mt-2 w-full">Close</Button>
        </div>
      </div>
    );
  }

  const handleMerge = async (primaryId, duplicateIds, groupName) => {
    if (!window.confirm("Are you sure you want to merge these accounts? This action cannot be undone.")) return;
    setMerging(true);
    try {
      const res = await apiFetch("/api/admin/users/merge_duplicates/", {
        method: "POST",
        body: JSON.stringify({ primary_id: primaryId, duplicate_ids: duplicateIds }),
      });
      const result = await res.json();
      if (res.ok) {
        setDismissedGroups(prev => [...prev, groupName]);
        setSuccessMsg(`Successfully merged ${result.merged_count} duplicate account(s).`);
        toast.success(`Successfully merged ${result.merged_count} duplicate account(s).`);
        mutate();
        if (onMerged) onMerged();
        setTimeout(() => setSuccessMsg(""), 5000);
      } else {
        toast.error(result.error || "Failed to merge accounts.");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setMerging(false);
    }
  };

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className="w-full bg-orange-500/10 hover:bg-orange-500/20 cursor-pointer transition-colors border border-orange-500/30 rounded-xl p-3 sm:p-4 mb-4 shadow-sm flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <h3 className="font-bold text-sm sm:text-base">
            Duplicate Accounts Detected ({activeData.length} groups)
          </h3>
        </div>
        <Button variant="outline" size="sm" className="text-orange-600 border-orange-500/50 pointer-events-none">
          Resolve Now
        </Button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl border border-border p-4 sm:p-6 flex flex-col gap-4 relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-2 mt-2 sm:mt-0">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-lg sm:text-xl">Resolve Duplicate Accounts</h3>
            </div>
            
            <p className="text-sm text-foreground/70 leading-relaxed mb-2">
              We found {activeData.length} potential duplicate group(s) based on exact name matches. Please select the primary account to keep. All data from the others will be merged into the primary, and the duplicates will be deleted.
            </p>

            {successMsg && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 p-3 rounded-lg flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 shrink-0" />
                {successMsg}
              </div>
            )}

            <div className="flex flex-col gap-4">
              {activeData.map((group, idx) => (
                <div key={idx} className="bg-background rounded-lg border border-border p-3 flex flex-col gap-3 shadow-sm">
                  <div className="flex items-center justify-between bg-muted/50 p-2 rounded">
                    <h4 className="font-semibold text-sm text-foreground">{group.name}</h4>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setDismissedGroups(prev => [...prev, group.name]);
                        toast.success(`Dismissed ${group.name} from duplicate checks.`);
                        setSuccessMsg(`Dismissed ${group.name}.`);
                        setTimeout(() => setSuccessMsg(""), 3000);
                      }}
                    >
                      <X className="w-3 h-3 mr-1" />
                      Dismiss Group
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {group.users.map((u) => (
                      <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted/20 rounded-md border border-border/50 gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate text-primary">{u.email}</div>
                          <div className="text-xs text-foreground/60 truncate mt-1">ID: {u.id} • Username: {u.username}</div>
                          <div className="text-xs text-foreground/60">Joined: {new Date(u.date_joined).toLocaleDateString()}</div>
                        </div>
                        <Button
                          size="sm"
                          variant="default"
                          disabled={merging}
                          className="w-full sm:w-auto shrink-0 shadow-sm"
                          onClick={() => {
                            const duplicateIds = group.users.filter(x => x.id !== u.id).map(x => x.id);
                            handleMerge(u.id, duplicateIds, group.name);
                          }}
                        >
                          Keep as Primary
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
