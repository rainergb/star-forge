# API Contracts - Projects

## 📁 PROJECTS

### Tipos Base

```typescript
type ProjectStatus = "active" | "paused" | "completed" | "archived";

type ProjectColor = 
  | "purple" 
  | "blue" 
  | "green" 
  | "orange" 
  | "red" 
  | "pink" 
  | "cyan" 
  | "yellow";

interface ProjectIcon {
  type: "emoji" | "lucide";
  value: string;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  color: ProjectColor;
  icon: ProjectIcon;
  status: ProjectStatus;
  favorite: boolean;
  createdAt: number;       // timestamp em ms
  updatedAt: number;       // timestamp em ms
  dueDate: number | null;  // timestamp em ms
  estimatedPomodoros: number | null;
  completedPomodoros: number;
  totalTimeSpent: number;  // em segundos
  sortOrder: number;
}

interface ProjectStats {
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

---

## CRUD de Projects

### GET /api/projects

Retorna todos os projetos do usuário.

**Query Params:**
- `status`: filtrar por status (active, paused, completed, archived)
- `favorite`: filtrar favoritos (true/false)

**Response:**
```json
{
  "projects": [
    {
      "id": "1735570800000-abc123",
      "name": "Aprender TypeScript",
      "description": "Dominar TypeScript em 30 dias",
      "color": "purple",
      "icon": {
        "type": "lucide",
        "value": "Code"
      },
      "status": "active",
      "favorite": true,
      "createdAt": 1735570800000,
      "updatedAt": 1735570800000,
      "dueDate": 1738249200000,
      "estimatedPomodoros": 60,
      "completedPomodoros": 18,
      "totalTimeSpent": 27000,
      "sortOrder": 0
    }
  ]
}
```

### POST /api/projects

Cria um novo projeto.

**Request:**
```json
{
  "name": "Aprender TypeScript",
  "description": "Dominar TypeScript em 30 dias",
  "color": "purple",
  "icon": {
    "type": "lucide",
    "value": "Code"
  },
  "dueDate": 1738249200000,
  "estimatedPomodoros": 60
}
```

**Response:**
```json
{
  "id": "1735570800000-abc123",
  "name": "Aprender TypeScript",
  "description": "Dominar TypeScript em 30 dias",
  "color": "purple",
  "icon": {
    "type": "lucide",
    "value": "Code"
  },
  "status": "active",
  "favorite": false,
  "createdAt": 1735570800000,
  "updatedAt": 1735570800000,
  "dueDate": 1738249200000,
  "estimatedPomodoros": 60,
  "completedPomodoros": 0,
  "totalTimeSpent": 0,
  "sortOrder": 0
}
```

### GET /api/projects/:id

Retorna um projeto específico.

**Response:**
```json
{
  "id": "1735570800000-abc123",
  "name": "Aprender TypeScript",
  "description": "Dominar TypeScript em 30 dias",
  "color": "purple",
  "icon": {
    "type": "lucide",
    "value": "Code"
  },
  "status": "active",
  "favorite": true,
  "createdAt": 1735570800000,
  "updatedAt": 1735570800000,
  "dueDate": 1738249200000,
  "estimatedPomodoros": 60,
  "completedPomodoros": 18,
  "totalTimeSpent": 27000,
  "sortOrder": 0
}
```

### PUT /api/projects/:id

Atualiza um projeto existente.

**Request:**
```json
{
  "name": "Dominar TypeScript",
  "description": "Estudar TypeScript avançado",
  "color": "blue",
  "dueDate": 1738249200000,
  "estimatedPomodoros": 80
}
```

**Response:**
```json
{
  "id": "1735570800000-abc123",
  "name": "Dominar TypeScript",
  "description": "Estudar TypeScript avançado",
  "color": "blue",
  "icon": {
    "type": "lucide",
    "value": "Code"
  },
  "status": "active",
  "favorite": true,
  "createdAt": 1735570800000,
  "updatedAt": 1735571000000,
  "dueDate": 1738249200000,
  "estimatedPomodoros": 80,
  "completedPomodoros": 18,
  "totalTimeSpent": 27000,
  "sortOrder": 0
}
```

### DELETE /api/projects/:id

Remove um projeto.

**Query Params:**
- `deleteTasks`: se true, remove também as tasks associadas (default: false)

**Response:**
```json
{
  "success": true,
  "deletedId": "1735570800000-abc123",
  "tasksUnlinked": 5
}
```

---

## Status & Favoritos

### PATCH /api/projects/:id/status

Altera o status do projeto.

**Request:**
```json
{
  "status": "paused"
}
```

**Response:**
```json
{
  "id": "1735570800000-abc123",
  "status": "paused",
  "updatedAt": 1735571000000
}
```

### PATCH /api/projects/:id/toggle-favorite

Alterna o status de favorito.

**Response:**
```json
{
  "id": "1735570800000-abc123",
  "favorite": true
}
```

---

## Tasks do Projeto

### GET /api/projects/:id/tasks

Retorna todas as tasks de um projeto.

**Query Params:**
- `completed`: filtrar por status (true/false)
- `limit`: limite de resultados
- `offset`: paginação

**Response:**
```json
{
  "tasks": [
    {
      "id": "task-123",
      "title": "Estudar Generics",
      "projectId": "1735570800000-abc123",
      "completed": false,
      "estimatedPomodoros": 4,
      "completedPomodoros": 2,
      "totalTimeSpent": 3000
    }
  ],
  "total": 12,
  "limit": 20,
  "offset": 0
}
```

---

## Estatísticas

### GET /api/projects/:id/stats

Retorna estatísticas do projeto.

**Response:**
```json
{
  "projectId": "1735570800000-abc123",
  "totalTasks": 12,
  "completedTasks": 8,
  "pendingTasks": 4,
  "totalPomodoros": 60,
  "completedPomodoros": 18,
  "totalTimeSpent": 27000,
  "completionPercentage": 66.67,
  "estimatedTimeRemaining": 63000,
  "tasksByStatus": {
    "completed": 8,
    "inProgress": 2,
    "pending": 2
  },
  "pomodorosByDay": {
    "2026-01-05": 4,
    "2026-01-06": 6,
    "2026-01-07": 8
  }
}
```

---

## Reordenação

### PUT /api/projects/reorder

Reordena os projetos.

**Request:**
```json
{
  "projectIds": [
    "project-3",
    "project-1",
    "project-2"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "updatedAt": 1735571000000
}
```

---

## Pomodoro Tracking

### POST /api/projects/:id/pomodoro-complete

Registra um pomodoro completado no projeto (chamado automaticamente quando uma task do projeto completa um pomodoro).

**Request:**
```json
{
  "duration": 1500,
  "taskId": "task-123"
}
```

**Response:**
```json
{
  "id": "1735570800000-abc123",
  "completedPomodoros": 19,
  "totalTimeSpent": 28500,
  "updatedAt": 1735571000000
}
```

---

## 📊 Resumo de Endpoints - Projects

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
| POST | `/api/projects/:id/pomodoro-complete` | Registrar pomodoro |

---

## Relação com Tasks

A Task agora possui um campo `projectId` que referencia o projeto:

```typescript
interface Task {
  // ... outros campos
  projectId: string | null;  // referência ao projeto
}
```

### Endpoints de Tasks atualizados

#### PATCH /api/tasks/:id/project

Move uma task para um projeto (ou remove do projeto).

**Request:**
```json
{
  "projectId": "project-123"
}
```

ou para remover do projeto:
```json
{
  "projectId": null
}
```

**Response:**
```json
{
  "id": "task-123",
  "projectId": "project-123",
  "updatedAt": 1735571000000
}
```
