import type { JSX } from "@solidjs/web";
import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  onSettled,
  Show,
  untrack,
  useContext,
  type Signal,
} from "solid-js";
import {
  dialogRecipe,
  flag,
  tabIds,
  tabListRecipe,
  tabPanelRecipe,
  tabRecipe,
  type DialogCloseReason,
  type DialogMaxWidth,
  type MotionPreset,
  type Severity,
  type TabIds,
  type TabsVariant,
  type TabValue,
} from "@claymo/core";
import {
  actionIconAttrs,
  alertIcons,
  closeIconPath,
  type AlertVariant,
} from "@claymo/core/actions";
import { attachDialog, setDialogOpen } from "@claymo/core/behavior/dialog";
import { attachSnackbar } from "@claymo/core/behavior/overlays";
import { moveTabFocus } from "@claymo/core/behavior/tabs";
import {
  circularProgress,
  circularProgressDefaults,
  linearProgress,
  progressDefaults,
  skeletonDefaults,
  skeletonDimensions,
  type CircularProgressOptions,
  type LinearProgressOptions,
  type SkeletonOptions,
} from "@claymo/core/display";
import {
  snackbarAnchorOrigin,
  snackbarAutoHideDuration,
  type DrawerOptions,
  type SnackbarAnchorOrigin,
  type SnackbarCloseReason,
} from "@claymo/core/overlays";
import { IconButton } from "./actions.js";
import { callHandler, omit } from "./shared.js";

interface OpenProps {
  /** Reactive visibility. With no dismissal callback, user requests can close locally. */
  open?: boolean;
  /** Initial visibility when `open` is omitted. */
  defaultOpen?: boolean;
}

type DialogClose = (event: Event, reason: DialogCloseReason) => void;

function createOpenState(props: OpenProps): Signal<boolean> {
  const initial = untrack(() => props.defaultOpen) ?? false;
  // Local dismissal lasts until the owner supplies a new value for `open`.
  return createSignal(() => props.open ?? initial);
}

function hasContent(value: JSX.Element): boolean {
  return value != null && typeof value !== "boolean";
}

interface ModalRootProps extends Omit<
  JSX.IntrinsicElements["dialog"],
  "open" | "onCancel" | "onClose"
> {
  state: Signal<boolean>;
  onRequestClose?: DialogClose;
}

function ModalRoot(props: ModalRootProps) {
  const [open, setOpen] = props.state;
  const rest = omit(props, ["state", "onRequestClose", "ref", "children"]);
  let dialog!: HTMLDialogElement;
  const capture = (node: HTMLDialogElement) => {
    dialog = node;
  };

  createEffect(open, (shown) => setDialogOpen(dialog, shown));
  onSettled(() => {
    const detach = attachDialog(dialog, {
      requestClose(event, reason) {
        if (props.onRequestClose) props.onRequestClose(event, reason);
        else if (open()) setOpen(false);
        else setDialogOpen(dialog, false); // A native invoker can open the dialog directly.
      },
      closed(event) {
        if (!open()) return;
        // A native close (including method="dialog") cannot be vetoed; sync it back.
        setOpen(false);
        props.onRequestClose?.(event, "escapeKeyDown");
      },
    });
    return () => {
      detach();
      setDialogOpen(dialog, false);
    };
  });

  return (
    <dialog {...rest} ref={[capture, props.ref]}>
      {props.children}
    </dialog>
  );
}

export interface DialogProps
  extends
    Omit<JSX.IntrinsicElements["dialog"], "open" | "title" | "onCancel" | "onClose">,
    OpenProps {
  /** When supplied, the owner accepts a dismissal request by setting `open` to false. */
  onClose?: DialogClose;
  title?: string;
  fullWidth?: boolean;
  maxWidth?: DialogMaxWidth;
  dismissible?: boolean;
  closeText?: string;
  motion?: MotionPreset;
  actions?: JSX.Element;
}

