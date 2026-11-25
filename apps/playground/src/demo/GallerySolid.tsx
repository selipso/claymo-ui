import { createSignal, For, onCleanup, Show } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { Color, Severity, Size, TabValue } from "@claymo/core";
import type { DataTablePaginationModel } from "@claymo/core/display";
import type { TypographyVariant } from "@claymo/core/surfaces";
import {
  Accordion,
  Alert,
  Autocomplete,
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
  DataTable,
  Dialog,
  Divider,
  FormControlLabel,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Radio,
  RadioGroup,
  Skeleton,
  Slider,
  Snackbar,
  Switch,
  Tab,
  TabPanel,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@claymo/solid";
import { formats, rows } from "./collection-data";
import { DemoIcon } from "./DemoIcon";

export interface MotionChoice {
  value: string;
  label: string;
  description: string;
  recommended: boolean;
}

const colors = [
  "primary",
  "secondary",
  "success",
  "error",
  "warning",
  "info",
  "default",
] satisfies Color[];
const accents = colors.slice(0, 6);
const sizes = ["small", "medium", "large"] satisfies Size[];
const severities = ["success", "info", "warning", "error"] satisfies Severity[];
const variants = ["contained", "outlined", "text"] as const;
const elevations = [0, 1, 2, 3] as const;
const typeSamples = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "subtitle1",
  "subtitle2",
  "body1",
  "body2",
  "caption",
  "overline",
] satisfies TypographyVariant[];
const columns = [
  { field: "name", headerName: "Item" },
  { field: "shelf", headerName: "Shelf" },
  { field: "qty", headerName: "Qty", type: "number" },
] as const;

function GallerySection(props: {
  id: string;
  title: string;
  details: string;
  children: JSX.Element;
}) {
  return (
    <Card as="section" aria-labelledby={props.id}>
      <CardHeader title={props.title} subheader={props.details} />
      <CardContent>
        <h2 id={props.id} class="clay-sr-only">
          {props.title}
        </h2>
        {props.children}
      </CardContent>
    </Card>
  );
}

