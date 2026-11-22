import { hydrate } from "@solidjs/web";
import { Counter } from "./counter.mjs";

const root = document.querySelector("main");
const button = root.querySelector("button");
hydrate(Counter, root);
if (root.querySelector("button") !== button)
  throw new Error("Hydration replaced the server button");
button.dataset.hydrated = "true";
