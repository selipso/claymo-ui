<script lang="ts">
  // Must render the same states as Parity.astro; the parity test compares them.
  import { Button, Checkbox, Paper, Tab, TabPanel, Tabs } from "@claymo/svelte";
</script>

<section id="parity" style="display:grid;gap:16px;padding:16px">
  <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">
    <Button>Save</Button>
    <Button variant="outlined" color="secondary" size="small">Cancel</Button>
    <Button variant="text">More</Button>
    <Button href="/nowhere/" disabled>Disabled link</Button>
    <Button loading>Saving</Button>
    <!-- Svelte separates state (checked) from the reset default (defaultChecked); Astro's attribute is both. -->
    <Checkbox checked defaultChecked aria-label="Parity checked" />
  </div>
  <div style="display:flex;gap:16px">
    <Paper elevation={2} style="padding:16px">Raised</Paper>
    <Paper variant="outlined" as="aside" style="padding:16px">Outlined</Paper>
  </div>
  <Tabs aria-label="Parity tabs" value="one">
    <Tab value="one" label="One" />
    <Tab value="two" label="Two" disabled />
    <Tab value="three" label="Three" />
    {#snippet panels()}
      <TabPanel value="one"><p>First panel</p></TabPanel>
      <TabPanel value="two"></TabPanel>
      <TabPanel value="three"><p>Third panel</p></TabPanel>
    {/snippet}
  </Tabs>
</section>
