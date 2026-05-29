import { useCallback, useEffect, useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { supabase } from "@/lib/supabase";
import { invalidateAllCaches } from "@/lib/cache-registry";
import { AuthState, User, LoginCredentials } from "@/types/auth.types";

const AUTH_STORAGE_KEY  = "star-habit-auth";
const GUEST_MODE_KEY    = "star-habit-guest-mode";
const AVATAR_CACHE_KEY  = "star-habit-avatar-cache";
const CUSTOM_AVATAR_KEY = "star-habit-avatar-custom";

const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  rememberMe: false
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Lê rememberMe do localStorage sem passar pelo hook React */
function getStoredRememberMe(): boolean {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return false;
    return JSON.parse(raw)?.rememberMe === true;
  } catch {
    return false;
  }
}

/** Limpa TUDO do localStorage relacionado ao app */
function clearAllStorage(): void {
  invalidateAllCaches();
  localStorage.removeItem(AVATAR_CACHE_KEY);
  localStorage.removeItem(CUSTOM_AVATAR_KEY);
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(GUEST_MODE_KEY);
}

// ─── Helpers Electron ────────────────────────────────────────────────────────

const isElectron = (): boolean =>
  typeof window !== "undefined" && "electronAPI" in window;

const getElectronAPI = (): any =>
  typeof window !== "undefined" ? (window as any).electronAPI : null;

// rememberMe a ser aplicado no próximo SIGNED_IN.
// null = nenhum login em andamento (bloqueia SIGNED_IN inesperado).
let _pendingRememberMe: boolean | null = null;

// Flag de "check de startup já feito" — compartilhado entre TODAS as instâncias de useAuth.
// A primeira instância faz o check de rememberMe; as seguintes só sincronizam estado.
// Isso evita que instâncias que montam DEPOIS do login (componentes do app principal)
// reapliquem regras de rememberMe e façam signOut indevidamente.
let _initialCheckHandled = false;

