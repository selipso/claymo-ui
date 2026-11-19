import { upgrader } from "./upgrade.ts";

/** Native summary keyboard activation also dispatches click, so one guard covers both. */
export function attachAccordion(details: HTMLDetailsElement): (() => void) | undefined {
  const summary = details.firstElementChild;
  if (summary?.localName !== "summary") return;

  const guard = (event: Event) => {
    if (summary.hasAttribute("data-disabled")) event.preventDefault();
  };
  summary.addEventListener("click", guard, true);
  return () => summary.removeEventListener("click", guard, true);
}

export const upgradeAccordions = upgrader<HTMLDetailsElement>(
  "details[data-clay-accordion]",
  attachAccordion,
);
