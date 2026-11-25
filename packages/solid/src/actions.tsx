import { buttonRecipe, CLAY_LIGHTING_SVG, flag, type ButtonOptions } from "@claymo/core";
import type { Color, MotionPreset, Size } from "@claymo/core";
import {
  actionIconAttrs,
  closeIconPath,
  isChipDeleteKey,
  nativeAction,
  type ButtonGroupOrientation,
  type ButtonVariant,
  type ChipSize,
  type ChipVariant,
  type IconButtonEdge,
  type NativeActionOptions,
} from "@claymo/core/actions";
import { watchAvatarImage } from "@claymo/core/behavior/display";
import { attachTooltip } from "@claymo/core/behavior/overlays";
import { avatarDefaults, avatarInitial, badgeDefaults, badgeLabel } from "@claymo/core/display";
import type { AvatarOptions, BadgeOptions } from "@claymo/core/display";
import type { TooltipCloseReason, TooltipPlacement } from "@claymo/core/overlays";
import { dynamic, type JSX } from "@solidjs/web";
import {
  children,
  createMemo,
  createSignal,
  createUniqueId,
  onSettled,
  Show,
  type Component,
} from "solid-js";
import { callHandler, omit } from "./shared.js";

type ActionElement = HTMLAnchorElement | HTMLButtonElement;
type ButtonDOMProps = JSX.ButtonHTMLAttributes<ActionElement>;
type ActionDOMProps = ButtonDOMProps &
  Omit<JSX.AnchorHTMLAttributes<ActionElement>, keyof ButtonDOMProps>;

type MotionProps = { motion?: MotionPreset };

// Native event handlers and refs must accept either element when href can change.
function actionElement(tag: () => "a" | "button") {
  return dynamic(tag) as Component<ActionDOMProps>;
}

function hasContent(value: JSX.Element): boolean {
  return value != null && typeof value !== "boolean" && value !== "";
}

export type ButtonProps = Omit<ActionDOMProps, keyof ButtonOptions> &
  ButtonOptions &
  MotionProps & {
    startIcon?: JSX.Element;
    endIcon?: JSX.Element;
  };

export function Button(props: ButtonProps) {
  const rest = omit(props, [
    "variant",
    "color",
    "size",
    "disabled",
    "fullWidth",
    "href",
    "type",
    "loading",
    "loadingPosition",
    "disableElevation",
    "inflated",
    "motion",
    "class",
    "startIcon",
    "endIcon",
    "children",
    "onClick",
    "aria-busy",
  ]);
  const recipe = createMemo(() => buttonRecipe(props));
  const Tag = actionElement(() => recipe().tag);

  const onClick: JSX.EventHandler<ActionElement, MouseEvent> = (event) => {
    if (recipe().inert) event.preventDefault();
    else callHandler(props.onClick, event);
  };

  return (
    <Tag
      {...rest}
      {...recipe().attrs}
      class={[recipe().className, props.class ?? undefined]}
      data-motion={props.motion}
      aria-busy={props.loading ? "true" : props["aria-busy"]}
      onClick={onClick}
    >
      <Show when={props.loading}>
        <span class="clay-button__spinner" role="progressbar" aria-label="Loading" />
      </Show>
      <Show when={props.startIcon}>
        {(icon) => <span class="clay-button__icon">{icon()}</span>}
      </Show>
      <span class="clay-button__label">{props.children}</span>
      <Show when={props.endIcon}>{(icon) => <span class="clay-button__icon">{icon()}</span>}</Show>
    </Tag>
  );
}

export type IconButtonProps = Omit<
  ActionDOMProps,
  keyof NativeActionOptions | "color" | "size" | "aria-label"
> &
  Omit<NativeActionOptions, "disabled"> &
  MotionProps & {
    "aria-label": string;
    color?: Color;
    size?: Size;
    disabled?: boolean;
    loading?: boolean | null;
    loadingIndicator?: JSX.Element;
    edge?: IconButtonEdge;
    inflated?: boolean;
  };

