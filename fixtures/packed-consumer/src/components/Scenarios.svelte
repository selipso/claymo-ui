<script lang="ts">
  import { Button, Checkbox, Dialog, Tab, TabPanel, Tabs } from "@claymo/svelte";
  import type { DialogCloseReason, TabValue } from "@claymo/core";

  let tab: TabValue = $state("profile");
  let changes = $state(0);
  let terms = $state(false);
  let mixed = $state(true);
  let open = $state(false);
  let rejections: DialogCloseReason[] = $state([]);
</script>

<section>
  <h2>Tabs</h2>
  <Tabs
    value={tab}
    aria-label="Account"
    onChange={(_event, next) => {
      tab = next;
      changes++;
    }}
  >
    <Tab value="profile" label="Profile" />
    <Tab value="security" label="Security" />
    <Tab value="danger" label="Danger" disabled />
    <Tab value="billing" label="Billing" />
    {#snippet panels()}
      <TabPanel value="profile"><p>Profile panel</p></TabPanel>
      <TabPanel value="security"><p>Security panel</p></TabPanel>
      <TabPanel value="danger"><p>Danger panel</p></TabPanel>
      <TabPanel value="billing"><p>Billing panel</p></TabPanel>
    {/snippet}
  </Tabs>
  <p>Changes: <output id="tab-changes">{changes}</output></p>
  <Button id="programmatic" variant="outlined" onclick={() => (tab = "billing")}>
    Select billing from code
  </Button>
</section>

<form id="form" method="get" action="/svelte/" onreset={() => (terms = false)}>
  <label>
    <Checkbox
      name="terms"
      value="yes"
      checked={terms}
      onChange={(_event, next) => (terms = next)}
    /> Accept terms
  </label>
  <label>
    <Checkbox name="mixed" value="yes" indeterminate={mixed} onChange={() => (mixed = false)} />
    Mixed
  </label>
  <label><Checkbox name="locked" value="yes" indeterminate /> Locked mixed</label>
  <p>Terms bound: <output id="terms">{terms}</output></p>
  <Button type="submit">Submit</Button>
  <Button type="reset" variant="outlined">Reset</Button>
</form>

<section>
  <Button id="open" onclick={() => (open = true)}>Open dialog</Button>
  <Dialog {open} title="Locked dialog" onClose={(_event, reason) => rejections.push(reason)}>
    <p>Escape and backdrop requests are rejected.</p>
    {#snippet actions()}
      <Button onclick={() => (open = false)}>Close</Button>
    {/snippet}
  </Dialog>
  <p>Rejected: <output id="rejections">{rejections.join(" ")}</output></p>
</section>
