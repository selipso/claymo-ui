import { dynamic, type JSX } from "@solidjs/web";
import { createMemo, createSignal, onSettled, Show, untrack, type Component } from "solid-js";
import { flag, paperRecipe, type MotionPreset, type PaperOptions } from "@claymo/core";
import { nativeAction, type NativeActionOptions } from "@claymo/core/actions";
import { attachAccordion } from "@claymo/core/behavior/surfaces";
import { tableDefaults, type TableOptions } from "@claymo/core/display";
import {
  accordionRecipe,
  cardElevation,
  typographyTag,
  type AccordionOptions,
  type AppBarOptions,
  type CardOptions,
  type DividerOptions,
  type TypographyOptions,
} from "@claymo/core/surfaces";
import { callHandler, omit } from "./shared.js";

function hasContent(value: JSX.Element): boolean {
  return value != null && typeof value !== "boolean";
}

export type PaperProps = JSX.HTMLAttributes<HTMLElement> & PaperOptions;

export function Paper(props: PaperProps) {
  const rest = omit(props, [
    "as",
    "elevation",
    "variant",
    "square",
    "inflated",
    "class",
    "children",
  ]);
  const recipe = createMemo(() => paperRecipe(props));
  const Surface = dynamic(() => recipe().tag);
  return (
    <Surface {...rest} {...recipe().attrs} class={[recipe().className, props.class]}>
      {props.children}
    </Surface>
  );
}

export type CardProps = JSX.HTMLAttributes<HTMLElement> & CardOptions;

export function Card(props: CardProps) {
  const rest = omit(props, ["raised", "elevation", "class", "children"]);
  return (
    <Paper
      {...rest}
      elevation={cardElevation(props.elevation, props.raised)}
      class={["clay-card", props.class]}
    >
      {props.children}
    </Paper>
  );
}

export function CardContent(props: JSX.IntrinsicElements["div"]) {
  const rest = omit(props, ["class", "children"]);
  return (
    <div {...rest} class={["clay-card-content", props.class]}>
      {props.children}
    </div>
  );
}

export type CardActionsProps = JSX.IntrinsicElements["div"] & {
  disableSpacing?: boolean;
};

export function CardActions(props: CardActionsProps) {
  const rest = omit(props, ["disableSpacing", "class", "children"]);
  return (
    <div
      {...rest}
      class={["clay-card-actions", props.class]}
      data-no-spacing={flag(props.disableSpacing)}
    >
      {props.children}
    </div>
  );
}

export type CardHeaderProps = Omit<JSX.IntrinsicElements["div"], "title" | "children"> & {
  title?: JSX.Element;
  subheader?: JSX.Element;
  avatar?: JSX.Element;
  action?: JSX.Element;
  disableTypography?: boolean;
};

export function CardHeader(props: CardHeaderProps) {
  const rest = omit(props, [
    "title",
    "subheader",
    "avatar",
    "action",
    "disableTypography",
    "class",
  ]);
  const title = createMemo(() => props.title);
  const subheader = createMemo(() => props.subheader);
  return (
    <div {...rest} class={["clay-card-header", props.class]}>
      <Show when={props.avatar}>
        {(avatar) => <div class="clay-card-header__avatar">{avatar()}</div>}
      </Show>
      <div class="clay-card-header__text">
        <Show when={hasContent(title())}>
          {props.disableTypography ? title() : <div class="clay-card-header__title">{title()}</div>}
        </Show>
        <Show when={hasContent(subheader())}>
          {props.disableTypography ? (
            subheader()
          ) : (
            <div class="clay-card-header__subheader">{subheader()}</div>
          )}
        </Show>
      </div>
      <Show when={props.action}>
        {(action) => <div class="clay-card-header__action">{action()}</div>}
      </Show>
    </div>
  );
}

export type AccordionProps = Omit<
  JSX.IntrinsicElements["details"],
  "open" | "prop:open" | "onChange"
> &
  AccordionOptions & {
    summary: JSX.Element;
    onChange?: (event: Event, expanded: boolean) => void;
    motion?: MotionPreset;
  };