export function IconButton(props: IconButtonProps) {
  const rest = omit(props, [
    "color",
    "size",
    "disabled",
    "href",
    "type",
    "loading",
    "loadingIndicator",
    "edge",
    "inflated",
    "motion",
    "class",
    "children",
    "onClick",
    "aria-busy",
  ]);
  const inactive = () => !!(props.disabled || props.loading);
  const action = createMemo(() =>
    nativeAction({ href: props.href, type: props.type, disabled: inactive() }),
  );
  const Tag = actionElement(() => action().tag);

  const onClick: JSX.EventHandler<ActionElement, MouseEvent> = (event) => {
    if (inactive()) event.preventDefault();
    else callHandler(props.onClick, event);
  };

  return (
    <Tag
      {...rest}
      {...action().attrs}
      class={["clay clay-icon-button", props.class ?? undefined]}
      data-loading={flag(!!props.loading)}
      data-edge={props.edge || undefined}
      data-color={props.color ?? "default"}
      data-size={props.size ?? "medium"}
      data-clay-interactive=""
      data-inflated={flag(props.inflated)}
      data-motion={props.motion}
      aria-busy={props.loading ? "true" : props["aria-busy"]}
      onClick={onClick}
    >
      <Show
        when={props.loading}
        fallback={<span class="clay-icon-button__icon">{props.children}</span>}
      >
        <Show
          when={props.loadingIndicator}
          fallback={
            <span class="clay-icon-button__spinner" role="progressbar" aria-label="Loading" />
          }
        >
          {(indicator) => indicator()}
        </Show>
      </Show>
    </Tag>
  );
}

export type ButtonGroupProps = Omit<
  JSX.FieldsetHTMLAttributes<HTMLFieldSetElement>,
  "color" | "disabled"
> &
  MotionProps & {
    variant?: ButtonVariant;
    color?: Color;
    size?: Size;
    orientation?: ButtonGroupOrientation;
    disabled?: boolean;
    fullWidth?: boolean;
    disableElevation?: boolean;
  };

export function ButtonGroup(props: ButtonGroupProps) {
  const rest = omit(props, [
    "variant",
    "color",
    "size",
    "orientation",
    "disabled",
    "fullWidth",
    "disableElevation",
    "motion",
    "class",
    "children",
  ]);

  return (
    <fieldset
      {...rest}
      class={["clay clay-button-group", props.class ?? undefined]}
      data-variant={props.variant ?? "contained"}
      data-orientation={props.orientation ?? "horizontal"}
      data-color={props.color ?? "primary"}
      data-size={props.size ?? "medium"}
      data-full-width={flag(props.fullWidth)}
      data-no-elevation={flag(props.disableElevation)}
      data-motion={props.motion}
      disabled={props.disabled}
    >
      {props.children}
    </fieldset>
  );
}

export type BadgeProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, keyof BadgeOptions> &
  Omit<BadgeOptions, "badgeContent"> &
  MotionProps & { badgeContent?: JSX.Element };

export function Badge(props: BadgeProps) {
  const rest = omit(props, [
    "badgeContent",
    "color",
    "max",
    "showZero",
    "invisible",
    "variant",
    "anchorOrigin",
    "overlap",
    "motion",
    "class",
    "children",
  ]);
  const anchor = children(() => props.children);
  const variant = () => props.variant ?? badgeDefaults.variant;
  const indicator = createMemo(() => {
    const invisible = props.invisible;
    const badgeVariant = variant();
    const content = invisible || badgeVariant === "dot" ? undefined : props.badgeContent;
    const scalar = typeof content === "string" || typeof content === "number";
    const label = badgeLabel(
      {
        badgeContent: scalar ? content : undefined,
        max: props.max,
        showZero: props.showZero,
        invisible,
        variant: badgeVariant,
      },
      !scalar && hasContent(content),
    );
    return label === undefined || scalar || badgeVariant === "dot" ? label : content;
  });

  return (
    <span {...rest} class={["clay-badge", props.class ?? undefined]} data-motion={props.motion}>
      {anchor()}
      <Show when={indicator() !== undefined}>
        <span
          class="clay clay-badge__indicator"
          data-variant={variant()}
          data-anchored={flag(hasContent(anchor()))}
          data-vertical={props.anchorOrigin?.vertical ?? badgeDefaults.anchorOrigin.vertical}
          data-horizontal={props.anchorOrigin?.horizontal ?? badgeDefaults.anchorOrigin.horizontal}
          data-overlap={props.overlap ?? badgeDefaults.overlap}
          data-color={props.color ?? badgeDefaults.color}
        >
          {indicator()}
        </span>
      </Show>
    </span>
  );
}

