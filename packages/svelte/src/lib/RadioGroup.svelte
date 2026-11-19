<script lang="ts">
  import { onMount, setContext, untrack } from "svelte";
  import { on } from "svelte/events";
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
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
    children?: Snippet;
  }

  let {
    defaultValue,
    value = $bindable(),
    name,
    row = false,
    disabled = false,
    required = false,
    form,
    options,
    onChange,
    class: className = "",
    children,
    ...rest
  }: Props = $props();

  const uid = $props.id();
  const groupName = $derived(name ?? `clay-radio-${uid}`);
  let mounted = $state(false);
  const selection = $derived(mounted ? value : (value ?? defaultValue));
  const initialValue = untrack(() => selection);
  const resetValue = $derived(defaultValue ?? initialValue);
  let root: HTMLDivElement;

  // Radio inputs reset natively. Keep the group's Svelte binding in sync, including controls
  // associated with a non-ancestor form via the native `form` attribute.
  onMount(() => {
    value ??= initialValue;
    mounted = true;
    return on(
      root.ownerDocument,
      "reset",
      (event) => {
        for (const input of root.querySelectorAll<HTMLInputElement>("[data-clay-radio-member]")) {
          if (input.form !== event.target || input.closest(".clay-radio-group") !== root) continue;
          queueMicrotask(() => {
            if (!event.defaultPrevented) value = resetValue;
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
      value = next;
      onChange?.(event, next);
    },
  });
</script>

<!-- Name the group with aria-label or aria-labelledby (passed through rest). -->
<div
  bind:this={root}
  role="radiogroup"
  class={["clay-radio-group", className]}
  data-row={row || undefined}
  aria-required={required || undefined}
  {...rest}
>
  {#if options}
    {#each options as option}
      <FormControlLabel label={option.label}>
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
