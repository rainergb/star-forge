# API Contracts - Config

## ⚙️ TIMER SETTINGS

### Tipo Base

```typescript
interface TimerSettings {
  pomodoro: number;           // minutos (padrão: 25)
  shortBreak: number;         // minutos (padrão: 5)
  longBreak: number;          // minutos (padrão: 15)
  autoStartBreaks: boolean;   // auto iniciar pausas
  autoStartPomodoros: boolean; // auto iniciar pomodoros
  longBreakInterval: number;  // ciclos até pausa longa (padrão: 4)
}
```

### GET /api/config/timer

Retorna configurações do timer.

**Response:**
```json
{
  "pomodoro": 25,
  "shortBreak": 5,
  "longBreak": 15,
  "autoStartBreaks": false,
  "autoStartPomodoros": false,
  "longBreakInterval": 4
}
```

### PUT /api/config/timer

Salva configurações do timer.

**Request:**
```json
{
  "pomodoro": 30,
  "shortBreak": 10,
  "longBreak": 20,
  "autoStartBreaks": true,
  "autoStartPomodoros": true,
  "longBreakInterval": 3
}
```

**Response:**
```json
{
  "pomodoro": 30,
  "shortBreak": 10,
  "longBreak": 20,
  "autoStartBreaks": true,
  "autoStartPomodoros": true,
  "longBreakInterval": 3,
  "updatedAt": 1735570800000
}
```

---

## 🎨 PERSONALIZE SETTINGS

### Tipo Base

```typescript
interface PersonalizeSettings {
  showBg: boolean;            // mostrar vídeo de fundo
  showTest: boolean;          // mostrar botão de modo teste
  notificationSound: boolean; // habilitar som de notificação
  notificationVolume: number; // volume 0-100
}
```

### GET /api/config/personalize

Retorna configurações de personalização.

**Response:**
```json
{
  "showBg": true,
  "showTest": false,
  "notificationSound": true,
  "notificationVolume": 50
}
```

### PUT /api/config/personalize

Salva configurações de personalização.

**Request:**
```json
{
  "showBg": false,
  "showTest": true,
  "notificationSound": true,
  "notificationVolume": 75
}
```

**Response:**
```json
{
  "showBg": false,
  "showTest": true,
  "notificationSound": true,
  "notificationVolume": 75,
  "updatedAt": 1735570800000
}
```

---

## 📊 Resumo de Endpoints - Config

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/config/timer` | Obter config timer |
| PUT | `/api/config/timer` | Salvar config timer |
| GET | `/api/config/personalize` | Obter config personalize |
| PUT | `/api/config/personalize` | Salvar config personalize |