type AvatarSource = Pick<AvatarOptions, "src" | "srcSet" | "sizes">;
export type AvatarProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, keyof AvatarOptions> &
  AvatarOptions;

function AvatarImage(props: { source: AvatarSource; alt: string; onFailure: () => void }) {
  let image!: HTMLImageElement;
  onSettled(() => watchAvatarImage(image, props.onFailure).destroy);

  return (
    <img
      ref={image}
      class="clay-avatar__image"
      src={props.source.src}
      srcset={props.source.srcSet}
      sizes={props.source.sizes}
      alt={props.alt}
    />
  );
}

function AvatarFallback(props: { alt: string; children?: JSX.Element }) {
  const custom = children(() => props.children);
  const initial = createMemo(() => (hasContent(custom()) ? "" : avatarInitial(props.alt)));

  return (
    <span
      class="clay-avatar__fallback"
      role={initial() ? "img" : undefined}
      aria-label={initial() ? props.alt : undefined}
    >
      {hasContent(custom())
        ? custom()
        : initial() || (
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
              <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5Z" />
            </svg>
          )}
    </span>
  );
}

export function Avatar(props: AvatarProps) {
  const rest = omit(props, [
    "src",
    "srcSet",
    "sizes",
    "alt",
    "variant",
    "size",
    "class",
    "children",
  ]);
  const alt = () => props.alt ?? avatarDefaults.alt;
  const source = createMemo(() => {
    const { src, srcSet, sizes } = props;
    return src || srcSet ? { src: src || undefined, srcSet, sizes } : undefined;
  });
  const [failedSource, setFailedSource] = createSignal<AvatarSource>();
  const activeSource = () => {
    const attempted = source();
    return attempted === failedSource() ? undefined : attempted;
  };

  return (
    <span
      {...rest}
      class={["clay clay-avatar", props.class ?? undefined]}
      data-variant={props.variant ?? avatarDefaults.variant}
      data-size={props.size ?? avatarDefaults.size}
    >
      <Show
        keyed
        when={activeSource()}
        fallback={<AvatarFallback alt={alt()}>{props.children}</AvatarFallback>}
      >
        {(attempted) => (
          <AvatarImage
            source={attempted}
            alt={alt()}
            onFailure={() => setFailedSource(attempted)}
          />
        )}
      </Show>
    </span>
  );
}

export type ChipProps = Omit<
  JSX.HTMLAttributes<HTMLSpanElement>,
  "color" | "children" | "onClick"
> &
  MotionProps & {
    label: string;
    variant?: ChipVariant;
    color?: Color;
    size?: ChipSize;
    icon?: JSX.Element;
    avatar?: JSX.Element;
    deleteIcon?: JSX.Element;
    onClick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
    onDelete?: (event: MouseEvent | KeyboardEvent) => void;
    clickable?: boolean;
    disabled?: boolean;
  };

