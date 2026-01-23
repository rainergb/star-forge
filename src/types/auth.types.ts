export interface User {
  email: string;
  name?: string;
  avatar?: string;
  provider: "email" | "google";
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  rememberMe: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}
