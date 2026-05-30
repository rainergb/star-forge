// ─── Versão atual do app ──────────────────────────────────────────────────────
// Atualize CURRENT_VERSION junto com package.json a cada release.
// O modal "What's New" aparece somente quando essa string muda entre sessões.
export const CURRENT_VERSION = "1.0.1";

// ─── Tipos ────────────────────────────────────────────────────────────────────
export interface ChangelogEntry {
  version: string;
  date: string;
  fixes?: string[];
  features?: string[];
  removed?: string[];
}

// ─── Histórico — versão mais recente primeiro ─────────────────────────────────
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.0.1",
    date: "2026-05-29",
    fixes: [
      "Botão direito em projetos agora altera o status corretamente (pausar, ativar, concluir)",
      "Filtro do módulo Daily começa sem filtro ativo — exibe todas as entradas",
      "Cadastro via Google na tela de signup agora entra no sistema após autenticação",
      "Logout no app instalado (produção) funcionando corretamente",
      "Toast de XP de habilidades agora aparece corretamente ao finalizar um Pomodoro",
      "Submenu de repetição de tarefas não fecha mais ao mover o mouse para as opções",
    ],
    features: [
      "Filtro de status (Ativo / Pausado / Concluído) na tela de Projetos",
      "Botão direito em tarefas: opção para remover data de conclusão",
      "Ordenação de tarefas e projetos persiste ao alternar entre mini-widget e tela cheia",
      "Mini-widget expandido com ícones nos controles de ordenação e filtros compactos",
    ],
    removed: [
      "Botões de exportar/importar JSON removidos dos inputs de cadastro",
      "Horário estimado de conclusão removido ao lado das estrelas nas tarefas",
    ]
  }
];
