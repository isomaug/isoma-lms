let audioContext;

function getAudioContext() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  audioContext ||= new AudioContext();
  return audioContext;
}

function tone(context, start, frequency, duration, gainValue) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

export async function playNotificationSound(volume = 35, urgent = false) {
  const context = getAudioContext();
  if (!context) return false;

  try {
    if (context.state === "suspended") await context.resume();
    const level = Math.max(0, Math.min(100, volume)) / 100;
    const start = context.currentTime + 0.02;
    tone(context, start, urgent ? 587.33 : 523.25, 0.22, 0.12 * level);
    tone(context, start + 0.13, urgent ? 880 : 659.25, 0.32, 0.1 * level);
    return true;
  } catch {
    return false;
  }
}

export function isQuietHours(preferences, now = new Date()) {
  if (!preferences?.quiet_hours_enabled) return false;
  const toMinutes = (value) => {
    const [hours, minutes] = String(value || "").split(":").map(Number);
    return hours * 60 + minutes;
  };
  const current = now.getHours() * 60 + now.getMinutes();
  const start = toMinutes(preferences.quiet_hours_start);
  const end = toMinutes(preferences.quiet_hours_end);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start === end) {
    return false;
  }
  return start < end
    ? current >= start && current < end
    : current >= start || current < end;
}
