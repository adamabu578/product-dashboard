import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const MOCK_USERS: Record<string, { password: string; user: User }> = {
  demo: {
    password: "password",
    user: { name: "Demo User", email: "demo@productops.io", role: "Operations Manager" },
  },
  admin: {
    password: "admin123",
    user: { name: "Admin", email: "admin@productops.io", role: "Administrator" },
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (username, password) => {
        const match = MOCK_USERS[username.toLowerCase()];
        if (match && match.password === password) {
          set({ token: `mock-jwt-${username}-${Date.now()}`, user: match.user });
          return true;
        }
        return false;
      },
      logout: () => set({ token: null, user: null }),
    }),
    { name: "productops-auth" }
  )
);