export function Dialog(props: DialogProps) {
  const state = createOpenState(props);
  const rest = omit(props, [
    "open",
    "defaultOpen",
    "onClose",
    "title",
    "fullWidth",
    "maxWidth",
    "dismissible",
    "closeText",
    "motion",
    "actions",
    "class",
    "children",
  ]);
  const idBase = `clay-dialog-${createUniqueId()}`;
  const recipe = createMemo(() =>
    dialogRecipe({
      idBase,
      hasTitle: !!props.title,
      fullWidth: props.fullWidth,
      maxWidth: props.maxWidth,
      dismissible: props.dismissible,
    }),
  );
  const actions = createMemo(() => props.actions);

  return (
    <ModalRoot
      {...recipe().attrs}
      {...rest}
      state={state}
      onRequestClose={props.onClose}
      class={[recipe().className, props.class]}
      data-motion={props.motion}
    >
      <div class="clay-dialog__panel">
        <Show when={props.dismissible}>
          <IconButton
            size="small"
            class="clay-dialog__close"
            aria-label={props.closeText ?? "Close"}
            data-clay-dialog-close=""
          >
            <svg {...actionIconAttrs} width="18" height="18" stroke-width="2.5">
              <path d={closeIconPath} />
            </svg>
          </IconButton>
        </Show>
        <Show when={props.title}>
          <h2 id={recipe().titleId} class="clay-dialog__title">
            {props.title}
          </h2>
        </Show>
        <div class="clay-dialog__content">{props.children}</div>
        <Show when={hasContent(actions())}>
          <div class="clay-dialog__actions">{actions()}</div>
        </Show>
      </div>
    </ModalRoot>
  );
}

export interface DrawerProps
  extends
    Omit<JSX.IntrinsicElements["aside"], "onCancel" | "onClose">,
    Omit<DrawerOptions, "open">,
    OpenProps {
  "aria-label": string;
  /** Temporary drawers only. The owner accepts a dismissal request by setting `open` to false. */
  onClose?: DialogClose;
  motion?: MotionPreset;
  actions?: JSX.Element;
}

function DrawerPanel(props: Pick<DrawerProps, "children" | "actions">) {
  const actions = createMemo(() => props.actions);
  return (
    <div class="clay-drawer__panel">
      {props.children}
      <Show when={hasContent(actions())}>
        <div class="clay-drawer__actions">{actions()}</div>
      </Show>
    </div>
  );
}

export function Drawer(props: DrawerProps) {
  const state = createOpenState(props);
  const rest = omit(props, [
    "variant",
    "open",
    "defaultOpen",
    "onClose",
    "anchor",
    "width",
    "hideBackdrop",
    "motion",
    "class",
    "children",
    "actions",
    "hidden",
    "style",
    "ref",
  ]);
  const modalRest = omit(rest, ["tabindex"]);
  const variant = () => props.variant ?? "temporary";
  const style = createMemo(() => {
    const native = props.style;
    const width = `${props.width ?? 280}px`;
    return typeof native === "string"
      ? `${native};--clay-drawer-width:${width}`
      : { ...(native || undefined), "--clay-drawer-width": width };
  });

  return (
    <Show
      when={variant() === "temporary"}
      fallback={
        <aside
          {...rest}
          ref={[props.ref]}
          class={["clay clay-drawer", props.class]}
          hidden={variant() === "persistent" && !state[0]() ? true : props.hidden}
          data-variant={variant()}
          data-anchor={props.anchor ?? "left"}
          data-motion={props.motion}
          style={style()}
        >
          <DrawerPanel actions={props.actions}>{props.children}</DrawerPanel>
        </aside>
      }
    >
      <ModalRoot
        {...modalRest}
        ref={[props.ref as JSX.Ref<HTMLDialogElement>]}
        class={["clay clay-drawer", props.class]}
        hidden={props.hidden}
        state={state}
        onRequestClose={props.onClose}
        data-variant="temporary"
        data-anchor={props.anchor ?? "left"}
        data-hide-backdrop={flag(props.hideBackdrop)}
        data-motion={props.motion}
        style={style()}
      >
        <DrawerPanel actions={props.actions}>{props.children}</DrawerPanel>
      </ModalRoot>
    </Show>
  );
}

interface TabsState {
  selected: () => TabValue | undefined;
  enabled: () => readonly TabValue[];
  ids: TabIds;
  select(event: Event, next: TabValue): void;
  register(value: TabValue): () => void;
}

const TabsContext = createContext<TabsState>();

export interface TabsProps extends Omit<JSX.IntrinsicElements["div"], "role" | "onChange"> {
  "aria-label": string;
  /** Controlled selection. Update it in `onChange` to accept user selection. */
  value?: TabValue;
  /** Initial selection when uncontrolled. */
  defaultValue?: TabValue;
  onChange?: (event: Event, value: TabValue) => void;
  variant?: TabsVariant;
  motion?: MotionPreset;
  panels?: JSX.Element;
}

