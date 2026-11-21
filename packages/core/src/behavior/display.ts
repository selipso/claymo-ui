import { upgrader } from "./upgrade.js";

/** Also detect failures that completed before hydration or Astro's script loaded. */
export function watchAvatarImage(image: HTMLImageElement, onFailure: () => void) {
  if (image.complete && image.naturalWidth === 0) onFailure();
  else image.addEventListener("error", onFailure, { once: true });
  return { destroy: () => image.removeEventListener("error", onFailure) };
}

export const upgradeAvatars = upgrader<HTMLElement>("[data-clay-avatar]", (avatar) => {
  const image = avatar.querySelector<HTMLImageElement>(":scope > .clay-avatar__image");
  const fallback = avatar.querySelector<HTMLElement>(":scope > .clay-avatar__fallback");
  if (!image || !fallback) return;
  watchAvatarImage(image, () => {
    image.hidden = true;
    fallback.hidden = false;
  });
});

export * from "./data-table.ts";