export function Accordion(props: AccordionProps) {
  const rest = omit(props, [
    "expanded",
    "defaultExpanded",
    "disabled",
    "summary",
    "onChange",
    "onToggle",
    "motion",
    "class",
    "children",
  ]);
  const [expanded, setExpanded] = createSignal(untrack(() => props.defaultExpanded ?? false));
  const recipe = createMemo(() =>
    accordionRecipe({ expanded: props.expanded ?? expanded(), disabled: props.disabled }),
  );
  let summary!: HTMLElement;
  onSettled(() => attachAccordion(summary.parentElement as HTMLDetailsElement));

  const handleToggle: JSX.EventHandler<HTMLDetailsElement, ToggleEvent> = (event) => {
    const details = event.currentTarget;
    const open = details.open;
    const changed = open !== recipe().open;
    if (changed) {
      if (props.expanded === undefined) setExpanded(open);
      props.onChange?.(event, open);
    }
    callHandler(props.onToggle, event);
    if (changed && props.expanded !== undefined) {
      // Let updates from the change handler commit before restoring a rejected toggle.
      queueMicrotask(() => {
        const controlled = props.expanded;
        if (controlled !== undefined && details.open !== controlled) details.open = controlled;
      });
    }
  };

  return (
    <details
      {...rest}
      class={["clay-accordion", props.class]}
      data-motion={props.motion}
      open={recipe().open}
      onToggle={handleToggle}
    >
      <summary
        ref={summary}
        class="clay clay-accordion__summary"
        data-clay-interactive=""
        {...recipe().summaryAttrs}
      >
        <span class="clay-accordion__title">{props.summary}</span>
        <svg
          class="clay-accordion__chevron"
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <div class="clay clay-accordion__content">{props.children}</div>
    </details>
  );
}

export type DividerProps = Omit<JSX.IntrinsicElements["hr"], "children"> & DividerOptions;

export function Divider(props: DividerProps) {
  const rest = omit(props, ["orientation", "flexItem", "variant", "class"]);
  return (
    <hr
      {...rest}
      class={["clay-divider", props.class]}
      data-orientation={props.orientation ?? "horizontal"}
      data-variant={props.variant ?? "fullWidth"}
      data-flex-item={flag(props.flexItem)}
      aria-orientation={props.orientation ?? "horizontal"}
    />
  );
}

export type TypographyProps = Omit<JSX.HTMLAttributes<HTMLElement>, "color"> &
  Pick<JSX.LabelHTMLAttributes<HTMLLabelElement>, "for"> &
  TypographyOptions;

export function Typography(props: TypographyProps) {
  const rest = omit(props, [
    "variant",
    "as",
    "variantMapping",
    "color",
    "gutterBottom",
    "noWrap",
    "align",
    "class",
    "children",
  ]);
  const Text = dynamic(() =>
    typographyTag(props.variant ?? "body1", props.as, props.variantMapping),
  );
  return (
    <Text
      {...rest}
      class={["clay-typography", props.class]}
      data-variant={props.variant ?? "body1"}
      data-gutter-bottom={flag(props.gutterBottom)}
      data-no-wrap={flag(props.noWrap)}
      data-tcolor={props.color ?? "inherit"}
      data-align={props.align ?? "inherit"}
    >
      {props.children}
    </Text>
  );
}

export type TableProps = Omit<JSX.IntrinsicElements["div"], "role" | "tabindex" | "aria-label"> &
  TableOptions;

export function Table(props: TableProps) {
  const rest = omit(props, ["size", "padding", "stickyHeader", "label", "class", "children"]);
  return (
    <div
      {...rest}
      class={["clay clay-table", props.class]}
      data-sticky-header={flag(props.stickyHeader)}
      data-size={props.size ?? tableDefaults.size}
      data-padding={props.padding ?? tableDefaults.padding}
      role="region"
      tabindex={0}
      aria-label={props.label}
    >
      <table class="clay-table__table">{props.children}</table>
    </div>
  );
}

export type ListProps = JSX.IntrinsicElements["ul"] & {
  dense?: boolean;
  disablePadding?: boolean;
  subheader?: string;
};

export function List(props: ListProps) {
  const rest = omit(props, [
    "dense",
    "disablePadding",
    "subheader",
    "class",
    "children",
    "role",
    "aria-label",
  ]);
  return (
    <ul
      {...rest}
      class={["clay-list", props.class]}
      data-dense={flag(props.dense)}
      data-padded={flag(!props.disablePadding)}
      role={props.role ?? "list"}
      aria-label={
        props["aria-label"] ??
        (props["aria-labelledby"] === undefined ? props.subheader : undefined)
      }
    >
      <Show when={props.subheader}>
        <li class="clay-list__subheader" aria-hidden="true">
          {props.subheader}
        </li>
      </Show>
      {props.children}
    </ul>
  );
}

