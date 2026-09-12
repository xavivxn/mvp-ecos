"use client";

import { useEffect, useState } from "react";
import { THEME_STORAGE_KEY } from "@/lib/theme";

function systemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readStored(): "light" | "dark" | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function applyTheme(next: "light" | "dark") {
  const root = document.documentElement;
  root.classList.remove("theme-light", "theme-dark");
  root.classList.add(`theme-${next}`);
}

export function ThemeSwitch() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    setTheme(readStored() ?? systemTheme());
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (!readStored()) setTheme(systemTheme());
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  function choose(next: "light" | "dark") {
    setTheme(next);
    applyTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      return;
    }
  }

  return (
    <div className="mt-5">
      <div
        className="inline-flex rounded-lg border border-line/80 bg-bg/60 p-0.5"
        role="group"
        aria-label="Tema de la interfaz"
      >
        <button
          type="button"
          className={`rounded-md px-2.5 py-1 text-xs font-medium ${
            theme === "light" ? "bg-surface-2 text-ink" : "text-muted"
          }`}
          aria-pressed={theme === "light"}
          onClick={() => choose("light")}
        >
          Claro
        </button>
        <button
          type="button"
          className={`rounded-md px-2.5 py-1 text-xs font-medium ${
            theme === "dark" ? "bg-surface-2 text-ink" : "text-muted"
          }`}
          aria-pressed={theme === "dark"}
          onClick={() => choose("dark")}
        >
          Oscuro
        </button>
      </div>
    </div>
  );
}
