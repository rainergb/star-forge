# 📁 Projects Implementation

> ⚠️ **IMPORTANT**: All implementation must follow the rules defined in [regras.md](./regras.md)

## Overview

Implementar uma seção de **Projects** (Projetos) que organiza tarefas em grupos lógicos, seguindo a hierarquia:

```
Projects → Tasks → Pomodoros
```

Um projeto agrupa múltiplas tarefas relacionadas, permitindo:
- Organização por contexto (trabalho, estudos, pessoal)
- Visão macro do progresso
- Estatísticas agregadas por projeto
- Prazos e metas por projeto

---

## 🎯 Hierarquia do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        PROJECT                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  📊 Estatísticas do Projeto                             │ │
│  │  - Total de tarefas: 12 (8 completas, 4 pendentes)      │ │
│  │  - Pomodoros: 45/60 (75%)                               │ │
│  │  - Tempo investido: 18h 45min                           │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   TASK 1    │  │   TASK 2    │  │   TASK 3    │   ...    │
│  │  🍅 3/4     │  │  🍅 5/5 ✓   │  │  🍅 0/3     │          │
│  │  ⏱ 1h 15m  │  │  ⏱ 2h 05m  │  │  ⏱ 0m       │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Types & Interfaces

### 1.1 Create Project Types
- [ ] Create `src/types/project.types.ts`

```typescript
export type ProjectStatus = "active" | "paused" | "completed" | "archived";

export type ProjectColor = 
  | "purple"    // #6A30FF - Primary
  | "blue"      // #1A7FFF - Blue Accent
  | "green"     // #22C55E - Success
  | "orange"    // #F97316 - Warning
  | "red"       // #EF4444 - Danger
  | "pink"      // #EC4899 - Pink
  | "cyan"      // #06B6D4 - Cyan
  | "yellow";   // #EAB308 - Yellow

export interface ProjectIcon {
  type: "emoji" | "lucide";
  value: string; // emoji char or lucide icon name
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: ProjectColor;
  icon: ProjectIcon;
  status: ProjectStatus;
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
  dueDate: number | null;
  estimatedPomodoros: number | null;
  completedPomodoros: number;
  totalTimeSpent: number;
  sortOrder: number;
}

export interface ProjectsState {
  projects: Project[];
}

export interface ProjectStats {
  projectId: string;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalPomodoros: number;
  completedPomodoros: number;
  totalTimeSpent: number;
  completionPercentage: number;
  estimatedTimeRemaining: number;
}
```

### 1.2 Update Task Types
- [ ] Modify `src/types/task.types.ts`

```typescript
// Adicionar ao interface Task existente:
export interface Task {
  // ... campos existentes ...
  projectId: string | null;  // NOVO: referência ao projeto
}
```

### 1.3 Update App Types
- [ ] Modify `src/types/app.types.ts`

```typescript
export type AppView = "pomodoro" | "tasks" | "stats" | "projects";
```

---

## Phase 2: API Contracts

### 2.1 Create Projects API Contract
- [ ] Create `src/data/api/projects-api.md`

#### Tipos Base

```typescript
interface Project {
  id: string;
  name: string;
  description: string | null;
  color: ProjectColor;
  icon: ProjectIcon;
  status: ProjectStatus;
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
  dueDate: number | null;
  estimatedPomodoros: number | null;
  completedPomodoros: number;
  totalTimeSpent: number;
  sortOrder: number;
}
```

#### Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/projects` | Listar todos os projetos |
| POST | `/api/projects` | Criar novo projeto |
| GET | `/api/projects/:id` | Obter projeto específico |
| PUT | `/api/projects/:id` | Atualizar projeto |
| DELETE | `/api/projects/:id` | Remover projeto |
| PATCH | `/api/projects/:id/status` | Alterar status |
| PATCH | `/api/projects/:id/toggle-favorite` | Toggle favorito |
| GET | `/api/projects/:id/tasks` | Listar tasks do projeto |
| GET | `/api/projects/:id/stats` | Estatísticas do projeto |
| PUT | `/api/projects/reorder` | Reordenar projetos |

### 2.2 Update Tasks API
- [ ] Modify `src/data/api/tasks-api.md`

```typescript
// Adicionar endpoint:
// PATCH /api/tasks/:id/project
// Move task para um projeto

// Request:
{
  "projectId": "project-123" | null
}

// Response:
{
  "id": "task-123",
  "projectId": "project-123"
}
```

---

## Phase 3: State Management (Hooks)

### 3.1 Create useProjects Hook
- [ ] Create `src/hooks/use-projects.ts`

