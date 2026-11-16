<script lang="ts">
  import { setContext } from "svelte";
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type ChangeEv = Event & { currentTarget: EventTarget & HTMLInputElement };

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "onchange"> {
    value?: string | number;
    /** Shared `name` for the child radios; generated when omitted. */
    name?: string;
    row?: boolean;
    disabled?: boolean;
    onChange?: (event: ChangeEv, value: string | number) => void;
    children?: Snippet;
  }

  let {
    value = $bindable(),
    name,
    row = false,
    disabled = false,
    onChange,
    class: className = "",
    children,
    ...rest
  }: Props = $props();

  const uid = $props.id();
  const groupName = $derived(name ?? `clay-radio-${uid}`);

  setContext("clay-radio-group", {
    get name() {
      return groupName;
    },
    get value() {
      return value;
    },
    get disabled() {
      return disabled;
    },
    select(next: string | number, event: ChangeEv) {
      value = next;
      onChange?.(event, next);
    },
  });
</script>

<!-- Name the group with aria-label or aria-labelledby (passed through rest). -->
<div role="radiogroup" class="radio-group {className}" class:row {...rest}>
  {@render children?.()}
</div>

<style>
  .radio-group {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .radio-group.row {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 24px;
  }
</style>
