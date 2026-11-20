<script lang="ts">
  import { tick } from "svelte";
  import { Button, Checkbox, Dialog } from "@claymo/svelte";

  let open = $state(false);
  let reasons = $state<string[]>([]);
  let clicks = $state(0);
  let mixed = $state(true);
  let changes = $state(0);

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

<form>
  <label><Checkbox indeterminate={mixed} onChange={() => changes++} /> Controlled mixed</label>
  <output aria-label="User checkbox changes">{changes}</output>
  <Button onclick={() => (mixed = !mixed)}>Toggle mixed</Button>
  <Button type="reset">Reset mixed form</Button>
</form>
