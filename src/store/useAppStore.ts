import { create } from "zustand";

export interface User {
  id: number;
  email: string;
  role: "ADMIN" | "WORKER";
  token: string;
}

interface AppState {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  theme: string;
  setTheme: (newTheme: string) => void;
}

function applyTheme(theme: string) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  if (theme === "system") {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    root.classList.add(prefersDark ? "dark" : "light");
  } else {
    root.classList.add(theme);
  }
}

const savedTheme = localStorage.getItem("logistics_theme") || "system";

applyTheme(savedTheme);

const useAppStore = create<AppState>((set) => ({
  user: JSON.parse(localStorage.getItem("logistics_user") || "null"),

  login: (userData) => {
    localStorage.setItem("logistics_user", JSON.stringify(userData));
    set({ user: userData });
  },

  logout: () => {
    localStorage.removeItem("logistics_user");
    set({ user: null });
  },

  theme: savedTheme,

  setTheme: (newTheme) => {
    localStorage.setItem("logistics_theme", newTheme);
    applyTheme(newTheme);
    set({ theme: newTheme });
  },
}));

export default useAppStore;
