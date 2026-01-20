# Floating Calendar Architecture

## Objetivo
Desacoplar o calendário do módulo Diary e transformá-lo em um componente flutuante reutilizável disponível em todos os módulos: Diary, Maestry, Pomodoro, Projects e Stats.

## Arquitetura Proposta

### 1. Componente Base: `FloatingCalendar`

```
src/components/floating/
├── floating-calendar.tsx      # Componente principal do calendário flutuante
├── calendar-views/
│   ├── index.ts               # Exports
│   ├── diary-calendar-view.tsx    # Visualização para Diary (moods, entries)
│   ├── pomodoro-calendar-view.tsx # Visualização para Pomodoro (sessões)
│   ├── projects-calendar-view.tsx # Visualização para Projects (deadlines, progress)
│   ├── maestry-calendar-view.tsx  # Visualização para Maestry (practice days)
│   └── stats-calendar-view.tsx    # Visualização para Stats (activity overview)
```

### 2. Estrutura do FloatingCalendar

O calendário base terá:
- **Mini view**: Calendário compacto no widget flutuante
- **Expanded view**: Visualização expandida com dados do módulo ativo
- **Module context**: Sabe qual módulo está ativo para renderizar a visualização correta

### 3. Interface de Dados por Módulo

```typescript
// types/calendar.types.ts

export type CalendarModule = "diary" | "pomodoro" | "projects" | "maestry" | "stats";

export interface CalendarDayData {
  date: string; // YYYY-MM-DD
  hasData: boolean;
  indicator?: {
    type: "dot" | "emoji" | "progress" | "count";
    value: string | number;
    color?: string;
  };
}

export interface CalendarViewProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  getDayData: (date: string) => CalendarDayData | undefined;
  onExpandedView?: () => void;
}
```

### 4. Hook para Dados do Calendário

```typescript
// hooks/use-calendar-data.ts

export function useCalendarData(module: CalendarModule) {
  // Retorna dados específicos do módulo para o calendário
  // - Diary: moods, entry counts
  // - Pomodoro: sessions completed, focus time
  // - Projects: deadlines, milestones
  // - Maestry: practice days, streaks
  // - Stats: activity levels
}
```

### 5. Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────┐
│                    Active Module Context                     │
│  (Diary | Pomodoro | Projects | Maestry | Stats)            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     useCalendarData(module)                  │
│  - getDayData(date) → CalendarDayData                       │
│  - getMonthSummary(month) → MonthSummary                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     FloatingCalendar                         │
│  ┌─────────────────┐    ┌─────────────────────────────────┐ │
│  │   Mini View     │    │      Expanded View               │ │
│  │   (widget)      │ ─► │  (module-specific component)     │ │
│  │   - Basic grid  │    │  - DiaryCalendarView            │ │
│  │   - Indicators  │    │  - PomodoroCalendarView         │ │
│  └─────────────────┘    │  - ProjectsCalendarView         │ │
│                         │  - MaestryCalendarView          │ │
│                         │  - StatsCalendarView            │ │
│                         └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 6. Visualizações Expandidas por Módulo

#### Diary
- Lista de entries do dia selecionado
- Mood average do dia
- Quick add entry

#### Pomodoro
- Sessões completadas no dia
- Tempo total focado
- Gráfico de distribuição por hora

#### Projects
- Tasks com deadline no dia
- Milestones do dia
- Progress de projetos ativos

#### Maestry
- Skills praticadas no dia
- Tempo de prática
- Streak indicator

#### Stats
- Overview de atividade
- Comparison com dias anteriores
- Heatmap do mês

### 7. Alterações no Widget System

```typescript
// types/widget.types.ts
export type WidgetType =
  | "miniTaskList"
  | "miniPomodoro"
  | "musicPlayer"
  | "miniProjectList"
  | "miniMaestryList"
  | "miniCalendar"; // NOVO

// Adicionar ao DEFAULT_FLOATING_WIDGETS_STATE
miniCalendar: {
  isVisible: true,
  isPinned: false,
  position: "top-right"
}
```

### 8. Refatoração do Diary

O Diary passará a funcionar como uma lista padrão:
- Input de cadastro (DiaryInput - já existe)
- Lista de entries (DiaryListContent - já existe)  
- Details panel (DiaryDetails - já existe)
- **Remove**: Calendário inline

O calendário flutuante filtrará as entries por data quando no módulo Diary.

### 9. Context de Módulo Ativo

```typescript
// context/active-module-context.tsx

export type ModuleType = "diary" | "pomodoro" | "projects" | "maestry" | "stats" | "tasks" | "config";

export const ActiveModuleContext = createContext<{
  activeModule: ModuleType;
  setActiveModule: (module: ModuleType) => void;
}>({...});
```

## Benefícios

1. **Consistência**: Calendário disponível em todos os módulos
2. **Economia de espaço**: Widget flutuante não ocupa espaço fixo
3. **Flexibilidade**: Cada módulo pode customizar sua visualização expandida
4. **Reutilização**: Código do calendário centralizado
5. **Experiência**: Navegação por data consistente em todo o app

## Próximos Passos

1. Criar tipos em `calendar.types.ts`
2. Criar `FloatingCalendar` base
3. Adicionar ao widget system
4. Criar `useCalendarData` hook
5. Implementar views expandidas por módulo
6. Refatorar Diary para usar calendário flutuante
7. Integrar calendário nos demais módulos
