import { useCallback, useEffect } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { supabase } from "@/lib/supabase";
import { invalidateAllCaches } from "@/lib/cache-registry";
import { AuthState, User, LoginCredentials } from "@/types/auth.types";

const AUTH_STORAGE_KEY = "star-habit-auth";
const GUEST_MODE_KEY = "star-habit-guest-mode";

const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  rememberMe: false
};

export function useAuth() {
  const { value: authState, setValue: setAuthState } =
    useLocalStorage<AuthState>(AUTH_STORAGE_KEY, initialAuthState);
  const { value: isGuestMode, setValue: setIsGuestMode } =
    useLocalStorage<boolean>(GUEST_MODE_KEY, false);

  // Sincronizar com Supabase auth na montagem
  useEffect(() => {
    // Busca sessão ativa imediatamente (resolve stale localStorage sem id)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const meta = session.user.user_metadata ?? {};
        const user: User = {
          id: session.user.id,
          email: session.user.email || "",
          name: meta.full_name || meta.name || session.user.email?.split("@")[0],
          provider: session.user.app_metadata?.provider || meta.provider || "email",
          avatar: meta.avatar_url || meta.picture || undefined,
          createdAt: new Date(session.user.created_at).getTime()
        };
        setAuthState({ user, isAuthenticated: true, rememberMe: true });
        setIsGuestMode(false);
      }
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata ?? {};
        const user: User = {
          id: session.user.id,
          email: session.user.email || "",
          name: meta.full_name || meta.name || session.user.email?.split("@")[0],
          provider: session.user.app_metadata?.provider || meta.provider || "email",
          avatar: meta.avatar_url || meta.picture || undefined,
          createdAt: new Date(session.user.created_at).getTime()
        };
        setAuthState({ user, isAuthenticated: true, rememberMe: true });
        setIsGuestMode(false);
      } else if (!isGuestMode) {
        setAuthState(initialAuthState);
      }
    });

    return () => subscription?.unsubscribe();
  }, [setAuthState, setIsGuestMode, isGuestMode]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password
        });

        if (error) throw error;

        if (data.user) {
          const user: User = {
            id: data.user.id,
            email: data.user.email || "",
            name:
              data.user.user_metadata?.name || credentials.email.split("@")[0],
            provider: "email",
            createdAt: new Date(data.user.created_at).getTime()
          };

          setAuthState({
            user,
            isAuthenticated: true,
            rememberMe: credentials.rememberMe
          });
          setIsGuestMode(false);
          return true;
        }
      } catch (error) {
        console.error("Login failed:", error);
        return false;
      }
    },
    [setAuthState, setIsGuestMode]
  );

  const signup = useCallback(
    async (data: { email: string; password: string; name: string }) => {
      try {
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: { name: data.name }
          }
        });

        if (error) throw error;

        const needsConfirmation = !authData.session;
        return { success: true, needsConfirmation };
      } catch (error: any) {
        console.error("Signup failed:", error);
        return { success: false, error: error.message as string };
      }
    },
    []
  );

  const loginWithGoogle = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `http://localhost:${window.location.port || 5173}`
        }
      });

      if (error) throw error;

      return true;
    } catch (error) {
      console.error("Google login failed:", error);
      return false;
    }
  }, []);

  const loginAsGuest = useCallback(() => {
    const guestUser: User = {
      email: "guest@starhabit.local",
      name: "Guest",
      provider: "guest",
      createdAt: Date.now()
    };

    setAuthState({
      user: guestUser,
      isAuthenticated: true,
      rememberMe: false
    });
    setIsGuestMode(true);

    return true;
  }, [setAuthState, setIsGuestMode]);

  const updateUser = useCallback(
    (updates: Partial<User>) => {
      setAuthState((prev) => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...updates } : prev.user
      }));
    },
    [setAuthState]
  );

  const logout = useCallback(async () => {
    try {
      if (!isGuestMode) {
        await supabase.auth.signOut();
      }
      invalidateAllCaches();
      setAuthState(initialAuthState);
      setIsGuestMode(false);
    } catch (error) {
      console.error("Logout failed:", error);
      // Invalida mesmo em caso de erro para não manter dados do usuário anterior
      invalidateAllCaches();
    }
  }, [setAuthState, setIsGuestMode, isGuestMode]);

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    rememberMe: authState.rememberMe,
    isGuest: isGuestMode,
    login,
    signup,
    loginWithGoogle,
    loginAsGuest,
    updateUser,
    logout
  };
}
