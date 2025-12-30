# API Contracts - Pomodoro

## 🍅 SESSION STATE

### Tipos Base

```typescript
type TimerMode = "work" | "shortBreak" | "longBreak";

interface PomodoroState {
  timeLeft: number;          // segundos restantes
  isActive: boolean;         // timer está rodando
  mode: TimerMode;           // modo atual
  completedCycles: number;   // ciclos completos
  hasStarted: boolean;       // sessão iniciada
  isTestMode: boolean;       // modo teste (1 segundo)
}

interface PomodoroSession {
  id: string;
  userId: string;
  startedAt: number;         // timestamp início
  endedAt: number | null;    // timestamp fim
  mode: TimerMode;
  duration: number;          // duração em segundos
  completed: boolean;        // finalizou naturalmente
}
```

---

## Estado do Timer

### GET /api/pomodoro/state

Retorna estado atual do timer (para sincronização entre dispositivos).

**Response:**
```json
{
  "timeLeft": 1245,
  "isActive": true,
  "mode": "work",
  "completedCycles": 2,
  "hasStarted": true,
  "isTestMode": false,
  "serverTime": 1735570800000
}
```

### PUT /api/pomodoro/state

Sincroniza estado do timer.

**Request:**
```json
{
  "timeLeft": 1200,
  "isActive": true,
  "mode": "work",
  "completedCycles": 2,
  "hasStarted": true,
  "isTestMode": false
}
```

**Response:**
```json
{
  "success": true,
  "syncedAt": 1735570800000
}
```

---

## Sessões

### POST /api/pomodoro/sessions

Registra uma sessão completada (para histórico/estatísticas).

**Request:**
```json
{
  "mode": "work",
  "duration": 1500,
  "completed": true,
  "startedAt": 1735569300000
}
```

**Response:**
```json
{
  "id": "session-1735570800000",
  "userId": "user-123",
  "mode": "work",
  "duration": 1500,
  "completed": true,
  "startedAt": 1735569300000,
  "endedAt": 1735570800000
}
```

### GET /api/pomodoro/sessions

Retorna histórico de sessões.

**Query Params:**
- `startDate`: timestamp início do período
- `endDate`: timestamp fim do período
- `mode`: filtrar por modo (work, shortBreak, longBreak)
- `limit`: limite de resultados
- `offset`: paginação

**Response:**
```json
{
  "sessions": [
    {
      "id": "session-1735570800000",
      "userId": "user-123",
      "mode": "work",
      "duration": 1500,
      "completed": true,
      "startedAt": 1735569300000,
      "endedAt": 1735570800000
    }
  ],
  "total": 42,
  "limit": 20,
  "offset": 0
}
```

---

## Estatísticas

### GET /api/pomodoro/stats

Retorna estatísticas agregadas.

**Query Params:**
- `period`: day, week, month, year, all

**Response:**
```json
{
  "period": "week",
  "totalSessions": 28,
  "totalWorkTime": 42000,
  "totalBreakTime": 12600,
  "completedCycles": 7,
  "averageSessionLength": 1500,
  "longestStreak": 4,
  "byDay": {
    "2024-12-30": {
      "sessions": 4,
      "workTime": 6000,
      "cycles": 1
    }
  }
}
```

---

## 📊 Resumo de Endpoints - Pomodoro

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/pomodoro/state` | Obter estado timer |
| PUT | `/api/pomodoro/state` | Sincronizar estado |
| POST | `/api/pomodoro/sessions` | Registrar sessão |
| GET | `/api/pomodoro/sessions` | Histórico sessões |
| GET | `/api/pomodoro/stats` | Estatísticas |
