import { useState } from "react";
import { Flame, Trophy, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useStreak } from "@/hooks/use-streak";

function getTodayLocalDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Returns the last 7 dates as YYYY-MM-DD strings (oldest → newest).
 */
function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    days.push(`${y}-${m}-${day}`);
  }
  return days;
}

/**
 * Given the current streak and lastActivityDate, returns which of the last 7
 * days were "active" by back-projecting from lastActivityDate.
 */
function getActiveDays(
  currentStreak: number,
  lastActivityDate: string | null
): Set<string> {
  const active = new Set<string>();
  if (!lastActivityDate || currentStreak === 0) return active;

  const today = getTodayLocalDate();
  // If streak is broken (last activity was 2+ days ago), show nothing
  const lastDate = new Date(lastActivityDate).getTime();
  const todayDate = new Date(today).getTime();
  const diff = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24));
  if (diff > 1) return active;

  // Back-project the streak (capped at 7 days)
  const streakToShow = Math.min(currentStreak, 7);
  for (let i = 0; i < streakToShow; i++) {
    const d = new Date(lastDate - i * 24 * 60 * 60 * 1000);
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    active.add(`${y}-${mo}-${day}`);
  }
  return active;
}

const DAY_ABBR = ["D", "S", "T", "Q", "Q", "S", "S"];

export function StreakBadge() {
  const { currentStreak, longestStreak, lastActivityDate, isLoading } =
    useStreak();
  const [open, setOpen] = useState(false);

  const today = getTodayLocalDate();
  const last7 = getLast7Days();
  const activeDays = getActiveDays(currentStreak, lastActivityDate);
  const activeToday = lastActivityDate === today;

  if (isLoading) return null;

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        title={`Streak: ${currentStreak} dias`}
        className="cursor-pointer flex items-center gap-1.5 rounded-lg p-2.5 bg-background/50 border border-white/10 text-white/70 transition-colors hover:bg-primary/10 hover:text-white group"
      >
        <Flame
          className={`w-4 h-4 transition-colors ${
            activeToday
              ? "text-orange-400 drop-shadow-[0_0_6px_rgba(251,146,60,0.8)]"
              : "text-white/40"
          }`}
        />
        <span
          className={`text-sm font-bold tabular-nums leading-none ${
            activeToday ? "text-orange-300" : "text-white/50"
          }`}
        >
          {currentStreak}
        </span>
      </button>

      {/* Popover */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[100]"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute top-full right-0 mt-2 z-[101] w-64 rounded-xl border backdrop-blur-xl shadow-2xl overflow-hidden"
              style={{
                backgroundColor: "rgba(15, 15, 30, 0.95)",
                borderColor: "rgba(255,255,255,0.1)",
                boxShadow:
                  "0 0 30px rgba(251,146,60,0.15), 0 10px 40px rgba(0,0,0,0.5)"
              }}
            >
              {/* Header */}
              <div className="px-4 pt-4 pb-3 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame
                      className={`w-5 h-5 ${
                        activeToday ? "text-orange-400" : "text-white/30"
                      }`}
                    />
                    <span className="text-white font-bold text-lg leading-none">
                      {currentStreak}
                      <span className="text-white/40 text-sm font-normal ml-1">
                        {currentStreak === 1 ? "dia" : "dias"}
                      </span>
                    </span>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="p-1 rounded text-white/30 hover:text-white/70 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-white/40 text-xs mt-1">
                  {activeToday
                    ? "Você foi ativo hoje! 🔥"
                    : currentStreak > 0
                    ? "Mantenha sua sequência hoje!"
                    : "Comece sua sequência hoje!"}
                </p>
              </div>

              {/* Mini calendar — last 7 days */}
              <div className="px-4 py-3">
                <p className="text-white/30 text-[10px] uppercase tracking-wider mb-2">
                  Últimos 7 dias
                </p>
                <div className="grid grid-cols-7 gap-1">
                  {last7.map((date) => {
                    const isActive = activeDays.has(date);
                    const isToday = date === today;
                    const dayOfWeek = new Date(date).getDay();
                    return (
                      <div key={date} className="flex flex-col items-center gap-1">
                        <span className="text-[9px] text-white/25">
                          {DAY_ABBR[dayOfWeek]}
                        </span>
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                            isActive
                              ? "bg-orange-500/30 border border-orange-400/60 shadow-[0_0_8px_rgba(251,146,60,0.4)]"
                              : isToday
                              ? "border border-white/20 bg-white/5"
                              : "bg-white/5 border border-white/5"
                          }`}
                        >
                          {isActive ? (
                            <Flame className="w-3.5 h-3.5 text-orange-400" />
                          ) : (
                            <span className="text-[10px] text-white/20">
                              {new Date(date).getDate()}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Record */}
              <div className="px-4 pb-4">
                <div
                  className="flex items-center justify-between rounded-lg px-3 py-2"
                  style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                >
                  <div className="flex items-center gap-2">
                    <Trophy className="w-3.5 h-3.5 text-yellow-400/70" />
                    <span className="text-white/40 text-xs">Recorde</span>
                  </div>
                  <span className="text-yellow-300/80 text-sm font-bold tabular-nums">
                    {longestStreak} {longestStreak === 1 ? "dia" : "dias"}
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