export function Tabs(props: TabsProps) {
  const rest = omit(props, [
    "aria-label",
    "value",
    "defaultValue",
    "onChange",
    "variant",
    "motion",
    "panels",
    "class",
    "children",
  ]);
  const [local, setLocal] = createSignal(untrack(() => props.defaultValue));
  const controlled = "value" in props;
  const [enabled, setEnabled] = createSignal<readonly TabValue[]>([]);
  const ids = tabIds(`clay-tabs-${createUniqueId()}`);
  const list = createMemo(() =>
    tabListRecipe({ variant: props.variant, label: props["aria-label"] }),
  );
  const selected = () => (controlled ? props.value : local());
  const context: TabsState = {
    selected,
    enabled,
    ids,
    select(event, next) {
      if (next === selected()) return;
      if (!controlled) setLocal(next);
      props.onChange?.(event, next);
    },
    register(value) {
      setEnabled((current) => [...current, value]);
      return () => {
        setEnabled((current) => current.filter((item) => item !== value));
      };
    },
  };

  return (
    <TabsContext value={context}>
      <div {...rest} class={["clay-tabs", props.class]} data-motion={props.motion}>
        <div class={list().className} {...list().attrs}>
          {props.children}
        </div>
        {props.panels}
      </div>
    </TabsContext>
  );
}

export interface TabProps extends Omit<
  JSX.IntrinsicElements["button"],
  | "value"
  | "role"
  | "children"
  | "id"
  | "aria-selected"
  | "aria-controls"
  | "tabindex"
  | "prop:tabIndex"
> {
  label: string;
  value: TabValue;
  icon?: JSX.Element;
  disabled?: boolean;
  motion?: MotionPreset;
}

export function Tab(props: TabProps) {
  const rest = omit(props, [
    "value",
    "label",
    "icon",
    "disabled",
    "motion",
    "class",
    "onClick",
    "onKeyDown",
  ]);
  const context = useContext(TabsContext);
  const recipe = createMemo(() => {
    const result = tabRecipe({
      value: props.value,
      selected: context.selected(),
      enabled: context.enabled(),
      ids: context.ids,
    });
    if (props.disabled) result.attrs.tabindex = -1;
    return result;
  });
  const icon = createMemo(() => props.icon);
  createEffect(
    () => (props.disabled ? undefined : props.value),
    (value) => (value === undefined ? undefined : context.register(value)),
  );

  return (
    <button
      {...recipe().attrs}
      {...rest}
      class={[recipe().className, props.class]}
      data-motion={props.motion}
      disabled={props.disabled}
      onClick={(event) => {
        callHandler(props.onClick, event);
        if (!props.disabled && !event.defaultPrevented) context.select(event, props.value);
      }}
      onKeyDown={(event) => {
        callHandler(props.onKeyDown, event);
        if (!props.disabled && !event.defaultPrevented) moveTabFocus(event, event.currentTarget);
      }}
    >
      <Show when={hasContent(icon())}>
        <span class="clay-tab__icon">{icon()}</span>
      </Show>
      <span class="clay-tab__label">{props.label}</span>
    </button>
  );
}

export interface TabPanelProps extends Omit<
  JSX.IntrinsicElements["div"],
  "id" | "role" | "aria-labelledby"
> {
  value: TabValue;
}

export function TabPanel(props: TabPanelProps) {
  const rest = omit(props, ["value", "class", "hidden", "children"]);
  const context = useContext(TabsContext);
  const recipe = createMemo(() =>
    tabPanelRecipe({
      value: props.value,
      selected: context.selected(),
      ids: context.ids,
    }),
  );
  return (
    <div
      {...recipe().attrs}
      {...rest}
      class={[recipe().className, props.class]}
      hidden={recipe().attrs.hidden === true || props.hidden}
    >
      {props.children}
    </div>
  );
}

export interface SnackbarProps
  extends Omit<JSX.IntrinsicElements["div"], "role" | "onClose">, OpenProps {
  message?: string;
  action?: JSX.Element;
  /** Milliseconds before requesting a timeout close; `null` disables the timer. */
  autoHideDuration?: number | null;
  resumeHideDuration?: number;
  disableWindowBlurListener?: boolean;
  /** When supplied, the owner decides whether to accept a dismissal request. */
  onClose?: (event: Event | null, reason: SnackbarCloseReason) => void;
  anchorOrigin?: SnackbarAnchorOrigin;
  motion?: MotionPreset;
}

