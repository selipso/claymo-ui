<script lang="ts">
  // A separate island: its $props.id() ids must not collide with the first island's.
  import { Tab, TabPanel, Tabs } from "@claymo/svelte";
</script>

<Tabs value="plan" aria-label="Billing settings">
  <Tab value="plan" label="Plan" />
  <Tab value="invoices" label="Invoices" />
  {#snippet panels()}
    <TabPanel value="plan"><p>Plan panel</p></TabPanel>
    <TabPanel value="invoices"><p>Invoices panel</p></TabPanel>
  {/snippet}
</Tabs>