let _oauthListenerRegistered = false;
function ensureElectronOAuthListener(): void {
  if (_oauthListenerRegistered) return;
  const api = getElectronAPI();
  if (!api?.onOAuthCallback) return;
  _oauthListenerRegistered = true;

  api.onOAuthCallback(async (url: string) => {
    // Supabase v2 usa PKCE por padrão: callback retorna ?code=AUTH_CODE
    // O verifier fica no localStorage do renderer — exchangeCodeForSession o lê automaticamente
    try {
      // Normaliza para URL parseável (star-forge:// não é reconhecido pelo construtor URL)
      const normalized = url.replace(/^[a-z][\w+.-]*:\/\/[^/]*/, "http://dummy");
      const urlObj = new URL(normalized);
      const code = urlObj.searchParams.get("code");

      if (code) {
        // PKCE flow — troca o code pelo par de tokens
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) console.error("[OAuth] exchangeCodeForSession:", error.message);
        // onAuthStateChange com SIGNED_IN vai disparar automaticamente após a troca
        return;
      }

      // Fallback: implicit flow (access_token no fragment — Supabase flowType: 'implicit')
      const fragment = url.includes("#")
        ? url.split("#")[1]
        : url.split("?")[1] || "";
      const params       = new URLSearchParams(fragment);
      const type         = params.get("type");
      const accessToken  = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (accessToken && refreshToken) {
        await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        if (type === "recovery") {
          window.dispatchEvent(new CustomEvent("auth:password-recovery"));
        }
      }
    } catch (err) {
      console.error("[OAuth] callback error:", err);
    }
  });
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth() {
  const { value: authState, setValue: setAuthState, removeValue: removeAuthState } =
    useLocalStorage<AuthState>(AUTH_STORAGE_KEY, initialAuthState);
  const { value: isGuestMode, setValue: setIsGuestMode, removeValue: removeGuestMode } =
    useLocalStorage<boolean>(GUEST_MODE_KEY, false);

  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  useEffect(() => {
    ensureElectronOAuthListener();
  }, []);

  useEffect(() => {
    const handler = () => setIsRecoveryMode(true);
    window.addEventListener("auth:password-recovery", handler);
    return () => window.removeEventListener("auth:password-recovery", handler);
  }, []);

  // ── Auth principal ────────────────────────────────────────────────────────
  useEffect(() => {
    // Captura se ESTA instância é a primeira do app (a que deve fazer o check de startup).
    // Instâncias que montam DEPOIS (em componentes do app principal, após o login) NÃO
    // devem reaplicar regras de rememberMe — apenas sincronizar estado com a sessão atual.
    const myCheckIsFirst = !_initialCheckHandled;
    _initialCheckHandled = true;

    // Só faz sentido capturar rememberMeAtStartup se eu sou a primeira instância.
    // Para instâncias tardias, esse valor está stale (foi capturado antes de qualquer login).
    const rememberMeAtStartup = myCheckIsFirst ? getStoredRememberMe() : false;

    const buildUser = (
      supabaseUser: NonNullable<
        Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]
      >["user"]
    ): User => {
      const meta = supabaseUser.user_metadata ?? {};
      const freshAvatar = meta.avatar_url || meta.picture || undefined;
      if (freshAvatar) localStorage.setItem(AVATAR_CACHE_KEY, freshAvatar);
      const customAvatar = localStorage.getItem(CUSTOM_AVATAR_KEY) || undefined;
      const googleAvatar = freshAvatar || localStorage.getItem(AVATAR_CACHE_KEY) || undefined;
      return {
        id:        supabaseUser.id,
        email:     supabaseUser.email || "",
        name:      meta.full_name || meta.name || supabaseUser.email?.split("@")[0],
        provider:  supabaseUser.app_metadata?.provider || meta.provider || "email",
        avatar:    customAvatar ?? googleAvatar,
        createdAt: new Date(supabaseUser.created_at).getTime()
      };
    };

    /**
     * Lida com sessão restaurada.
     * - Se eu sou a PRIMEIRA instância: aplica regras de rememberMe (check de startup).
     * - Se sou uma instância TARDIA (montei depois do login): só sincroniza estado.
     *   Isso evita que componentes que usam useAuth dentro do app principal façam
     *   signOut indevido logo após o login.
     */
    const handleRestoredSession = async (
      session: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]
    ) => {
      if (!session?.user) return;

      if (!myCheckIsFirst) {
        // Instância tardia — só sincroniza estado com a sessão atual.
        // O rememberMe correto já foi gravado no localStorage pela instância que processou o login.
        setAuthState({
          user: buildUser(session.user),
          isAuthenticated: true,
          rememberMe: getStoredRememberMe()
        });
        setIsGuestMode(false);
        return;
      }

      // Primeira instância — aplica regras de startup.
      if (!rememberMeAtStartup) {
        // Usuário não marcou "manter conectado" — expira a sessão
        await supabase.auth.signOut({ scope: "global" });
        clearAllStorage();
        setAuthState(initialAuthState);
        setIsGuestMode(false);
        return;
      }

      setAuthState({ user: buildUser(session.user), isAuthenticated: true, rememberMe: true });
      setIsGuestMode(false);
    };

    // Busca sessão existente (inicialização)
    supabase.auth.getSession().then(({ data: { session } }) =>
      handleRestoredSession(session)
    );

    // Escuta mudanças de auth em tempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {

        // INITIAL_SESSION: Supabase v2 dispara na inicialização com sessão em cache.
        // Trata igual à restauração de sessão — usa rememberMeAtStartup.
        if (event === "INITIAL_SESSION") {
          await handleRestoredSession(session);
          return;
        }

        if (event === "PASSWORD_RECOVERY" && session?.user) {
          setAuthState({ user: buildUser(session.user), isAuthenticated: true, rememberMe: true });
          setIsGuestMode(false);
          setIsRecoveryMode(true);
          return;
        }

        if (event === "SIGNED_IN" && session?.user) {
          if (_pendingRememberMe === null) {
            // _pendingRememberMe já foi consumido por outro subscriber (múltiplas
            // instâncias de useAuth rodando em paralelo — ex.: App.tsx + LoginScreen).
            // Chamar handleRestoredSession aqui causaria signOut imediatamente após
            // o login, porque rememberMeAtStartup foi capturado ANTES do login (false).
            // O check de startup já é coberto por INITIAL_SESSION + getSession().
            return;
          }

          const rememberMe = _pendingRememberMe;
          _pendingRememberMe = null; // reset após consumir
          setAuthState({ user: buildUser(session.user), isAuthenticated: true, rememberMe });
          setIsGuestMode(false);
          return;
        }

        if (event === "TOKEN_REFRESHED" && session?.user) {
          // Refresh silencioso — só atualiza dados do usuário, mantém rememberMe atual
          setAuthState((prev) => ({
            ...prev,
            user: buildUser(session.user)
          }));
          return;
        }

        if (event === "SIGNED_OUT" || !session) {
          setAuthState(initialAuthState);
          setIsGuestMode(false);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, [setAuthState, setIsGuestMode]);

  // ─── Actions ───────────────────────────────────────────────────────────────

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        _pendingRememberMe = credentials.rememberMe;
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password
        });
        if (error) throw error;
        return !!data.user;
      } catch (error) {
        console.error("Login failed:", error);
        _pendingRememberMe = null;
        return false;
      }
    },
    []
  );

  const signup = useCallback(
    async (data: { email: string; password: string; name: string }) => {
      try {
        // Pré-arma o rememberMe: se a confirmação de email estiver desativada,
        // o signUp já retorna sessão e dispara SIGNED_IN — o guard só processa
        // esse evento se _pendingRememberMe não for null. Sem isso, a conta é
        // criada mas o app não entra no sistema.
        _pendingRememberMe = true;
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: { data: { name: data.name } }
        });
        if (error) throw error;

        // Sem sessão = precisa confirmar email. Nenhum SIGNED_IN vai consumir
        // o _pendingRememberMe — reseta para não vazar para um login futuro.
        if (!authData.session) _pendingRememberMe = null;

        return { success: true, needsConfirmation: !authData.session };
      } catch (error: any) {
        console.error("Signup failed:", error);
        _pendingRememberMe = null;
        return { success: false, error: error.message as string };
      }
    },
    []
  );

  const loginWithGoogle = useCallback(async (rememberMe: boolean = true) => {
    try {
      // Blindagem: garante boolean. Se algum call site passar o evento de clique
      // (onClick={loginWithGoogle}), rememberMe viraria um HTMLButtonElement e o
      // JSON.stringify do authState quebraria com "circular structure".
      _pendingRememberMe = rememberMe === true;
      const inElectron = isElectron();
      const redirectTo = inElectron
        ? "star-forge://auth/callback"
        : window.location.origin || `http://localhost:${window.location.port || 5173}`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo, skipBrowserRedirect: inElectron }
      });
      if (error) throw error;

      if (inElectron && data?.url) {
        getElectronAPI()?.openExternal(data.url);
      }
      return true;
    } catch (error) {
      console.error("Google login failed:", error);
      _pendingRememberMe = null;
      return false;
    }
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    try {
      const redirectTo = isElectron()
        ? "star-forge://auth/callback"
        : window.location.origin || `http://localhost:${window.location.port || 5173}`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message as string };
    }
  }, []);

  const changePassword = useCallback(async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setIsRecoveryMode(false);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message as string };
    }
  }, []);

  const loginAsGuest = useCallback(() => {
    const guestUser: User = {
      email: "guest@starhabit.local",
      name: "Guest",
      provider: "guest",
      createdAt: Date.now()
    };
    setAuthState({ user: guestUser, isAuthenticated: true, rememberMe: false });
    setIsGuestMode(true);
    return true;
  }, [setAuthState, setIsGuestMode]);

  const updateUser = useCallback(
    (updates: Partial<User>) => {
      if ("avatar" in updates) {
        if (updates.avatar) localStorage.setItem(CUSTOM_AVATAR_KEY, updates.avatar);
        else localStorage.removeItem(CUSTOM_AVATAR_KEY);
      }
      setAuthState((prev) => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...updates } : prev.user
      }));
    },
    [setAuthState]
  );

  const logout = useCallback(async () => {
    _pendingRememberMe = null; // garante que nenhum SIGNED_IN inesperado loga de volta

    if (!isGuestMode) {
      try {
        // scope: "local" encerra a sessão do cliente e para o auto-refresh
        // SEM fazer a chamada de rede de revogação global. Em produção
        // (origin file://) o signOut global ficava pendente e travava o await,
        // então o estado local nunca era limpo e o usuário não deslogava.
        // O Promise.race com timeout garante que o logout SEMPRE prossegue,
        // mesmo que o cliente Supabase trave (ex.: deadlock de navigator.locks).
        await Promise.race([
          supabase.auth.signOut({ scope: "local" }),
          new Promise((resolve) => setTimeout(resolve, 2000))
        ]);
      } catch (error) {
        console.error("Supabase signOut failed:", error);
      }
    }

    // Limpeza local — sempre executa, independente da rede/servidor.
    clearAllStorage();
    removeAuthState();
    removeGuestMode();
    setIsRecoveryMode(false);
  }, [isGuestMode, removeAuthState, removeGuestMode]);

  return {
    user:            authState.user,
    isAuthenticated: authState.isAuthenticated,
    rememberMe:      authState.rememberMe,
    isGuest:         isGuestMode,
    isRecoveryMode,
    login,
    signup,
    loginWithGoogle,
    loginAsGuest,
    sendPasswordReset,
    changePassword,
    updateUser,
    logout
  };
}