export function Snackbar(props: SnackbarProps) {
  const [open, setOpen] = createOpenState(props);
  const rest = omit(props, [
    "open",
    "defaultOpen",
    "message",
    "action",
    "autoHideDuration",
    "resumeHideDuration",
    "onClose",
    "disableWindowBlurListener",
    "anchorOrigin",
    "motion",
    "class",
    "ref",
    "children",
  ]);
  const children = createMemo(() => props.children);
  const action = createMemo(() => props.action);
  const origin = () => props.anchorOrigin ?? snackbarAnchorOrigin;
  let root!: HTMLDivElement;
  const capture = (node: HTMLDivElement) => {
    root = node;
  };
  onSettled(() =>
    attachSnackbar(root, (event, reason) => {
      if (props.onClose) props.onClose(event, reason);
      else setOpen(false);
    }),
  );

  return (
    <div
      {...rest}
      ref={[capture, props.ref]}
      class={["clay-snackbar", props.class]}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-vertical={origin().vertical}
      data-horizontal={origin().horizontal}
      data-clay-open={flag(open())}
      data-clay-auto-hide={
        props.autoHideDuration === null
          ? undefined
          : (props.autoHideDuration ?? snackbarAutoHideDuration)
      }
      data-clay-resume-hide={props.resumeHideDuration}
      data-clay-ignore-window-blur={flag(props.disableWindowBlurListener)}
      data-motion={props.motion}
    >
      <div class="clay-snackbar__wrapper" hidden={!open()} inert={!open()}>
        <Show
          when={hasContent(children())}
          fallback={
            <div class="clay clay-snackbar__bar">
              <span class="clay-snackbar__message">{props.message}</span>
              <Show when={hasContent(action())}>
                <div class="clay-snackbar__action">{action()}</div>
              </Show>
            </div>
          }
        >
          {children()}
        </Show>
      </div>
    </div>
  );
}

export interface AlertProps extends Omit<JSX.IntrinsicElements["div"], "color" | "onClose"> {
  severity?: Severity;
  color?: Severity;
  variant?: AlertVariant;
  icon?: JSX.Element;
  action?: JSX.Element;
  /** Renders a close button unless `action` is supplied. The owner controls visibility. */
  onClose?: (event: MouseEvent) => void;
  closeText?: string;
  motion?: MotionPreset;
}

export function Alert(props: AlertProps) {
  const rest = omit(props, [
    "severity",
    "color",
    "variant",
    "icon",
    "action",
    "onClose",
    "closeText",
    "role",
    "motion",
    "class",
    "children",
  ]);
  const severity = () => props.severity ?? "success";
  const defaultIcon = () => alertIcons[severity()];
  const icon = createMemo(() => props.icon);
  const action = createMemo(() => props.action);

  return (
    <div
      {...rest}
      class={["clay clay-alert", props.class]}
      role={props.role ?? "alert"}
      data-color={props.color ?? severity()}
      data-variant={props.variant ?? "standard"}
      data-motion={props.motion}
    >
      <Show when={icon() !== false}>
        <span class="clay-alert__icon" aria-hidden="true">
          <Show
            when={hasContent(icon())}
            fallback={
              <svg {...actionIconAttrs} width="22" height="22">
                <path d={defaultIcon().path} />
              </svg>
            }
          >
            {icon()}
          </Show>
        </span>
      </Show>
      <div class="clay-alert__message">
        <span class="clay-sr-only">{defaultIcon().label}: </span>
        {props.children}
      </div>
      <Show
        when={hasContent(action())}
        fallback={
          <Show when={props.onClose}>
            <div class="clay-alert__action">
              <button
                type="button"
                class="clay clay-alert__close"
                data-clay-interactive=""
                aria-label={props.closeText ?? "Close"}
                onClick={(event) => props.onClose?.(event)}
              >
                <svg {...actionIconAttrs} width="18" height="18">
                  <path d={closeIconPath} />
                </svg>
              </button>
            </div>
          </Show>
        }
      >
        <div class="clay-alert__action">{action()}</div>
      </Show>
    </div>
  );
}

type ProgressAria = "role" | "aria-valuemin" | "aria-valuemax" | "aria-valuenow";

