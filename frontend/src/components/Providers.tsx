"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Toaster } from "sonner";

type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({
  theme: "light",
  setTheme: () => {},
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("pmlab-theme") as Theme | null;
    const initialTheme = savedTheme || "light";
    setThemeState(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
    setMounted(true);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("pmlab-theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {mounted ? children : <div style={{ visibility: "hidden" }}>{children}</div>}
      <Toaster position="bottom-right" richColors />
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
