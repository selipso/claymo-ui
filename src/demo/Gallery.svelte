<script lang="ts">
  import Download from "@lucide/svelte/icons/download";
  import Send from "@lucide/svelte/icons/send";
  import Heart from "@lucide/svelte/icons/heart";
  import Star from "@lucide/svelte/icons/star";
  import Plus from "@lucide/svelte/icons/plus";
  import Search from "@lucide/svelte/icons/search";

  import type { Color, Severity, Size } from "../lib/types";
  import Button from "../lib/components/Button.svelte";
  import IconButton from "../lib/components/IconButton.svelte";
  import ButtonGroup from "../lib/components/ButtonGroup.svelte";
  import TextField from "../lib/components/TextField.svelte";
  import Checkbox from "../lib/components/Checkbox.svelte";
  import Radio from "../lib/components/Radio.svelte";
  import RadioGroup from "../lib/components/RadioGroup.svelte";
  import FormControlLabel from "../lib/components/FormControlLabel.svelte";
  import Switch from "../lib/components/Switch.svelte";
  import Slider from "../lib/components/Slider.svelte";
  import Chip from "../lib/components/Chip.svelte";
  import Badge from "../lib/components/Badge.svelte";
  import Avatar from "../lib/components/Avatar.svelte";
  import Card from "../lib/components/Card.svelte";
  import CardHeader from "../lib/components/CardHeader.svelte";
  import CardContent from "../lib/components/CardContent.svelte";
  import CardActions from "../lib/components/CardActions.svelte";
  import Paper from "../lib/components/Paper.svelte";
  import Alert from "../lib/components/Alert.svelte";
  import Snackbar from "../lib/components/Snackbar.svelte";
  import LinearProgress from "../lib/components/LinearProgress.svelte";
  import CircularProgress from "../lib/components/CircularProgress.svelte";
  import Skeleton from "../lib/components/Skeleton.svelte";
  import Tabs from "../lib/components/Tabs.svelte";
  import Tab from "../lib/components/Tab.svelte";
  import TabPanel from "../lib/components/TabPanel.svelte";
  import Accordion from "../lib/components/Accordion.svelte";
  import Tooltip from "../lib/components/Tooltip.svelte";
  import Typography from "../lib/components/Typography.svelte";
  import Divider from "../lib/components/Divider.svelte";
  import List from "../lib/components/List.svelte";
  import ListItem from "../lib/components/ListItem.svelte";
  import ListItemButton from "../lib/components/ListItemButton.svelte";
  import ListItemIcon from "../lib/components/ListItemIcon.svelte";
  import ListItemText from "../lib/components/ListItemText.svelte";
  import Dialog from "../lib/components/Dialog.svelte";

  const colors: Color[] = [
    "primary",
    "secondary",
    "success",
    "error",
    "warning",
    "info",
    "default",
  ];
  const sizes: Size[] = ["small", "medium", "large"];
  const severities: Severity[] = ["success", "info", "warning", "error"];
  const variants = ["contained", "outlined", "text"] as const;

  let checkA = $state(true);
  let checkB = $state(false);
  let sw1 = $state(true);
  let sw2 = $state(false);
  let radio = $state("b");
  let slider = $state(40);
  let slider2 = $state(60);
  let field = $state("");
  let tab = $state<string | number>("one");
  let snack = $state(false);
  let dialog = $state(false);
  let loadingDemo = $state(false);
  let acc = $state(false);

  function fakeLoad() {
    loadingDemo = true;
    setTimeout(() => (loadingDemo = false), 1500);
  }
</script>

