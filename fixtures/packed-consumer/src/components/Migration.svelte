<script lang="ts">
  import {
    Accordion,
    Alert,
    Badge,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    CircularProgress,
    Drawer,
    FormControlLabel,
    LinearProgress,
    Radio,
    RadioGroup,
    Skeleton,
    Slider,
    Snackbar,
    Switch,
    Tab,
    TabPanel,
    Table,
    Tabs,
    TextField,
    Tooltip,
  } from "@claymo/svelte";

  let saved = $state("");
  let volume = $state(25);
  let alerts = $state(true);
  let drawer = $state(false);
  let snackbar = $state(false);
  let selection = $state("");
  let draft = $state(true);
  let message = $state(true);

  function save(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
    event.preventDefault();
    saved = new URLSearchParams(
      Array.from(new FormData(event.currentTarget), ([key, value]) => [key, String(value)]),
    ).toString();
  }
</script>

<form id="preferences" onsubmit={save}>
  <TextField id="mail" type="email" name="mail" label="Email" required />
  <TextField id="shelf" name="shelf" label="Shelf" select defaultValue="paper">
    <option value="ebook">E-book</option>
    <option value="paper">Paper</option>
  </TextField>
  <RadioGroup name="plan" aria-label="Plan" defaultValue="pro">
    <label><Radio value="basic" /> Basic</label>
    <label><Radio value="pro" /> Pro</label>
  </RadioGroup>
  <FormControlLabel label="Alerts">
    {#snippet control()}<Switch name="alerts" defaultChecked bind:checked={alerts} />{/snippet}
  </FormControlLabel>
  <FormControlLabel label="Back up changes">
    {#snippet control()}<Checkbox />{/snippet}
  </FormControlLabel>
  <Slider
    id="volume"
    name="volume"
    aria-label="Volume"
    defaultValue={25}
    bind:value={volume}
    step={25}
    marks
    valueLabelDisplay="on"
  />
  <Button type="submit">Save preferences</Button>
  <Button type="reset">Reset preferences</Button>
</form>
<output id="saved" aria-label="Saved preferences">{saved}</output>

<Accordion>
  {#snippet summary()}Details{/snippet}
  <p>Native disclosure content</p>
</Accordion>
<Accordion disabled>
  {#snippet summary()}Locked details{/snippet}
  <p>Unavailable disclosure content</p>
</Accordion>
<Card as="article"
  ><CardContent>
    <h2>Activity</h2>
    <Badge badgeContent={120} max={99}>Inbox</Badge>
    <LinearProgress variant="buffer" value={40} valueBuffer={65} aria-label="Import progress" />
    <CircularProgress aria-label="Checking updates" />
    <LinearProgress aria-label="Downloading updates" />
    <Skeleton animation="wave" />
    <Table label="Results" stickyHeader style="max-height: 110px">
      <thead><tr><th scope="col">Result</th></tr></thead>
      <tbody>
        <tr><td>Ready</td></tr>
        {#each [1, 2, 3, 4, 5, 6] as row (row)}
          <tr><td>Result {row}</td></tr>
        {/each}
      </tbody>
    </Table>
  </CardContent></Card
>

{#if draft}<Chip label="Draft" clickable onDelete={() => (draft = false)} />{/if}
{#if message}<Alert onClose={() => (message = false)}>Saved message</Alert>{/if}
<Tooltip title="Extra information"><Button>More info</Button></Tooltip>
<Button onclick={() => (drawer = true)}>Open drawer</Button>
<Drawer bind:open={drawer} aria-label="Settings drawer">
  <Button onclick={() => (drawer = false)}>Close drawer</Button>
</Drawer>
<Button onclick={() => (snackbar = true)}>Show notice</Button>
<Snackbar bind:open={snackbar} message="Preferences saved" autoHideDuration={null} />

<Tabs
  aria-label="Migration tabs"
  value="2"
  onChange={(_event, value) => (selection = `${typeof value}:${value}`)}
>
  <Tab value="2" label="Overview" />
  <Tab value={2} label="Stats" />
  {#snippet panels()}
    <TabPanel value="2">Overview panel</TabPanel>
    <TabPanel value={2}>Stats panel</TabPanel>
  {/snippet}
</Tabs>
<output id="tab-selection">{selection}</output>
