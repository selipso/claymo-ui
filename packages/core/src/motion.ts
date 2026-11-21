/**
 * Motion presets, defined in css/motion.css. Apply one to an element and everything inside it with
 * `data-motion="<preset>"` or the class `clay-motion-<preset>` (on `<html>` for the whole app), or
 * with a component's `motion` prop. Without one, components use `subtle`.
 */
export const motionPresets = [
  "subtle",
  "ease-in-out",
  "expand-contract",
  "lift",
  "fade",
  "none",
  "lift-push",
  "squish",
] as const;

export type MotionPreset = (typeof motionPresets)[number];
