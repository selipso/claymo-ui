<script lang="ts">
  import { onMount } from "svelte";
  import Menu from "@lucide/svelte/icons/menu";
  import Bell from "@lucide/svelte/icons/bell";
  import LayoutDashboard from "@lucide/svelte/icons/layout-dashboard";
  import Settings from "@lucide/svelte/icons/settings";
  import { THEME_CHANGE_EVENT, readTheme, setTheme } from "../lib/theme";
  import { formats, rows, type Shelf } from "./collection-data";
  import Save from "@lucide/svelte/icons/save";
  import Trash from "@lucide/svelte/icons/trash";
  import Plus from "@lucide/svelte/icons/plus";

  import {
    Alert,
    AppBar,
    Avatar,
    Badge,
    Button,
    ButtonGroup,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Checkbox,
    Chip,
    CircularProgress,
    Dialog,
    Divider,
    Drawer,
    FormControlLabel,
    IconButton,
    LinearProgress,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Radio,
    RadioGroup,
    Slider,
    Snackbar,
    Switch,
    Tab,
    TabPanel,
    Table,
    Tabs,
    TextField,
    Tooltip,
    Typography,
  } from "@claymo/svelte";

  // ---- shell state
  let drawerOpen = $state(false);
  let dark = $state(false);
  let tab = $state<string | number>("dashboard");

  // The demo's Dark switch drives the site theme, so it stays in sync with the sidebar controls.
  onMount(() => {
    const systemMode = matchMedia("(prefers-color-scheme: dark)");
    function syncDark() {
      const { mode } = readTheme();
      dark = mode === "system" ? systemMode.matches : mode === "dark";
    }
    syncDark();
    systemMode.addEventListener("change", syncDark);
    window.addEventListener(THEME_CHANGE_EVENT, syncDark);
    return () => {
      systemMode.removeEventListener("change", syncDark);
      window.removeEventListener(THEME_CHANGE_EVENT, syncDark);
    };
  });

  function openSection(section: string) {
    tab = section;
    drawerOpen = false;
  }

  // ---- dashboard (sample data)
  let activeFormats = $state<Shelf[]>(["Favorites"]);
  let removedFormats = $state<Shelf[]>([]);
  const visibleRows = $derived(
    activeFormats.length ? rows.filter((row) => activeFormats.includes(row.shelf)) : rows,
  );

  function toggleFormat(f: Shelf) {
    activeFormats = activeFormats.includes(f)
      ? activeFormats.filter((x) => x !== f)
      : [...activeFormats, f];
  }

  function removeFormat(format: Shelf) {
    activeFormats = activeFormats.filter((item) => item !== format);
    removedFormats = [...removedFormats, format];
  }

  // ---- settings form
  let displayName = $state("Avery Quinn");
  let email = $state("avery@example.com");
  let emailTouched = $state(false);
  const emailInvalid = $derived(emailTouched && !/^\S+@\S+\.\S+$/.test(email));
  let defaultFormat = $state("main");
  let bio = $state("Sample bio text.");
  let density = $state("comfortable");
  let notify = $state({ price: true, trade: false, news: false });
  const notifyCount = $derived(Object.values(notify).filter(Boolean).length);
  const allNotify = $derived(notifyCount === 3);
  const someNotify = $derived(notifyCount > 0 && notifyCount < 3);
  let digest = $state(true);
  let publicProfile = $state(false);
  let betaFeatures = $state(false);
  let threshold = $state(25);
  let view = $state("grid");

  let saving = $state(false);
  let snackOpen = $state(false);
  let confirmOpen = $state(false);

  function setAllNotify(checked: boolean) {
    notify = { price: checked, trade: checked, news: checked };
  }

  function save() {
    emailTouched = true;
    if (emailInvalid || !displayName.trim()) return;
    saving = true;
    setTimeout(() => {
      saving = false;
      snackOpen = true;
    }, 1200);
  }
