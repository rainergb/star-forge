# 🔗 Pomodoro + Tasks Integration

> ⚠️ **IMPORTANT**: All implementation must follow the rules defined in [regras.md](./regras.md)

## Overview

Integrate the Pomodoro timer with the Tasks system to allow users to:
- Link pomodoro sessions to specific tasks
- Track time spent on each task
- Estimate and track pomodoros per task
- View productivity statistics

---

## Phase 1: Types & State Management

### 1.1 Create Pomodoro Types
- [x] Create `src/types/pomodoro.types.ts`
  - [x] `TimerMode` type
  - [x] `PomodoroSession` interface (with taskId)
  - [x] `PomodoroState` interface
  - [x] `ActiveTask` interface

### 1.2 Update Task Types
- [x] Modify `src/types/task.types.ts`
  - [x] Add `estimatedPomodoros: number | null`
  - [x] Add `completedPomodoros: number`
  - [x] Add `totalTimeSpent: number`

### 1.3 Create Hooks
- [x] Create `src/hooks/use-active-task.ts`
  - [x] `activeTask` state (task linked to pomodoro)
  - [x] `setActiveTask(task)` function
  - [x] `clearActiveTask()` function
  - [x] Persist in localStorage

- [x] Create `src/hooks/use-pomodoro-sessions.ts`
  - [x] `sessions` array
  - [x] `addSession(session)` function
  - [x] `getSessionsByTask(taskId)` function
  - [x] `getStats(period)` function

### 1.4 Update use-tasks.ts
- [x] Add `incrementPomodoro(taskId)` function
- [x] Add `addTimeSpent(taskId, seconds)` function
- [x] Add `setEstimatedPomodoros(taskId, count)` function
- [x] Update `addTask` to include new fields with defaults

---

## Phase 2: Pomodoro Components

### 2.1 Task Selector Component
- [x] Create `src/content/pomodoro/task-selector.tsx`
  - [x] Dropdown/popover with task list
  - [x] Show only incomplete tasks
  - [x] Favorite tasks at top
  - [x] Search/filter functionality
  - [x] "No task" option
  - [x] Show selected task name

### 2.2 Update Pomodoro Timer
- [x] Modify `src/content/pomodoro/pomodoro-timer.tsx`
  - [x] Display active task name below timer
  - [x] Add TaskSelector component
  - [x] Show pomodoro count for active task

### 2.3 Update use-pomodoro-timer.ts
- [x] Add `linkedTaskId` state (via useActiveTask)
- [x] On session complete:
  - [x] Record session with taskId
  - [x] Increment task's completedPomodoros
  - [x] Add time to task's totalTimeSpent
- [x] Add `linkTask(taskId)` function
- [x] Add `unlinkTask()` function

---

## Phase 3: Task Components

### 3.1 Task Item Updates
- [x] Modify `src/content/tasks/task-item.tsx`
  - [x] Show pomodoro indicator (🕐 1/4)
  - [ ] Show time spent badge
  - [x] Visual if task has estimated pomodoros

### 3.2 Task Details - Pomodoro Section
- [x] Create `src/content/tasks/task-pomodoro-section.tsx`
  - [x] Estimated pomodoros input
  - [x] Completed pomodoros display
  - [x] Progress bar (completed/estimated)
  - [x] Total time spent
  - [x] "Start Pomodoro" button (links and starts)
  - [x] Session history for this task

### 3.3 Update Task Details Index
- [x] Modify `src/content/tasks/task-details/index.tsx`
  - [x] Add TaskPomodoroSection component
  - [x] Pass necessary props

---

## Phase 4: Quick Actions

### 4.1 Start Pomodoro from Task
- [x] Add "Start Pomodoro" button in task-item context menu
- [x] Add "Start Pomodoro" button in task-details
- [x] Auto-navigate to pomodoro view and start

### 4.2 Task Selection in Timer
- [x] Quick-select from recent tasks
- [x] Show task progress in timer view

---

## Phase 5: Statistics & History

### 5.1 Session History
- [x] Store all pomodoro sessions
- [x] Link sessions to tasks
- [x] Calculate aggregated stats

### 5.2 Task Statistics
- [x] Time spent per task
- [x] Pomodoros per task
- [x] Completion rate
- [x] Productivity trends

