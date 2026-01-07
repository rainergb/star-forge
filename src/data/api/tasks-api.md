# API Contracts - Tasks

## 📋 TASKS

### Tipos Base

```typescript
interface TaskStep {
  id: string;
  title: string;
  completed: boolean;
}

interface TaskReminder {
  date: number;        // timestamp em ms
  label: string;
}

interface TaskFile {
  id: string;
  name: string;
  url: string;
  addedAt: number;     // timestamp em ms
}

interface TaskNote {
  id: string;
  content: string;
  createdAt: number;   // timestamp em ms
  updatedAt: number;   // timestamp em ms
}

interface Task {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  favorite: boolean;
  createdAt: number;   // timestamp em ms
  index: number;       // ordem da task na lista (para reordenação drag-and-drop)
  steps: TaskStep[];
  dueDate: number | null;
  reminder: TaskReminder | null;
  repeat: RepeatType;
  files: TaskFile[];
  notes: TaskNote[];   // array de notas/comentários
  estimatedPomodoros: number | null;  // pomodoros estimados para a task
  completedPomodoros: number;         // pomodoros concluídos
  totalTimeSpent: number;             // tempo total gasto em segundos
}
```

---

## CRUD de Tasks

### GET /api/tasks

Retorna todas as tasks do usuário.

**Response:**
```json
{
  "tasks": [
    {
      "id": "1735570800000-abc123",
      "title": "Estudar TypeScript",
      "category": "Estudos",
      "completed": false,
      "favorite": true,
      "createdAt": 1735570800000,
      "steps": [
        {
          "id": "1735570900000-def456",
          "title": "Ler documentação",
          "completed": true
        },
        {
          "id": "1735571000000-ghi789",
          "title": "Fazer exercícios",
          "completed": false
        }
      ],
      "dueDate": 1735660800000,
      "reminder": {
        "date": 1735657200000,
        "label": "Amanhã"
      },
      "files": [
        {
          "id": "1735571100000-jkl012",
          "name": "notas.pdf",
          "url": "file:///path/to/notas.pdf",
          "addedAt": 1735571100000
        }
      ],
      "notes": [
        {
          "id": "1735571200000-mno345",
          "content": "Foco em generics e utility types",
          "createdAt": 1735571200000,
          "updatedAt": 1735571200000
        },
        {
          "id": "1735572000000-pqr678",
          "content": "Revisar decorators também",
          "createdAt": 1735572000000,
          "updatedAt": 1735572000000
        }
      ]
    }
  ]
}
```

### POST /api/tasks

Cria uma nova task.

**Request:**
```json
{
  "title": "Estudar TypeScript",
  "category": "Estudos"
}
```

**Response:**
```json
{
  "id": "1735570800000-abc123",
  "title": "Estudar TypeScript",
  "category": "Estudos",
  "completed": false,
  "favorite": false,
  "createdAt": 1735570800000,
  "steps": [],
  "dueDate": null,
  "reminder": null,
  "files": [],
  "notes": []
}
```

### PUT /api/tasks/:id

Atualiza uma task existente (campos básicos, sem notes).

**Request:**
```json
{
  "title": "Estudar TypeScript Avançado",
  "category": "Estudos",
  "completed": false,
  "favorite": true,
  "dueDate": 1735660800000
}
```

**Response:**
```json
{
  "id": "1735570800000-abc123",
  "title": "Estudar TypeScript Avançado",
  "category": "Estudos",
  "completed": false,
  "favorite": true,
  "createdAt": 1735570800000,
  "steps": [],
  "dueDate": 1735660800000,
  "reminder": null,
  "files": [],
  "notes": []
}
```

### DELETE /api/tasks/:id

Remove uma task.

**Response:**
```json
{
  "success": true,
  "deletedId": "1735570800000-abc123"
}
```

### PATCH /api/tasks/:id/toggle-completed

Alterna o status de completude.

**Response:**
```json
{
  "id": "1735570800000-abc123",
  "completed": true
}
```

### PATCH /api/tasks/:id/toggle-favorite

Alterna o status de favorito.

**Response:**
```json
{
  "id": "1735570800000-abc123",
  "favorite": true
}
```

### PATCH /api/tasks/reorder

Reordena as tasks (drag-and-drop).

**Request:**
```json
{
  "taskIds": ["id1", "id2", "id3"]
}
```

**Response:**
```json
{
  "success": true,
  "tasks": [
    { "id": "id1", "index": 0 },
    { "id": "id2", "index": 1 },
    { "id": "id3", "index": 2 }
  ]
}
```

---

## 📝 TASK STEPS

### POST /api/tasks/:taskId/steps

Adiciona um step à task.

**Request:**
```json
{
  "title": "Ler documentação oficial"
}
```

**Response:**
```json
{
  "id": "1735570900000-def456",
  "title": "Ler documentação oficial",
  "completed": false
}
```

### PATCH /api/tasks/:taskId/steps/:stepId/toggle

Alterna completude do step.

**Response:**
```json
{
  "id": "1735570900000-def456",
  "completed": true
}
```

### DELETE /api/tasks/:taskId/steps/:stepId

Remove um step.

**Response:**
```json
{
  "success": true,
  "deletedStepId": "1735570900000-def456"
}
```

