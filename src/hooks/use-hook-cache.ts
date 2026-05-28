/**
 * Cache por módulo que persiste através de unmounts de componentes.
 * Evita re-fetches desnecessários ao navegar entre módulos.
 */

const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutos

interface CacheEntry<T> {
  userId: string;
  data: T[];
  ts: number;
}

export function createHookCache<T>() {
  let entry: CacheEntry<T> | null = null;

  return {
    /** Retorna dados do cache se válidos, ou null se expirado/sem dados */
    get(userId: string): T[] | null {
      if (entry?.userId === userId && Date.now() - entry.ts < CACHE_TTL_MS) {
        return entry.data;
      }
      return null;
    },

    /** Salva dados no cache */
    set(userId: string, data: T[]): void {
      entry = { userId, data, ts: Date.now() };
    },

    /** Atualiza dados no cache sem alterar o TTL (usado após mutações) */
    update(data: T[]): void {
      if (entry) {
        entry.data = data;
        entry.ts = Date.now(); // renova TTL após mutação
      }
    },

    /** Invalida o cache (força re-fetch na próxima montagem) */
    invalidate(): void {
      entry = null;
    }
  };
}
