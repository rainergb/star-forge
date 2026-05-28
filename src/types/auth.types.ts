export interface User {
  id?: string;
  email: string;
  name?: string;
  avatar?: string;
  bio?: string;
  provider: "email" | "google" | "guest";
  createdAt?: number;
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
