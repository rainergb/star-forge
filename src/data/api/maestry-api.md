# API Contracts - Maestry (Skills)

## 🎯 SKILLS

### Base Types

```typescript
type SkillColor =
  | "purple"
  | "blue"
  | "green"
  | "orange"
  | "red"
  | "pink"
  | "cyan"
  | "yellow";

interface SkillIcon {
  type: "emoji" | "lucide";
  value: string;
}

type MasteryLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface MasteryLevelInfo {
  level: MasteryLevel;
  name: string;
  minHours: number;
  maxHours: number;
  description: string;
}

interface Skill {
  id: string;
  name: string;
  description: string | null;
  color: SkillColor;
  icon: SkillIcon;
  createdAt: number;           // timestamp in ms
  updatedAt: number;           // timestamp in ms
  totalTimeSpent: number;      // total time in seconds
  totalPomodoros: number;      // total completed pomodoros
  currentLevel: MasteryLevel;  // calculated from totalTimeSpent
  archived: boolean;
}

interface SkillStats {
  skillId: string;
  currentLevel: MasteryLevel;
  currentLevelName: string;
  totalHours: number;
  hoursToNextLevel: number;
  progressPercentage: number;
  totalPomodoros: number;
  totalTasks: number;
  activeTasks: number;
}
```

### Mastery Levels

| Level | Name        | Hours Range   |
|-------|-------------|---------------|
| 1     | Beginner    | 0 – 100       |
| 2     | Apprentice  | 100 – 500     |
| 3     | Practitioner| 500 – 2,000   |
| 4     | Competent   | 2,000 – 4,000 |
| 5     | Advanced    | 4,000 – 6,500 |
| 6     | Expert      | 6,500 – 9,000 |
| 7     | Master      | 9,000 – 10,000+ |

---

## CRUD Operations

### GET /api/skills

Returns all skills for the user.

**Query Params:**
- `archived`: filter by archived status (true/false)

**Response:**
```json
{
  "skills": [
    {
      "id": "1735570800000-abc123",
      "name": "TypeScript",
      "description": "Mastering TypeScript for better code quality",
      "color": "blue",
      "icon": {
        "type": "lucide",
        "value": "Code"
      },
      "createdAt": 1735570800000,
      "updatedAt": 1735580800000,
      "totalTimeSpent": 180000,
      "totalPomodoros": 120,
      "currentLevel": 2,
      "archived": false
    }
  ]
}
```

### POST /api/skills

Creates a new skill.

**Request:**
```json
{
  "name": "TypeScript",
  "description": "Mastering TypeScript for better code quality",
  "color": "blue",
  "icon": {
    "type": "lucide",
    "value": "Code"
  }
}
```

**Response:**
```json
{
  "id": "1735570800000-abc123",
  "name": "TypeScript",
  "description": "Mastering TypeScript for better code quality",
  "color": "blue",
  "icon": {
    "type": "lucide",
    "value": "Code"
  },
  "createdAt": 1735570800000,
  "updatedAt": 1735570800000,
  "totalTimeSpent": 0,
  "totalPomodoros": 0,
  "currentLevel": 1,
  "archived": false
}
```

### GET /api/skills/:id

Returns a specific skill.

**Response:**
```json
{
  "id": "1735570800000-abc123",
  "name": "TypeScript",
  "description": "Mastering TypeScript for better code quality",
  "color": "blue",
  "icon": {
    "type": "lucide",
    "value": "Code"
  },
  "createdAt": 1735570800000,
  "updatedAt": 1735580800000,
  "totalTimeSpent": 180000,
  "totalPomodoros": 120,
  "currentLevel": 2,
  "archived": false
}
```

### PUT /api/skills/:id

Updates an existing skill.

**Request:**
```json
{
  "name": "TypeScript Advanced",
  "description": "Advanced TypeScript patterns and practices",
  "color": "purple"
}
```

**Response:**
```json
{
  "id": "1735570800000-abc123",
  "name": "TypeScript Advanced",
  "description": "Advanced TypeScript patterns and practices",
  "color": "purple",
  "icon": {
    "type": "lucide",
    "value": "Code"
  },
  "createdAt": 1735570800000,
  "updatedAt": 1735590800000,
  "totalTimeSpent": 180000,
  "totalPomodoros": 120,
  "currentLevel": 2,
  "archived": false
}
```

### DELETE /api/skills/:id

Removes a skill.

