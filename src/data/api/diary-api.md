# API Contracts - Diary

## 📓 DIARY

### Base Types

```typescript
type MoodLevel = 1 | 2 | 3 | 4 | 5;

type MoodEmoji = "😢" | "😕" | "😐" | "🙂" | "😄";

type DiaryEntryType =
  | "note"
  | "event"
  | "mood"
  | "task-created"
  | "task-completed"
  | "pomodoro-summary";

interface MoodEntry {
  level: MoodLevel;
  emoji: MoodEmoji;
  note: string | null;
}

interface DiaryFile {
  id: string;
  name: string;
  url: string;
  type: "image" | "document" | "other";
  mimeType: string;
  size: number;              // in bytes
  addedAt: number;           // timestamp in ms
}

interface DiaryEntry {
  id: string;
  type: DiaryEntryType;
  content: string;
  createdAt: number;         // timestamp in ms
  updatedAt: number;         // timestamp in ms
  date: string;              // YYYY-MM-DD format
  time: string | null;       // HH:mm format
  mood: MoodEntry | null;
  linkedTaskId: string | null;
  tags: string[];
  favorite: boolean;
  files: DiaryFile[];
}

interface DailyMoodSummary {
  date: string;              // YYYY-MM-DD
  averageMood: number;
  moodCount: number;
  dominantMood: MoodLevel;
}

interface DailySummary {
  date: string;
  entries: DiaryEntry[];
  moodSummary: DailyMoodSummary | null;
  tasksCreated: number;
  tasksCompleted: number;
  pomodorosCompleted: number;
  totalFocusTime: number;    // in seconds
}
```

---

## CRUD de Diary Entries

### GET /api/diary/entries

Returns all diary entries with optional filters.

**Query Parameters:**
- `date?: string` - Filter by specific date (YYYY-MM-DD)
- `startDate?: string` - Filter from date
- `endDate?: string` - Filter to date
- `type?: DiaryEntryType` - Filter by entry type
- `tag?: string` - Filter by tag
- `favorite?: boolean` - Filter favorites only

**Response:**
```json
{
  "entries": [
    {
      "id": "1736870400000-abc123",
      "type": "note",
      "content": "Project ideas for Q1: implement dark mode, add export feature",
      "createdAt": 1736870400000,
      "updatedAt": 1736870400000,
      "date": "2026-01-14",
      "time": "14:30",
      "mood": {
        "level": 4,
        "emoji": "🙂",
        "note": "Productive day"
      },
      "linkedTaskId": null,
      "tags": ["work", "ideas"],
      "favorite": false,
      "files": []
    }
  ]
}
```

### POST /api/diary/entries

Creates a new diary entry.

**Request:**
```json
{
  "type": "note",
  "content": "Team meeting - discussed Q1 goals",
  "date": "2026-01-14",
  "time": "10:00",
  "mood": {
    "level": 4,
    "emoji": "🙂",
    "note": null
  },
  "tags": ["meeting", "work"]
}
```

**Response:**
```json
{
  "id": "1736870400000-abc123",
  "type": "note",
  "content": "Team meeting - discussed Q1 goals",
  "createdAt": 1736870400000,
  "updatedAt": 1736870400000,
  "date": "2026-01-14",
  "time": "10:00",
  "mood": {
    "level": 4,
    "emoji": "🙂",
    "note": null
  },
  "linkedTaskId": null,
  "tags": ["meeting", "work"],
  "favorite": false,
  "files": []
}
```

### PUT /api/diary/entries/:id

Updates an existing diary entry.

**Request:**
```json
{
  "content": "Updated meeting notes with action items",
  "mood": {
    "level": 5,
    "emoji": "😄",
    "note": "Great outcomes!"
  },
  "tags": ["meeting", "work", "important"],
  "favorite": true
}
```

**Response:** Updated `DiaryEntry` object

### DELETE /api/diary/entries/:id

Deletes a diary entry.

**Response:**
```json
{
  "success": true,
  "deletedId": "1736870400000-abc123"
}
```

---

## Entry Actions

### POST /api/diary/entries/:id/create-task

Creates a task from a diary entry content.

**Request:**
```json
{
  "taskTitle": "Review project proposal",
  "category": "Tasks"
}
```

**Response:**
```json
{
  "taskId": "1736870500000-def456",
  "entry": {
    "id": "1736870400000-abc123",
    "type": "task-created",
    "linkedTaskId": "1736870500000-def456",
    "...rest of entry..."
  }
}
```

### PUT /api/diary/entries/:id/favorite

Toggles favorite status.

**Response:**
```json
{
  "id": "1736870400000-abc123",
  "favorite": true
}
```

### PUT /api/diary/entries/:id/mood

Updates mood for an entry.

