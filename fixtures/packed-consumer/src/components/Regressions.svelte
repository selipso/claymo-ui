<script lang="ts">
  import { tick } from "svelte";
  import { Button, Dialog } from "@claymo/svelte";

  let open = $state(false);
  let reasons = $state<string[]>([]);
  let clicks = $state(0);

  // Close then reopen in one interaction: the queued native `close` must not close it again.
  async function reopen() {
    open = false;
    await tick();
    open = true;
  }
</script>

<Button id="open-reopen" onclick={() => (open = true)}>Open reopen dialog</Button>
<Dialog
  bind:open
  title="Reopen dialog"
  onClose={(_event, reason) => {
    reasons.push(reason);
    open = false;
  }}
>
  {#snippet actions()}<Button onclick={reopen}>Reopen</Button>{/snippet}
</Dialog>
<output id="close-reasons">{reasons.join(",")}</output>

<Button href="/nowhere/" disabled onclick={() => clicks++}>Disabled link</Button>
<output id="link-clicks">{clicks === 0 ? "none" : "clicked"}</output>