export type ListItemProps = JSX.IntrinsicElements["li"] & {
  disablePadding?: boolean;
  disableGutters?: boolean;
  divider?: boolean;
  secondaryAction?: JSX.Element;
};

export function ListItem(props: ListItemProps) {
  const rest = omit(props, [
    "disablePadding",
    "disableGutters",
    "divider",
    "secondaryAction",
    "class",
    "children",
  ]);
  return (
    <li
      {...rest}
      class={["clay-list-item", props.class]}
      data-padded={flag(!props.disablePadding)}
      data-gutters={flag(!props.disableGutters)}
      data-divider={flag(props.divider)}
    >
      {props.children}
      <Show when={props.secondaryAction}>
        {(action) => <span class="clay-list-item__secondary-action">{action()}</span>}
      </Show>
    </li>
  );
}

type ListActionElement = HTMLAnchorElement | HTMLButtonElement;

type ListActionDOMProps = JSX.ButtonHTMLAttributes<ListActionElement> &
  Pick<
    JSX.AnchorHTMLAttributes<ListActionElement>,
    "download" | "hreflang" | "href" | "link" | "ping" | "referrerpolicy" | "rel" | "target"
  >;

export type ListItemButtonProps = Omit<ListActionDOMProps, keyof NativeActionOptions> &
  Omit<NativeActionOptions, "disabled"> & {
    disabled?: boolean;
    selected?: boolean;
    dense?: boolean;
    disableGutters?: boolean;
    motion?: MotionPreset;
  };

export function ListItemButton(props: ListItemButtonProps) {
  const rest = omit(props, [
    "href",
    "type",
    "disabled",
    "selected",
    "dense",
    "disableGutters",
    "motion",
    "class",
    "children",
    "onClick",
    "aria-current",
  ]);
  const action = createMemo(() => nativeAction(props));
  const Action = dynamic(() => action().tag) as Component<ListActionDOMProps>;
  const handleClick: JSX.EventHandler<ListActionElement, MouseEvent> = (event) => {
    if (props.disabled) {
      event.preventDefault();
      return;
    }
    callHandler(props.onClick, event);
  };
  return (
    <Action
      {...rest}
      {...action().attrs}
      class={["clay clay-list-item-button", props.class]}
      data-selected={flag(props.selected)}
      data-dense={flag(props.dense)}
      data-gutters={flag(!props.disableGutters)}
      data-clay-interactive=""
      data-motion={props.motion}
      aria-current={
        props["aria-current"] ?? (props.selected ? (props.href ? "page" : "true") : undefined)
      }
      onClick={handleClick}
    >
      {props.children}
    </Action>
  );
}

export function ListItemIcon(props: JSX.IntrinsicElements["span"]) {
  const rest = omit(props, ["class", "children", "aria-hidden"]);
  return (
    <span
      {...rest}
      class={["clay-list-item-icon", props.class]}
      aria-hidden={
        props["aria-hidden"] ??
        (props["aria-label"] || props["aria-labelledby"] ? undefined : "true")
      }
    >
      {props.children}
    </span>
  );
}

export type ListItemTextProps = JSX.IntrinsicElements["span"] & {
  primary?: JSX.Element;
  secondary?: JSX.Element;
};

export function ListItemText(props: ListItemTextProps) {
  const rest = omit(props, ["primary", "secondary", "class", "children"]);
  const primary = createMemo(() => props.primary ?? props.children);
  const secondary = createMemo(() => props.secondary);
  return (
    <span {...rest} class={["clay-list-item-text", props.class]}>
      <Show when={hasContent(primary())}>
        <span class="clay-list-item-text__primary">{primary()}</span>
      </Show>
      <Show when={hasContent(secondary())}>
        <span class="clay-list-item-text__secondary">{secondary()}</span>
      </Show>
    </span>
  );
}

export type AppBarProps = Omit<JSX.IntrinsicElements["header"], "color"> & AppBarOptions;

export function AppBar(props: AppBarProps) {
  const rest = omit(props, ["position", "color", "class", "children"]);
  return (
    <header
      {...rest}
      class={["clay clay-app-bar", props.class]}
      data-position={props.position ?? "sticky"}
      data-color={props.color ?? "primary"}
    >
      {props.children}
    </header>
  );
}