export function Chip(props: ChipProps) {
  const rest = omit(props, [
    "label",
    "variant",
    "color",
    "size",
    "icon",
    "avatar",
    "deleteIcon",
    "onClick",
    "onDelete",
    "clickable",
    "disabled",
    "motion",
    "class",
    "aria-pressed",
  ]);
  const interactive = () => !!(props.clickable || props.onClick);
  const onDeleteKey = (event: KeyboardEvent) => {
    if (!props.disabled && props.onDelete && isChipDeleteKey(event.key)) {
      event.preventDefault();
      props.onDelete(event);
    }
  };

  const BodyContent = () => (
    <>
      <Show when={props.avatar}>
        {(avatar) => <span class="clay-chip__lead clay-chip__avatar">{avatar()}</span>}
      </Show>
      <Show when={props.icon}>
        {(icon) => <span class="clay-chip__lead clay-chip__icon">{icon()}</span>}
      </Show>
      <span class="clay-chip__label">{props.label}</span>
    </>
  );

  return (
    <span
      {...rest}
      class={["clay clay-chip", props.class ?? undefined]}
      data-variant={props.variant ?? "filled"}
      data-deletable={flag(!!props.onDelete)}
      data-color={props.color ?? "default"}
      data-size={props.size ?? "medium"}
      data-clay-interactive={flag(interactive())}
      data-disabled={flag(props.disabled)}
      data-motion={props.motion}
    >
      <Show
        when={interactive()}
        fallback={
          <span class="clay-chip__body">
            <BodyContent />
          </span>
        }
      >
        <button
          type="button"
          class="clay-chip__body"
          aria-pressed={props["aria-pressed"]}
          disabled={props.disabled}
          onClick={(event) => {
            if (!props.disabled) callHandler(props.onClick, event);
          }}
          onKeyDown={onDeleteKey}
        >
          <BodyContent />
        </button>
      </Show>
      <Show when={props.onDelete}>
        <button
          type="button"
          class="clay-chip__remove"
          aria-label={`Remove ${props.label}`}
          disabled={props.disabled}
          onClick={(event) => {
            if (!props.disabled) props.onDelete?.(event);
          }}
          onKeyDown={onDeleteKey}
        >
          <Show
            when={props.deleteIcon}
            fallback={
              <svg {...actionIconAttrs} width="14" height="14" stroke-width="2.5">
                <path d={closeIconPath} />
              </svg>
            }
          >
            {(icon) => icon()}
          </Show>
        </button>
      </Show>
    </span>
  );
}

export type TooltipProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "title" | "onClose"> &
  MotionProps & {
    title?: string;
    placement?: TooltipPlacement;
    arrow?: boolean;
    open?: boolean;
    onOpen?: (event: Event) => void;
    onClose?: (event: Event, reason: TooltipCloseReason) => void;
    content?: JSX.Element;
  };

export function Tooltip(props: TooltipProps) {
  const rest = omit(props, [
    "title",
    "placement",
    "arrow",
    "open",
    "onOpen",
    "onClose",
    "motion",
    "content",
    "children",
    "class",
    "ref",
  ]);
  const tipId = `${createUniqueId()}-tip`;
  const content = createMemo(() => {
    const custom = props.content;
    return hasContent(custom) ? custom : props.title;
  });
  let root!: HTMLSpanElement;

  onSettled(() =>
    attachTooltip(root, {
      requestOpen: (event) => props.onOpen?.(event),
      requestClose: (event, reason) => props.onClose?.(event, reason),
    }),
  );

  return (
    <span
      {...rest}
      ref={[props.ref, (element) => (root = element)]}
      class={["clay-tooltip", props.class ?? undefined]}
      data-placement={props.placement ?? "bottom"}
      data-arrow={flag(props.arrow)}
      data-clay-open={props.open === undefined ? undefined : String(props.open)}
      data-clay-tooltip-content={flag(hasContent(content()))}
      data-motion={props.motion}
    >
      {props.children}
      <span id={tipId} role="tooltip" class="clay clay-tooltip__bubble">
        {content()}
      </span>
    </span>
  );
}

const lightingFilter = CLAY_LIGHTING_SVG.slice(
  CLAY_LIGHTING_SVG.indexOf(">") + 1,
  -"</svg>".length,
);

/** Defines the document-wide filter used by inflated surfaces. */
export function ClayLighting() {
  return (
    <svg
      width="0"
      height="0"
      style="position:absolute"
      aria-hidden="true"
      {...{ focusable: "false" }}
      innerHTML={lightingFilter}
    />
  );
}