export default function Gallery(props: { motionPresets: readonly MotionChoice[] }) {
  const [field, setField] = createSignal("");
  const [radio, setRadio] = createSignal("b");
  const [slider, setSlider] = createSignal(40);
  const [pagination, setPagination] = createSignal<DataTablePaginationModel>({
    page: 0,
    pageSize: 3,
  });
  const [slider2, setSlider2] = createSignal(60);
  const [tab, setTab] = createSignal<TabValue>("one");
  const [snack, setSnack] = createSignal(false);
  const [dialog, setDialog] = createSignal(false);
  const [loading, setLoading] = createSignal(false);
  const [expanded, setExpanded] = createSignal(false);
  const [deletable, setDeletable] = createSignal(true);
  const [clicked, setClicked] = createSignal(false);
  const [dismissed, setDismissed] = createSignal<Severity[]>([]);
  let loadTimer: number | undefined;
  onCleanup(() => window.clearTimeout(loadTimer));

  function load() {
    setLoading(true);
    loadTimer = window.setTimeout(() => setLoading(false), 1500);
  }

  return (
    <main class="component-gallery">
      <header class="clay masthead">
        <div class="intro">
          <Typography variant="overline" color="primary">
            Claymo UI / Solid 2
          </Typography>
          <h1>Component gallery</h1>
          <Typography color="text.secondary">
            Explore variants and states. Hover to lift, press to sink, or Tab to see keyboard focus.
            Switch palette, mode and motion in the sidebar.
          </Typography>
        </div>
        <div class="samples" aria-hidden="true">
          <For each={accents}>
            {(color) => <span class="clay" data-color={color} title={color} />}
          </For>
        </div>
      </header>
      <div class="sections">
        <GallerySection
          id="g-motion"
          title="Motion presets"
          details="Hover and press each row. The sidebar's Motion setting applies one preset to the whole site."
        >
          <For each={props.motionPresets}>
            {(preset) => (
              <div class="motion-row" data-motion={preset.value}>
                <div class="motion-label">
                  <strong>{preset.label}</strong>
                  <Show when={!preset.recommended}>
                    <span class="motion-tag">Expressive</span>
                  </Show>
                  <span>{preset.description}</span>
                </div>
                <div class="wrap">
                  <Button>Save</Button>
                  <Button variant="outlined">Cancel</Button>
                  <IconButton aria-label={`Favorite, ${preset.label}`}>
                    <DemoIcon name="heart" />
                  </IconButton>
                  <Checkbox aria-label={`Checkbox, ${preset.label}`} defaultChecked />
                  <Switch aria-label={`Switch, ${preset.label}`} />
                </div>
              </div>
            )}
          </For>
        </GallerySection>

        <GallerySection
          id="g-button"
          title="Button"
          details="Variant × color × size, loading, icons, fullWidth, href, inflated, disableElevation"
        >
          <For each={variants}>
            {(variant) => (
              <>
                <p class="label">Variant: {variant}</p>
                <div class="wrap">
                  <For each={colors}>
                    {(color) => (
                      <Button variant={variant} color={color}>
                        {color}
                      </Button>
                    )}
                  </For>
                </div>
              </>
            )}
          </For>
          <p class="label">Size</p>
          <div class="wrap">
            <For each={sizes}>{(size) => <Button size={size}>{size}</Button>}</For>
          </div>
          <p class="label">States and extras</p>
          <div class="wrap">
            <Button disabled>Disabled</Button>
            <Button variant="outlined" disabled>
              Disabled outlined
            </Button>
            <Button loading={loading()} onClick={load}>
              Click: loading
            </Button>
            <Button loading loadingPosition="start" variant="outlined">
              Loading at start
            </Button>
            <Button startIcon={<DemoIcon name="download" size={18} />}>Start icon</Button>
            <Button color="secondary" endIcon={<DemoIcon name="send" size={18} />}>
              End icon
            </Button>
            <Button href="/lab/" variant="outlined">
              CSS lab link
            </Button>
            <Button disableElevation>Disable elevation</Button>
            <Button inflated>Inflated</Button>
            <Button inflated color="secondary" size="large">
              Inflated large
            </Button>
          </div>
          <div class="wrap">
            <Button fullWidth>Full width</Button>
          </div>
        </GallerySection>

        <GallerySection
          id="g-iconbutton"
          title="IconButton and ButtonGroup"
          details="Icon buttons need an accessible label; groups share variant, color, and size."
        >
          <div class="wrap">
            <IconButton aria-label="Small favorite button" size="small">
              <DemoIcon name="heart" size={18} />
            </IconButton>
            <IconButton aria-label="Favorite">
              <DemoIcon name="heart" />
            </IconButton>
            <IconButton aria-label="Star" size="large" color="primary">
              <DemoIcon name="star" />
            </IconButton>
            <IconButton aria-label="Search" color="secondary" inflated>
              <DemoIcon name="search" />
            </IconButton>
            <IconButton aria-label="Add" disabled>
              <DemoIcon name="plus" />
            </IconButton>
          </div>
          <div class="wrap">
            <ButtonGroup aria-label="Contained group">
              <Button>One</Button>
              <Button>Two</Button>
              <Button>Three</Button>
            </ButtonGroup>
            <ButtonGroup variant="outlined" color="secondary" aria-label="Outlined group">
              <Button>One</Button>
              <Button>Two</Button>
              <Button>Three</Button>
            </ButtonGroup>
            <ButtonGroup orientation="vertical" variant="outlined" aria-label="Vertical group">
              <Button>Top</Button>
              <Button>Middle</Button>
              <Button>Bottom</Button>
            </ButtonGroup>
          </div>
        </GallerySection>

        <GallerySection
          id="g-text"
          title="TextField and Autocomplete"
          details="Outlined and filled fields, validation, selects, multiline, adornments, and searchable choices"
        >
          <div class="grid">
            <TextField
              label="Outlined"
              placeholder="Type here"
              value={field()}
              onChange={(event) => setField(event.currentTarget.value)}
              helperText="Helper text"
            />
            <TextField label="Filled" variant="filled" helperText="Filled variant" />
            <TextField label="Required" required helperText="Required marks the label" />
            <TextField
              label="Error"
              error
              defaultValue="not-an-email"
              helperText="Enter a valid email"
            />
            <TextField label="Disabled" disabled defaultValue="Disabled value" />
            <TextField label="Small" size="small" />
            <TextField label="Select" select defaultValue="b">
              <option value="a">Alpha</option>
              <option value="b">Beta</option>
              <option value="c">Gamma</option>
            </TextField>
            <TextField label="Multiline" multiline rows={3} />
            <TextField
              label="Adornments"
              placeholder="Search"
              startAdornment={<DemoIcon name="search" size={18} />}
            />
            <Autocomplete
              label="Shelves"
              options={formats}
              multiple
              filterSelectedOptions
              placeholder="Choose shelves"
            />
          </div>
          <p class="label">Typed value: {field() || "(empty)"}</p>
        </GallerySection>

        <GallerySection
          id="g-select"
          title="Checkbox, Radio, Switch, Slider"
          details="Checked, mixed, disabled, color, size, marks, and value labels"
        >
          <div class="grid">
            <div class="col">
              <p class="label">Checkbox</p>
              <FormControlLabel label="Checked" control={<Checkbox defaultChecked />} />
              <FormControlLabel label="Unchecked" control={<Checkbox color="secondary" />} />
              <FormControlLabel label="Indeterminate" control={<Checkbox indeterminate />} />
              <FormControlLabel
                label="Small checkbox"
                control={<Checkbox size="small" defaultChecked />}
              />
              <FormControlLabel label="Disabled checkbox" disabled control={<Checkbox />} />
            </div>
            <div>
              <p class="label">Radio ({radio()})</p>
              <RadioGroup
                value={radio()}
                onChange={(_event, value) => setRadio(String(value))}
                aria-label="Radio demo"
              >
                <FormControlLabel label="Alpha" control={<Radio value="a" />} />
                <FormControlLabel label="Beta" control={<Radio value="b" color="success" />} />
                <FormControlLabel label="Gamma (disabled)" disabled control={<Radio value="c" />} />
              </RadioGroup>
            </div>
            <div class="col">
              <p class="label">Switch</p>
              <FormControlLabel label="On" control={<Switch defaultChecked />} />
              <FormControlLabel label="Off" control={<Switch color="secondary" />} />
              <FormControlLabel
                label="Small switch"
                control={<Switch size="small" defaultChecked color="success" />}
              />
              <FormControlLabel label="Disabled switch" disabled control={<Switch />} />
            </div>
            <div>
              <p class="label">Slider ({slider()})</p>
              <Slider
                value={slider()}
                onChange={(_event, value) => setSlider(value)}
                valueLabelDisplay="auto"
                aria-label="Slider with auto label"
              />
              <p class="label">Marks + on ({slider2()})</p>
              <Slider
                value={slider2()}
                onChange={(_event, value) => setSlider2(value)}
                min={0}
                max={100}
                step={10}
                marks
                valueLabelDisplay="on"
                color="secondary"
                aria-label="Slider with marks"
              />
              <p class="label">Disabled</p>
              <Slider value={30} disabled aria-label="Disabled slider" />
            </div>
          </div>
        </GallerySection>

        <GallerySection
          id="g-data"
          title="Chip, Badge, Avatar, Tooltip"
          details="Variants, colors, deletion, badgeContent, max, and dot"
        >
          <div class="wrap">
            <Chip label="Default" />
            <Chip label="Outlined" variant="outlined" />
            <For each={accents}>{(color) => <Chip label={color} color={color} />}</For>
            <Show
              when={deletable()}
              fallback={
                <Button variant="text" size="small" onClick={() => setDeletable(true)}>
                  Restore chip
                </Button>
              }
            >
              <Chip label="Deletable" onDelete={() => setDeletable(false)} />
            </Show>
            <Chip
              label="Clickable"
              color={clicked() ? "secondary" : "default"}
              aria-pressed={clicked() ? "true" : "false"}
              onClick={() => setClicked((value) => !value)}
            />
            <Chip label="Small" size="small" color="primary" />
            <Chip label="Disabled" disabled />
          </div>
          <div class="wrap">
            <Badge badgeContent={4}>
              <Chip label="Inbox" />
            </Badge>
            <Badge badgeContent={1200} max={99} color="error">
              <Chip label="Max 99" />
            </Badge>
            <Badge variant="dot" color="success">
              <Chip label="Dot" />
            </Badge>
            <Badge badgeContent={0} showZero color="secondary">
              <Chip label="Show zero" />
            </Badge>
            <Avatar alt="Ada">AB</Avatar>
            <Avatar variant="rounded" size="large" alt="Rounded">
              RD
            </Avatar>
            <Avatar size="small" alt="Small">
              S
            </Avatar>
            <Tooltip title="Tooltip on hover or focus" placement="top">
              <Button variant="outlined" size="small">
                Tooltip
              </Button>
            </Tooltip>
          </div>
        </GallerySection>

        <GallerySection
          id="g-feedback"
          title="Alert, Snackbar, Progress, Skeleton"
          details="Severity × variant, dismissal, determinate and indeterminate progress"
        >
          <div class="stack">
            <For each={severities}>
              {(severity) => <Alert severity={severity}>{severity} / standard</Alert>}
            </For>
            <For each={severities.filter((severity) => !dismissed().includes(severity))}>
              {(severity) => (
                <Alert
                  severity={severity}
                  variant="filled"
                  onClose={() => setDismissed((previous) => [...previous, severity])}
                >
                  {severity} / filled with close button
                </Alert>
              )}
            </For>
            <For each={severities}>
              {(severity) => (
                <Alert severity={severity} variant="outlined">
                  {severity} / outlined
                </Alert>
              )}
            </For>
          </div>
          <div class="wrap">
            <Button variant="outlined" onClick={() => setSnack(true)}>
              Open Snackbar
            </Button>
            <Show when={dismissed().length > 0}>
              <Button variant="text" onClick={() => setDismissed([])}>
                Restore alerts
              </Button>
            </Show>
          </div>
          <p class="label">LinearProgress</p>
          <div class="stack">
            <LinearProgress variant="determinate" value={64} aria-label="Determinate 64 percent" />
            <LinearProgress aria-label="Indeterminate" color="secondary" />
          </div>
          <p class="label">CircularProgress</p>
          <div class="wrap">
            <CircularProgress
              variant="determinate"
              value={72}
              aria-label="Determinate 72 percent"
            />
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
        </GallerySection>

        <GallerySection
          id="g-nav"
          title="Tabs, Accordion, List, Divider, Paper"
          details="Try arrow keys, Home and End on the tabs. Panels are passed as JSX."
        >
          <Tabs
            value={tab()}
            onChange={(_event, value) => setTab(value)}
            aria-label="Gallery tabs"
            panels={
              <>
                <TabPanel value="one">
                  <p>Panel one</p>
                </TabPanel>
                <TabPanel value="two">
                  <p>Panel two</p>
                </TabPanel>
                <TabPanel value="four">
                  <p>Panel four</p>
                </TabPanel>
              </>
            }
          >
            <Tab value="one" label="One" />
            <Tab value="two" label="Two" />
            <Tab value="three" label="Disabled" disabled />
            <Tab value="four" label="Four" />
          </Tabs>
          <Divider />
          <Accordion
            expanded={expanded()}
            onChange={(_event, value) => setExpanded(value)}
            summary={<>Accordion summary ({expanded() ? "open" : "closed"})</>}
          >
            <p>Native details and summary underneath.</p>
          </Accordion>
          <Divider />
          <List>
            <ListItem disablePadding>
              <ListItemButton selected>
                <ListItemIcon>
                  <DemoIcon name="star" />
                </ListItemIcon>
                <ListItemText primary="Selected" secondary="Secondary text" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <DemoIcon name="heart" />
                </ListItemIcon>
                <ListItemText primary="Default item" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton disabled>
                <ListItemIcon>
                  <DemoIcon name="plus" />
                </ListItemIcon>
                <ListItemText primary="Disabled item" />
              </ListItemButton>
            </ListItem>
          </List>
          <div class="wrap">
            <For each={elevations}>
              {(elevation) => (
                <Paper elevation={elevation} class="swatch">
                  Elevation {elevation}
                </Paper>
              )}
            </For>
            <Paper variant="outlined" class="swatch">
              Outlined
            </Paper>
            <Paper inflated class="swatch">
              Inflated
            </Paper>
          </div>
        </GallerySection>

        <GallerySection
          id="g-table"
          title="DataTable"
          details="Quick filter, sortable columns, row selection, and pagination"
        >
          <DataTable
            rows={rows}
            columns={columns}
            getRowId={(row) => row.set}
            rowHeader="name"
            label="Sample shelf inventory"
            quickFilter
            checkboxSelection
            pagination
            paginationModel={pagination()}
            onPaginationModelChange={setPagination}
            pageSizeOptions={[3, 5]}
          />
        </GallerySection>

        <Card as="section" aria-labelledby="g-type">
          <CardHeader
            title="Typography and overlays"
            subheader="Type variants and a native modal dialog"
          />
          <CardContent>
            <h2 id="g-type" class="clay-sr-only">
              Typography and overlays
            </h2>
            <For each={typeSamples}>
              {(variant) => (
                <Typography variant={variant} as="p">
                  {variant}: The quick brown fox
                </Typography>
              )}
            </For>
          </CardContent>
          <CardActions>
            <Button onClick={() => setDialog(true)}>Open Dialog</Button>
          </CardActions>
        </Card>
      </div>
      <Snackbar
        open={snack()}
        message="Snackbar from the gallery"
        onClose={() => setSnack(false)}
      />
      <Dialog
        open={dialog()}
        title="Dialog title"
        maxWidth="xs"
        onClose={() => setDialog(false)}
        actions={
          <Button variant="text" onClick={() => setDialog(false)}>
            Close
          </Button>
        }
      >
        <p>Native dialog: focus is trapped, Escape closes, and focus returns to the opener.</p>
      </Dialog>
    </main>
  );
}
