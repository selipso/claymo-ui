# @claymo/svelte

Svelte 5 components for Claymo, a claymorphic design system with Material UI-style APIs, built on native HTML.

## Install

```sh
npm install @claymo/svelte @claymo/core
```

SvelteKit: load the styles once in `src/routes/+layout.svelte`, and set the theme on `<html>` in `src/app.html` (`data-theme="light|dark"`, `data-palette`):

```svelte
<script>
  import "@claymo/core/claymo.css";
  import "@claymo/core/page.css";
  let { children } = $props();
</script>

{@render children()}
```

In Astro, use `claymo({ svelte: true })` from `@claymo/astro/integration` instead and hydrate components with a client directive such as `client:load`.

## Use

```svelte
<script>
  import { Button } from "@claymo/svelte";
</script>

<Button variant="contained" onclick={() => console.log("saved")}>Save</Button>
```

## Docs

[Getting started](https://github.com/selipso/claymo-ui/blob/main/docs/getting-started.md), [component conventions](https://github.com/selipso/claymo-ui/blob/main/docs/frameworks.md) and [theming](https://github.com/selipso/claymo-ui/blob/main/docs/theming.md).
