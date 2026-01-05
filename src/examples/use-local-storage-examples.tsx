/**
 * Exemplos de uso do hook useLocalStorage
 * 
 * Este hook permite persistir dados no localStorage do navegador
 * de forma tipada e reativa.
 */

import { useLocalStorage } from "@/hooks/use-local-storage";

// ============================================
// EXEMPLO 1: Valor simples (string)
// ============================================
function ExemploString() {
  const { value: nome, setValue: setNome } = useLocalStorage<string>(
    "user-name",
    "Visitante"
  );

  return (
    <div>
      <p>Olá, {nome}!</p>
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />
    </div>
  );
}

// ============================================
// EXEMPLO 2: Número
// ============================================
function ExemploNumero() {
  const { value: contador, setValue: setContador } = useLocalStorage<number>(
    "contador",
    0
  );

  return (
    <div>
      <p>Contador: {contador}</p>
      <button onClick={() => setContador(contador + 1)}>+1</button>
      <button onClick={() => setContador(0)}>Reset</button>
    </div>
  );
}

// ============================================
// EXEMPLO 3: Objeto tipado
// ============================================
interface UserPreferences {
  theme: "light" | "dark";
  language: string;
  notifications: boolean;
}

function ExemploObjeto() {
  const { value: preferences, setValue: setPreferences } = useLocalStorage<UserPreferences>(
    "user-preferences",
    {
      theme: "dark",
      language: "pt-BR",
      notifications: true
    }
  );

  const toggleTheme = () => {
    setPreferences({
      ...preferences,
      theme: preferences.theme === "dark" ? "light" : "dark"
    });
  };

  const toggleNotifications = () => {
    setPreferences({
      ...preferences,
      notifications: !preferences.notifications
    });
  };

  return (
    <div>
      <p>Tema: {preferences.theme}</p>
      <p>Idioma: {preferences.language}</p>
      <p>Notificações: {preferences.notifications ? "Ativas" : "Desativadas"}</p>
      <button onClick={toggleTheme}>Alternar Tema</button>
      <button onClick={toggleNotifications}>Toggle Notificações</button>
    </div>
  );
}

// ============================================
// EXEMPLO 4: Array
// ============================================
interface Task {
  id: number;
  title: string;
  completed: boolean;
}

function ExemploArray() {
  const { value: tasks, setValue: setTasks } = useLocalStorage<Task[]>(
    "todo-list",
    []
  );

  const addTask = (title: string) => {
    setTasks([
      ...tasks,
      { id: Date.now(), title, completed: false }
    ]);
  };

  const toggleTask = (id: number) => {
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const removeTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div>
      <button onClick={() => addTask("Nova tarefa")}>Adicionar</button>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id)}
            />
            {task.title}
            <button onClick={() => removeTask(task.id)}>X</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================
// EXEMPLO 5: Com função de update
// ============================================
function ExemploFuncaoUpdate() {
  const { value: count, setValue: setCount } = useLocalStorage<number>(
    "func-counter",
    0
  );

  const increment = () => {
    setCount((prev) => prev + 1);
  };

  const decrement = () => {
    setCount((prev) => prev - 1);
  };

  return (
    <div>
      <p>Valor: {count}</p>
      <button onClick={decrement}>-</button>
      <button onClick={increment}>+</button>
    </div>
  );
}

// ============================================
// EXEMPLO 6: Com removeValue
// ============================================
function ExemploRemove() {
  const { value: token, setValue: setToken, removeValue: logout } = useLocalStorage<string | null>(
    "auth-token",
    null
  );

  const login = () => {
    setToken("abc123-token-xyz");
  };

  return (
    <div>
      {token ? (
        <>
          <p>Logado com token: {token}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <p>Não logado</p>
          <button onClick={login}>Login</button>
        </>
      )}
    </div>
  );
}

// ============================================
// COMO É USADO NO STAR HABIT (useConfig)
// ============================================
/**
 * O hook useConfig usa o useLocalStorage internamente:
 * 
 * const { value: settings, setValue: setSettings } = useLocalStorage<TimerSettings>(
 *   "star-habit-settings",
 *   defaultSettings
 * );
 * 
 * Isso permite que as configurações do timer sejam:
 * - Salvas automaticamente no localStorage
 * - Carregadas instantaneamente ao abrir o app
 * - Reativas (atualizações refletem em todos os componentes)
 * 
 * 
 * ============================================
 * ESTRUTURA DOS DADOS SALVOS
 * ============================================
 * 
 * No localStorage (chave: "star-habit-settings"):
 * {
 *   "pomodoro": 25,
 *   "shortBreak": 5,
 *   "longBreak": 15,
 *   "autoStartBreaks": false,
 *   "autoStartPomodoros": false,
 *   "longBreakInterval": 4
 * }
 * 
 * No arquivo config.txt (via Electron IPC):
 * {
 *   "stageSeconds": [1500, 300, 900],
 *   "autoStartEnabled": false,
 *   "autoStartPomodoroEnabled": false,
 *   "longBreakInterval": 4
 * }
 * 
 * Onde:
 * - stageSeconds[0] = pomodoro em segundos (25 min = 1500s)
 * - stageSeconds[1] = shortBreak em segundos (5 min = 300s)
 * - stageSeconds[2] = longBreak em segundos (15 min = 900s)
 * - autoStartEnabled = autoStartBreaks
 * - autoStartPomodoroEnabled = autoStartPomodoros
 * - longBreakInterval = quantidade de pomodoros antes do long break
 * 
 * 
 * ============================================
 * CONVERSÃO ENTRE FORMATOS
 * ============================================
 * 
 * localStorage -> arquivo (saveConfig):
 * {
 *   stageSeconds: [
 *     settings.pomodoro * 60,      // minutos -> segundos
 *     settings.shortBreak * 60,
 *     settings.longBreak * 60
 *   ],
 *   autoStartEnabled: settings.autoStartBreaks,
 *   autoStartPomodoroEnabled: settings.autoStartPomodoros,
 *   longBreakInterval: settings.longBreakInterval
 * }
 * 
 * arquivo -> localStorage (getConfig):
 * {
 *   pomodoro: Math.floor(data.stageSeconds[0] / 60),  // segundos -> minutos
 *   shortBreak: Math.floor(data.stageSeconds[1] / 60),
 *   longBreak: Math.floor(data.stageSeconds[2] / 60),
 *   autoStartBreaks: data.autoStartEnabled,
 *   autoStartPomodoros: data.autoStartPomodoroEnabled,
 *   longBreakInterval: data.longBreakInterval
 * }
 */

export {
  ExemploString,
  ExemploNumero,
  ExemploObjeto,
  ExemploArray,
  ExemploFuncaoUpdate,
  ExemploRemove
};