---

## ⏰ TASK REMINDER

### PUT /api/tasks/:taskId/reminder

Define ou atualiza reminder.

**Request:**
```json
{
  "date": 1735657200000,
  "label": "Amanhã às 10h"
}
```

**Response:**
```json
{
  "taskId": "1735570800000-abc123",
  "reminder": {
    "date": 1735657200000,
    "label": "Amanhã às 10h"
  }
}
```

### DELETE /api/tasks/:taskId/reminder

Remove reminder.

**Response:**
```json
{
  "taskId": "1735570800000-abc123",
  "reminder": null
}
```

---

## 📎 TASK FILES

### POST /api/tasks/:taskId/files

Adiciona arquivo à task.

**Request (multipart/form-data):**
```
file: <binary>
```

**Response:**
```json
{
  "id": "1735571100000-jkl012",
  "name": "documento.pdf",
  "url": "https://storage.example.com/files/documento.pdf",
  "addedAt": 1735571100000
}
```

### DELETE /api/tasks/:taskId/files/:fileId

Remove arquivo da task.

**Response:**
```json
{
  "success": true,
  "deletedFileId": "1735571100000-jkl012"
}
```

---

## 📝 TASK NOTES

### POST /api/tasks/:taskId/notes

Adiciona uma nota/comentário à task.

**Request:**
```json
{
  "content": "Lembrar de revisar os exemplos práticos"
}
```

**Response:**
```json
{
  "id": "1735571200000-mno345",
  "content": "Lembrar de revisar os exemplos práticos",
  "createdAt": 1735571200000,
  "updatedAt": 1735571200000
}
```

### PUT /api/tasks/:taskId/notes/:noteId

Edita uma nota existente.

**Request:**
```json
{
  "content": "Lembrar de revisar os exemplos práticos e fazer exercícios"
}
```

**Response:**
```json
{
  "id": "1735571200000-mno345",
  "content": "Lembrar de revisar os exemplos práticos e fazer exercícios",
  "createdAt": 1735571200000,
  "updatedAt": 1735573000000
}
```

### DELETE /api/tasks/:taskId/notes/:noteId

Remove uma nota.

**Response:**
```json
{
  "success": true,
  "deletedNoteId": "1735571200000-mno345"
}
```

---

## 📊 Resumo de Endpoints - Tasks

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/tasks` | Listar todas tasks |
| POST | `/api/tasks` | Criar task |
| PUT | `/api/tasks/:id` | Atualizar task |
| DELETE | `/api/tasks/:id` | Remover task |
| PATCH | `/api/tasks/:id/toggle-completed` | Toggle completude |
| PATCH | `/api/tasks/:id/toggle-favorite` | Toggle favorito |
| POST | `/api/tasks/:taskId/steps` | Adicionar step |
| PATCH | `/api/tasks/:taskId/steps/:stepId/toggle` | Toggle step |
| DELETE | `/api/tasks/:taskId/steps/:stepId` | Remover step |
| PUT | `/api/tasks/:taskId/reminder` | Definir reminder |
| DELETE | `/api/tasks/:taskId/reminder` | Remover reminder |
| POST | `/api/tasks/:taskId/files` | Upload arquivo |
| DELETE | `/api/tasks/:taskId/files/:fileId` | Remover arquivo |
| PUT | `/api/tasks/:taskId/estimated-pomodoros` | Definir pomodoros estimados |
| POST | `/api/tasks/:taskId/pomodoro-complete` | Registrar pomodoro concluído |
| GET | `/api/tasks/:taskId/pomodoro-stats` | Obter estatísticas pomodoro |

---

## 🍅 Pomodoro Integration

### PUT /api/tasks/:taskId/estimated-pomodoros

Define o número estimado de pomodoros para uma task.

**Request:**
```json
{
  "estimatedPomodoros": 4
}
```

**Response:**
```json
{
  "task": {
    "id": "1735570800000-abc123",
    "estimatedPomodoros": 4,
    "completedPomodoros": 0,
    "totalTimeSpent": 0
  }
}
```

### POST /api/tasks/:taskId/pomodoro-complete

Registra a conclusão de um pomodoro vinculado à task.

**Request:**
```json
{
  "duration": 1500,
  "sessionId": "1735580000000-xyz789"
}
```

**Response:**
```json
{
  "task": {
    "id": "1735570800000-abc123",
    "completedPomodoros": 3,
    "totalTimeSpent": 4500
  }
}
```

### GET /api/tasks/:taskId/pomodoro-stats

Retorna estatísticas de pomodoro para uma task específica.

**Response:**
```json
{
  "taskId": "1735570800000-abc123",
  "taskTitle": "Estudar TypeScript",
  "estimatedPomodoros": 4,
  "completedPomodoros": 3,
  "totalTimeSpent": 4500,
  "progress": 75,
  "sessions": [
    {
      "id": "1735580000000-xyz789",
      "startedAt": 1735580000000,
      "duration": 1500,
      "completed": true
    }
  ]
}
| POST | `/api/tasks/:taskId/notes` | Adicionar nota |
| PUT | `/api/tasks/:taskId/notes/:noteId` | Editar nota |
| DELETE | `/api/tasks/:taskId/notes/:noteId` | Remover nota |
