# @claymo/solid

Solid 2 components backed by `@claymo/core`. Use with `solid-js` and `@solidjs/web` 2.0.3 or later 2.x. The package exports a browser build for mounting or hydration and a server build for SSR. It does not carry its own copy of Solid or the Claymo stylesheet.

```tsx
import { createSignal } from "solid-js";
import { Button } from "@claymo/solid";
import "@claymo/core/claymo.css";

export default function Counter() {
  const [count, setCount] = createSignal(0);
  return <Button onClick={() => setCount((n) => n + 1)}>Count: {count()}</Button>;
}
```

Use `@solidjs/vite-plugin` 3 to compile application JSX and `"jsxImportSource": "@solidjs/web"` in TypeScript. Add `@claymo/core/page.css` once in the app entry if Claymo should style the page. Set palette and mode on `<html>`.

For a complete Vite starter, call Claymo MCP `get_setup` with `framework: "solid"`. Use `list_components` and `get_components` with the same framework for typed props, JSX content, callbacks, and runnable TSX examples.