### 5.3 Statistics View
- [x] Create `src/content/pomodoro/pomodoro-stats.tsx`
- [x] Add stats view to app navigation
- [x] Period selector (day/week/month/all)
- [x] 7-day chart visualization
- [x] Recent sessions list

---

## Phase 6: API Contracts Update

### 6.1 Update tasks-api.md
- [x] Add pomodoro fields to Task interface
- [x] Add endpoints:
  - [x] `PUT /api/tasks/:taskId/estimated-pomodoros`
  - [x] `POST /api/tasks/:taskId/pomodoro-complete`
  - [x] `GET /api/tasks/:taskId/pomodoro-stats`

### 6.2 Update pomodoro-api.md
- [x] Add `taskId` to PomodoroSession
- [x] Add endpoint:
  - [x] `GET /api/pomodoro/sessions?taskId=xxx`
  - [x] `GET /api/pomodoro/active-task`
  - [x] `PUT /api/pomodoro/active-task`
  - [x] `DELETE /api/pomodoro/active-task`

---

## Implementation Order

```
Week 1: Foundation
├── Day 1-2: Phase 1 (Types & Hooks)
├── Day 3-4: Phase 2.1-2.2 (Task Selector)
└── Day 5: Phase 2.3 (Timer Integration)

Week 2: Task Side
├── Day 1-2: Phase 3.1-3.2 (Task Components)
├── Day 3: Phase 3.3 (Integration)
└── Day 4-5: Phase 4 (Quick Actions)

Week 3: Polish
├── Day 1-2: Phase 5 (Statistics)
├── Day 3: Phase 6 (API Contracts)
└── Day 4-5: Testing & Refinement
```

---

## Files Created ✅

| File | Description | Status |
|------|-------------|--------|
| `src/types/pomodoro.types.ts` | Pomodoro type definitions | ✅ |
| `src/hooks/use-active-task.ts` | Active task state management | ✅ |
| `src/hooks/use-pomodoro-sessions.ts` | Session history management | ✅ |
| `src/content/pomodoro/task-selector.tsx` | Task selection dropdown | ✅ |
| `src/content/tasks/task-pomodoro-section.tsx` | Pomodoro section in details | ✅ |

## Files Modified

| File | Changes | Status |
|------|---------|--------|
| `src/types/task.types.ts` | Add pomodoro fields | ✅ |
| `src/hooks/use-tasks.ts` | Add pomodoro functions | ✅ |
| `src/content/pomodoro/pomodoro-timer.tsx` | Add task selector & display | ✅ |
| `src/content/pomodoro/use-pomodoro-timer.ts` | Add task linking | ✅ |
| `src/content/tasks/task-item.tsx` | Show pomodoro stats | ✅ |
| `src/content/tasks/task-details/index.tsx` | Add pomodoro section | ✅ |
| `src/content/tasks/task-list.tsx` | Pass setEstimatedPomodoros | ✅ |
| `src/data/api/tasks-api.md` | Add pomodoro endpoints | ✅ |
| `src/data/api/pomodoro-api.md` | Add taskId field | ✅ |
| `src/content/pomodoro/pomodoro-stats.tsx` | Statistics component | ✅ |
| `src/content/dock/app-dock.tsx` | Add stats navigation | ✅ |
| `src/types/app.types.ts` | Add stats view type | ✅ |
| `src/App.tsx` | Add stats view | ✅ |

---

## Current Progress

**Phase 1**: ✅ Completed  
**Phase 2**: ✅ Completed  
**Phase 3**: ✅ Completed  
**Phase 4**: ✅ Completed  
**Phase 5**: ✅ Completed  
**Phase 6**: ✅ Completed

### 🎉 Integration Complete!  

---

## Notes

- Keep localStorage keys consistent: `star-habit-*`
- All times in seconds (consistent with current implementation)
- Timestamps in milliseconds (Date.now())
- Optional task linking (pomodoro can run without task)

---

## Rules to Follow (from regras.md)

- ✅ **Componentization**: Each element must be a reusable component
- ✅ **Max 500 lines per file**: Ideal 200-300 lines
- ✅ **Full TypeScript typing**: All props, states, functions must be typed
- ✅ **Types in `src/types/`**: All type definitions organized there
- ✅ **No comments**: Unless strictly necessary
- ✅ **File naming conventions**:
  - Components: `kebab-case.tsx`
  - Hooks: `use-camelCase.ts`
  - Types: `kebab-case.types.ts`
