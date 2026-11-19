/**
 * Sätteri mdast plugin: rewrites links between docs/*.md files (`./theming.md#modes`) to site
 * routes (`/docs/theming/#modes`; index.md is `/`). On GitHub the same links keep working as files.
 */
export const docLinks = {
  name: "claymo-doc-links",
  link: rewrite,
  definition: rewrite,
};

/** @param {{ url: string }} node @param {{ setField(node: unknown, key: "url", value: string): void }} ctx */
function rewrite(node, ctx) {
  const url = docRoute(node.url);
  if (url !== node.url) ctx.setField(node, "url", url);
}

/** @param {string} url */
export function docRoute(url) {
  const match = /^(?:\.\/)?([\w-]+)\.md(#.*)?$/.exec(url);
  if (!match) return url;
  const slug = match[1].toLowerCase();
  return (slug === "index" ? "/" : `/docs/${slug}/`) + (match[2] ?? "");
}
