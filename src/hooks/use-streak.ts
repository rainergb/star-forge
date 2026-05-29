import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { streakService } from "@/services/supabase/streak.service";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getTodayLocalDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA).getTime();
  const b = new Date(dateB).getTime();
  return Math.round(Math.abs(b - a) / (1000 * 60 * 60 * 24));
}

// ─── Module-level emitter (decoupled from React tree) ────────────────────────

type ActivityListener = () => void;
let _listeners: ActivityListener[] = [];

/** Call this anywhere in the app to record user activity for streak purposes. */
export function recordUserActivity() {
  _listeners.forEach((fn) => fn());
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  isLoading: boolean;
}

export function useStreak() {
  const { user, isGuest } = useAuth();
  const [state, setState] = useState<StreakState>({
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    isLoading: true
  });

  // Keep a mutable ref so the activity handler always sees fresh state
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ── Load streak from Supabase on mount ──────────────────────────────────────
  useEffect(() => {
    if (isGuest || !user?.id) {
      // Guest: load from localStorage
      const raw = localStorage.getItem("star-habit-streak");
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Partial<StreakState>;
          setState({
            currentStreak: parsed.currentStreak ?? 0,
            longestStreak: parsed.longestStreak ?? 0,
            lastActivityDate: parsed.lastActivityDate ?? null,
            isLoading: false
          });
          return;
        } catch {
          // ignore
        }
      }
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }

    streakService
      .getStreak(user.id)
      .then((row) => {
        if (row) {
          setState({
            currentStreak: row.current_streak,
            longestStreak: row.longest_streak,
            lastActivityDate: row.last_activity_date,
            isLoading: false
          });
        } else {
          setState((s) => ({ ...s, isLoading: false }));
        }
      })
      .catch(() => {
        setState((s) => ({ ...s, isLoading: false }));
      });
  }, [user?.id, isGuest]);

  // ── Handle activity ─────────────────────────────────────────────────────────
  const handleActivity = useCallback(() => {
    const today = getTodayLocalDate();
    const { lastActivityDate, currentStreak, longestStreak } = stateRef.current;

    // Already logged today — no change needed
    if (lastActivityDate === today) return;

    let newStreak: number;
    if (!lastActivityDate) {
      newStreak = 1;
    } else {
      const diff = daysBetween(lastActivityDate, today);
      // Yesterday: continue streak; 2+ days gap: restart
      newStreak = diff === 1 ? currentStreak + 1 : 1;
    }

    const newLongest = Math.max(longestStreak, newStreak);

    const newState: StreakState = {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActivityDate: today,
      isLoading: false
    };
    setState(newState);
    stateRef.current = newState;

    // Persist
    if (isGuest || !user?.id) {
      localStorage.setItem("star-habit-streak", JSON.stringify(newState));
    } else {
      streakService
        .upsertStreak(user.id, {
          current_streak: newStreak,
          longest_streak: newLongest,
          last_activity_date: today
        })
        .catch(() => {
          // Silently fail — UI already updated optimistically
        });
    }
  }, [user?.id, isGuest]);

  // ── Subscribe to module-level emitter ──────────────────────────────────────
  useEffect(() => {
    _listeners.push(handleActivity);
    return () => {
      _listeners = _listeners.filter((fn) => fn !== handleActivity);
    };
  }, [handleActivity]);

  return state;
}
