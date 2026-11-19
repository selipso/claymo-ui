<script lang="ts">
  import { onMount } from "svelte";
  import { TextField } from "@claymo/svelte";
  import type { TextFieldOption } from "@claymo/core/input";
  import { THEME_CHANGE_EVENT, readTheme, setTheme, type Mode } from "../lib/theme";

  let { palettes }: { palettes: TextFieldOption[] } = $props();

  const modes: TextFieldOption[] = [
    { value: "system", label: "System" },
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
  ];

  let palette = $state("default");
  let mode = $state<Mode>("system");

  function sync() {
    ({ palette, mode } = readTheme());
  }

  function selected(event: Event): string {
    return (event.currentTarget as HTMLSelectElement).value;
  }

  onMount(() => {
    sync();
    window.addEventListener(THEME_CHANGE_EVENT, sync);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, sync);
  });
</script>

<div class="theme-controls">
  <TextField
    select
    size="small"
    label="Palette"
    options={palettes}
    value={palette}
    onChange={(event) => setTheme({ palette: selected(event) })}
  />
  <TextField
    select
    size="small"
    label="Mode"
    options={modes}
    value={mode}
    onChange={(event) => setTheme({ mode: selected(event) as Mode })}
  />
</div>

<style>
  .theme-controls {
    display: grid;
    grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
    gap: 10px;
  }
</style>
