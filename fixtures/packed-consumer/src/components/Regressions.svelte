<script lang="ts">
  import { tick } from "svelte";
  import {
    Button,
    ButtonGroup,
    Checkbox,
    Chip,
    DataTable,
    Dialog,
    TextField,
  } from "@claymo/svelte";

  let open = $state(false);
  let reasons = $state<string[]>([]);
  let clicks = $state(0);
  let mixed = $state(true);
  let changes = $state(0);
  let dismissOpen = $state(false);
  let dismissReasons = $state<string[]>([]);
  let showCsrDefault = $state(false);

  // Close then reopen in one interaction: the queued native `close` must not close it again.
  async function reopen() {
    open = false;
    await tick();
    open = true;
  }
</script>

<Button id="open-reopen" onclick={() => (open = true)}>Open reopen dialog</Button>
<Dialog
  {open}
  title="Reopen dialog"
  onClose={(_event, reason) => {
    reasons.push(reason);
    open = false;
  }}
>
  {#snippet actions()}<Button onclick={reopen}>Reopen</Button>{/snippet}
</Dialog>
<output id="close-reasons">{reasons.join(",")}</output>

<Button id="open-dismissible" onclick={() => (dismissOpen = true)}>Open dismissible dialog</Button>
<Dialog
  open={dismissOpen}
  title="Dismissible dialog"
  dismissible
  closeText="Dismiss"
  onClose={(_event, reason) => {
    dismissReasons.push(reason);
    // The first close request is rejected.
    if (dismissReasons.length > 1) dismissOpen = false;
  }}
>
  <p>The first close request is rejected.</p>
</Dialog>
<output id="dismiss-requests">{dismissReasons.join(",")}</output>

<Button href="/nowhere/" disabled onclick={() => clicks++}>Disabled link</Button>
<output id="link-clicks">{clicks === 0 ? "none" : "clicked"}</output>

<form>
  <label><Checkbox indeterminate={mixed} onChange={() => changes++} /> Controlled mixed</label>
  <output aria-label="User checkbox changes">{changes}</output>
  <Button onclick={() => (mixed = !mixed)}>Toggle mixed</Button>
  <Button type="reset">Reset mixed form</Button>
</form>

<section aria-label="Consistency checks">
  <label><Checkbox checked={false} /> Locked unchecked</label>
  <TextField label="Locked text" value="locked" />
  <Button id="mount-csr-default" onclick={() => (showCsrDefault = true)}
    >Mount default checkbox</Button
  >
  {#if showCsrDefault}
    <label><Checkbox defaultChecked /> CSR default checked</label>
  {/if}
  <Chip label="Pinned filter" clickable aria-pressed={true} />
  <Button id="loading-link" href="/nowhere/" loading>Loading link</Button>
  <ButtonGroup id="legend-group" variant="outlined" aria-label="Legend group">
    <legend class="clay-sr-only">Actions</legend>
    <Button>First</Button>
    <Button>Second</Button>
  </ButtonGroup>
  <DataTable label="Empty inferred" rows={[]} />
</section>
