# ✅ Floating Widgets Implementation (COMPLETED)

> ⚠️ **IMPORTANT**: All implementation must follow the rules defined in [regras.md](./regras.md)

## Overview

Create floating widget components that provide quick access between Pomodoro and Tasks:
- **Mini Task List**: Appears in Pomodoro view, shows tasks with drag-to-reorder
- **Mini Pomodoro**: Appears in Tasks view, shows timer with basic controls

---

## Features Summary

### Mini Task List (Pomodoro View)
- Floating panel on the **top-left corner**
- Close/Pin toggle buttons
- Active task always at the top (highlighted)
- Drag & drop to reorder tasks (using **@dnd-kit**)
- Click task to set as active (pauses timer)
- Shows all incomplete tasks with invisible scroll
- Compact design

### Mini Pomodoro (Tasks View)
- Floating panel on the **top-left corner** (same position, alternates with Mini Task List)
- Close/Pin toggle buttons
- Shows current time
- Play/Pause/Reset controls
- Shows active task name
- Compact circular timer design

### Shared Behavior
- **Pin**: Widget stays visible, remembers preference
- **Close**: Widget hides, can be reopened via button
- **State persistence**: Pin state saved in localStorage

---

## Phase 1: Types & State ✅

### 1.1 Create Widget Types
- [x] Create `src/types/widget.types.ts`
  ```typescript
  interface WidgetState {
    isVisible: boolean;
    isPinned: boolean;
  }
  
  interface FloatingWidgetsState {
    miniTaskList: WidgetState;
    miniPomodoro: WidgetState;
  }
  ```

### 1.2 Create Widget Hook
- [x] Create `src/hooks/use-floating-widgets.ts`
  - `widgetsState` - current visibility/pin state
  - `toggleVisibility(widget)` - show/hide widget
  - `togglePin(widget)` - pin/unpin widget
  - `isVisible(widget)` - check if widget is visible
  - `isPinned(widget)` - check if widget is pinned
  - Persist state in localStorage (`star-habit-floating-widgets`)

---

## Phase 2: Mini Task List Component ✅

### 2.1 Create Mini Task List
- [x] Create `src/components/floating/mini-task-list.tsx`
  - Floating container with header (title, pin, close buttons)
  - Task list with drag handle
  - Active task highlighted at top
  - Click to select task (triggers pause callback)
  - Max height with scroll
  - Estimated size: ~150 lines

### 2.2 Create Mini Task Item
- [x] Create `src/components/floating/mini-task-item.tsx`
  - Compact task display (title only)
  - Drag handle icon
  - Active indicator (glow/border)
  - Click handler
  - Estimated size: ~50 lines

### 2.3 Drag & Drop Logic
- [x] Install `@dnd-kit/core` and `@dnd-kit/sortable`
- [x] Implement drag-to-reorder functionality
  - Use `@dnd-kit` for smooth drag and drop
  - Update task order in state
  - Visual feedback during drag
  - Touch support built-in

---

## Phase 3: Mini Pomodoro Component ✅

### 3.1 Create Mini Pomodoro
- [x] Create `src/components/floating/mini-pomodoro.tsx`
  - Floating container with header (title, pin, close buttons)
  - Circular mini timer display
  - Play/Pause button
  - Current mode indicator (work/break)
  - Active task name (truncated)
  - Estimated size: ~120 lines

### 3.2 Timer Sync
- [ ] Sync with main `usePomodoroTimer` hook
  - Share timer state (timeLeft, isActive, mode)
  - Control actions (toggle, reset)
  - No duplicate timer logic

---

## Phase 4: Floating Container Base

### 4.1 Create Base Container
- [ ] Create `src/components/floating/floating-container.tsx`
  - Reusable wrapper for floating widgets
  - Header with title, pin button, close button
  - Draggable position (optional enhancement)
  - Animation on open/close
  - Estimated size: ~80 lines

### 4.2 Styling
- [ ] Consistent floating panel style
  - Semi-transparent background (bg-background/80)
  - Backdrop blur
  - Border with glow
  - Shadow for depth

---

## Phase 5: Integration

### 5.1 Update Pomodoro Timer View
- [ ] Modify `src/content/pomodoro/pomodoro-timer.tsx`
  - Add MiniTaskList component
  - Position to the left of timer
  - Pass necessary props (tasks, activeTask, onSelectTask)
  - Handle task selection → pause timer

### 5.2 Update Tasks View
- [ ] Modify `src/content/tasks/task-list.tsx`
  - Add MiniPomodoro component
  - Position at corner/side
  - Pass timer state and controls

### 5.3 Update use-pomodoro-timer.ts
- [ ] Add `pauseTimer()` function (separate from toggle)
- [ ] Add callback for task change that auto-pauses

### 5.4 Toggle Buttons
- [ ] Add button to show hidden widgets
  - Small icon button when widget is closed
  - Positioned where widget would appear

---

## Phase 6: Task Reordering

### 6.1 Update use-tasks.ts
- [ ] Add `reorderTasks(taskIds: string[])` function
- [ ] Persist custom order in localStorage

### 6.2 Sort Logic
- [ ] Active task always first
- [ ] Then custom order (from drag)
- [ ] Favorites before non-favorites (within custom order)

---

## File Structure

