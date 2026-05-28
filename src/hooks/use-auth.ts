import { useCallback } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { AuthState, User, LoginCredentials } from "@/types/auth.types";

const AUTH_STORAGE_KEY = "star-habit-auth";

const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  rememberMe: false
};

export function useAuth() {
  const { value: authState, setValue: setAuthState } = useLocalStorage<AuthState>(
    AUTH_STORAGE_KEY,
    initialAuthState
  );

  const login = useCallback(
    (credentials: LoginCredentials) => {
      const user: User = {
        email: credentials.email,
        name: credentials.email.split("@")[0],
        provider: "email",
        createdAt: Date.now()
      };

      setAuthState({
        user,
        isAuthenticated: true,
        rememberMe: credentials.rememberMe
      });

      return true;
    },
    [setAuthState]
  );

  const loginWithGoogle = useCallback(() => {
    const user: User = {
      email: "user@gmail.com",
      name: "Google User",
      provider: "google",
      createdAt: Date.now()
    };

    setAuthState({
      user,
      isAuthenticated: true,
      rememberMe: true
    });

    return true;
  }, [setAuthState]);

  const loginAsGuest = useCallback(() => {
    const user: User = {
      email: "guest@starhabit.local",
      name: "Guest",
      provider: "guest",
      createdAt: Date.now()
    };

    setAuthState({
      user,
      isAuthenticated: true,
      rememberMe: false
    });

    return true;
  }, [setAuthState]);

  const updateUser = useCallback(
    (updates: Partial<User>) => {
      setAuthState((prev) => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...updates } : prev.user
      }));
    },
    [setAuthState]
  );

  const logout = useCallback(() => {
    setAuthState(initialAuthState);
  }, [setAuthState]);

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    rememberMe: authState.rememberMe,
    login,
    loginWithGoogle,
    loginAsGuest,
    updateUser,
    logout
  };
}
