import { useEffect, useState } from "react";
import { MasteryLevel, SkillColor, SkillIcon } from "@/types/skill.types";

export interface SkillToastData {
  id: string;
  skillId: string;
  skillName: string;
  skillIcon: SkillIcon;
  skillColor: SkillColor;
  /** Tempo adicionado em segundos */
  durationSeconds: number;
  previousLevel: MasteryLevel;
  newLevel: MasteryLevel;
  leveledUp: boolean;
  /** % de progresso APÓS adicionar o tempo (para barra animada) */
  progressPercentageAfter: number;
}

type Listener = (toasts: SkillToastData[]) => void;

let queue: SkillToastData[] = [];
const listeners: Listener[] = [];

function emit() {
  listeners.forEach((l) => l([...queue]));
}

const AUTO_DISMISS_MS = 4500;

/** Adiciona um novo toast à fila global */
export function pushSkillToast(data: Omit<SkillToastData, "id">) {
  const toast: SkillToastData = { ...data, id: crypto.randomUUID() };
  queue = [...queue, toast];
  emit();

  setTimeout(() => {
    queue = queue.filter((t) => t.id !== toast.id);
    emit();
  }, AUTO_DISMISS_MS);
}

/** Remove um toast manualmente (ex: clique) */
export function dismissSkillToast(id: string) {
  queue = queue.filter((t) => t.id !== id);
  emit();
}

/** Hook para subscriber: usado pelo container */
export function useSkillToasts() {
  const [toasts, setToasts] = useState<SkillToastData[]>(queue);

  useEffect(() => {
    listeners.push(setToasts);
    return () => {
      const idx = listeners.indexOf(setToasts);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  return { toasts, dismiss: dismissSkillToast };
}