<div class="page">
  <p><a href="/">&larr; Back to app demo</a> &middot; <a href="/lab/">Technique lab</a></p>
  <Typography variant="h2" as="h1" gutterBottom>Component gallery</Typography>
  <Typography color="text.secondary" gutterBottom>
    Every component with the MUI prop names that drive it. Hover, press, and Tab through them: hover
    lifts, press sinks, focus draws a 3px ring.
  </Typography>

  <div class="sections">
    <Card as="section" aria-labelledby="g-button">
      <CardHeader
        title="Button"
        subheader="variant × color × size, loading, icons, fullWidth, href, inflated, disableElevation"
      />
      <CardContent>
        <h3 id="g-button" class="clay-sr-only">Button</h3>
        {#each variants as v}
          <p class="label">variant="{v}"</p>
          <div class="wrap">
            {#each colors as c}
              <Button variant={v} color={c}>{c}</Button>
            {/each}
          </div>
        {/each}
        <p class="label">size</p>
        <div class="wrap">
          {#each sizes as s}<Button size={s}>{s}</Button>{/each}
        </div>
        <p class="label">states and extras</p>
        <div class="wrap">
          <Button disabled>disabled</Button>
          <Button variant="outlined" disabled>disabled</Button>
          <Button loading={loadingDemo} onclick={fakeLoad}>click: loading</Button>
          <Button loading loadingPosition="start" variant="outlined">loadingPosition start</Button>
          <Button>
            {#snippet startIcon()}<Download size={18} />{/snippet}
            startIcon
          </Button>
          <Button color="secondary">
            endIcon
            {#snippet endIcon()}<Send size={18} />{/snippet}
          </Button>
          <Button href="/lab/" variant="outlined">href renders &lt;a&gt;</Button>
          <Button disableElevation>disableElevation</Button>
          <Button inflated>inflated</Button>
          <Button inflated color="secondary" size="large">inflated large</Button>
        </div>
        <div class="wrap"><Button fullWidth>fullWidth</Button></div>
      </CardContent>
    </Card>

    <Card as="section" aria-labelledby="g-iconbutton">
      <CardHeader
        title="IconButton and ButtonGroup"
        subheader="aria-label required; group shares variant/color/size"
      />
      <CardContent>
        <h3 id="g-iconbutton" class="clay-sr-only">IconButton and ButtonGroup</h3>
        <div class="wrap">
          <IconButton aria-label="Favourite" size="small"><Heart size={18} /></IconButton>
          <IconButton aria-label="Favourite"><Heart /></IconButton>
          <IconButton aria-label="Favourite" size="large" color="primary"><Star /></IconButton>
          <IconButton aria-label="Search" color="secondary" inflated><Search /></IconButton>
          <IconButton aria-label="Add" disabled><Plus /></IconButton>
        </div>
        <div class="wrap">
          <ButtonGroup aria-label="Contained group"
            ><Button>One</Button><Button>Two</Button><Button>Three</Button></ButtonGroup
          >
          <ButtonGroup variant="outlined" color="secondary" aria-label="Outlined group"
            ><Button>One</Button><Button>Two</Button><Button>Three</Button></ButtonGroup
          >
          <ButtonGroup orientation="vertical" variant="outlined" aria-label="Vertical group"
            ><Button>Top</Button><Button>Middle</Button><Button>Bottom</Button></ButtonGroup
          >
        </div>
      </CardContent>
    </Card>

    <Card as="section" aria-labelledby="g-text">
      <CardHeader
        title="TextField"
        subheader="outlined/filled, helperText, error, required, select, multiline, adornments, sizes"
      />
      <CardContent>
        <h3 id="g-text" class="clay-sr-only">TextField</h3>
        <div class="grid">
          <TextField
            label="Outlined"
            placeholder="Type here"
            bind:value={field}
            helperText="Helper text"
          />
          <TextField label="Filled" variant="filled" helperText="variant=&quot;filled&quot;" />
          <TextField label="Required" required helperText="required marks the label" />
          <TextField label="Error" error value="not-an-email" helperText="Enter a valid email" />
          <TextField label="Disabled" disabled value="Disabled value" />
          <TextField label="Small" size="small" />
          <TextField label="Select" select value="b">
            <option value="a">Alpha</option>
            <option value="b">Beta</option>
            <option value="c">Gamma</option>
          </TextField>
          <TextField label="Multiline" multiline rows={3} />
          <TextField label="Adornments" placeholder="Search">
            {#snippet startAdornment()}<Search size={18} />{/snippet}
          </TextField>
        </div>
        <p class="label">Typed value (two-way bound): {field || "(empty)"}</p>
      </CardContent>
    </Card>

    <Card as="section" aria-labelledby="g-select">
      <CardHeader
        title="Checkbox, Radio, Switch, Slider"
        subheader="checked, indeterminate, disabled, color, size, marks, valueLabelDisplay"
      />
      <CardContent>
        <h3 id="g-select" class="clay-sr-only">Selection controls</h3>
        <div class="grid">
          <div class="col">
            <p class="label">Checkbox</p>
            <FormControlLabel label="Checked"
              >{#snippet control()}<Checkbox bind:checked={checkA} />{/snippet}</FormControlLabel
            >
            <FormControlLabel label="Unchecked"
              >{#snippet control()}<Checkbox
                  bind:checked={checkB}
                  color="secondary"
                />{/snippet}</FormControlLabel
            >
            <FormControlLabel label="Indeterminate"
              >{#snippet control()}<Checkbox indeterminate />{/snippet}</FormControlLabel
            >
            <FormControlLabel label="Small"
              >{#snippet control()}<Checkbox size="small" checked />{/snippet}</FormControlLabel
            >
            <FormControlLabel label="Disabled" disabled
              >{#snippet control()}<Checkbox disabled />{/snippet}</FormControlLabel
            >
          </div>
          <div>
            <p class="label">Radio ({radio})</p>
            <RadioGroup bind:value={radio} aria-label="Radio demo">
              <FormControlLabel label="Alpha"
                >{#snippet control()}<Radio value="a" />{/snippet}</FormControlLabel
              >
              <FormControlLabel label="Beta"
                >{#snippet control()}<Radio value="b" color="success" />{/snippet}</FormControlLabel
              >
              <FormControlLabel label="Gamma (disabled)" disabled
                >{#snippet control()}<Radio value="c" disabled />{/snippet}</FormControlLabel
              >
            </RadioGroup>
          </div>
          <div class="col">
            <p class="label">Switch</p>
            <FormControlLabel label="On"
              >{#snippet control()}<Switch bind:checked={sw1} />{/snippet}</FormControlLabel
            >
            <FormControlLabel label="Off"
              >{#snippet control()}<Switch
                  bind:checked={sw2}
                  color="secondary"
                />{/snippet}</FormControlLabel
            >
            <FormControlLabel label="Small"
              >{#snippet control()}<Switch
                  size="small"
                  checked
                  color="success"
                />{/snippet}</FormControlLabel
            >
            <FormControlLabel label="Disabled" disabled
              >{#snippet control()}<Switch disabled />{/snippet}</FormControlLabel
            >
          </div>
          <div>
            <p class="label">Slider ({slider})</p>
            <Slider
              bind:value={slider}
              valueLabelDisplay="auto"
              aria-label="Slider with auto label"
            />
            <p class="label">marks + on ({slider2})</p>
            <Slider
              bind:value={slider2}
              min={0}
              max={100}
              step={10}
              marks
              valueLabelDisplay="on"
              color="secondary"
              aria-label="Slider with marks"
            />
            <p class="label">disabled</p>
            <Slider value={30} disabled aria-label="Disabled slider" />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card as="section" aria-labelledby="g-data">
      <CardHeader
        title="Chip, Badge, Avatar, Tooltip"
        subheader="variants, colors, onDelete, badgeContent, max, dot"
      />
      <CardContent>
        <h3 id="g-data" class="clay-sr-only">Chip, Badge, Avatar</h3>
        <div class="wrap">
          <Chip label="Default" />
          <Chip label="Outlined" variant="outlined" />
          {#each colors.slice(0, 6) as c}<Chip label={c} color={c} />{/each}
          <Chip label="Deletable" onDelete={() => {}} />
          <Chip label="Clickable" clickable onclick={() => {}} />
          <Chip label="Small" size="small" color="primary" />
          <Chip label="Disabled" disabled />
        </div>
        <div class="wrap">
          <Badge badgeContent={4}><Chip label="Inbox" /></Badge>
          <Badge badgeContent={1200} max={99} color="error"><Chip label="max=99" /></Badge>
          <Badge variant="dot" color="success"><Chip label="dot" /></Badge>
          <Badge badgeContent={0} showZero color="secondary"><Chip label="showZero" /></Badge>
          <Avatar alt="Ada">AB</Avatar>
          <Avatar variant="rounded" size="large" alt="Rounded">RD</Avatar>
          <Avatar size="small" alt="Small">S</Avatar>
          <Tooltip title="Tooltip on hover or focus" placement="top"
            ><Button variant="outlined" size="small">Tooltip</Button></Tooltip
          >
        </div>
      </CardContent>
    </Card>

    <Card as="section" aria-labelledby="g-feedback">
      <CardHeader
        title="Alert, Snackbar, Progress, Skeleton"
        subheader="severity × variant, onClose, determinate and indeterminate"
      />
      <CardContent>
        <h3 id="g-feedback" class="clay-sr-only">Feedback</h3>
        <div class="stack">
          {#each severities as s}
            <Alert severity={s}>{s} / standard</Alert>
          {/each}
          {#each severities as s}
            <Alert severity={s} variant="filled" onClose={() => {}}>{s} / filled with onClose</Alert
            >
          {/each}
          {#each severities as s}
            <Alert severity={s} variant="outlined">{s} / outlined</Alert>
          {/each}
        </div>
        <div class="wrap">
          <Button variant="outlined" onclick={() => (snack = true)}>Open Snackbar</Button>
        </div>
        <p class="label">LinearProgress</p>
        <div class="stack">
          <LinearProgress variant="determinate" value={64} aria-label="Determinate 64 percent" />
          <LinearProgress aria-label="Indeterminate" color="secondary" />
        </div>
        <p class="label">CircularProgress</p>
        <div class="wrap">
          <CircularProgress variant="determinate" value={72} aria-label="Determinate 72 percent" />
          <CircularProgress aria-label="Indeterminate" color="success" />
          <CircularProgress
            size={24}
            thickness={3}
            aria-label="Small indeterminate"
            color="error"
          />
        </div>
        <p class="label">Skeleton</p>
        <div class="stack">
          <Skeleton width="60%" />
          <Skeleton variant="rectangular" height={64} />
          <Skeleton variant="rounded" height={64} animation="wave" />
          <Skeleton variant="circular" width={48} height={48} />
        </div>
      </CardContent>
    </Card>

    <Card as="section" aria-labelledby="g-nav">
      <CardHeader
        title="Tabs, Accordion, List, Divider, Paper"
        subheader="Tabs: arrows, Home, End; panels render via the panels snippet"
      />
      <CardContent>
        <h3 id="g-nav" class="clay-sr-only">Navigation and surfaces</h3>
        <Tabs bind:value={tab} aria-label="Gallery tabs">
          <Tab value="one" label="One" />
          <Tab value="two" label="Two" />
          <Tab value="three" label="Disabled" disabled />
          <Tab value="four" label="Four" />
          {#snippet panels()}
            <TabPanel value="one"><p>Panel one</p></TabPanel>
            <TabPanel value="two"><p>Panel two</p></TabPanel>
            <TabPanel value="four"><p>Panel four</p></TabPanel>
          {/snippet}
        </Tabs>
        <Divider />
        <Accordion bind:expanded={acc}>
          {#snippet summary()}Accordion summary ({acc ? "open" : "closed"}){/snippet}
          <p>Native details and summary underneath.</p>
        </Accordion>
        <Divider />
        <List>
          <ListItem disablePadding
            ><ListItemButton selected
              ><ListItemIcon><Star /></ListItemIcon><ListItemText
                primary="Selected"
                secondary="secondary text"
              /></ListItemButton
            ></ListItem
          >
          <ListItem disablePadding
            ><ListItemButton
              ><ListItemIcon><Heart /></ListItemIcon><ListItemText
                primary="Default item"
              /></ListItemButton
            ></ListItem
          >
          <ListItem disablePadding
            ><ListItemButton disabled
              ><ListItemIcon><Plus /></ListItemIcon><ListItemText
                primary="Disabled item"
              /></ListItemButton
            ></ListItem
          >
        </List>
        <div class="wrap">
          {#each [0, 1, 2, 3] as e (e)}
            <Paper elevation={e as 0 | 1 | 2 | 3} class="swatch">elevation {e}</Paper>
          {/each}
          <Paper variant="outlined" class="swatch">outlined</Paper>
          <Paper inflated class="swatch">inflated</Paper>
        </div>
      </CardContent>
    </Card>

    <Card as="section" aria-labelledby="g-type">
      <CardHeader title="Typography and overlays" subheader="variants, Dialog" />
      <CardContent>
        <h3 id="g-type" class="clay-sr-only">Typography and overlays</h3>
        {#each ["h1", "h2", "h3", "h4", "h5", "h6", "subtitle1", "subtitle2", "body1", "body2", "caption", "overline"] as v (v)}
          <Typography variant={v as "h1"}>{v}: The quick brown fox</Typography>
        {/each}
        <div class="wrap">
          <Button onclick={() => (dialog = true)}>Open Dialog</Button>
        </div>
      </CardContent>
      <CardActions>
        <Button variant="text" color="secondary">CardActions</Button>
      </CardActions>
    </Card>
  </div>
</div>

<Snackbar bind:open={snack} message="Snackbar from the gallery" />
<Dialog bind:open={dialog} title="Dialog title" maxWidth="xs">
  <p>Native dialog: focus is trapped, Escape closes, focus returns to the opener.</p>
  {#snippet actions()}
    <Button variant="text" onclick={() => (dialog = false)}>Close</Button>
  {/snippet}
</Dialog>

<style>
  .page {
    max-width: 1100px;
    margin: 0 auto;
    padding: 32px 20px 64px;
  }
  a {
    color: var(--clay-primary-ink);
  }
  .sections {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 32px;
    margin-top: 24px;
  }
  .wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;
    padding: 8px 4px 16px;
  }
  .stack {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 14px;
    padding: 8px 4px 16px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
    gap: 24px;
  }
  .label {
    margin: 12px 0 0;
    font-weight: 600;
    color: var(--clay-ink-muted);
    font-size: 0.875rem;
  }
  .col {
    display: grid;
    justify-items: start;
    gap: 4px;
    align-content: start;
  }
  :global(.swatch) {
    padding: 20px 24px;
    min-width: 120px;
    text-align: center;
  }
</style>
