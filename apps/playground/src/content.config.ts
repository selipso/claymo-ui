import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";

/** The repo's docs/*.md, the single source for both GitHub and the playground. */
const docs = defineCollection({ loader: glob({ base: "../../docs", pattern: "*.md" }) });

export const collections = { docs };