export interface CircularProgressProps
  extends
    Omit<
      JSX.IntrinsicElements["svg"],
      keyof CircularProgressOptions | ProgressAria | "width" | "height" | "viewBox" | "children"
    >,
    CircularProgressOptions {
  "aria-label": string;
}

export function CircularProgress(props: CircularProgressProps) {
  const rest = omit(props, [
    "variant",
    "min",
    "max",
    "value",
    "size",
    "thickness",
    "disableShrink",
    "enableTrackSlot",
    "color",
    "class",
  ]);
  const geometry = createMemo(() => circularProgress(props));
  return (
    <svg
      {...rest}
      class={["clay-circular-progress", props.class]}
      data-variant={props.variant ?? progressDefaults.variant}
      data-disable-shrink={flag(props.disableShrink)}
      data-color={props.color ?? progressDefaults.color}
      role="progressbar"
      aria-valuemin={geometry().range?.min}
      aria-valuemax={geometry().range?.max}
      aria-valuenow={geometry().range?.now}
      width={geometry().width}
      height={geometry().width}
      viewBox={`0 0 ${geometry().diameter} ${geometry().diameter}`}
    >
      <Show when={props.enableTrackSlot ?? circularProgressDefaults.enableTrackSlot}>
        <circle
          class="clay-circular-progress__track"
          cx={geometry().center}
          cy={geometry().center}
          r={geometry().radius}
          fill="none"
          stroke-width={geometry().stroke}
        />
      </Show>
      <circle
        class="clay-circular-progress__arc"
        data-empty={flag(geometry().range?.fraction === 0)}
        cx={geometry().center}
        cy={geometry().center}
        r={geometry().radius}
        fill="none"
        stroke-width={geometry().stroke}
        stroke-linecap="round"
        stroke-dasharray={geometry().range ? String(geometry().circumference) : undefined}
        stroke-dashoffset={geometry().dashOffset}
        style={{ "--clay-circular-progress-circ": `${geometry().circumference}px` }}
      />
    </svg>
  );
}

export interface LinearProgressProps
  extends
    Omit<JSX.IntrinsicElements["div"], keyof LinearProgressOptions | ProgressAria | "children">,
    LinearProgressOptions {
  "aria-label": string;
}

export function LinearProgress(props: LinearProgressProps) {
  const rest = omit(props, ["variant", "min", "max", "value", "valueBuffer", "color", "class"]);
  const progress = createMemo(() => linearProgress(props));
  return (
    <div
      {...rest}
      class={["clay clay-linear-progress", props.class]}
      data-variant={props.variant ?? progressDefaults.variant}
      data-color={props.color ?? progressDefaults.color}
      role="progressbar"
      aria-valuemin={progress().range?.min}
      aria-valuemax={progress().range?.max}
      aria-valuenow={progress().range?.now}
    >
      <Show when={progress().buffer !== undefined}>
        <div
          class="clay-linear-progress__buffer"
          style={{ "--clay-linear-progress-fraction": progress().buffer }}
        />
      </Show>
      <div
        class="clay clay-linear-progress__bar"
        data-empty={flag(progress().range?.fraction === 0)}
        style={{ "--clay-linear-progress-fraction": progress().range?.fraction }}
      />
    </div>
  );
}

export interface SkeletonProps
  extends
    Omit<JSX.IntrinsicElements["span"], keyof SkeletonOptions | "aria-hidden" | "children">,
    SkeletonOptions {}

export function Skeleton(props: SkeletonProps) {
  const rest = omit(props, ["variant", "width", "height", "animation", "class", "style"]);
  const dimensions = createMemo(() => skeletonDimensions(props));
  const style = () => {
    const native = props.style;
    const { width, height } = dimensions();
    if (width === undefined && height === undefined) return native;
    if (typeof native === "string") {
      return `${native};${width === undefined ? "" : `width:${width};`}${height === undefined ? "" : `height:${height};`}`;
    }
    const merged = { ...(native || undefined) };
    if (width !== undefined) merged.width = width;
    if (height !== undefined) merged.height = height;
    return merged;
  };
  return (
    <span
      {...rest}
      class={["clay clay-skeleton", props.class]}
      data-variant={props.variant ?? skeletonDefaults.variant}
      data-animation={(props.animation ?? skeletonDefaults.animation) || undefined}
      aria-hidden="true"
      style={style()}
    />
  );
}