```
src/
├── types/
│   └── widget.types.ts          (NEW)
├── hooks/
│   └── use-floating-widgets.ts  (NEW)
├── components/
│   └── floating/                (NEW FOLDER)
│       ├── floating-container.tsx
│       ├── mini-task-list.tsx
│       ├── mini-task-item.tsx
│       └── mini-pomodoro.tsx
├── content/
│   ├── pomodoro/
│   │   └── pomodoro-timer.tsx   (MODIFY)
│   └── tasks/
│       └── task-list.tsx        (MODIFY)
```

---

## Files to Create

| File | Description | Est. Lines |
|------|-------------|------------|
| `src/types/widget.types.ts` | Widget type definitions | ~20 |
| `src/hooks/use-floating-widgets.ts` | Widget state management | ~60 |
| `src/components/floating/floating-container.tsx` | Base floating panel | ~80 |
| `src/components/floating/mini-task-list.tsx` | Mini task list widget | ~150 |
| `src/components/floating/mini-task-item.tsx` | Compact task item | ~50 |
| `src/components/floating/mini-pomodoro.tsx` | Mini timer widget | ~120 |

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/use-tasks.ts` | Add reorderTasks function |
| `src/hooks/use-pomodoro-timer.ts` | Add pauseTimer, onTaskChange callback |
| `src/content/pomodoro/pomodoro-timer.tsx` | Add MiniTaskList, handle task selection |
| `src/content/tasks/task-list.tsx` | Add MiniPomodoro widget |

---

## Implementation Order

```
Phase 1: Foundation (Types & Hooks)
├── 1.1 Create widget.types.ts
└── 1.2 Create use-floating-widgets.ts

Phase 2: Base Components
├── 2.1 Create floating-container.tsx
└── 2.2 Test base container

Phase 3: Mini Task List
├── 3.1 Create mini-task-item.tsx
├── 3.2 Create mini-task-list.tsx
├── 3.3 Integrate in pomodoro-timer.tsx
└── 3.4 Implement drag & drop

Phase 4: Mini Pomodoro
├── 4.1 Create mini-pomodoro.tsx
└── 4.2 Integrate in task-list.tsx

Phase 5: Task Selection Logic
├── 5.1 Update use-pomodoro-timer.ts (pause on task change)
├── 5.2 Connect task selection to pause
└── 5.3 Update use-tasks.ts (reorder function)

Phase 6: Polish
├── 6.1 Animations
├── 6.2 Toggle buttons for hidden widgets
└── 6.3 Testing & refinement
```

---

## UI Mockup (ASCII)

### Pomodoro View with Mini Task List (top-left):
```
┌─────────────────────────────────────────────────────┐
│ ┌──────────────┐                                    │
│ │ Tasks    📌 ✕│                                    │
│ ├──────────────┤         ┌─────────────┐           │
│ │ ⬡ Task 1 ◀──│─────────│             │           │
│ │   Task 2    ≡│  ACTIVE │   25:00     │           │
│ │   Task 3    ≡│         │             │           │
│ │   Task 4    ≡│         └─────────────┘           │
│ │   ...scroll..│         [▶] [↻] [☕]               │
│ └──────────────┘                                    │
└─────────────────────────────────────────────────────┘
```

### Tasks View with Mini Pomodoro (top-left):
```
┌─────────────────────────────────────────────────────┐
│ ┌───────────┐                                       │
│ │ 🍅   📌 ✕ │                                       │
│ ├───────────┤   ┌────────────────────────────┐     │
│ │   25:00   │   │ Add new task...            │     │
│ │  [▶][↻]   │   └────────────────────────────┘     │
│ │ "Task 1"  │                                       │
│ └───────────┘   ☐ Task 1           ⭐              │
│                 ☐ Task 2                            │
│                 ☑ Task 3 (done)                     │
└─────────────────────────────────────────────────────┘
```

---

## Behavior Details

### Task Selection in Mini Task List
1. User clicks on a task in mini task list
2. If different from current active task:
   - Timer pauses automatically
   - New task becomes active
   - Toast notification: "Task changed. Press play to continue."
3. User must press play to resume timer

### Drag & Drop
1. User drags task by handle (≡)
2. Visual indicator shows drop position
3. On drop, order is saved
4. Active task always stays at top visually

### Pin/Close Behavior
- **Pinned**: Widget always visible, survives view changes
- **Unpinned + Visible**: Widget visible but can be closed
- **Closed**: Widget hidden, small button to reopen

---

## Current Progress

**Phase 1**: ⬜ Not Started  
**Phase 2**: ⬜ Not Started  
**Phase 3**: ⬜ Not Started  
**Phase 4**: ⬜ Not Started  
**Phase 5**: ⬜ Not Started  
**Phase 6**: ⬜ Not Started  

---

## Decisions Made ✅

| Question | Decision |
|----------|----------|
| Widget position | Top-left corner (both widgets alternate based on view) |
| Drag library | `@dnd-kit` (modular, hooks-based, ~12kb) |
| Tasks shown | All tasks with invisible scroll |
| Toggle button | Icon only |

---

## Notes

- Keep localStorage keys consistent: `star-habit-*`
- Respect max 500 lines per file rule
- All types in `src/types/`
- No comments unless strictly necessary
- kebab-case for component files
