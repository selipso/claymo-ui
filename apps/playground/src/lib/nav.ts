export interface NavLink {
  href: string;
  label: string;
}

/** Guides in sidebar order; each slug is a file in the repo's docs/ folder (index is the home page). */
export const guides = [
  { slug: "index", label: "Introduction" },
  { slug: "getting-started", label: "Getting started" },
  { slug: "frameworks", label: "Astro and Svelte" },
  { slug: "theming", label: "Theming" },
  { slug: "motion", label: "Motion" },
  { slug: "mcp", label: "MCP server" },
  { slug: "accessibility", label: "Accessibility and limits" },
  { slug: "runbook", label: "Release runbook" },
] as const;

export const showcase: NavLink[] = [
  { href: "/demo/", label: "App demo" },
  { href: "/gallery/", label: "Gallery" },
  { href: "/lab/", label: "CSS lab" },
];

export function guideHref(slug: string): string {
  return slug === "index" ? "/" : `/docs/${slug}/`;
}

/** `ListItemButton` → `list-item-button`, the URL segment of a component's reference page. */
export function componentSlug(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

export function componentHref(name: string): string {
  return `/components/${componentSlug(name)}/`;
}

/** Route segment of a component's example page: `list-item-button-2` for the second example. */
export function exampleSlug(name: string, index: number): string {
  return `${componentSlug(name)}-${index + 1}`;
}