```typescript
export function useProjects() {
  // State
  const projects: Project[];
  
  // CRUD Operations
  const addProject: (name: string, options?: Partial<Project>) => string;
  const updateProject: (id: string, updates: Partial<Project>) => void;
  const removeProject: (id: string, deleteTasks?: boolean) => void;
  
  // Status & Favorites
  const setStatus: (id: string, status: ProjectStatus) => void;
  const toggleFavorite: (id: string) => void;
  
  // Reordering
  const reorderProjects: (projectIds: string[]) => void;
  
  // Queries
  const getProject: (id: string) => Project | undefined;
  const getProjectsByStatus: (status: ProjectStatus) => Project[];
  const getFavoriteProjects: () => Project[];
  
  // Stats (calculated)
  const getProjectStats: (projectId: string) => ProjectStats;
  
  // Pomodoro tracking
  const incrementPomodoro: (projectId: string) => void;
  const addTimeSpent: (projectId: string, seconds: number) => void;
}
```

### 3.2 Update useTasks Hook
- [ ] Modify `src/hooks/use-tasks.ts`

```typescript
// Adicionar funções:
const setProject: (taskId: string, projectId: string | null) => void;
const getTasksByProject: (projectId: string) => Task[];
const getTasksWithoutProject: () => Task[];
```

### 3.3 Create useActiveProject Hook
- [ ] Create `src/hooks/use-active-project.ts`

```typescript
export function useActiveProject() {
  const activeProject: Project | null;
  const setActiveProject: (project: Project | null) => void;
  const clearActiveProject: () => void;
}
```

---

## Phase 4: UI Components

### 4.1 Project List View
- [ ] Create `src/content/projects/project-list.tsx`
  - Lista de projetos com drag-to-reorder
  - Filtros por status (active/paused/completed/archived)
  - Barra de busca
  - Botão de criar novo projeto
  - Exibição de progresso visual por projeto
  - Estimated size: ~400 lines

### 4.2 Project Item Component
- [ ] Create `src/content/projects/project-item.tsx`
  - Card compacto com ícone, nome, cor
  - Progress bar (tasks ou pomodoros)
  - Badge de status
  - Indicador de favorito
  - Menu de contexto (edit, archive, delete)
  - Estimated size: ~150 lines

### 4.3 Project Details Panel
- [ ] Create `src/content/projects/project-details/`

```
project-details/
  ├── index.tsx              # Container principal (~200 lines)
  ├── project-header.tsx     # Nome, ícone, cor, favorito (~100 lines)
  ├── project-stats.tsx      # Estatísticas resumidas (~80 lines)
  ├── project-tasks.tsx      # Lista de tasks do projeto (~150 lines)
  ├── project-timeline.tsx   # Timeline de atividade (~100 lines)
  └── project-actions.tsx    # Ações (archive, delete, etc) (~60 lines)
```

### 4.4 Project Selector Component
- [ ] Create `src/content/projects/project-selector.tsx`
  - Dropdown para selecionar projeto
  - Usado em Task Details
  - Opção "Sem projeto"
  - Quick-create project inline
  - Estimated size: ~100 lines

### 4.5 Create Project Dialog
- [ ] Create `src/content/projects/create-project-dialog.tsx`
  - Form para criar/editar projeto
  - Seletor de cor
  - Seletor de ícone (emoji ou Lucide)
  - Input de nome e descrição
  - Date picker para deadline
  - Estimated size: ~200 lines

---

## Phase 5: Navigation & Integration

### 5.1 Update App Dock
- [ ] Modify `src/content/dock/app-dock.tsx`

```typescript
const dockItems: DockItemData[] = [
  {
    icon: <FolderKanban className="w-6 h-6 text-white" />,
    label: "Projects",
    onClick: () => onViewChange("projects"),
    className: currentView === "projects" ? "bg-primary/20 border-primary/50" : ""
  },
  // ... existing items
];
```

### 5.2 Update App.tsx
- [ ] Add Projects view routing
- [ ] Add project context if needed

### 5.3 Update Task List
- [ ] Modify `src/content/tasks/task-list.tsx`
  - Agrupar tasks por projeto (opcional)
  - Filtrar por projeto
  - Mostrar badge do projeto no task item

### 5.4 Update Task Details
- [ ] Modify `src/content/tasks/task-details/index.tsx`
  - Adicionar ProjectSelector
  - Mostrar info do projeto vinculado

---

## Phase 6: Floating Widgets

### 6.1 Mini Project Progress
- [ ] Create `src/components/floating/mini-project.tsx`
  - Widget flutuante com progresso do projeto ativo
  - Mostra: nome, % completo, pomodoros
  - Quick actions
  - Estimated size: ~100 lines

### 6.2 Update Widget Types
- [ ] Modify `src/types/widget.types.ts`

```typescript
export type WidgetType = 
  | "miniTaskList" 
  | "miniPomodoro" 
  | "musicPlayer"
  | "miniProject";  // NOVO
```

---

## Phase 7: Statistics Integration

### 7.1 Project Statistics View
- [ ] Create `src/content/projects/project-stats-view.tsx`
  - Gráfico de progresso ao longo do tempo
  - Distribuição de tempo por task
  - Comparação estimado vs. realizado
  - Streak de produtividade

### 7.2 Update Pomodoro Stats
- [ ] Modify `src/content/pomodoro/pomodoro-stats.tsx`
  - Filtrar por projeto
  - Mostrar estatísticas por projeto

---

## 🎨 Design Guidelines