**Request:**
```json
{
  "mood": {
    "level": 5,
    "emoji": "😄",
    "note": "Feeling great!"
  }
}
```

**Response:** Updated `DiaryEntry` object

### PUT /api/diary/entries/:id/tags

Updates tags for an entry.

**Request:**
```json
{
  "tags": ["work", "important", "meeting"]
}
```

**Response:** Updated `DiaryEntry` object

---

## File Attachments

### POST /api/diary/entries/:id/files

Adds a file attachment to an entry.

**Request (multipart/form-data):**
- `file`: File binary
- `name`: Original filename

**Response:**
```json
{
  "file": {
    "id": "1736870600000-file123",
    "name": "screenshot.png",
    "url": "file:///path/to/screenshot.png",
    "type": "image",
    "mimeType": "image/png",
    "size": 245678,
    "addedAt": 1736870600000
  }
}
```

### DELETE /api/diary/entries/:id/files/:fileId

Removes a file attachment from an entry.

**Response:**
```json
{
  "success": true,
  "deletedFileId": "1736870600000-file123"
}
```

---

## Summary Endpoints

### GET /api/diary/summary/:date

Returns daily summary for a specific date.

**Response:**
```json
{
  "date": "2026-01-14",
  "entries": [
    { "...entry objects..." }
  ],
  "moodSummary": {
    "date": "2026-01-14",
    "averageMood": 3.8,
    "moodCount": 4,
    "dominantMood": 4
  },
  "tasksCreated": 2,
  "tasksCompleted": 5,
  "pomodorosCompleted": 6,
  "totalFocusTime": 10800
}
```

### GET /api/diary/mood/calendar

Returns mood data for calendar visualization.

**Query Parameters:**
- `month: string` - Month in YYYY-MM format

**Response:**
```json
{
  "month": "2026-01",
  "days": [
    { "date": "2026-01-01", "averageMood": 4.2, "entryCount": 3 },
    { "date": "2026-01-02", "averageMood": 3.5, "entryCount": 5 },
    { "date": "2026-01-03", "averageMood": null, "entryCount": 0 },
    { "date": "2026-01-14", "averageMood": 4.0, "entryCount": 4 }
  ]
}
```

---

## Statistics Endpoints

### GET /api/diary/stats

Returns diary statistics for a period.

**Query Parameters:**
- `period: StatsPeriod` - day, week, month, year, all

**Response:**
```json
{
  "period": "month",
  "totalEntries": 87,
  "entriesByType": {
    "note": 45,
    "event": 20,
    "mood": 15,
    "task-created": 5,
    "task-completed": 2,
    "pomodoro-summary": 0
  },
  "averageMood": 3.6,
  "moodTrend": "improving",
  "mostActiveDay": "Monday",
  "mostActiveHour": 10,
  "topTags": [
    { "tag": "work", "count": 32 },
    { "tag": "personal", "count": 18 },
    { "tag": "ideas", "count": 12 }
  ],
  "entriesPerDay": 2.9,
  "streakDays": 14
}
```

---

## Tags Endpoints

### GET /api/diary/tags

Returns all unique tags used in diary entries.

**Response:**
```json
{
  "tags": [
    { "name": "work", "count": 32 },
    { "name": "personal", "count": 18 },
    { "name": "ideas", "count": 12 },
    { "name": "meeting", "count": 8 }
  ]
}
```

---

## Settings

### GET /api/diary/settings

Returns diary settings.

**Response:**
```json
{
  "autoLogTaskCompletion": false,
  "autoLogPomodoroSummary": false,
  "showMoodPromptOnOpen": true,
  "defaultEntryType": "note"
}
```

### PUT /api/diary/settings

Updates diary settings.

**Request:**
```json
{
  "autoLogTaskCompletion": true,
  "showMoodPromptOnOpen": false
}
```

**Response:** Updated settings object

---

## Integration Events

### TaskCompletedEvent (from tasks-api)

When `autoLogTaskCompletion` is enabled, creates a diary entry:

```typescript
interface TaskCompletedEvent {
  taskId: string;
  taskTitle: string;
  completedAt: number;
  projectId: string | null;
}
```

**Auto-created entry:**
```json
{
  "type": "task-completed",
  "content": "Completed: Review project proposal",
  "linkedTaskId": "task-123",
  "date": "2026-01-14",
  "time": "15:30"
}
```

### PomodoroDailySummary (from pomodoro-api)

When `autoLogPomodoroSummary` is enabled, creates a daily summary entry:

```typescript
interface PomodoroDailySummary {
  date: string;
  totalSessions: number;
  completedSessions: number;
  totalFocusTime: number;
}
```

**Auto-created entry:**
```json
{
  "type": "pomodoro-summary",
  "content": "Today: 6 pomodoros completed (3h focus time)",
  "date": "2026-01-14",
  "time": "23:59"
}
```
