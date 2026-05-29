import { useEffect, useState } from "react";
import { X, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SkillToastData, useSkillToasts } from "@/hooks/use-skill-toasts";
import { SKILL_COLORS, MASTERY_LEVELS, MasteryLevel } from "@/types/skill.types";
import { SKILL_ICON_MAP } from "@/content/maestry/skill-icon-color-selector";
import { Brain } from "lucide-react";

import maestry1 from "@/assets/maestry/maestry1.png";
import maestry2 from "@/assets/maestry/maestry2.png";
import maestry3 from "@/assets/maestry/maestry3.png";
import maestry4 from "@/assets/maestry/maestry4.png";
import maestry5 from "@/assets/maestry/maestry5.png";
import maestry6 from "@/assets/maestry/maestry6.png";
import maestry7 from "@/assets/maestry/maestry7.png";

const MASTERY_IMAGES: Record<MasteryLevel, string> = {
  1: maestry1,
  2: maestry2,
  3: maestry3,
  4: maestry4,
  5: maestry5,
  6: maestry6,
  7: maestry7
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return remMins > 0 ? `${hours}h ${remMins}min` : `${hours}h`;
  }
  return `${mins}min`;
}

interface SkillToastItemProps {
  toast: SkillToastData;
  onDismiss: () => void;
}

function SkillToastItem({ toast, onDismiss }: SkillToastItemProps) {
  const colors = SKILL_COLORS[toast.skillColor];
  const [progressFill, setProgressFill] = useState(0);

  // Anima a barra de progresso após o slide-in
  useEffect(() => {
    const t = setTimeout(() => {
      setProgressFill(toast.progressPercentageAfter);
    }, 300);
    return () => clearTimeout(t);
  }, [toast.progressPercentageAfter]);

  const renderIcon = () => {
    if (toast.skillIcon.type === "emoji") {
      return <span className="text-2xl">{toast.skillIcon.value}</span>;
    }
    const Icon = SKILL_ICON_MAP[toast.skillIcon.value] ?? Brain;
    return <Icon className="w-5 h-5" style={{ color: colors.solid }} />;
  };

  const xpGained = Math.round(toast.durationSeconds / 60); // 1 min = 1 XP
  const newLevelInfo = MASTERY_LEVELS[toast.newLevel - 1];

  return (
    <motion.div
      layout
      initial={{ x: 400, opacity: 0, scale: 0.9 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 400, opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative w-80 overflow-hidden rounded-xl border backdrop-blur-xl shadow-2xl pointer-events-auto cursor-pointer group"
      style={{
        backgroundColor: "rgba(15, 15, 30, 0.92)",
        borderColor: `${colors.solid}40`,
        boxShadow: `0 0 30px ${colors.solid}30, 0 10px 40px rgba(0,0,0,0.5)`
      }}
      onClick={onDismiss}
    >
      {/* Glow effect background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at top right, ${colors.solid}, transparent 60%)`
        }}
      />

      {/* LEVEL UP badge */}
      {toast.leveledUp && (
        <div
          className="absolute top-2 right-8 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider animate-pulse"
          style={{
            backgroundColor: `${colors.solid}30`,
            color: colors.solid,
            border: `1px solid ${colors.solid}80`,
            boxShadow: `0 0 12px ${colors.solid}80`
          }}
        >
          <div className="flex items-center gap-1">
            <TrendingUp className="w-2.5 h-2.5" />
            LEVEL UP
          </div>
        </div>
      )}

      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        className="absolute top-2 right-2 p-1 rounded-md text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
      >
        <X className="w-3 h-3" />
      </button>

      <div className="relative p-3 flex gap-3 items-center">
        {/* Mastery image (left) */}
        <div className="relative shrink-0">
          <div
            className="absolute inset-0 rounded-lg blur-md"
            style={{ backgroundColor: `${colors.solid}40` }}
          />
          <img
            src={MASTERY_IMAGES[toast.newLevel]}
            alt={`Level ${toast.newLevel}`}
            className="relative w-12 h-12 object-contain"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            {renderIcon()}
            <span
              className="text-sm font-semibold truncate"
              style={{ color: colors.solid }}
            >
              {toast.skillName}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-white/70">+{formatTime(toast.durationSeconds)}</span>
            <span className="text-white/30">•</span>
            <span className="font-bold" style={{ color: colors.solid }}>
              +{xpGained} XP
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-1.5 relative">
            <div className="h-1.5 rounded-full overflow-hidden bg-white/10">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${colors.solid}80, ${colors.solid})`,
                  boxShadow: `0 0 8px ${colors.solid}`
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progressFill}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between mt-0.5">
              <span className="text-[10px] text-white/40">
                Lv.{toast.newLevel} · {newLevelInfo.name}
              </span>
              {toast.leveledUp ? (
                <span className="text-[10px] font-bold" style={{ color: colors.solid }}>
                  {toast.previousLevel} → {toast.newLevel}
                </span>
              ) : (
                <span className="text-[10px] text-white/40">
                  {Math.round(progressFill)}%
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function SkillToastContainer() {
  const { toasts, dismiss } = useSkillToasts();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <SkillToastItem
            key={toast.id}
            toast={toast}
            onDismiss={() => dismiss(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
