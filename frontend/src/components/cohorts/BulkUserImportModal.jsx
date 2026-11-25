import { useState, useRef } from "react";
import { apiFetch } from "@/api/client/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function BulkUserImportModal({ onClose, onSuccess }) {
  const [csvFile, setCsvFile] = useState(null);
  const [defaultPassword, setDefaultPassword] = useState("");
  const [forceReset, setForceReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef(null);

  const handleImport = async () => {
    if (!csvFile) return toast.error("Please select a CSV file.");
    if (!defaultPassword) return toast.error("Please set a default password.");

    setLoading(true);
    setProgress(0);
    const form = new FormData();
    form.append("csv_file", csvFile);
    form.append("default_password", defaultPassword);
    form.append("force_password_reset", forceReset ? "true" : "false");

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.floor(Math.random() * 10) + 1;
      });
    }, 200);

    try {
      const res = await apiFetch("/api/admin/users/bulk-import/", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      clearInterval(progressInterval);
      if (res.ok) {
        setProgress(100);
        setTimeout(() => {
          setResult(data);
          onSuccess?.();
          toast.success(`${data.created} users created, ${data.skipped} skipped.`);
        }, 500);
      } else {
        setProgress(0);
        toast.error(data.error || "Import failed.");
      }
    } catch {
      clearInterval(progressInterval);
      setProgress(0);
      toast.error("Import failed.");
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h3 className="font-bold text-lg">Bulk Import Users</h3>
            <p className="text-muted-foreground text-xs mt-0.5">
              CSV columns mapping (strict indices): <br />
              <code className="bg-muted px-1 rounded block mt-1">B: Full Name, C: First, D: Last, E: Middle, F: Email, H: Class/Stream, I: Gender</code>
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {!result ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">CSV File</label>
                <div
                  className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center gap-2 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {csvFile ? csvFile.name : "Click to upload CSV"}
                  </span>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => setCsvFile(e.target.files[0])}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Default Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={defaultPassword}
                    onChange={(e) => setDefaultPassword(e.target.value)}
                    placeholder="Set a password for all new users"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div
                  className={`w-10 h-6 rounded-full transition-colors relative ${forceReset ? "bg-primary" : "bg-muted"}`}
                  onClick={() => setForceReset(!forceReset)}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${forceReset ? "translate-x-4" : ""}`}
                  />
                </div>
                <span className="text-sm font-medium">Force password reset on first login</span>
              </label>

              <div className="flex items-start gap-2 bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-700 rounded-lg p-3 shadow-none">
                <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900 dark:text-amber-100 font-medium">
                  Users with existing emails will be skipped. Usernames are auto-generated from email if not provided.
                </p>
              </div>

              {loading && progress > 0 && (
                <div className="w-full bg-muted rounded-full h-2 mt-2 overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-300 ease-out" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
              
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleImport} disabled={loading}>
                  {loading ? `Importing... ${progress}%` : "Import Users"}
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">{result.created}</p>
                  <p className="text-xs text-green-600 dark:text-green-500">Created</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{result.skipped}</p>
                  <p className="text-xs text-amber-600 dark:text-amber-500">Skipped</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-red-700 dark:text-red-400">{result.errors}</p>
                  <p className="text-xs text-red-600 dark:text-red-500">Errors</p>
                </div>
              </div>
              {result.skipped_users?.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  <p className="font-semibold mb-1">Skipped emails:</p>
                  <div className="max-h-24 overflow-y-auto space-y-0.5">
                    {result.skipped_users.map((u, i) => (
                      <p key={i}>
                        {u.email} - {u.reason}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {result.error_details?.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  <p className="font-semibold mb-1">Errors:</p>
                  <div className="max-h-24 overflow-y-auto space-y-0.5">
                    {result.error_details.map((e, i) => (
                      <p key={i}>Row {e.row}: {e.reason}</p>
                    ))}
                  </div>
                </div>
              )}
              <Button className="w-full" onClick={onClose}>
                Done
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
