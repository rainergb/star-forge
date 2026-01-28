# 📚 Star Habit - Guia de Estudo para Desenvolvedores

> Um roadmap completo para entender e contribuir com o projeto Star Habit.
> Marque os checkboxes conforme for avançando no estudo!

---

## 🎯 Objetivo deste Guia

Este documento vai te guiar pelo projeto Star Habit de forma **progressiva**, começando pelos conceitos básicos até os mais avançados. Cada seção tem exercícios práticos para fixar o aprendizado.

**Tempo estimado:** 2-3 semanas (dedicando ~2h/dia)

---

## 📋 Checklist de Progresso

### Fase 1: Setup e Fundamentos (Dias 1-3)

- [ x ] **1.1 Configurar ambiente**
  - [ x ] Instalar Node.js 18+
  - [ x ] Instalar VS Code com extensões (ESLint, Prettier, Tailwind IntelliSense)
  - [ x ] Clonar o repositório
  - [ x ] Rodar `yarn install`
  - [ x ] Executar `yarn dev` e verificar se a aplicação abre

- [ x ] **1.2 Entender a estrutura de pastas**
  - [ x ] Ler a seção "Estrutura do Projeto" no README.md
  - [ x ] Navegar pelas pastas e abrir alguns arquivos
  - [ x ] Entender a diferença entre `src/components`, `src/content` e `src/hooks`

- [ ] **1.3 Estudar TypeScript básico**
  - [ x ] Entender tipos primitivos (`string`, `number`, `boolean`)
  - [ x ] Entender `interface` vs `type`
  - [ x ] Abrir `src/types/task.types.ts` e analisar as interfaces
  - [ x ] **Exercício:** Adicionar um novo campo opcional à interface `Task`

### Fase 2: React e Hooks (Dias 4-7)

- [ ] **2.1 Revisar React Hooks**
  - [ ] `useState` - Gerenciamento de estado local
  - [ ] `useEffect` - Efeitos colaterais
  - [ ] `useCallback` - Memorização de funções
  - [ ] `useMemo` - Memorização de valores

- [ ] **2.2 Estudar o hook `useLocalStorage`**
  - [ ] Abrir `src/hooks/use-local-storage.ts`
  - [ ] Entender como ele persiste dados no navegador
  - [ ] Abrir o DevTools (F12) > Application > Local Storage
  - [ ] **Exercício:** Criar um contador simples que persiste no localStorage

- [ ] **2.3 Analisar um hook de domínio**
  - [ ] Abrir `src/hooks/use-tasks.ts`
  - [ ] Identificar: estado, funções de leitura, funções de escrita
  - [ ] Entender o padrão CRUD (Create, Read, Update, Delete)
  - [ ] **Exercício:** Adicionar uma função `duplicateTask(id: string)` ao hook

- [ ] **2.4 Entender o fluxo de dados**
  ```
  Componente -> Chama hook -> Hook atualiza estado -> Componente re-renderiza
  ```
  - [ ] Colocar `console.log` no hook `useTasks` para ver quando ele é chamado
  - [ ] Usar React DevTools para inspecionar o estado

### Fase 3: Componentes UI (Dias 8-10)

- [ ] **3.1 Estudar Tailwind CSS**
  - [ ] Entender classes utilitárias (`flex`, `p-4`, `text-white`, etc.)
  - [ ] Abrir `tailwind.config.js` e ver as customizações
  - [ ] Estudar o sistema de cores do projeto
  - [ ] **Exercício:** Criar um card simples usando apenas Tailwind

- [ ] **3.2 Analisar componentes base**
  - [ ] Abrir `src/components/ui/button.tsx`
  - [ ] Entender `class-variance-authority` (cva) para variantes
  - [ ] Entender o helper `cn()` em `src/lib/utils.ts`
  - [ ] **Exercício:** Adicionar uma nova variante ao Button

- [ ] **3.3 Estudar Radix UI**
  - [ ] Abrir `src/components/ui/checkbox.tsx`
  - [ ] Entender componentes headless (sem estilo padrão)
  - [ ] Ver como Radix cuida de acessibilidade automaticamente
  - [ ] Documentação: https://www.radix-ui.com/

- [ ] **3.4 Componentes compartilhados**
  - [ ] Analisar `src/components/shared/list-item.tsx`
  - [ ] Entender props e composição de componentes
  - [ ] **Exercício:** Criar um componente `Badge` reutilizável

### Fase 4: Módulos de Funcionalidade (Dias 11-14)

- [ ] **4.1 Estrutura de um módulo**
  - [ ] Escolher um módulo para estudar (sugestão: `tasks`)
  - [ ] Analisar a pasta `src/content/tasks/`
  - [ ] Mapear: componente principal, sub-componentes, conexão com hooks

- [ ] **4.2 Módulo de Tasks (completo)**
  - [ ] `task-list.tsx` - Lista principal
  - [ ] `task-input.tsx` - Adicionar nova task
  - [ ] `task-item.tsx` - Item individual
  - [ ] `task-details.tsx` - Painel de detalhes
  - [ ] **Exercício:** Adicionar um tooltip ao passar o mouse sobre uma task

- [ ] **4.3 Módulo de Projects**
  - [ ] Analisar `src/content/projects/`
  - [ ] Entender relação Project -> Tasks (1:N)
  - [ ] Ver como tasks são filtradas por projeto

- [ ] **4.4 Módulo de Pomodoro**
  - [ ] Analisar `src/content/pomodoro/`
  - [ ] Entender o hook `use-pomodoro-timer.ts`
  - [ ] Ver como o timer usa `setInterval`
  - [ ] Estudar o Context `PomodoroContext`

