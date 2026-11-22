import { createMemo, createSignal, createStore, For, onCleanup, onSettled, Show } from "solid-js";
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
} from "@claymo/solid";
import type { TabValue } from "@claymo/core";
import { THEME_CHANGE_EVENT, readTheme, setTheme } from "../lib/theme";
import { formats, rows, type Shelf } from "./collection-data";
import { DemoIcon } from "./DemoIcon";

const sections = [
  { id: "dashboard", label: "Dashboard", info: "Formats, uploads, progress" },
  { id: "settings", label: "Settings", info: "Profile and preferences" },
] as const;
const notifications = ["Updates", "Reminders", "Announcements"] as const;
const initialProfile = {
  name: "Avery Quinn",
  email: "avery@example.com",
  shelf: "main",
  bio: "Sample bio text.",
  density: "comfortable",
  digest: true,
  publicProfile: false,
  betaFeatures: false,
  threshold: 25,
  view: "grid",
};
const validEmail = /^\S+@\S+\.\S+$/;

export default function AppDemo() {
  const [tab, setTab] = createSignal<TabValue>("dashboard");
  const [drawerOpen, setDrawerOpen] = createSignal(false);
  const systemMode = matchMedia("(prefers-color-scheme: dark)");
  function darkMode() {
    const { mode } = readTheme();
    return mode === "system" ? systemMode.matches : mode === "dark";
  }
  const [dark, setDark] = createSignal(darkMode());
  onSettled(() => {
    const sync = () => setDark(darkMode());
    sync();
    systemMode.addEventListener("change", sync);
    window.addEventListener(THEME_CHANGE_EVENT, sync);
    return () => {
      systemMode.removeEventListener("change", sync);
      window.removeEventListener(THEME_CHANGE_EVENT, sync);
    };
  });

  const [activeFormats, setActiveFormats] = createSignal<Shelf[]>(["Favorites"]);
  const [removedFormats, setRemovedFormats] = createSignal<Shelf[]>([]);
  const visibleRows = createMemo(() => {
    const active = activeFormats();
    return active.length ? rows.filter((row) => active.includes(row.shelf)) : rows;
  });
  function toggleFormat(format: Shelf) {
    setActiveFormats((active) =>
      active.includes(format) ? active.filter((item) => item !== format) : [...active, format],
    );
  }
  function removeFormat(format: Shelf) {
    setActiveFormats((active) => active.filter((item) => item !== format));
    setRemovedFormats((removed) => [...removed, format]);
  }

  const [profile, setProfile] = createStore(initialProfile);
  function update<K extends keyof typeof initialProfile>(
    key: K,
    value: (typeof initialProfile)[K],
  ) {
    setProfile((draft) => {
      draft[key] = value;
    });
  }
  const [emailTouched, setEmailTouched] = createSignal(false);
  const emailInvalid = createMemo(() => emailTouched() && !validEmail.test(profile.email));
  const [notify, setNotify] = createStore([true, false, false]);
  const notifyCount = createMemo(() => notify.filter(Boolean).length);
  const someNotifications = createMemo(() => notifyCount() > 0 && notifyCount() < 3);
  const [saving, setSaving] = createSignal(false);
  const [snackOpen, setSnackOpen] = createSignal(false);
  const [confirmOpen, setConfirmOpen] = createSignal(false);
  let saveTimer: number | undefined;
  onCleanup(() => window.clearTimeout(saveTimer));

  function save(event: SubmitEvent) {
    event.preventDefault();
    setEmailTouched(true);
    if (saving() || !validEmail.test(profile.email) || !profile.name.trim()) return;
    setSaving(true);
    saveTimer = window.setTimeout(() => {
      setSaving(false);
      setSnackOpen(true);
    }, 1200);
  }

  function resetProfile(event: Event) {
    event.preventDefault();
    setProfile(() => initialProfile);
    setNotify(() => [true, false, false]);
    setEmailTouched(false);
  }

  const Nav = () => (
    <List>
      <For each={sections}>
        {(section) => (
          <ListItem disablePadding>
            <ListItemButton
              selected={tab() === section.id}
              onClick={() => {
                setTab(section.id);
                setDrawerOpen(false);
              }}
            >
              <ListItemIcon>
                <DemoIcon name={section.id} />
              </ListItemIcon>
              <ListItemText primary={section.label} secondary={section.info} />
            </ListItemButton>
          </ListItem>
        )}
      </For>
    </List>
  );

  return (
    <div class="collection-demo">
      <AppBar>
        <span class="menu-btn">
          <IconButton aria-label="Open navigation" onClick={() => setDrawerOpen(true)}>
            <DemoIcon name="menu" />
          </IconButton>
        </span>
        <Typography variant="h6" as="h1" noWrap>
          Collection demo
        </Typography>
        <span class="spacer" />
        <label class="bar-switch">
          <span>Dark</span>
          <Switch
            size="small"
            checked={dark()}
            onChange={(_event, checked) => setTheme({ mode: checked ? "dark" : "light" })}
          />
        </label>
        <Tooltip title="3 new alerts" placement="bottom">
          <IconButton aria-label="Notifications, 3 new">
            <Badge badgeContent={3} color="error">
              <DemoIcon name="bell" />
            </Badge>
          </IconButton>
        </Tooltip>
        <Avatar size="small" alt="Avery Quinn">
          AQ
        </Avatar>
      </AppBar>
      <div class="body">
        <div class="perm">
          <Drawer variant="permanent" aria-label="Main navigation">
            <Nav />
          </Drawer>
        </div>
        <Drawer
          variant="temporary"
          aria-label="Main navigation"
          open={drawerOpen()}
          onClose={() => setDrawerOpen(false)}
        >
          <Nav />
        </Drawer>
        <main class="main">
          <Typography variant="overline" as="p" color="text.secondary">
            Prototype · sample data · no backend
          </Typography>
          <Tabs
            value={tab()}
            onChange={(_event, value) => setTab(value)}
            aria-label="App sections"
            panels={
              <>
                <TabPanel value="dashboard">
                  <div class="stack">
                    <Alert severity="info">
                      All numbers are sample content to show components in a realistic layout.
                    </Alert>
                    <div class="stats">
                      <Card>
                        <CardHeader title="Items owned" subheader="Across all shelves" />
                        <CardContent>
                          <Typography variant="h3" as="p">
                            1,284
                          </Typography>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader title="Total value" subheader="Sample figure" />
                        <CardContent>
                          <Typography variant="h3" as="p">
                            $3,940
                          </Typography>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader title="Progress" subheader="Sample metric" />
                        <CardContent>
                          <Typography variant="h3" as="p">
                            64%
                          </Typography>
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
                            <Typography variant="h4" as="p">
                              82%
                            </Typography>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    <Card>
                      <CardHeader title="Recently added" subheader="Filter by shelf" />
                      <CardContent>
                        <div class="chips" role="group" aria-label="Shelf filters">
                          <For
                            each={formats.filter((format) => !removedFormats().includes(format))}
                          >
                            {(format) => (
                              <Chip
                                label={format}
                                color={activeFormats().includes(format) ? "primary" : "default"}
                                variant={activeFormats().includes(format) ? "filled" : "outlined"}
                                aria-pressed={activeFormats().includes(format) ? "true" : "false"}
                                onClick={() => toggleFormat(format)}
                                onDelete={() => removeFormat(format)}
                              />
                            )}
                          </For>
                          <Show when={removedFormats().length > 0}>
                            <Button
                              size="small"
                              variant="text"
                              startIcon={<DemoIcon name="plus" size={16} />}
                              onClick={() => setRemovedFormats([])}
                            >
                              Restore filters
                            </Button>
                          </Show>
                        </div>
                        <Table label="Recently added items (sample data)">
                          <thead>
                            <tr>
                              <th>Item</th>
                              <th>Code</th>
                              <th>Qty</th>
                              <th>Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            <For each={visibleRows()}>
                              {(row) => (
                                <tr>
                                  <td>{row.name}</td>
                                  <td>{row.set}</td>
                                  <td>{row.qty}</td>
                                  <td>{row.price}</td>
                                </tr>
                              )}
                            </For>
                          </tbody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                </TabPanel>
                <TabPanel value="settings">
                  <div class="stack">
                    <Show when={snackOpen()}>
                      <Alert
                        severity="success"
                        variant="outlined"
                        onClose={() => setSnackOpen(false)}
                      >
                        Settings saved.
                      </Alert>
                    </Show>
                    <Card>
                      <CardHeader title="Profile" subheader="Sample profile form" />
                      <CardContent>
                        <form class="form" novalidate onSubmit={save} onReset={resetProfile}>
                          <TextField
                            label="Display name"
                            value={profile.name}
                            onChange={(event) => update("name", event.currentTarget.value)}
                            required
                            fullWidth
                          />
                          <TextField
                            label="Email"
                            type="email"
                            value={profile.email}
                            onChange={(event) => update("email", event.currentTarget.value)}
                            required
                            fullWidth
                            error={emailInvalid()}
                            helperText={
                              emailInvalid() ? "Enter a valid email address" : "Sample helper text"
                            }
                            onBlur={() => setEmailTouched(true)}
                          />
                          <TextField
                            label="Default shelf"
                            select
                            value={profile.shelf}
                            onChange={(event) => update("shelf", event.currentTarget.value)}
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
                            value={profile.bio}
                            onChange={(event) => update("bio", event.currentTarget.value)}
                            fullWidth
                            variant="filled"
                          />
                          <fieldset class="fieldset">
                            <legend>Shelf density</legend>
                            <RadioGroup
                              value={profile.density}
                              onChange={(_event, value) => update("density", String(value))}
                              row
                              aria-label="Shelf density"
                            >
                              <FormControlLabel
                                label="Comfortable"
                                control={<Radio value="comfortable" />}
                              />
                              <FormControlLabel
                                label="Compact"
                                control={<Radio value="compact" />}
                              />
                            </RadioGroup>
                          </fieldset>
                          <fieldset class="fieldset">
                            <legend>Notifications</legend>
                            <FormControlLabel
                              label="All notifications"
                              control={
                                <Checkbox
                                  checked={notifyCount() === 3}
                                  indeterminate={someNotifications()}
                                  onChange={(_event, checked) =>
                                    setNotify((draft) => {
                                      draft.fill(checked);
                                    })
                                  }
                                />
                              }
                            />
                            <div class="indent">
                              <For each={notifications}>
                                {(label, index) => (
                                  <FormControlLabel
                                    label={label}
                                    control={
                                      <Checkbox
                                        checked={notify[index()]}
                                        onChange={(_event, checked) =>
                                          setNotify((draft) => {
                                            draft[index()] = checked;
                                          })
                                        }
                                      />
                                    }
                                  />
                                )}
                              </For>
                            </div>
                          </fieldset>
                          <Divider />
                          <div class="switches">
                            <FormControlLabel
                              label="Weekly email digest"
                              control={
                                <Switch
                                  checked={profile.digest}
                                  onChange={(_event, value) => update("digest", value)}
                                />
                              }
                            />
                            <FormControlLabel
                              label="Profile visible to others"
                              control={
                                <Switch
                                  checked={profile.publicProfile}
                                  color="secondary"
                                  onChange={(_event, value) => update("publicProfile", value)}
                                />
                              }
                            />
                            <FormControlLabel
                              label="Preview features"
                              control={
                                <Switch
                                  checked={profile.betaFeatures}
                                  color="success"
                                  onChange={(_event, value) => update("betaFeatures", value)}
                                />
                              }
                            />
                            <FormControlLabel
                              label="Disabled option"
                              disabled
                              control={<Switch />}
                            />
                          </div>
                          <div>
                            <Typography variant="subtitle2" as="p">
                              Alert threshold: ${profile.threshold}
                            </Typography>
                            <Slider
                              value={profile.threshold}
                              onChange={(_event, value) => update("threshold", value)}
                              min={5}
                              max={100}
                              step={5}
                              valueLabelDisplay="auto"
                              aria-label="Alert threshold in dollars"
                            />
                          </div>
                          <div>
                            <Typography variant="subtitle2" as="p">
                              Collection view
                            </Typography>
                            <ButtonGroup
                              variant="outlined"
                              class="view-group"
                              aria-label="Collection view"
                            >
                              <Button
                                aria-pressed={profile.view === "grid" ? "true" : "false"}
                                onClick={() => update("view", "grid")}
                              >
                                Grid
                              </Button>
                              <Button
                                aria-pressed={profile.view === "list" ? "true" : "false"}
                                onClick={() => update("view", "list")}
                              >
                                List
                              </Button>
                              <Button
                                aria-pressed={profile.view === "compact" ? "true" : "false"}
                                onClick={() => update("view", "compact")}
                              >
                                Compact
                              </Button>
                            </ButtonGroup>
                            <Typography variant="caption" as="p" color="text.secondary">
                              Selected: {profile.view}
                            </Typography>
                          </div>
                          <div class="actions">
                            <Button
                              type="submit"
                              loading={saving()}
                              startIcon={<DemoIcon name="save" size={18} />}
                            >
                              Save changes
                            </Button>
                            <Button variant="text" color="default" type="reset">
                              Reset
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                    <Card variant="outlined">
                      <CardHeader title="Danger zone" subheader="Demo only: nothing is deleted" />
                      <CardActions>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<DemoIcon name="trash" size={18} />}
                          onClick={() => setConfirmOpen(true)}
                        >
                          Reset sample data
                        </Button>
                      </CardActions>
                    </Card>
                  </div>
                </TabPanel>
              </>
            }
          >
            <For each={sections}>
              {(section) => (
                <Tab
                  value={section.id}
                  label={section.label}
                  icon={<DemoIcon name={section.id} size={18} />}
                />
              )}
            </For>
          </Tabs>
        </main>
      </div>
      <Snackbar
        open={snackOpen()}
        autoHideDuration={4000}
        message="Settings saved"
        onClose={() => setSnackOpen(false)}
      />
      <Dialog
        open={confirmOpen()}
        title="Reset sample data?"
        onClose={() => setConfirmOpen(false)}
        actions={
          <>
            <Button variant="text" color="default" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button color="error" onClick={() => setConfirmOpen(false)}>
              Reset
            </Button>
          </>
        }
      >
        <p>Demo only. Nothing is stored or deleted; the buttons just close this dialog.</p>
      </Dialog>
    </div>
  );
}
