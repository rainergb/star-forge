# API Contracts - Star Habit Backend

Este diretório contém a documentação ilustrativa dos contratos de API para integração com um backend.

## 📁 Estrutura

| Arquivo | Descrição |
|---------|-----------|
| [tasks-api.md](./tasks-api.md) | CRUD de Tasks, Steps, Reminders, Files e Notes |
| [config-api.md](./config-api.md) | Configurações de Timer e Personalização |
| [pomodoro-api.md](./pomodoro-api.md) | Estado do Timer, Sessões e Estatísticas |
| [sync-api.md](./sync-api.md) | Sincronização bulk offline/online |

---

## 📊 Todos os Endpoints

### Tasks
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
| POST | `/api/tasks/:taskId/notes` | Adicionar nota |
| PUT | `/api/tasks/:taskId/notes/:noteId` | Editar nota |
| DELETE | `/api/tasks/:taskId/notes/:noteId` | Remover nota |

### Config
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/config/timer` | Obter config timer |
| PUT | `/api/config/timer` | Salvar config timer |
| GET | `/api/config/personalize` | Obter config personalize |
| PUT | `/api/config/personalize` | Salvar config personalize |

### Pomodoro
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/pomodoro/state` | Obter estado timer |
| PUT | `/api/pomodoro/state` | Sincronizar estado |
| POST | `/api/pomodoro/sessions` | Registrar sessão |
| GET | `/api/pomodoro/sessions` | Histórico sessões |
| GET | `/api/pomodoro/stats` | Estatísticas |

### Sync
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/sync` | Sincronização bulk |

---

## 🔐 Autenticação (Sugestão)

Para um backend real, incluir header de autenticação:

```
Authorization: Bearer <jwt_token>
```

Todos os endpoints acima assumem que o usuário está autenticado e os dados são filtrados automaticamente por `userId`.
