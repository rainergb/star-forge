# Star Habit ⚡

**Aplicação desktop de produtividade pessoal** - Gerencie tarefas, projetos, sessões Pomodoro, diário e skills em uma interface moderna e gamificada.

![Electron](https://img.shields.io/badge/Electron-28.0-47848F?logo=electron)
![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-4.1-06B6D4?logo=tailwindcss)

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Features](#-features)
- [Stack Tecnológica](#-stack-tecnológica)
- [Instalação](#-instalação)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Arquitetura](#-arquitetura)
- [Testes](#-testes)
- [Contribuindo](#-contribuindo)

---

## 🎯 Visão Geral

Star Habit é um aplicativo desktop focado em **produtividade pessoal** com elementos de **gamificação**. Ele integra:

- **Gerenciamento de Tarefas** com steps, notas, arquivos e estimativas Pomodoro
- **Projetos** para organizar tarefas relacionadas
- **Timer Pomodoro** com ciclos de trabalho/descanso
- **Diário** para reflexões diárias com tracking de humor
- **Maestry** para acompanhar progresso de skills
- **Widgets Flutuantes** para acesso rápido a funcionalidades

---

## ✨ Features

| Módulo | Descrição |
|--------|-----------|
| 🔐 **Auth** | Login com email/senha e Google (localStorage) |
| ✅ **Tasks** | CRUD completo com steps, notas, files, due dates, estimativas Pomodoro |
| 📁 **Projects** | Organização de tarefas, status, favoritos, cores customizadas |
| ⏱️ **Pomodoro** | Timer configurável, modos work/break, ciclos, sessões salvas |
| 📔 **Diary** | Entradas diárias, mood tracking, tags, análise de humor |
| 🎯 **Maestry** | Tracking de skills com níveis e tempo dedicado |
| 🎵 **Music Player** | Player integrado para foco |
| 📅 **Calendar** | Visualização de tarefas e eventos por data |
| 🪟 **Floating Widgets** | Mini versões dos módulos arrastáveis |

---

## 🛠️ Stack Tecnológica

### Core
- **React 18** - UI Library com Hooks
- **TypeScript 5** - Type Safety
- **Vite 5** - Build Tool
- **Electron 28** - Desktop Framework

### Styling
- **Tailwind CSS 4** - Utility-first CSS
- **Radix UI** - Componentes acessíveis headless
- **Lucide React** - Ícones
- **Motion** - Animações

### State & Forms
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **Custom Hooks** - Estado local com localStorage

### Drag & Drop
- **@dnd-kit** - Reordenação de listas

### Testes
- **Vitest** - Unit/Integration tests
- **Testing Library** - React component testing
- **Playwright** - E2E tests

---

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Setup

```bash
# Clone o repositório
git clone <repo-url>
cd star-habit

# Instale as dependências (recomendado: yarn)
yarn install

# Inicie em modo desenvolvimento
yarn electron:dev
```

---

## 📜 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `yarn dev` | Servidor Vite (apenas web) |
| `yarn electron:dev` | Electron + Vite com hot reload |
| `yarn build` | Build de produção completo |
| `yarn electron:build` | Build do executável Electron |
| `yarn test` | Executa testes unitários |
| `yarn test:watch` | Testes em modo watch |
| `yarn test:coverage` | Relatório de cobertura |
| `yarn test:e2e` | Testes E2E com Playwright |
| `yarn test:e2e:ui` | Playwright com interface visual |
| `yarn test:e2e:headed` | E2E com browser visível |

---

## 📁 Estrutura do Projeto

```
star-habit/
├── electron/                    # Processo principal Electron
│   ├── main.ts                  # Entry point Electron
│   └── preload.ts               # Context bridge (IPC)
│
├── src/
│   ├── App.tsx                  # Componente raiz com roteamento
│   ├── main.tsx                 # Entry point React
│   ├── index.css                # Estilos globais + Tailwind
│   │
│   ├── components/              # Componentes reutilizáveis
│   │   ├── ui/                  # Primitivos UI (Button, Input, etc.)
│   │   ├── shared/              # Componentes compartilhados
│   │   └── floating/            # Widgets flutuantes
│   │
│   ├── content/                 # Módulos de funcionalidade
│   │   ├── auth/                # Login/Logout
│   │   ├── tasks/               # Gerenciamento de tarefas
│   │   ├── projects/            # Gerenciamento de projetos
│   │   ├── pomodoro/            # Timer Pomodoro
│   │   ├── diary/               # Diário pessoal
│   │   ├── maestry/             # Tracking de skills
│   │   ├── dock/                # Barra de navegação
│   │   ├── config/              # Configurações
│   │   └── stats/               # Estatísticas
│   │
│   ├── hooks/                   # Custom React Hooks
│   │   ├── use-auth.ts          # Autenticação
│   │   ├── use-tasks.ts         # CRUD de tarefas
│   │   ├── use-projects.ts      # CRUD de projetos
│   │   ├── use-diary.ts         # Entradas do diário
│   │   ├── use-skills.ts        # Tracking de skills
│   │   ├── use-local-storage.ts # Persistência localStorage
│   │   └── ...                  # Outros hooks
│   │
│   ├── types/                   # TypeScript type definitions
│   │   ├── task.types.ts
│   │   ├── project.types.ts
│   │   ├── diary.types.ts
│   │   └── ...
│   │
│   ├── schemas/                 # Zod validation schemas
│   │   └── auth.schema.ts
│   │
│   ├── context/                 # React Contexts
│   │   ├── pomodoro-context.tsx
│   │   ├── active-module-context.tsx
│   │   └── floating-widgets-context.tsx
│   │
│   ├── services/                # Serviços externos
│   └── lib/                     # Utilitários
│       └── utils.ts             # cn() e helpers
│
├── e2e/                         # Testes E2E (Playwright)
├── prompts/                     # Documentação de features
├── dist/                        # Build web
├── dist-electron/               # Build Electron
└── release/                     # Executáveis gerados
```

---

## 🏗️ Arquitetura

### Padrão de Hooks Customizados

Cada módulo segue o padrão de **Custom Hook + localStorage**:

```typescript
// hooks/use-tasks.ts
export function useTasks() {
  const { value, setValue } = useLocalStorage<Task[]>('tasks', []);
  
  const addTask = (title: string) => { /* ... */ };
  const updateTask = (id: string, updates: Partial<Task>) => { /* ... */ };
  const removeTask = (id: string) => { /* ... */ };
  
  return { tasks: value, addTask, updateTask, removeTask, /* ... */ };
}
```

### Fluxo de Dados

```
┌─────────────────────────────────────────────────────────┐
│                     App.tsx                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Context Providers                   │   │
│  │  (Pomodoro, ActiveModule, FloatingWidgets)      │   │
│  │  ┌─────────────────────────────────────────┐   │   │
│  │  │            Content Modules               │   │   │
│  │  │  ┌─────────────────────────────────┐   │   │   │
│  │  │  │         Custom Hooks             │   │   │   │
│  │  │  │  ┌─────────────────────────┐   │   │   │   │
│  │  │  │  │    useLocalStorage      │   │   │   │   │
│  │  │  │  │    (Persistência)       │   │   │   │   │
│  │  │  │  └─────────────────────────┘   │   │   │   │
│  │  │  └─────────────────────────────────┘   │   │   │
│  │  └─────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Componentes UI

Baseados em **Radix UI** + **Tailwind** com variantes via `class-variance-authority`:

```typescript
// components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center ...",
  {
    variants: {
      variant: { default: "...", destructive: "...", outline: "..." },
      size: { default: "...", sm: "...", lg: "..." }
    }
  }
);
```

---

## 🧪 Testes

### Testes Unitários (Vitest)

```bash
# Rodar todos os testes
yarn test

# Modo watch
yarn test:watch

# Com cobertura
yarn test:coverage
```

**Arquivos de teste:** `*.test.ts` / `*.test.tsx`

### Testes E2E (Playwright)

```bash
# Rodar E2E
yarn test:e2e

# Com UI visual
yarn test:e2e:ui

# Com browser visível
yarn test:e2e:headed
```

**Arquivos de teste:** `e2e/*.spec.ts`

---

## 🤝 Contribuindo

### Workflow de Desenvolvimento

1. **Criar branch** a partir de `main`
2. **Desenvolver** a feature/fix
3. **Escrever testes** para novas funcionalidades
4. **Rodar testes** (`yarn test`)
5. **Criar PR** com descrição clara

### Convenções

- **Commits:** Use conventional commits (`feat:`, `fix:`, `refactor:`, etc.)
- **Branches:** `feature/nome-da-feature`, `fix/nome-do-bug`
- **Componentes:** PascalCase (`TaskList.tsx`)
- **Hooks:** camelCase com prefixo `use-` (`use-tasks.ts`)
- **Types:** Sufixo `.types.ts` (`task.types.ts`)

### Adicionando um Novo Módulo

1. Criar types em `src/types/modulo.types.ts`
2. Criar hook em `src/hooks/use-modulo.ts`
3. Criar componentes em `src/content/modulo/`
4. Adicionar ao `MainContent.tsx`
5. Adicionar ao `AppDock.tsx`
6. Escrever testes

---

## 📚 Documentação Adicional

- 📖 [LEARNME.md](./LEARNME.md) - Guia de estudo para desenvolvedores Jr
- 📁 [prompts/](./prompts/) - Documentação detalhada de cada feature

---

## 🔒 Segurança (Electron)

- ✅ Context Isolation habilitado
- ✅ Node Integration desabilitado
- ✅ Preload script para IPC seguro
- ✅ CSP configurado

---

## 📄 Licença

ISC

---

Desenvolvido com 💜 para produtividade pessoal