**Response:**
```json
{
  "success": true,
  "deletedId": "1735570800000-abc123"
}
```

### PATCH /api/skills/:id/archive

Toggles archive status.

**Response:**
```json
{
  "id": "1735570800000-abc123",
  "archived": true
}
```

---

## Time Tracking

### POST /api/skills/:id/add-time

Adds time to a skill (called when Pomodoro completes).

**Request:**
```json
{
  "duration": 1500,
  "sessionId": "1735580000000-session123",
  "taskId": "1735575000000-task456"
}
```

**Response:**
```json
{
  "id": "1735570800000-abc123",
  "totalTimeSpent": 181500,
  "totalPomodoros": 121,
  "currentLevel": 2,
  "previousLevel": 2,
  "leveledUp": false
}
```

### POST /api/skills/batch-add-time

Adds time to multiple skills at once (when task has multiple linked skills).

**Request:**
```json
{
  "skillIds": ["skill1", "skill2", "skill3"],
  "duration": 1500,
  "sessionId": "1735580000000-session123",
  "taskId": "1735575000000-task456"
}
```

**Response:**
```json
{
  "results": [
    {
      "skillId": "skill1",
      "totalTimeSpent": 181500,
      "currentLevel": 2,
      "leveledUp": false
    },
    {
      "skillId": "skill2",
      "totalTimeSpent": 50000,
      "currentLevel": 1,
      "leveledUp": false
    },
    {
      "skillId": "skill3",
      "totalTimeSpent": 360000,
      "currentLevel": 2,
      "leveledUp": true
    }
  ]
}
```

---

## Statistics

### GET /api/skills/:id/stats

Returns detailed statistics for a skill.

**Response:**
```json
{
  "skillId": "1735570800000-abc123",
  "currentLevel": 2,
  "currentLevelName": "Apprentice",
  "totalHours": 50,
  "hoursToNextLevel": 450,
  "progressPercentage": 12.5,
  "totalPomodoros": 120,
  "totalTasks": 15,
  "activeTasks": 3,
  "weeklyHours": 5.5,
  "monthlyHours": 22,
  "streakDays": 7,
  "lastPracticed": 1735580800000
}
```

### GET /api/skills/summary

Returns summary statistics for all skills.

**Response:**
```json
{
  "totalSkills": 5,
  "activeSkills": 4,
  "archivedSkills": 1,
  "totalHoursAllSkills": 250,
  "totalPomodorosAllSkills": 600,
  "skillsByLevel": {
    "1": 1,
    "2": 2,
    "3": 1,
    "4": 0,
    "5": 0,
    "6": 0,
    "7": 0
  },
  "topSkills": [
    {
      "id": "skill1",
      "name": "TypeScript",
      "totalHours": 120,
      "currentLevel": 3
    }
  ]
}
```

---

## Task Integration

### Task Model Extension

Tasks now include a `skillIds` field:

```typescript
interface Task {
  // ... existing fields
  skillIds: string[];  // Array of skill IDs
}
```

### PUT /api/tasks/:id/skills

Updates skills linked to a task.

**Request:**
```json
{
  "skillIds": ["skill1", "skill2", "skill3"]
}
```

**Response:**
```json
{
  "id": "1735575000000-task456",
  "skillIds": ["skill1", "skill2", "skill3"]
}
```

---

## Pomodoro Session Integration

When a Pomodoro session completes for a task with linked skills:

1. Backend fetches the task's `skillIds`
2. For each skill in `skillIds`:
   - Add session duration to `totalTimeSpent`
   - Increment `totalPomodoros`
   - Recalculate `currentLevel`
3. Return updated skill data

### POST /api/pomodoro/complete (updated)

**Request:**
```json
{
  "sessionId": "session123",
  "taskId": "task456",
  "duration": 1500,
  "mode": "work",
  "completed": true
}
```

**Response (updated):**
```json
{
  "session": {
    "id": "session123",
    "taskId": "task456",
    "duration": 1500,
    "mode": "work",
    "completed": true
  },
  "skillsUpdated": [
    {
      "skillId": "skill1",
      "timeAdded": 1500,
      "newTotal": 181500,
      "leveledUp": false
    }
  ]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid skill data",
  "message": "Skill name is required"
}
```

### 404 Not Found
```json
{
  "error": "Skill not found",
  "message": "No skill found with id: abc123"
}
```

### 409 Conflict
```json
{
  "error": "Duplicate skill",
  "message": "A skill with this name already exists"
}
```
