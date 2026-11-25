import React, { useState, useEffect, useRef } from "react";
import { FaPlay, FaPause, FaClock, FaRedoAlt } from "react-icons/fa";

export default function SessionTimer({ courseSlug, compact = false }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [targetMinutes, setTargetMinutes] = useState(60);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  const timerRef = useRef(null);
  const lastSyncRef = useRef(Date.now());

  // Fetch initial state
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;
        
        const res = await fetch(`/api/courses/${courseSlug}/session/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setElapsedSeconds(data.elapsed_seconds || 0);
          setIsActive(data.is_active || false);
          setTargetMinutes(data.target_minutes || 60);
        }
      } catch (err) {
        console.error("Failed to fetch study session:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSession();
  }, [courseSlug]);

  // Sync to backend function
  const syncSession = async (action, currentElapsed, customTarget) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      
      await fetch(`/api/courses/${courseSlug}/session/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action,
          elapsed_seconds: currentElapsed,
          target_minutes: customTarget || targetMinutes,
        })
      });
      lastSyncRef.current = Date.now();
    } catch (err) {
      console.error("Failed to sync session:", err);
    }
  };

  // Run the local timer
  useEffect(() => {
    if (isActive && !loading) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          const newElapsed = prev + 1;
          // Background sync every 30 seconds
          if (Date.now() - lastSyncRef.current > 30000) {
            syncSession("ping", newElapsed);
          }
          return newElapsed;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, loading]);

  const toggleTimer = () => {
    const newActiveState = !isActive;
    setIsActive(newActiveState);
    syncSession(newActiveState ? "start" : "pause", elapsedSeconds);
  };

  const handleReset = () => {
    setIsActive(false);
    setElapsedSeconds(0);
    syncSession("reset", 0);
  };

  const handleSetTarget = (mins) => {
    setTargetMinutes(mins);
    setShowSettings(false);
    syncSession("set_target", elapsedSeconds, mins);
  };

  // Formatting for clock
  const remainingSeconds = Math.max(0, (targetMinutes * 60) - elapsedSeconds);
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;
  
  const displayTime = hours > 0 
    ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  if (loading) return null;

  return (
    <div
      className={`relative inline-flex items-center shrink-0 whitespace-nowrap ${
        compact
          ? "gap-1 bg-background/80 border border-border/80 rounded-md px-1.5 py-0.5 text-[11px]"
          : "gap-1.5 bg-background/80 border border-border/80 rounded-lg px-2.5 py-1 text-xs font-['Inter',sans-serif]"
      }`}
      title="Session Time"
    >
      <div className="flex items-center gap-1">
        <FaClock className={`w-3 h-3 ${isActive ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
        {!compact && (
          <span className="font-semibold text-[11px] text-foreground/70 hidden xl:inline">Session Time</span>
        )}
      </div>

      <span className={`font-mono font-bold tracking-wider ${compact ? "text-[11px]" : "text-xs"} ${isActive ? "text-primary" : "text-foreground"}`}>
        {displayTime}
      </span>

      <div className={`flex items-center shrink-0 ${compact ? "gap-0.5" : "gap-1 ml-1"}`}>
        <button 
          type="button"
          onClick={toggleTimer}
          className={`p-1 rounded transition-colors ${
            isActive 
              ? "text-amber-500 hover:bg-amber-500/10" 
              : "text-primary hover:bg-primary/10"
          }`}
          title={isActive ? "Pause Session" : "Start Session"}
        >
          {isActive ? <FaPause size={10} /> : <FaPlay size={10} />}
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Reset Timer"
        >
          <FaRedoAlt size={10} />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="px-1 py-0.5 text-[10px] font-bold text-muted-foreground hover:text-primary rounded border border-border/60 hover:bg-muted transition-colors"
            title="Set Target Duration"
          >
            {targetMinutes}m
          </button>

          {showSettings && (
            <div className="absolute right-0 top-full mt-1.5 z-50 bg-card border border-border rounded-lg shadow-xl p-2 w-28 space-y-1 animate-in zoom-in-95 duration-150">
              <span className="text-[10px] font-bold text-muted-foreground block border-b border-border pb-1 mb-1">Set Target</span>
              {[15, 30, 45, 60, 90, 120].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleSetTarget(m)}
                  className={`w-full text-left text-[11px] px-2 py-1 rounded transition-colors ${targetMinutes === m ? "bg-primary text-primary-foreground font-bold" : "hover:bg-muted text-foreground"}`}
                >
                  {m} mins
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

