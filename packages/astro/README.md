# @claymo/astro

Astro components and integration for Claymo, a claymorphic design system with Material UI-style APIs. Components render native HTML on the server; only interactive ones ship a small script.

## Install

```sh
npm install @claymo/astro @claymo/core
```

Add the integration to `astro.config.mjs`. It loads the Claymo stylesheet on every page:

```js
import { defineConfig } from "astro/config";
import claymo from "@claymo/astro/integration";

export default defineConfig({ integrations: [claymo()] });
```

| Option       | Default | Effect                                                                                                                   |
| ------------ | ------- | ------------------------------------------------------------------------------------------------------------------------ |
| `pageStyles` | `true`  | Also loads `@claymo/core/page.css`: brand font, page colors and the focus ring. Turn off inside a page styled elsewhere. |
| `svelte`     | `false` | Adds `@astrojs/svelte` for `@claymo/svelte` islands. Install `@astrojs/svelte svelte @claymo/svelte` first.              |

## Use

```astro
---
import { Button } from "@claymo/astro";
---

<Button variant="contained">Save</Button>
```

Theme with `data-theme="light|dark"` and `data-palette` on `<html>`.

## Docs

[Getting started](https://github.com/selipso/claymo-ui/blob/main/docs/getting-started.md), [component conventions](https://github.com/selipso/claymo-ui/blob/main/docs/frameworks.md) and [theming](https://github.com/selipso/claymo-ui/blob/main/docs/theming.md). Run `npm start` in a clone of the repository for every component's live reference.
