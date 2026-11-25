<script lang="ts">
  import { onMount, setContext, untrack } from "svelte";
  import { on } from "svelte/events";
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { MotionPreset } from "@claymo/core";
  import type { RadioGroupOption } from "@claymo/core/input";
  import FormControlLabel from "./FormControlLabel.svelte";
  import Radio from "./Radio.svelte";

  type ChangeEv = Event & { currentTarget: EventTarget & HTMLInputElement };

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "onchange"> {
    value?: string | number;
    defaultValue?: string | number;
    /** Shared `name` for the child radios; generated when omitted. */
    name?: string;
    row?: boolean;
    disabled?: boolean;
    required?: boolean;
    /** External form association for data-driven radios. */
    form?: string;
    options?: readonly RadioGroupOption[];
    onChange?: (event: ChangeEv, value: string | number) => void;
    /** Motion preset for this component and its contents; omitted, it inherits the surrounding preset (default subtle). */
    motion?: MotionPreset;
    children?: Snippet;
  }

  let {
    defaultValue,
    value,
    name,
    row = false,
    disabled = false,
    required = false,
    form,
    options,
    onChange,
    motion,
    class: className = "",
    children,
    ...rest
  }: Props = $props();

  const uid = $props.id();
  const groupName = $derived(name ?? `clay-radio-${uid}`);
  const initialDefault = untrack(() => defaultValue);
  let localValue = $state<string | number | undefined>(initialDefault);
  const selection = $derived(value !== undefined ? value : localValue);
  const resetValue = $derived(value !== undefined ? value : initialDefault);
  let root: HTMLDivElement;

  function syncRadios() {
    if (!root) return;
    const expected = selection === undefined ? undefined : String(selection);
    for (const input of root.querySelectorAll<HTMLInputElement>("[data-clay-radio-member]")) {
      if (input.closest(".clay-radio-group") !== root) continue;
      const shouldCheck = expected !== undefined && input.value === expected;
      if (input.checked !== shouldCheck) input.checked = shouldCheck;
    }
  }

  // Radio inputs reset natively. Keep the group's state in sync, including controls
  // associated with a non-ancestor form via the native `form` attribute and Shadow DOM.
  onMount(() => {
    const target = root.getRootNode();
    return on(
      target,
      "reset",
      (event) => {
        if (event.defaultPrevented) return;
        for (const input of root.querySelectorAll<HTMLInputElement>("[data-clay-radio-member]")) {
          if (input.form !== event.target || input.closest(".clay-radio-group") !== root) continue;
          setTimeout(() => {
            if (event.defaultPrevented) return;
            if (value === undefined) localValue = initialDefault;
            syncRadios();
          });
          break;
        }
      },
      { capture: true },
    );
  });

  setContext("clay-radio-group", {
    get name() {
      return groupName;
    },
    get value() {
      return selection;
    },
    get controlled() {
      return value !== undefined;
    },
    get disabled() {
      return disabled;
    },
    get resetValue() {
      return resetValue;
    },
    get required() {
      return required;
    },
    select(next: string | number, event: ChangeEv) {
      if (value === undefined) localValue = next;
      onChange?.(event, next);
      if (value !== undefined) {
        queueMicrotask(syncRadios);
      }
    },
  });
</script>

<!-- Name the group with aria-label or aria-labelledby (passed through rest). -->
<div
  {...rest}
  bind:this={root}
  role="radiogroup"
  class={["clay-radio-group", className]}
  data-row={row ? "" : undefined}
  data-motion={motion}
  aria-required={required || undefined}
>
  {#if options}
    {#each options as option}
      <FormControlLabel label={option.label} disabled={disabled || option.disabled}>
        {#snippet control()}
          <Radio
            value={option.value}
            disabled={option.disabled}
            color={option.color}
            size={option.size}
            {form}
          />
        {/snippet}
      </FormControlLabel>
    {/each}
  {:else}
    {@render children?.()}
  {/if}
</div>
