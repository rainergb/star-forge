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
        provider: "email"
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
      provider: "google"
    };

    setAuthState({
      user,
      isAuthenticated: true,
      rememberMe: true
    });

    return true;
  }, [setAuthState]);

  const logout = useCallback(() => {
    setAuthState(initialAuthState);
  }, [setAuthState]);

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    rememberMe: authState.rememberMe,
    login,
    loginWithGoogle,
    logout
  };
}