### Cores dos Projetos

```typescript
const projectColors = {
  purple: { bg: "bg-[#6A30FF]/20", border: "border-[#6A30FF]/50", text: "text-[#6A30FF]" },
  blue:   { bg: "bg-[#1A7FFF]/20", border: "border-[#1A7FFF]/50", text: "text-[#1A7FFF]" },
  green:  { bg: "bg-[#22C55E]/20", border: "border-[#22C55E]/50", text: "text-[#22C55E]" },
  orange: { bg: "bg-[#F97316]/20", border: "border-[#F97316]/50", text: "text-[#F97316]" },
  red:    { bg: "bg-[#EF4444]/20", border: "border-[#EF4444]/50", text: "text-[#EF4444]" },
  pink:   { bg: "bg-[#EC4899]/20", border: "border-[#EC4899]/50", text: "text-[#EC4899]" },
  cyan:   { bg: "bg-[#06B6D4]/20", border: "border-[#06B6D4]/50", text: "text-[#06B6D4]" },
  yellow: { bg: "bg-[#EAB308]/20", border: "border-[#EAB308]/50", text: "text-[#EAB308]" },
};
```

### Layout do Project Card

```
┌────────────────────────────────────────────────┐
│ 🎯  Project Name                    ⭐  •••   │
│     Description text here...                   │
│                                                │
│ ████████████░░░░░░░░░░░░░  45%                │
│                                                │
│ 📋 8/12 tasks   🍅 18/40   ⏱ 9h 30m          │
│                                                │
│ 📅 Due: Jan 15, 2026            [Active]      │
└────────────────────────────────────────────────┘
```

### Ícones Sugeridos (Lucide)

```typescript
const suggestedIcons = [
  "Folder", "FolderKanban", "Briefcase", "GraduationCap",
  "Code", "Palette", "Music", "Camera", "Book", "Rocket",
  "Target", "Trophy", "Star", "Heart", "Zap", "Flame"
];
```

---

## 📱 Responsive Considerations

### Desktop (>1024px)
- Project list como sidebar
- Task list ao lado
- Details em painel lateral

### Tablet (768px - 1024px)
- Project list em grid 2 colunas
- Details em modal/drawer

### Mobile (<768px)
- Project list em lista vertical
- Navegação em pilha
- Bottom sheet para details

---

## 🔄 Data Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    useProjects  │────▶│    useTasks     │────▶│  usePomodoro    │
│                 │     │                 │     │                 │
│ - projects[]    │     │ - tasks[]       │     │ - sessions[]    │
│ - addProject()  │     │ - projectId     │     │ - taskId        │
│ - getStats()    │     │ - setProject()  │     │ - projectId     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                      │                       │
         └──────────────────────┴───────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │    localStorage       │
                    │                       │
                    │ star-habit-projects   │
                    │ star-habit-tasks      │
                    │ star-habit-pomodoro   │
                    └───────────────────────┘
```

---

## 📋 Implementation Checklist

### Phase 1: Foundation
- [ ] Create `project.types.ts`
- [ ] Update `task.types.ts` with `projectId`
- [ ] Update `app.types.ts` with projects view
- [ ] Create `projects-api.md`

### Phase 2: State Management
- [ ] Create `use-projects.ts` hook
- [ ] Update `use-tasks.ts` with project functions
- [ ] Create `use-active-project.ts` hook

### Phase 3: Core Components
- [ ] Create `project-list.tsx`
- [ ] Create `project-item.tsx`
- [ ] Create `project-details/` folder structure
- [ ] Create `project-selector.tsx`
- [ ] Create `create-project-dialog.tsx`

### Phase 4: Integration
- [ ] Update `app-dock.tsx`
- [ ] Update `App.tsx` routing
- [ ] Update `task-list.tsx` with project filtering
- [ ] Update `task-details/index.tsx` with ProjectSelector

### Phase 5: Floating Widget
- [ ] Create `mini-project.tsx`
- [ ] Update `widget.types.ts`
- [ ] Update `use-floating-widgets.ts`

### Phase 6: Statistics
- [ ] Create `project-stats-view.tsx`
- [ ] Update `pomodoro-stats.tsx`

---

## 📊 Estimativas

| Fase | Componentes | Linhas Estimadas | Complexidade |
|------|-------------|------------------|--------------|
| 1 | Types & API | ~200 | Baixa |
| 2 | Hooks | ~400 | Média |
| 3 | Components | ~1000 | Alta |
| 4 | Integration | ~300 | Média |
| 5 | Widget | ~150 | Baixa |
| 6 | Statistics | ~200 | Média |
| **Total** | | **~2250** | |

---

## 🚀 Future Enhancements

### v2.0
- [ ] Project templates
- [ ] Collaborative projects (multi-user)
- [ ] Project milestones
- [ ] Kanban view for tasks within project
- [ ] Project export/import
- [ ] Project sharing

### v3.0
- [ ] AI-powered project planning
- [ ] Automatic task suggestions
- [ ] Time estimation based on history
- [ ] Project health score
