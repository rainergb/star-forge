/**
 * Cache por módulo que persiste através de unmounts de componentes.
 * Evita re-fetches desnecessários ao navegar entre módulos.
 *
 * Com storageKey: persiste no localStorage — dados disponíveis
 * instantaneamente no próximo start, mesmo antes do fetch do Supabase.
 */

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos
const LS_PREFIX = "star-habit-cache-";

interface CacheEntry<T> {
  userId: string;
  data: T[];
  ts: number;
}

export function createHookCache<T>(storageKey?: string) {
  let entry: CacheEntry<T> | null = null;
  const lsKey = storageKey ? `${LS_PREFIX}${storageKey}` : null;

  return {
    /** Retorna dados do cache se válidos.
     *  1º tenta memória (mais rápido), 2º tenta localStorage (persiste entre restarts). */
    get(userId: string): T[] | null {
      // Memória — mais rápido
      if (entry?.userId === userId && Date.now() - entry.ts < CACHE_TTL_MS) {
        return entry.data;
      }
      // localStorage — persiste entre restarts do app
      if (lsKey) {
        try {
          const raw = localStorage.getItem(`${lsKey}-${userId}`);
          if (raw) {
            const parsed = JSON.parse(raw) as T[];
            // Carrega na memória para próximas leituras
            entry = { userId, data: parsed, ts: Date.now() };
            return parsed;
          }
        } catch {}
      }
      return null;
    },

    /** Salva dados no cache (memória + localStorage) */
    set(userId: string, data: T[]): void {
      entry = { userId, data, ts: Date.now() };
      if (lsKey) {
        try {
          localStorage.setItem(`${lsKey}-${userId}`, JSON.stringify(data));
        } catch {}
      }
    },

    /** Atualiza dados no cache sem alterar o TTL (usado após mutações locais) */
    update(data: T[]): void {
      if (entry) {
        entry.data = data;
        entry.ts = Date.now();
        if (lsKey && entry.userId) {
          try {
            localStorage.setItem(`${lsKey}-${entry.userId}`, JSON.stringify(data));
          } catch {}
        }
      }
    },

    /** Invalida o cache (memória + localStorage) — deve ser chamado no logout */
    invalidate(): void {
      if (lsKey && entry?.userId) {
        try {
          localStorage.removeItem(`${lsKey}-${entry.userId}`);
        } catch {}
      }
      entry = null;
    }
  };
}