</script>

{#snippet nav()}
  <List>
    <ListItem disablePadding>
      <ListItemButton selected={tab === "dashboard"} onclick={() => openSection("dashboard")}>
        <ListItemIcon><LayoutDashboard /></ListItemIcon>
        <ListItemText primary="Dashboard" secondary="Formats, uploads, progress" />
      </ListItemButton>
    </ListItem>
    <ListItem disablePadding>
      <ListItemButton selected={tab === "settings"} onclick={() => openSection("settings")}>
        <ListItemIcon><Settings /></ListItemIcon>
        <ListItemText primary="Settings" secondary="Profile and preferences" />
      </ListItemButton>
    </ListItem>
  </List>
{/snippet}

<div class="collection-demo">
  <AppBar>
    <span class="menu-btn">
      <IconButton aria-label="Open navigation" onclick={() => (drawerOpen = true)}>
        <Menu />
      </IconButton>
    </span>
    <Typography variant="h6" as="h1" noWrap>Collection demo</Typography>
    <span class="spacer"></span>
    <label class="bar-switch">
      <span>Dark</span>
      <Switch
        size="small"
        checked={dark}
        onChange={(_e, checked) => setTheme({ mode: checked ? "dark" : "light" })}
      />
    </label>
    <Tooltip title="3 new alerts" placement="bottom">
      <IconButton aria-label="Notifications, 3 new">
        <Badge badgeContent={3} color="error"><Bell /></Badge>
      </IconButton>
    </Tooltip>
    <Avatar size="small" alt="Avery Quinn">AQ</Avatar>
  </AppBar>

  <div class="body">
    <div class="perm">
      <Drawer variant="permanent" aria-label="Main navigation">
        {@render nav()}
      </Drawer>
    </div>
    <Drawer
      variant="temporary"
      aria-label="Main navigation"
      open={drawerOpen}
      onClose={() => (drawerOpen = false)}
    >
      {@render nav()}
    </Drawer>

    <main class="main">
      <Typography variant="overline" as="p" color="text.secondary"
        >Prototype · sample data · no backend</Typography
      >
      <Tabs value={tab} onChange={(_e, next) => (tab = next)} aria-label="App sections">
        <Tab value="dashboard" label="Dashboard">
          {#snippet icon()}<LayoutDashboard size={18} />{/snippet}
        </Tab>
        <Tab value="settings" label="Settings">
          {#snippet icon()}<Settings size={18} />{/snippet}
        </Tab>
        {#snippet panels()}
          <TabPanel value="dashboard">
            <div class="stack">
              <Alert severity="info" variant="standard">
                All numbers on this screen are hard-coded sample content to show the components in a
                realistic layout.
              </Alert>

              <div class="stats">
                <Card>
                  <CardHeader title="Items owned" subheader="Across all shelves" />
                  <CardContent>
                    <Typography variant="h3" as="p">1,284</Typography>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader title="Total value" subheader="Sample figure" />
                  <CardContent>
                    <Typography variant="h3" as="p">$3,940</Typography>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader title="Progress" subheader="Sample metric" />
                  <CardContent>
                    <Typography variant="h3" as="p">64%</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={64}
                      aria-label="Progress 64 percent"
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader title="Sync progress" subheader="Last 30 days" />
                  <CardContent>
                    <div class="row">
                      <CircularProgress
                        variant="determinate"
                        value={82}
                        size={56}
                        aria-label="Sync progress 82 percent"
                      />
                      <Typography variant="h4" as="p">82%</Typography>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader title="Recently added" subheader="Filter by shelf" />
                <CardContent>
                  <div class="chips" role="group" aria-label="Shelf filters">
                    {#each formats.filter((f) => !removedFormats.includes(f)) as f (f)}
                      <Chip
                        label={f}
                        color={activeFormats.includes(f) ? "primary" : "default"}
                        variant={activeFormats.includes(f) ? "filled" : "outlined"}
                        clickable
                        onclick={() => toggleFormat(f)}
                        aria-pressed={activeFormats.includes(f)}
                        onDelete={() => removeFormat(f)}
                      />
                    {/each}
                    {#if removedFormats.length}
                      <Button size="small" variant="text" onclick={() => (removedFormats = [])}>
                        {#snippet startIcon()}<Plus size={16} />{/snippet}
                        Restore filters
                      </Button>
                    {/if}
                  </div>
                  <Table label="Recently added items (sample data)">
                    <thead>
                      <tr><th>Item</th><th>Code</th><th>Qty</th><th>Price</th></tr>
                    </thead>
                    <tbody>
                      {#each visibleRows as r (r.name)}
                        <tr><td>{r.name}</td><td>{r.set}</td><td>{r.qty}</td><td>{r.price}</td></tr>
                      {/each}
                    </tbody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabPanel>

          <TabPanel value="settings">
            <div class="stack">
              {#if snackOpen}
                <Alert severity="success" variant="outlined" onClose={() => (snackOpen = false)}
                  >Settings saved.</Alert
                >
              {/if}

              <Card>
                <CardHeader title="Profile" subheader="Sample profile form" />
                <CardContent>
                  <form
                    class="form"
                    novalidate
                    onsubmit={(e) => {
                      e.preventDefault();
                      save();
                    }}
                  >
                    <TextField
                      label="Display name"
                      value={displayName}
                      onChange={(e) => (displayName = (e.currentTarget as HTMLInputElement).value)}
                      required
                      fullWidth
                    />
                    <TextField
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(e) => (email = (e.currentTarget as HTMLInputElement).value)}
                      required
                      fullWidth
                      error={emailInvalid}
                      helperText={emailInvalid
                        ? "Enter a valid email address"
                        : "Sample helper text"}
                      onblur={() => (emailTouched = true)}
                    />
                    <TextField
                      label="Default shelf"
                      select
                      value={defaultFormat}
                      onChange={(e) =>
                        (defaultFormat = (e.currentTarget as HTMLSelectElement).value)}
                      fullWidth
                    >
                      <option value="main">Main shelf</option>
                      <option value="trade">Trade shelf</option>
                      <option value="wishlist">Wishlist</option>
                      <option value="archive">Archive</option>
                    </TextField>
                    <TextField
                      label="Bio"
                      multiline
                      rows={3}
                      value={bio}
                      onChange={(e) => (bio = (e.currentTarget as HTMLTextAreaElement).value)}
                      fullWidth
                      variant="filled"
                    />

                    <fieldset class="fieldset">
                      <legend>Shelf density</legend>
                      <RadioGroup
                        value={density}
                        onChange={(_e, next) => (density = String(next))}
                        row
                        aria-label="Shelf density"
                      >
                        <FormControlLabel label="Comfortable">
                          {#snippet control()}<Radio value="comfortable" />{/snippet}
                        </FormControlLabel>
                        <FormControlLabel label="Compact">
                          {#snippet control()}<Radio value="compact" />{/snippet}
                        </FormControlLabel>
                      </RadioGroup>
                    </fieldset>

                    <fieldset class="fieldset">
                      <legend>Notifications</legend>
                      <FormControlLabel label="All notifications">
                        {#snippet control()}
                          <Checkbox
                            checked={allNotify}
                            indeterminate={someNotify}
                            onChange={(_e, checked) => setAllNotify(checked)}
                          />
                        {/snippet}
                      </FormControlLabel>
                      <div class="indent">
                        <FormControlLabel label="Updates">
                          {#snippet control()}<Checkbox
                              checked={notify.price}
                              onChange={(_e, next) => (notify.price = next)}
                            />{/snippet}
                        </FormControlLabel>
                        <FormControlLabel label="Reminders">
                          {#snippet control()}<Checkbox
                              checked={notify.trade}
                              onChange={(_e, next) => (notify.trade = next)}
                            />{/snippet}
                        </FormControlLabel>
                        <FormControlLabel label="Announcements">
                          {#snippet control()}<Checkbox
                              checked={notify.news}
                              onChange={(_e, next) => (notify.news = next)}
                            />{/snippet}
                        </FormControlLabel>
                      </div>
                    </fieldset>

                    <Divider />

                    <div class="switches">
                      <FormControlLabel label="Weekly email digest">
                        {#snippet control()}<Switch
                            checked={digest}
                            onChange={(_e, next) => (digest = next)}
                          />{/snippet}
                      </FormControlLabel>
                      <FormControlLabel label="Profile visible to others">
                        {#snippet control()}<Switch
                            checked={publicProfile}
                            onChange={(_e, next) => (publicProfile = next)}
                            color="secondary"
                          />{/snippet}
                      </FormControlLabel>
                      <FormControlLabel label="Preview features">
                        {#snippet control()}<Switch
                            checked={betaFeatures}
                            onChange={(_e, next) => (betaFeatures = next)}
                            color="success"
                          />{/snippet}
                      </FormControlLabel>
                      <FormControlLabel label="Disabled option" disabled>
                        {#snippet control()}<Switch checked={false} disabled />{/snippet}
                      </FormControlLabel>
                    </div>

                    <div>
                      <Typography variant="subtitle2" as="p" id="threshold-label">
                        Alert threshold: ${threshold}
                      </Typography>
                      <Slider
                        value={threshold}
                        onChange={(_e, next) => (threshold = next)}
                        min={5}
                        max={100}
                        step={5}
                        valueLabelDisplay="auto"
                        aria-label="Alert threshold in dollars"
                      />
                    </div>

                    <div>
                      <Typography variant="subtitle2" as="p">Collection view</Typography>
                      <ButtonGroup
                        variant="outlined"
                        class="view-group"
                        aria-label="Collection view"
                      >
                        <Button aria-pressed={view === "grid"} onclick={() => (view = "grid")}
                          >Grid</Button
                        >
                        <Button aria-pressed={view === "list"} onclick={() => (view = "list")}
                          >List</Button
                        >
                        <Button aria-pressed={view === "compact"} onclick={() => (view = "compact")}
                          >Compact</Button
                        >
                      </ButtonGroup>
                      <Typography variant="caption" as="p" color="text.secondary"
                        >Selected: {view}</Typography
                      >
                    </div>

                    <div class="actions">
                      <Button type="submit" loading={saving}>
                        {#snippet startIcon()}<Save size={18} />{/snippet}
                        Save changes
                      </Button>
                      <Button
                        variant="text"
                        color="default"
                        type="reset"
                        onclick={() => (emailTouched = false)}>Reset</Button
                      >
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardHeader title="Danger zone" subheader="Demo only: nothing is deleted" />
                <CardActions>
                  <Button variant="outlined" color="error" onclick={() => (confirmOpen = true)}>
                    {#snippet startIcon()}<Trash size={18} />{/snippet}
                    Reset sample data
                  </Button>
                </CardActions>
              </Card>
            </div>
          </TabPanel>
        {/snippet}
      </Tabs>
    </main>
  </div>
</div>

<Snackbar
  open={snackOpen}
  onClose={() => (snackOpen = false)}
  autoHideDuration={4000}
  message="Settings saved"
/>

<Dialog open={confirmOpen} onClose={() => (confirmOpen = false)} title="Reset sample data?">
  <p>Demo only. Nothing is stored or deleted; the buttons just close this dialog.</p>
  {#snippet actions()}
    <Button variant="text" color="default" onclick={() => (confirmOpen = false)}>Cancel</Button>
    <Button color="error" onclick={() => (confirmOpen = false)}>Reset</Button>
  {/snippet}
</Dialog>
