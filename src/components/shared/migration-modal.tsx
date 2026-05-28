import { Database, CheckCircle2, AlertTriangle, Loader2, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MigrationSummary, MigrationStatus } from "@/hooks/use-migration";

interface MigrationModalProps {
  open: boolean;
  status: MigrationStatus;
  summary: MigrationSummary | null;
  errorMsg: string | null;
  onMigrate: () => void;
  onSkip: () => void;
  onDismiss: () => void;
}

interface SummaryRow {
  label: string;
  count: number;
  emoji: string;
}

export function MigrationModal({
  open,
  status,
  summary,
  errorMsg,
  onMigrate,
  onSkip,
  onDismiss
}: MigrationModalProps) {
  if (!open) return null;

  const rows: SummaryRow[] = summary
    ? [
        { label: "Tasks", count: summary.tasks, emoji: "✅" },
        { label: "Projects", count: summary.projects, emoji: "📁" },
        { label: "Skills", count: summary.skills, emoji: "⚡" },
        { label: "Diary entries", count: summary.entries, emoji: "📝" },
        { label: "Pomodoro sessions", count: summary.sessions, emoji: "🍅" }
      ].filter((r) => r.count > 0)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header gradient line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-violet-500 via-purple-400 to-indigo-500" />

        <div className="p-6">
          {/* ── Pending / Migrating ── */}
          {(status === "pending" || status === "migrating") && (
            <>
              <div className="flex items-start gap-3 mb-5">
                <div className="p-2 rounded-lg bg-violet-500/10 shrink-0">
                  <Database className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white leading-tight">
                    Local data found
                  </h2>
                  <p className="text-sm text-white/50 mt-0.5">
                    We found data saved on this device. Migrate it to your account to access it anywhere.
                  </p>
                </div>
              </div>

              {/* Summary list */}
              <ul className="space-y-2 mb-6 bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                {rows.map((row) => (
                  <li key={row.label} className="flex items-center justify-between text-sm">
                    <span className="text-white/60 flex items-center gap-2">
                      <span>{row.emoji}</span>
                      {row.label}
                    </span>
                    <span className="font-mono text-white/90 font-medium tabular-nums">
                      {row.count.toLocaleString()}
                    </span>
                  </li>
                ))}
                <li className="flex items-center justify-between text-sm border-t border-white/[0.06] pt-2 mt-1">
                  <span className="text-white/40">Total</span>
                  <span className="font-mono text-violet-400 font-semibold tabular-nums">
                    {summary?.total.toLocaleString()}
                  </span>
                </li>
              </ul>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={onMigrate}
                  disabled={status === "migrating"}
                  className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-medium gap-2"
                >
                  {status === "migrating" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Migrating…
                    </>
                  ) : (
                    <>
                      Migrate
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
                <Button
                  onClick={onSkip}
                  disabled={status === "migrating"}
                  variant="ghost"
                  className="text-white/40 hover:text-white/70"
                >
                  Skip
                </Button>
              </div>

              <p className="text-xs text-white/25 text-center mt-3">
                Skipping will ignore this local data. This action cannot be undone.
              </p>
            </>
          )}

          {/* ── Success ── */}
          {status === "success" && (
            <div className="flex flex-col items-center text-center gap-4 py-2">
              <div className="p-3 rounded-full bg-emerald-500/10">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Migration complete!</h2>
                <p className="text-sm text-white/50 mt-1">
                  All your local data has been saved to your account. Reload the app to see everything.
                </p>
              </div>
              <Button
                onClick={() => window.location.reload()}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium gap-2"
              >
                Reload app
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* ── Error ── */}
          {status === "error" && (
            <div className="flex flex-col items-center text-center gap-4 py-2">
              <div className="p-3 rounded-full bg-red-500/10">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Migration failed</h2>
                <p className="text-sm text-white/50 mt-1">
                  {errorMsg ?? "An unexpected error occurred. Your local data was not affected."}
                </p>
              </div>
              <div className="flex gap-2 w-full">
                <Button
                  onClick={onMigrate}
                  className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-medium"
                >
                  Try again
                </Button>
                <Button onClick={onDismiss} variant="ghost" className="text-white/40 hover:text-white/70">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
