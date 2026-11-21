export type Mode = "system" | "light" | "dark";

export interface ThemeChoice {
  mode: Mode;
  palette: string;
  motion: string;
}

/** localStorage keys; ThemeScript restores them on every page, swap and example frame. */
export const THEME_STORAGE = {
  mode: "clay-theme",
  palette: "clay-palette",
  motion: "clay-motion",
} as const;

/** Dispatched on `window` after setTheme, so every control in the page stays in sync. */
export const THEME_CHANGE_EVENT = "clay-theme-change";

/** The applied theme, read from the `<html>` attributes ThemeScript sets. */
export function readTheme(): ThemeChoice {
  const { theme, palette, motion } = document.documentElement.dataset;
  return {
    mode: theme === "light" || theme === "dark" ? theme : "system",
    palette: palette ?? "default",
    motion: motion ?? "subtle",
  };
}

/** Applies, remembers and announces a theme change. Defaults remove their attribute. */
export function setTheme(next: Partial<ThemeChoice>): void {
  const { mode, palette, motion } = { ...readTheme(), ...next };
  const root = document.documentElement;
  if (mode === "system") delete root.dataset.theme;
  else root.dataset.theme = mode;
  if (palette === "default") delete root.dataset.palette;
  else root.dataset.palette = palette;
  if (motion === "subtle") delete root.dataset.motion;
  else root.dataset.motion = motion;
  try {
    localStorage.setItem(THEME_STORAGE.mode, mode);
    localStorage.setItem(THEME_STORAGE.palette, palette);
    localStorage.setItem(THEME_STORAGE.motion, motion);
  } catch {
    // Storage unavailable (private mode): the choice lasts until the next full page load.
  }
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}
