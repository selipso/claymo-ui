import type { Color, Size } from "./types.js";

export interface AvatarOptions {
  src?: string;
  srcSet?: string;
  sizes?: string;
  alt?: string;
  variant?: "circular" | "rounded" | "square";
  size?: Size;
}

export const avatarDefaults = { alt: "", variant: "circular", size: "medium" } as const;

export function avatarInitial(alt: string): string {
  const text = alt.trim();
  const initial = text.codePointAt(0);
  return initial === undefined ? "" : String.fromCodePoint(initial);
}

export interface BadgeOptions {
  badgeContent?: string | number;
  color?: Color;
  max?: number;
  showZero?: boolean;
  invisible?: boolean;
  variant?: "standard" | "dot";
  anchorOrigin?: { vertical?: "top" | "bottom"; horizontal?: "left" | "right" };
  overlap?: "rectangular" | "circular";
}

export const badgeDefaults = {
  color: "primary",
  max: 99,
  variant: "standard",
  overlap: "rectangular",
  anchorOrigin: { vertical: "top", horizontal: "right" },
} as const;

/** Undefined means hidden; an empty label means a visible dot or custom badge content. */
export function badgeLabel(
  { badgeContent, max = badgeDefaults.max, showZero, invisible, variant }: BadgeOptions,
  hasCustomContent = false,
): string | number | undefined {
  if (invisible) return undefined;
  if (variant === "dot" || hasCustomContent) return "";
  if (
    badgeContent === undefined ||
    badgeContent === "" ||
    (!showZero && Number(badgeContent) === 0)
  )
    return undefined;
  return typeof badgeContent === "number" && badgeContent > max ? `${max}+` : badgeContent;
}

interface ProgressRange {
  min?: number;
  max?: number;
  value?: number;
}

interface ProgressOptions extends ProgressRange {
  color?: Color;
}

export interface CircularProgressOptions extends ProgressOptions {
  variant?: "determinate" | "indeterminate";
  size?: number | string;
  thickness?: number;
  disableShrink?: boolean;
  enableTrackSlot?: boolean;
}

export interface LinearProgressOptions extends ProgressOptions {
  variant?: "determinate" | "indeterminate" | "buffer" | "query";
  valueBuffer?: number;
}

export const progressDefaults = {
  variant: "indeterminate",
  color: "primary",
  min: 0,
  max: 100,
} as const;
export const circularProgressDefaults = { size: 40, thickness: 4, enableTrackSlot: true } as const;

function boundProgress(value: number, min: number, max: number): number {
  return Number.isNaN(value) ? min : Math.min(max, Math.max(min, value));
}

function progressRange({
  min = progressDefaults.min,
  max = progressDefaults.max,
  value,
}: ProgressRange) {
  if (min >= max || !Number.isFinite(max - min)) {
    min = progressDefaults.min;
    max = progressDefaults.max;
  }
  const now = boundProgress(value ?? min, min, max);
  return { min, max, now, fraction: (now - min) / (max - min) };
}

export function linearProgress({ variant, min, max, value, valueBuffer }: LinearProgressOptions) {
  const buffered = variant === "buffer";
  const hasValue = buffered || variant === "determinate";
  const range = hasValue ? progressRange({ min, max, value }) : undefined;
  const buffer =
    buffered && range
      ? Math.max(
          range.fraction,
          (boundProgress(valueBuffer ?? range.min, range.min, range.max) - range.min) /
            (range.max - range.min),
        )
      : undefined;
  return { range, buffer };
}

export function circularProgress({
  variant,
  min,
  max,
  value,
  size = circularProgressDefaults.size,
  thickness = circularProgressDefaults.thickness,
}: CircularProgressOptions) {
  // A CSS length has no numeric coordinate space; render it using the default viewBox.
  const diameter =
    typeof size === "number" && Number.isFinite(size) && size > 0
      ? size
      : circularProgressDefaults.size;
  const width = typeof size === "string" && size ? size : diameter;
  const stroke =
    Number.isFinite(thickness) && thickness > 0 && thickness < diameter
      ? thickness
      : Math.min(circularProgressDefaults.thickness, diameter / 2);
  const center = diameter / 2;
  const radius = (diameter - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const range = variant === "determinate" ? progressRange({ min, max, value }) : undefined;
  return {
    width,
    diameter,
    stroke,
    center,
    radius,
    circumference,
    range,
    dashOffset: range === undefined ? undefined : circumference * (1 - range.fraction),
  };
}

export interface SkeletonOptions {
  variant?: "text" | "rectangular" | "rounded" | "circular";
  width?: number | string;
  height?: number | string;
  animation?: "pulse" | "wave" | false;
}

export const skeletonDefaults = { variant: "text", animation: "pulse" } as const;

/** A circle with a single supplied side uses that length for both sides. */
export function skeletonDimensions({ variant, width, height }: SkeletonOptions) {
  const circular = variant === "circular";
  const w = width ?? (circular ? (height ?? 40) : undefined);
  const h = height ?? (circular ? (width ?? 40) : undefined);
  return {
    width: typeof w === "number" ? `${w}px` : w,
    height: typeof h === "number" ? `${h}px` : h,
  };
}

export interface TableOptions {
  size?: "small" | "medium";
  stickyHeader?: boolean;
  padding?: "normal" | "none" | "checkbox";
  label: string;
}

export const tableDefaults = { size: "medium", padding: "normal" } as const;
