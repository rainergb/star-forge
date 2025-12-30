# API Contracts - Sync

## 🔄 BULK OPERATIONS

Para sincronização offline/online, pode ser útil ter endpoints de bulk.

### POST /api/sync

Sincroniza todos os dados de uma vez.

**Request:**
```json
{
  "lastSyncAt": 1735484400000,
  "tasks": {
    "created": [
      {
        "id": "local-123",
        "title": "Nova Task",
        "category": "Geral",
        "completed": false,
        "favorite": false,
        "createdAt": 1735570800000,
        "steps": [],
        "dueDate": null,
        "reminder": null,
        "files": [],
        "notes": []
      }
    ],
    "updated": [
      {
        "id": "1735400000000-abc",
        "completed": true
      }
    ],
    "deleted": ["1735300000000-xyz"]
  },
  "config": {
    "timer": {
      "pomodoro": 25,
      "shortBreak": 5,
      "longBreak": 15,
      "autoStartBreaks": false,
      "autoStartPomodoros": false,
      "longBreakInterval": 4
    },
    "personalize": {
      "showBg": true,
      "showTest": false,
      "notificationSound": true,
      "notificationVolume": 50
    }
  },
  "pomodoro": {
    "sessions": [
      {
        "mode": "work",
        "duration": 1500,
        "completed": true,
        "startedAt": 1735569300000
      }
    ]
  }
}
```

**Response:**
```json
{
  "syncedAt": 1735570800000,
  "tasks": {
    "created": [
      {
        "localId": "local-123",
        "serverId": "1735570800000-abc123"
      }
    ],
    "conflicts": [],
    "serverChanges": []
  },
  "config": {
    "synced": true
  },
  "pomodoro": {
    "sessionsSaved": 1
  }
}
```

---

## 📊 Resumo de Endpoints - Sync

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/sync` | Sincronização bulk |