### Fase 5: Context API e Estado Global (Dias 15-16)

- [ ] **5.1 Estudar React Context**
  - [ ] Abrir `src/context/pomodoro-context.tsx`
  - [ ] Entender Provider, Consumer, useContext
  - [ ] Ver onde o Provider é colocado (App.tsx)

- [ ] **5.2 Quando usar Context vs Props**
  - [ ] Context: Estado que muitos componentes precisam
  - [ ] Props: Comunicação direta pai -> filho
  - [ ] **Exercício:** Identificar no projeto quando cada um é usado

- [ ] **5.3 FloatingWidgetsContext**
  - [ ] Analisar `src/context/floating-widgets-context.tsx`
  - [ ] Entender como widgets são mostrados/escondidos
  - [ ] Ver o sistema de posicionamento

### Fase 6: Formulários e Validação (Dias 17-18)

- [ ] **6.1 React Hook Form**
  - [ ] Abrir `src/content/auth/login-form.tsx`
  - [ ] Entender `useForm`, `register`, `handleSubmit`
  - [ ] Ver como erros são exibidos

- [ ] **6.2 Zod para validação**
  - [ ] Abrir `src/schemas/auth.schema.ts`
  - [ ] Entender schema de validação
  - [ ] Ver integração com `@hookform/resolvers`
  - [ ] **Exercício:** Criar um schema para um formulário de "Nova Task"

### Fase 7: Testes (Dias 19-21)

- [ ] **7.1 Configuração de testes**
  - [ ] Analisar `vite.config.ts` (seção test)
  - [ ] Entender Vitest vs Jest
  - [ ] Rodar `yarn test`

- [ ] **7.2 Testes unitários de hooks**
  - [ ] Estudar `renderHook` do Testing Library
  - [ ] Ver como testar hooks com localStorage mockado
  - [ ] **Exercício:** Escrever um teste para `addTask`

- [ ] **7.3 Testes de componentes**
  - [ ] Estudar `render`, `screen`, `fireEvent`
  - [ ] Entender queries: `getByText`, `getByRole`, etc.
  - [ ] **Exercício:** Escrever teste para o componente Button

- [ ] **7.4 Testes E2E com Playwright**
  - [ ] Analisar `playwright.config.ts`
  - [ ] Rodar `yarn test:e2e:headed` para ver os testes
  - [ ] **Exercício:** Adicionar um teste E2E simples

### Fase 8: Electron (Opcional - Dias 22-23)

- [ ] **8.1 Arquitetura Electron**
  - [ ] Main Process vs Renderer Process
  - [ ] Abrir `electron/main.ts`
  - [ ] Entender criação da janela (BrowserWindow)

- [ ] **8.2 Preload e IPC**
  - [ ] Abrir `electron/preload.ts`
  - [ ] Entender contextBridge
  - [ ] Segurança: nodeIntegration desabilitado

---

## 🧪 Exercícios Práticos

### Exercício 1: Criar uma nova feature simples
**Objetivo:** Adicionar contador de tasks completas no header

1. [ ] Criar hook `use-task-stats.ts` que retorna `{ total, completed, pending }`
2. [ ] Criar componente `TaskStats.tsx`
3. [ ] Adicionar ao `TopBar.tsx`
4. [ ] Estilizar com Tailwind

### Exercício 2: Criar um novo módulo
**Objetivo:** Criar módulo "Notes" (notas rápidas)

1. [ ] Definir types em `src/types/note.types.ts`
2. [ ] Criar hook `src/hooks/use-notes.ts`
3. [ ] Criar componentes em `src/content/notes/`
4. [ ] Adicionar ao Dock
5. [ ] Escrever testes

### Exercício 3: Bug fix simulado
**Objetivo:** Praticar debug

1. [ ] Introduzir um bug proposital no `useTasks`
2. [ ] Usar React DevTools para investigar
3. [ ] Usar console.log estratégico
4. [ ] Corrigir e documentar

---

## 📖 Recursos de Estudo

### Documentação Oficial
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/primitives)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)

### Cursos Recomendados (Gratuitos)
- [React - Documentação oficial (Tutorial)](https://react.dev/learn)
- [TypeScript - Handbook](https://www.typescriptlang.org/docs/handbook/)
- [Testing JavaScript (Kent C. Dodds)](https://testingjavascript.com/)

### Artigos Úteis
- [Padrões de Custom Hooks](https://usehooks.com/)
- [Tailwind Best Practices](https://tailwindcss.com/docs/reusing-styles)
- [React Patterns](https://www.patterns.dev/react)

---

## 💡 Dicas

1. **Não tenha medo de quebrar coisas** - Git está aí para isso!
2. **Use console.log liberalmente** - É a forma mais rápida de entender o fluxo
3. **Leia o código antes de perguntar** - A maioria das respostas está no código
4. **Faça pequenas mudanças** - Evite refatorações grandes no início
5. **Peça code review** - Feedback acelera muito o aprendizado

---

## 🎓 Certificação de Conclusão

Quando completar todas as fases, você será capaz de:

- ✅ Entender e navegar em projetos React/TypeScript complexos
- ✅ Criar custom hooks para gerenciamento de estado
- ✅ Implementar componentes com Tailwind e Radix UI
- ✅ Escrever testes unitários e E2E
- ✅ Contribuir com novas features de forma independente

---

**Bons estudos! 🚀**

*Última atualização: Janeiro 2026*