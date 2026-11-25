/**
 * Client-side console & inspect lock.
 * Default is strictly locked for all visitors (even if DevTools is opened via browser menu).
 * Secret developer shortcut: Ctrl + Alt + Shift + D toggles Developer Mode on/off.
 */
import { customToast } from "../components/notifications/GlobalPopup";

const BYPASS_KEY = "dev_bypass";
const MAX_BUFFER = 300;
const logBuffer = [];

const nativeConsole =
  typeof console !== "undefined"
    ? {
        log: console.log.bind(console),
        info: console.info.bind(console),
        debug: console.debug.bind(console),
        warn: console.warn.bind(console),
        error: console.error.bind(console),
        table: console.table ? console.table.bind(console) : console.log.bind(console),
        dir: console.dir ? console.dir.bind(console) : console.log.bind(console),
        trace: console.trace ? console.trace.bind(console) : console.log.bind(console),
        clear: console.clear ? console.clear.bind(console) : () => {},
      }
    : null;

export function isInspectUnlocked() {
  try {
    return sessionStorage.getItem(BYPASS_KEY) === "true";
  } catch {
    return false;
  }
}

function pushToBuffer(method, args) {
  if (logBuffer.length >= MAX_BUFFER) {
    logBuffer.shift();
  }
  logBuffer.push({ method, args, time: new Date().toISOString().slice(11, 23) });
}

function flushBufferToNativeConsole() {
  if (!nativeConsole) return;
  nativeConsole.info(
    "%c[Developer Mode Unlocked] Replaying buffered session logs...",
    "color: #10b981; font-weight: bold;"
  );
  while (logBuffer.length > 0) {
    const entry = logBuffer.shift();
    const fn = nativeConsole[entry.method] || nativeConsole.log;
    try {
      fn(`[${entry.time}]`, ...entry.args);
    } catch {
      /* ignore */
    }
  }
}

export function applyConsoleLockState() {
  if (!nativeConsole) return;
  if (isInspectUnlocked()) {
    flushBufferToNativeConsole();
  } else {
    try {
      nativeConsole.clear();
    } catch {
      /* ignore */
    }
  }
}

export function installConsoleGate() {
  if (typeof window === "undefined" || !nativeConsole || window.__ekebuConsoleGateInstalled) {
    return;
  }
  window.__ekebuConsoleGateInstalled = true;

  ["log", "info", "debug", "warn", "error", "table", "dir", "trace"].forEach((method) => {
    console[method] = (...args) => {
      if (isInspectUnlocked()) {
        return nativeConsole[method](...args);
      }
      pushToBuffer(method, args);
    };
  });

  applyConsoleLockState();
}

function setInspectUnlocked(on) {
  try {
    if (on) sessionStorage.setItem(BYPASS_KEY, "true");
    else sessionStorage.removeItem(BYPASS_KEY);
  } catch {
    /* ignore */
  }
  applyConsoleLockState();
}

function isInspectUnlockCombo(e) {
  return Boolean(e.ctrlKey && e.altKey && e.shiftKey && (e.key === "D" || e.key === "d" || e.code === "KeyD"));
}

function isBlockedInspectShortcut(e) {
  if (isInspectUnlockCombo(e)) return false;
  if (e.key === "F12" || e.keyCode === 123) return true;
  if (e.ctrlKey && e.shiftKey && ["I", "i", "J", "j", "C", "c", "K", "k", "E", "e", "S", "s"].includes(e.key)) {
    return true;
  }
  if (e.ctrlKey && !e.shiftKey && !e.altKey && (e.key === "U" || e.key === "u")) return true;
  if (e.metaKey && e.altKey && ["i", "I", "j", "J", "c", "C", "u", "U", "k", "K"].includes(e.key)) {
    return true;
  }
  return false;
}

export function enableSecurityDeterrents() {
  if (typeof window === "undefined") return;

  installConsoleGate();
  applyConsoleLockState();

  if (window.__ekebuSecurityListenersInstalled) return;
  window.__ekebuSecurityListenersInstalled = true;

  window.addEventListener(
    "keydown",
    (e) => {
      if (isInspectUnlockCombo(e)) {
        e.preventDefault();
        e.stopPropagation();
        const next = !isInspectUnlocked();
        setInspectUnlocked(next);
        try {
          customToast.info(
            next
              ? "Developer console unlocked (Ctrl+Alt+Shift+D to lock)"
              : "Developer console locked"
          );
        } catch {
          /* ignore */
        }
        return;
      }
      if (isInspectUnlocked()) return;
      if (isBlockedInspectShortcut(e)) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true,
  );

  document.addEventListener(
    "contextmenu",
    (e) => {
      if (isInspectUnlocked()) return;
      e.preventDefault();
    },
    true,
  );

  const wipeIfLocked = () => {
    if (!isInspectUnlocked() && nativeConsole) {
      try {
        nativeConsole.clear();
      } catch {
        /* ignore */
      }
    }
  };

  window.addEventListener("resize", wipeIfLocked);
  window.addEventListener("focus", wipeIfLocked);
  window.setInterval(wipeIfLocked, 2000);
}
