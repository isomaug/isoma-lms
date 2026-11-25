import { useState, useEffect } from "react";
import { FaUsers, FaExchangeAlt, FaRobot, FaBolt, FaKey, FaRandom } from "react-icons/fa";
import { toast } from "sonner";
import { apiFetch } from "@/api/client/apiClient";

export default function TeamSessionManager({ lessonId, courseData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pairingData, setPairingData] = useState(null);
  const [pendingRequest, setPendingRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [requestingChange, setRequestingChange] = useState(false);
  
  // Unpaired matchmaking state
  const [matchTab, setMatchTab] = useState("quick"); // "quick" | "code"
  const [codeInputValue, setCodeInputValue] = useState("");
  const [generatedCode, setGeneratedCode] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPairing = async () => {
    if (!lessonId) return;
    setLoading(true);
    try {
      const data = await apiFetch(`/api/courses/lessons/${lessonId}/partner/`);
      if (data.has_partner) {
        setPairingData(data);
        setPendingRequest(null);
      } else {
        setPairingData(null);
        setPendingRequest(data.pending_request || null);
        if (data.pending_request?.pair_code) {
          setGeneratedCode(data.pending_request.pair_code);
        }
      }
    } catch (error) {
      console.error("Failed to fetch pairing:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (lessonId) {
      fetchPairing();
    }
  }, [lessonId]);

  const handleSwapRoles = async () => {
    setSwapping(true);
    try {
      await apiFetch(`/api/courses/lessons/${lessonId}/swap-roles/`, { method: "POST" });
      await fetchPairing();
      toast.success("Roles swapped!");
    } catch (error) {
      console.error("Failed to swap roles:", error);
      toast.error("Failed to swap roles.");
    } finally {
      setSwapping(false);
    }
  };

  const handleRequestPartnerChange = async () => {
    if (!window.confirm("Request a change of partner? Your teacher will review and approve the change.")) return;
    setRequestingChange(true);
    try {
      const res = await apiFetch(`/api/courses/lessons/${lessonId}/request-change-partner/`, { method: "POST" });
      toast.success(res.message || "Partner change requested. Waiting for teacher approval.");
      await fetchPairing();
    } catch (error) {
      console.error("Failed to request partner change:", error);
      toast.error(error.message || "Failed to request partner change.");
    } finally {
      setRequestingChange(false);
    }
  };

  const handleCancelPartnerChange = async () => {
    setRequestingChange(true);
    try {
      await apiFetch(`/api/courses/lessons/${lessonId}/cancel-change-partner/`, { method: "POST" });
      toast.info("Partner change request cancelled.");
      await fetchPairing();
    } catch (error) {
      toast.error("Failed to cancel request.");
    } finally {
      setRequestingChange(false);
    }
  };

  const handleQuickMatch = async (action = "join") => {
    setActionLoading(true);
    try {
      const res = await apiFetch(`/api/courses/lessons/${lessonId}/pair/match/`, {
        method: "POST",
        body: JSON.stringify({ action }),
      });
      if (res.matched) {
        toast.success(`Matched with ${res.partner_name}!`);
      } else if (res.waiting) {
        toast.info(res.message || "Looking for an available classmate...");
      } else if (res.cancelled) {
        toast.info("Quick match cancelled.");
      }
      await fetchPairing();
    } catch (error) {
      toast.error(error.message || "Quick match failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    setActionLoading(true);
    try {
      const res = await apiFetch(`/api/courses/lessons/${lessonId}/pair/code/`, {
        method: "POST",
        body: JSON.stringify({ action: "generate" }),
      });
      setGeneratedCode(res.code);
      toast.success(`Pair code generated: ${res.code}`);
      await fetchPairing();
    } catch (error) {
      toast.error(error.message || "Failed to generate code.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinByCode = async (e) => {
    e.preventDefault();
    if (!codeInputValue.trim()) return;
    setActionLoading(true);
    try {
      const res = await apiFetch(`/api/courses/lessons/${lessonId}/pair/code/`, {
        method: "POST",
        body: JSON.stringify({ action: "join", code: codeInputValue.trim() }),
      });
      if (res.matched) {
        toast.success(`Paired with ${res.partner_name}!`);
        setCodeInputValue("");
      }
      await fetchPairing();
    } catch (error) {
      toast.error(error.message || "Invalid pair code.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelPending = async () => {
    setActionLoading(true);
    try {
      await apiFetch(`/api/courses/lessons/${lessonId}/pair/code/`, {
        method: "POST",
        body: JSON.stringify({ action: "cancel" }),
      });
      setGeneratedCode(null);
      setPendingRequest(null);
      toast.info("Matching request cancelled.");
      await fetchPairing();
    } catch (error) {
      toast.error("Failed to cancel request.");
    } finally {
      setActionLoading(false);
    }
  };

  // Button is clickable if they have a pairing OR the teacher allowed self pairing
  const isClickable = Boolean(pairingData || courseData?.allow_self_pairing);

  return (
    <>
      <button
        onClick={() => {
          if (isClickable) {
            setIsOpen(true);
            fetchPairing();
          }
        }}
        disabled={!isClickable}
        title={!isClickable ? "Your instructor has not enabled team sessions for this lesson" : "Open Team Session"}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs sm:text-sm font-semibold shrink-0 transition-colors ${
          isClickable 
            ? "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20" 
            : "bg-muted text-muted-foreground border-border cursor-not-allowed opacity-70"
        }`}
      >
        <FaUsers />
        {pairingData ? (
          <span className="hidden sm:inline">
            <span className={pairingData.current_driver_id !== pairingData.partner_id ? "font-bold" : ""}>
              {pairingData.current_driver_id === pairingData.partner_id ? pairingData.partner_name : "You"} (Driver)
            </span>
            <span className="mx-1.5 opacity-50">/</span>
            <span className={pairingData.current_driver_id !== pairingData.partner_id ? "font-bold" : ""}>
              {pairingData.current_driver_id !== pairingData.partner_id ? pairingData.partner_name : "You"} (Navigator)
            </span>
          </span>
        ) : (
          <span className="hidden sm:inline">Team Session</span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-border flex justify-between items-center bg-muted/30">
              <div className="flex items-center gap-3 text-primary">
                <FaRobot size={24} />
                <h3 className="font-bold text-lg text-foreground">AI Robotics Pair Programming</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center p-8">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : pairingData ? (
                <div className="space-y-5">
                  {/* Collaboration Bonus Pill */}
                  <div className="flex items-center justify-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                      <FaBolt className="text-[11px]" />
                      +20% Collaboration XP Bonus Active
                    </span>
                  </div>

                  {/* Partner info card */}
                  <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                      {pairingData.partner_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Your Partner</p>
                      <p className="font-bold text-foreground text-base">{pairingData.partner_name}</p>
                    </div>
                  </div>
                  
                  {/* Roles */}
                  <div className="bg-muted/50 p-4 rounded-xl border border-border">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 text-center">
                      Current Roles
                    </p>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 text-center bg-background p-3 rounded-lg border border-border">
                        <span className="block text-xs text-muted-foreground mb-1">Driver</span>
                        <span className="font-semibold text-sm">
                          {pairingData.current_driver_id === pairingData.partner_id ? pairingData.partner_name : "You"}
                        </span>
                      </div>
                      <div className="flex-1 text-center bg-background p-3 rounded-lg border border-border">
                        <span className="block text-xs text-muted-foreground mb-1">Navigator</span>
                        <span className="font-semibold text-sm">
                          {pairingData.current_driver_id !== pairingData.partner_id ? pairingData.partner_name : "You"}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Swap button */}
                  <button
                    onClick={handleSwapRoles}
                    disabled={swapping}
                    className="w-full flex items-center justify-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                  >
                    {swapping ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <FaExchangeAlt />
                        Swap Roles
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-muted-foreground text-center">
                    The Driver controls keyboard/mouse. The Navigator plans and reviews.
                  </p>

                  {/* Partner Change Section */}
                  <div className="pt-2 border-t border-border/60">
                    {pairingData.change_status === "pending" ? (
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center space-y-1.5">
                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                          Partner change requested - waiting for teacher approval
                        </p>
                        {pairingData.change_requested_by_me && (
                          <button
                            onClick={handleCancelPartnerChange}
                            disabled={requestingChange}
                            className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
                          >
                            Cancel request
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={handleRequestPartnerChange}
                        disabled={requestingChange}
                        className="w-full text-xs text-muted-foreground hover:text-destructive py-2 px-3 rounded-lg border border-transparent hover:border-border transition-colors flex items-center justify-center gap-1.5"
                      >
                        Request change of partner
                      </button>
                    )}
                  </div>
                </div>
              ) : courseData?.allow_self_pairing ? (
                /* Unpaired with self-pairing allowed */
                <div className="space-y-4">
                  <div className="text-center pb-2">
                    <h4 className="font-bold text-foreground text-base">Find a Coding Partner</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Collaborate and earn +20% bonus XP on quizzes together!
                    </p>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-border text-sm">
                    <button
                      onClick={() => setMatchTab("quick")}
                      className={`flex-1 py-2 font-medium text-center border-b-2 transition-colors ${
                        matchTab === "quick"
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <FaRandom className="text-xs" /> Quick Match
                      </span>
                    </button>
                    <button
                      onClick={() => setMatchTab("code")}
                      className={`flex-1 py-2 font-medium text-center border-b-2 transition-colors ${
                        matchTab === "code"
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <FaKey className="text-xs" /> Pair Code
                      </span>
                    </button>
                  </div>

                  {matchTab === "quick" ? (
                    <div className="space-y-4 pt-2">
                      {pendingRequest?.is_open_match ? (
                        <div className="text-center py-4 bg-muted/40 rounded-xl border border-border p-4 space-y-3">
                          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                          <p className="text-sm font-semibold">Waiting for a classmate to match...</p>
                          <p className="text-xs text-muted-foreground">
                            When another classmate clicks Quick Match, you'll be paired automatically.
                          </p>
                          <button
                            onClick={() => handleQuickMatch("cancel")}
                            disabled={actionLoading}
                            className="text-xs text-destructive hover:underline"
                          >
                            Cancel queue
                          </button>
                        </div>
                      ) : (
                        <div className="text-center space-y-3 py-2">
                          <p className="text-xs text-muted-foreground">
                            Instantly match with any available classmate ready to work on this lesson.
                          </p>
                          <button
                            onClick={() => handleQuickMatch("join")}
                            disabled={actionLoading}
                            className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                          >
                            {actionLoading ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <>
                                <FaRandom /> Find Classmate Now
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Pair Code Tab */
                    <div className="space-y-4 pt-2">
                      {/* Join with code */}
                      <form onSubmit={handleJoinByCode} className="space-y-2">
                        <label className="block text-xs font-semibold text-muted-foreground">
                          Enter 4-Digit Code from Classmate:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="e.g. 4812"
                            value={codeInputValue}
                            onChange={(e) => setCodeInputValue(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm text-center font-mono font-bold tracking-widest uppercase focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                          <button
                            type="submit"
                            disabled={actionLoading || !codeInputValue.trim()}
                            className="px-4 py-2 bg-secondary text-secondary-foreground font-semibold rounded-lg text-sm hover:bg-secondary/90 transition-colors disabled:opacity-50"
                          >
                            Join
                          </button>
                        </div>
                      </form>

                      <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-border"></div>
                        <span className="flex-shrink mx-3 text-[11px] text-muted-foreground">OR</span>
                        <div className="flex-grow border-t border-border"></div>
                      </div>

                      {/* Generate code */}
                      {generatedCode ? (
                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center space-y-2">
                          <p className="text-xs text-muted-foreground">Share this code with your classmate:</p>
                          <div className="text-2xl font-mono font-extrabold text-primary tracking-widest select-all">
                            {generatedCode}
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            Waiting for your classmate to enter this code...
                          </p>
                          <button
                            onClick={handleCancelPending}
                            disabled={actionLoading}
                            className="text-xs text-destructive hover:underline pt-1 block mx-auto"
                          >
                            Cancel Code
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={handleGenerateCode}
                          disabled={actionLoading}
                          className="w-full py-2.5 border border-dashed border-border hover:border-primary/50 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                        >
                          + Generate 4-Digit Code to Share
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Unpaired without self-pairing allowed */
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                    <FaUsers size={28} />
                  </div>
                  <h4 className="font-bold text-foreground mb-2">No Active Team Session</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    You have not been paired with a partner for this lesson yet. Please wait for your instructor to assign a partner.
                  </p>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Got it
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
