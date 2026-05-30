import { motion, AnimatePresence } from "motion/react";
import { X, Wrench, Sparkles, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChangelogEntry } from "@/data/changelog";

interface WhatsNewModalProps {
  open: boolean;
  entry: ChangelogEntry | null;
  onClose: () => void;
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  items: string[];
  color: string;
  dotColor: string;
}

function Section({ title, icon, items, color, dotColor }: SectionProps) {
  if (!items.length) return null;

  return (
    <div className="space-y-2">
      <div className={`flex items-center gap-2 text-sm font-semibold ${color}`}>
        {icon}
        {title}
      </div>
      <ul className="space-y-1.5 pl-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-white/70">
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function WhatsNewModal({ open, entry, onClose }: WhatsNewModalProps) {
  if (!entry) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed z-[201] inset-0 flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            <div
              className="pointer-events-auto w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
              style={{ background: "rgba(15, 15, 30, 0.97)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative px-6 pt-6 pb-4">
                {/* Glow */}
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse at top, #6A30FF 0%, transparent 60%)"
                  }}
                />

                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3 relative">
                  <div className="p-2.5 rounded-xl bg-primary/20 border border-primary/30">
                    <Star className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 font-medium uppercase tracking-widest">
                      What's New
                    </p>
                    <h2 className="text-lg font-bold text-white">
                      Version {entry.version}
                    </h2>
                  </div>
                  <span className="ml-auto text-xs text-white/30">{entry.date}</span>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-white/10 mx-6" />

              {/* Content */}
              <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto scrollbar-none">
                <Section
                  title="New Features"
                  icon={<Sparkles className="w-4 h-4" />}
                  items={entry.features ?? []}
                  color="text-[#B57CFF]"
                  dotColor="bg-[#B57CFF]"
                />
                <Section
                  title="Bug Fixes"
                  icon={<Wrench className="w-4 h-4" />}
                  items={entry.fixes ?? []}
                  color="text-[#22C55E]"
                  dotColor="bg-[#22C55E]"
                />
                <Section
                  title="Removed"
                  icon={<Trash2 className="w-4 h-4" />}
                  items={entry.removed ?? []}
                  color="text-white/40"
                  dotColor="bg-white/30"
                />
              </div>

              {/* Footer */}
              <div className="px-6 pb-5">
                <Button
                  onClick={onClose}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-medium"
                >
                  Got it!
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
