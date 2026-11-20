export type Framework = "astro" | "svelte";
export type Mode = "system" | "light" | "dark";
export const frameworks: readonly Framework[];
export const modes: readonly Mode[];
export const palettes: readonly string[];
export const motionPresets: readonly string[];
export function listComponents(framework: Framework): string[];

export interface ComponentReference {
  framework: Framework;
  name: string;
  purpose: string;
  package: string;
  stylesheet: string;
  props: {
    type: "object";
    properties: Record<string, Record<string, unknown>>;
    required: string[];
  };
  content: string[];
  events: string[];
  example: string;
}
export function getComponent(framework: Framework, name: string): ComponentReference;

export interface ThemeColors {
  page: string;
  surface: string;
  ink: string;
  primary: string;
  secondary: string;
}
export interface ThemeChoice {
  palette: string;
  label: string;
  description: string;
  colors: { light: ThemeColors; dark: ThemeColors };
}
export function listThemes(): ThemeChoice[];

export interface Setup {
  framework: Framework;
  palette: string;
  mode: Mode;
  install: string;
  files: { path: string; content: string }[];
  usage: string;
  notes: string[];
}
export function getSetup(
  framework: Framework,
  palette?: string,
  mode?: Mode,
  svelteIslands?: boolean,
): Setup;

export const theme: {
  stylesheet: string;
  pageStylesheet: string;
  mode: { attribute: string; target: string; system: string };
  palette: { attribute: string; target: string; default: string };
  palettes: Record<string, { label: string; description: string }>;
  componentColor: string;
  motion: {
    attribute: string;
    class: string;
    target: string;
    default: string;
    reducedMotion: string;
    components: string[];
    presets: Record<string, { label: string; recommended: boolean; description: string }>;
    tokens: Record<string, string>;
  };
  overrides: { surface: string[]; brand: string; geometry: string[]; geometryTarget: string };
};
