import { createComponent, createSignal } from "solid-js";
import { Button } from "@claymo/solid";

export function Counter() {
  const [count, setCount] = createSignal(0);
  return createComponent(Button, {
    get children() {
      return `Count: ${count()}`;
    },
    onClick: () => setCount((n) => n + 1),
  });
}
