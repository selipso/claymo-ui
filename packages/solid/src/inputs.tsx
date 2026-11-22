import {
  For,
  Show,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  flush,
  onSettled,
  useContext,
} from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  checkboxRecipe,
  type CheckboxOptions,
  type Color,
  type MotionPreset,
  type Size,
} from "@claymo/core";
import { bindIndeterminate } from "@claymo/core/behavior/checkbox";
import {
  addAutocompleteValue,
  autocompleteDefaults,
  autocompleteInputValue,
  autocompleteSelectedValues,
  autocompleteValue,
  filterAutocompleteOptions,
  nextAutocompleteIndex,
  normalizeAutocompleteOptions,
  removeAutocompleteValue,
  sliderMarks,
  sliderPercent,
  sliderValue,
  textFieldDefaults,
  textFieldRecipe,
  type AutocompleteProps as CoreAutocompleteProps,
  type AutocompleteValue,
  type RadioGroupOption,
  type TextFieldOption,
} from "@claymo/core/input";
import { Chip } from "./actions.js";
import { callHandler, omit } from "./shared.js";

export type {
  AutocompleteOption,
  AutocompleteValue,
  RadioGroupOption,
  TextFieldOption,
} from "@claymo/core/input";

type InputAttributes = JSX.InputHTMLAttributes<HTMLInputElement>;
type InputEventFor<T extends HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> =
  InputEvent & { currentTarget: T; target: T };
type ChangeEventFor<T> = Event & { currentTarget: T; target: T };
type InputChange = ChangeEventFor<HTMLInputElement>;
type RadioValue = string | number;
type ControlSize = Exclude<Size, "large">;

// Reset bubbles before native form state is restored. Listen at the DOM root so controls can
// follow a changing form owner, including one set with `form`, and respect canceled resets.
function listenForReset(
  element: HTMLElement,
  belongsTo: (target: EventTarget | null) => boolean,
  apply: () => void,
) {
  const root = element.getRootNode();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const reset = (event: Event) => {
    if (!belongsTo(event.target) || event.defaultPrevented) return;
    // Do not let a second (canceled) reset erase an earlier successful one.
    queueMicrotask(() => {
      if (event.defaultPrevented || disposed) return;
      clearTimeout(timer);
      timer = setTimeout(apply);
    });
  };
  let disposed = false;
  root.addEventListener("reset", reset, true);
  return () => {
    disposed = true;
    root.removeEventListener("reset", reset, true);
    clearTimeout(timer);
  };
}

function setChecked(input: HTMLInputElement, checked: boolean) {
  if (input.checked !== checked) input.checked = checked;
}

function setValue(
  control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  value: string | number,
) {
  const text = String(value);
  if (control.value !== text) control.value = text;
}

const LabelContext = createContext<(() => boolean) | null>(null);

type ToggleProps = Omit<
  InputAttributes,
  "checked" | "defaultChecked" | "value" | "color" | "size" | "type" | "children" | "onChange"
> & {
  checked?: boolean;
  defaultChecked?: boolean;
  value?: string | number;
  onChange?: (event: InputChange, checked: boolean) => void;
  motion?: MotionPreset;
};

export interface CheckboxProps extends ToggleProps, CheckboxOptions {
  indeterminate?: boolean;
}

export interface SwitchProps extends Omit<ToggleProps, "role">, CheckboxOptions {}

function Toggle(props: CheckboxProps & { isSwitch?: boolean }) {
  const labelDisabled = useContext(LabelContext);
  const initial = props.defaultChecked ?? false;
  // Solid uses defaultChecked for SSR; a controlled value also owns the reset baseline.
  const checked = () => props.checked ?? initial;
  const recipe = createMemo(() => checkboxRecipe({ color: props.color, size: props.size }));
  const rest = omit(props, [
    "isSwitch",
    "checked",
    "defaultChecked",
    "disabled",
    "indeterminate",
    "color",
    "size",
    "motion",
    "class",
    "role",
    "onChange",
    "ref",
  ]);
  let input!: HTMLInputElement;
  const capture = (element: HTMLInputElement) => {
    input = element;
  };

  if (!props.isSwitch) {
    const mixed = createMemo(() => props.indeterminate ?? false);
    createEffect(mixed, (indeterminate) => {
      input.indeterminate = indeterminate;
    });
    onSettled(() => bindIndeterminate(input, mixed));
  }

  function change(event: InputChange) {
    props.onChange?.(event, event.currentTarget.checked);
    if (props.checked !== undefined) {
      flush();
      if (props.checked !== undefined) setChecked(event.currentTarget, props.checked);
    }
  }

  return (
    <input
      {...rest}
      ref={[capture, props.ref]}
      type="checkbox"
      role={props.isSwitch ? "switch" : props.role}
      {...recipe().attrs}
      class={[props.isSwitch ? "clay clay-switch" : recipe().className, props.class]}
      data-motion={props.motion}
      disabled={labelDisabled?.() ? true : props.disabled}
      defaultChecked={checked()}
      checked={checked()}
      onChange={change}
    />
  );
}

export function Checkbox(props: CheckboxProps) {
  return <Toggle {...props} />;
}

export function Switch(props: SwitchProps) {
  return <Toggle {...props} isSwitch />;
}

export interface FormControlLabelProps extends Omit<
  JSX.LabelHTMLAttributes<HTMLLabelElement>,
  "children"
> {
  label: JSX.Element;
  control: JSX.Element;
  labelPlacement?: "end" | "start" | "top" | "bottom";
  disabled?: boolean;
}

export function FormControlLabel(props: FormControlLabelProps) {
  const rest = omit(props, ["label", "control", "labelPlacement", "disabled", "class"]);
  const inheritedDisabled = useContext(LabelContext);
  const disabled = () => !!(props.disabled || inheritedDisabled?.());
  return (
    <LabelContext value={disabled}>
      <label
        {...rest}
        class={["clay-form-control-label", props.class]}
        data-disabled={disabled() ? "" : undefined}
        data-placement={props.labelPlacement ?? "end"}
      >
        {props.control}
        <span class="clay-form-control-label__text">{props.label}</span>
      </label>
    </LabelContext>
  );
}

interface RadioContext {
  readonly name: string;
  readonly value: RadioValue | undefined;
  readonly resetValue: RadioValue | undefined;
  readonly disabled: boolean | undefined;
  readonly required: boolean | undefined;
  select(value: RadioValue, event: InputChange): void;
}

const GroupContext = createContext<RadioContext | null>(null);
const matchesRadio = (selection: RadioValue | undefined, value: RadioValue) =>
  selection !== undefined && String(selection) === String(value);

export interface RadioProps extends Omit<ToggleProps, "value" | "onChange"> {
  value: RadioValue;
  color?: Color;
  size?: ControlSize;
  onChange?: (event: InputChange, value: RadioValue) => void;
}

export function Radio(props: RadioProps) {
  const group = useContext(GroupContext);
  const labelDisabled = useContext(LabelContext);
  const initial = props.defaultChecked ?? false;
  const rest = omit(props, [
    "name",
    "value",
    "checked",
    "defaultChecked",
    "disabled",
    "required",
    "color",
    "size",
    "motion",
    "class",
    "onChange",
  ]);

  function change(event: InputChange) {
    if (!event.currentTarget.checked) return;
    group?.select(props.value, event);
    props.onChange?.(event, props.value);
    if (!group && props.checked !== undefined) {
      flush();
      if (props.checked !== undefined) setChecked(event.currentTarget, props.checked);
    }
  }

  return (
    <input
      {...rest}
      type="radio"
      class={["clay clay-radio", props.class]}
      data-color={props.color ?? "primary"}
      data-size={props.size ?? "medium"}
      data-motion={props.motion}
      data-clay-radio-member={group ? "" : undefined}
      name={props.name ?? group?.name}
      value={props.value}
      defaultChecked={
        group ? matchesRadio(group.resetValue, props.value) : (props.checked ?? initial)
      }
      checked={group ? matchesRadio(group.value, props.value) : (props.checked ?? initial)}
      disabled={group?.disabled || labelDisabled?.() ? true : props.disabled}
      required={group?.required ? true : props.required}
      onChange={change}
    />
  );
}

export interface RadioGroupProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange"> {
  name?: string;
  value?: RadioValue;
  defaultValue?: RadioValue;
  row?: boolean;
  disabled?: boolean;
  required?: boolean;
  form?: string;
  options?: readonly RadioGroupOption[];
  onChange?: (event: InputChange, value: RadioValue) => void;
  motion?: MotionPreset;
}

export function RadioGroup(props: RadioGroupProps) {
  const rest = omit(props, [
    "name",
    "value",
    "defaultValue",
    "row",
    "disabled",
    "required",
    "form",
    "options",
    "onChange",
    "motion",
    "class",
    "children",
    "ref",
  ]);
  const id = `clay-radio-${createUniqueId()}`;
  const initial = props.defaultValue ?? props.value;
  const [internal, setInternal] = createSignal(initial);
  const value = () => props.value ?? internal();
  let root!: HTMLDivElement;
  const capture = (element: HTMLDivElement) => {
    root = element;
  };
  const members = () => root.querySelectorAll<HTMLInputElement>("[data-clay-radio-member]");
  const owns = (member: HTMLInputElement) => member.closest(".clay-radio-group") === root;

  function sync() {
    const selected = value();
    for (const member of members())
      if (owns(member)) setChecked(member, matchesRadio(selected, member.value));
  }

  onSettled(() =>
    listenForReset(
      root,
      (target) => {
        for (const member of members()) if (member.form === target && owns(member)) return true;
        return false;
      },
      () => {
        if (props.value === undefined) setInternal(initial);
        flush();
        sync();
      },
    ),
  );

  const context: RadioContext = {
    get resetValue() {
      return props.value ?? initial;
    },
    get name() {
      return props.name ?? id;
    },
    get value() {
      return value();
    },
    get disabled() {
      return props.disabled;
    },
    get required() {
      return props.required;
    },
    select(next, event) {
      if (props.value === undefined) setInternal(next);
      props.onChange?.(event, next);
      // Run after the Radio's own callback too; a parent may accept the change there.
      if (props.value !== undefined)
        queueMicrotask(() => {
          flush();
          if (root.isConnected && props.value !== undefined) sync();
        });
    },
  };

  return (
    <GroupContext value={context}>
      <div
        {...rest}
        ref={[capture, props.ref]}
        role="radiogroup"
        class={["clay-radio-group", props.class]}
        aria-required={props.required ? "true" : undefined}
        data-row={props.row ? "" : undefined}
        data-motion={props.motion}
      >
        <Show when={props.options} fallback={props.children}>
          {(options) => (
            <For each={options()}>
              {(option) => (
                <FormControlLabel
                  label={option.label}
                  disabled={props.disabled || option.disabled}
                  control={
                    <Radio
                      value={option.value}
                      color={option.color}
                      size={option.size}
                      form={props.form}
                    />
                  }
                />
              )}
            </For>
          )}
        </Show>
      </div>
    </GroupContext>
  );
}

export interface SliderProps extends Omit<
  InputAttributes,
  | "color"
  | "size"
  | "type"
  | "value"
  | "defaultValue"
  | "min"
  | "max"
  | "step"
  | "children"
  | "onChange"
  | "aria-label"
> {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  color?: Color;
  size?: ControlSize;
  valueLabelDisplay?: "off" | "auto" | "on";
  marks?: boolean;
  "aria-label": string;
  onChange?: (event: InputEventFor<HTMLInputElement>, value: number) => void;
  motion?: MotionPreset;
}

export function Slider(props: SliderProps) {
  const rest = omit(props, [
    "value",
    "defaultValue",
    "min",
    "max",
    "step",
    "color",
    "size",
    "valueLabelDisplay",
    "marks",
    "class",
    "id",
    "disabled",
    "onInput",
    "onChange",
    "motion",
    "ref",
  ]);
  const id = `clay-slider-${createUniqueId()}`;
  const initial = props.defaultValue ?? props.min ?? 0;
  const [internal, setInternal] = createSignal(initial);
  const min = () => props.min ?? 0;
  const max = () => props.max ?? 100;
  const step = () => props.step ?? 1;
  const normalize = (value: number) => sliderValue(value, min(), max(), step());
  const value = createMemo(() => normalize(props.value ?? internal()));
  const ticks = createMemo(() => (props.marks ? sliderMarks(min(), max(), step()) : []));
  const labelDisplay = () => props.valueLabelDisplay ?? "off";
  let input!: HTMLInputElement;
  const capture = (element: HTMLInputElement) => {
    input = element;
  };

  onSettled(() =>
    listenForReset(
      input,
      (target) => input.form === target,
      () => {
        if (props.value === undefined) setInternal(initial);
        flush();
        setValue(input, value());
      },
    ),
  );

  function change(event: InputEventFor<HTMLInputElement>) {
    callHandler(props.onInput, event);
    const next = event.currentTarget.valueAsNumber;
    if (props.value === undefined) setInternal(next);
    props.onChange?.(event, next);
    if (props.value !== undefined) {
      flush();
      setValue(event.currentTarget, value());
    }
  }

  return (
    <div
      class={["clay-slider", props.class]}
      data-disabled={props.disabled === true || props.disabled === "" ? "" : undefined}
      data-has-label={labelDisplay() !== "off" ? "" : undefined}
      data-has-marks={ticks().length > 0 ? "" : undefined}
      data-color={props.color ?? "primary"}
      data-size={props.size ?? "medium"}
      data-label={labelDisplay()}
      data-motion={props.motion}
      style={{ "--clay-slider-percent": String(sliderPercent(value(), min(), max())) }}
    >
      <Show when={labelDisplay() !== "off"}>
        <span class="clay clay-slider__bubble" aria-hidden="true">
          {value()}
        </span>
      </Show>
      <input
        {...rest}
        ref={[capture, props.ref]}
        type="range"
        class="clay clay-slider__input"
        id={props.id ?? id}
        min={min()}
        max={max()}
        step={step()}
        disabled={props.disabled}
        defaultValue={props.value === undefined ? normalize(initial) : value()}
        value={value()}
        onInput={change}
      />
      <Show when={ticks().length > 0}>
        <span class="clay-slider__marks" aria-hidden="true">
          <For each={ticks()}>
            {(tick) => (
              <span
                class="clay-slider__tick"
                data-value={tick}
                data-active={tick <= value() ? "" : undefined}
                style={{ "--clay-slider-tick": `${sliderPercent(tick, min(), max())}%` }}
              />
            )}
          </For>
        </span>
      </Show>
    </div>
  );
}

type FieldControl = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
type FieldValue = string | number | null;

export interface TextFieldProps extends Omit<
  InputAttributes,
  "color" | "size" | "value" | "defaultValue" | "onChange" | "onInput" | "ref"
> {
  variant?: "outlined" | "filled";
  label?: string;
  helperText?: string;
  error?: boolean;
  fullWidth?: boolean;
  multiline?: boolean;
  rows?: number;
  cols?: JSX.TextareaHTMLAttributes<HTMLTextAreaElement>["cols"];
  wrap?: JSX.TextareaHTMLAttributes<HTMLTextAreaElement>["wrap"];
  select?: boolean;
  options?: readonly TextFieldOption[];
  size?: ControlSize;
  color?: Color;
  value?: FieldValue;
  defaultValue?: FieldValue;
  startAdornment?: JSX.Element;
  endAdornment?: JSX.Element;
  onChange?: (event: ChangeEventFor<FieldControl>) => void;
  ref?: JSX.Ref<FieldControl>;
  onInput?: JSX.InputEventHandlerUnion<FieldControl, InputEvent>;
}

export function TextField(props: TextFieldProps) {
  const rest = omit(props, [
    "variant",
    "label",
    "helperText",
    "error",
    "fullWidth",
    "multiline",
    "rows",
    "cols",
    "wrap",
    "select",
    "options",
    "size",
    "color",
    "id",
    "class",
    "children",
    "value",
    "defaultValue",
    "type",
    "required",
    "disabled",
    "onInput",
    "onChange",
    "aria-describedby",
    "aria-invalid",
    "ref",
  ]);
  const selectRest = omit(rest, [
    "placeholder",
  ]) as unknown as JSX.SelectHTMLAttributes<HTMLSelectElement>;
  const textareaRest = rest as unknown as JSX.TextareaHTMLAttributes<HTMLTextAreaElement>;
  const uid = `clay-tf-${createUniqueId()}`;
  const initial = props.defaultValue;
  const id = () => props.id || uid;
  const startAdornment = createMemo(() => props.startAdornment);
  const endAdornment = createMemo(() => props.endAdornment);
  const recipe = createMemo(() =>
    textFieldRecipe({
      id: id(),
      variant: props.variant,
      size: props.size,
      color: props.color,
      error: props.error,
      disabled: props.disabled === true || props.disabled === "",
      fullWidth: props.fullWidth,
      select: props.select,
      multiline: props.multiline,
      hasStart: !!startAdornment(),
      hasEnd: !!endAdornment(),
      helperText: props.helperText,
      describedBy: props["aria-describedby"] || undefined,
    }),
  );
  const invalid = () => props["aria-invalid"] ?? recipe().input["aria-invalid"];
  const value = () => (props.value === undefined ? initial : props.value);
  const selectValue = () => (value() === undefined ? {} : { value: value() ?? "" });
  const chevron = () => (props.size === "small" ? 16 : 20);
  let root!: HTMLDivElement;
  const select = () =>
    root.querySelector<HTMLSelectElement>(":scope > .clay-text-field__control > select");

  onSettled(() =>
    listenForReset(
      root,
      (target) => select()?.form === target,
      () => {
        const field = select();
        if (field && value() !== undefined) setValue(field, value() ?? "");
      },
    ),
  );

  function report(event: ChangeEventFor<FieldControl>) {
    props.onChange?.(event);
    if (props.value !== undefined) {
      flush();
      setValue(event.currentTarget, value() ?? "");
    }
  }

  function input(event: InputEventFor<FieldControl>) {
    callHandler(props.onInput, event);
    if (event.currentTarget.tagName !== "SELECT") report(event);
  }

  return (
    <div
      ref={(element) => {
        root = element;
      }}
      class={["clay-text-field", props.class]}
      {...recipe().root}
    >
      <Show when={props.label}>
        <label class="clay-text-field__label" for={id()}>
          {props.label}
          {(props.required === true || props.required === "") && <span aria-hidden="true"> *</span>}
        </label>
      </Show>
      <div class="clay-text-field__control" {...recipe().control}>
        <Show when={startAdornment()}>
          {(adornment) => (
            <span class="clay-text-field__adornment clay-text-field__adornment--start">
              {adornment()}
            </span>
          )}
        </Show>
        {props.multiline ? (
          <textarea
            {...textareaRest}
            {...recipe().input}
            ref={[props.ref as JSX.Ref<HTMLTextAreaElement>]}
            aria-invalid={invalid()}
            class="clay clay-text-field__input"
            id={id()}
            required={props.required}
            disabled={props.disabled}
            rows={props.rows ?? textFieldDefaults.rows}
            cols={props.cols}
            wrap={props.wrap}
            defaultValue={value() ?? ""}
            value={value() ?? ""}
            onInput={input}
          />
        ) : props.select ? (
          <>
            <select
              {...selectRest}
              {...selectValue()}
              {...recipe().input}
              ref={[props.ref as JSX.Ref<HTMLSelectElement>]}
              aria-invalid={invalid()}
              class="clay clay-text-field__input"
              id={id()}
              required={props.required}
              disabled={props.disabled}
              onInput={input}
              onChange={report}
            >
              <Show when={props.options} fallback={props.children}>
                {(options) => (
                  <For each={options()}>
                    {(option) => (
                      <option value={option.value} disabled={option.disabled}>
                        {option.label}
                      </option>
                    )}
                  </For>
                )}
              </Show>
            </select>
            <svg
              class="clay-text-field__chevron"
              aria-hidden="true"
              width={chevron()}
              height={chevron()}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </>
        ) : (
          <input
            {...rest}
            {...recipe().input}
            ref={[props.ref as JSX.Ref<HTMLInputElement>]}
            aria-invalid={invalid()}
            class="clay clay-text-field__input"
            id={id()}
            type={props.type ?? textFieldDefaults.type}
            required={props.required}
            disabled={props.disabled}
            defaultValue={value() ?? ""}
            value={value() ?? ""}
            onInput={input}
          />
        )}
        <Show when={endAdornment()}>
          {(adornment) => (
            <span class="clay-text-field__adornment clay-text-field__adornment--end">
              {adornment()}
            </span>
          )}
        </Show>
      </div>
      <Show when={props.helperText}>
        <p class="clay-text-field__helper" id={recipe().helperId}>
          {props.error && <span aria-hidden="true">!&nbsp;</span>}
          {props.helperText}
        </p>
      </Show>
    </div>
  );
}

export interface AutocompleteProps<
  Multiple extends boolean = false,
> extends CoreAutocompleteProps<Multiple> {
  class?: JSX.ClassValue;
  form?: string;
  ref?: JSX.Ref<HTMLInputElement>;
  "aria-describedby"?: string;
  onChange?: (event: Event, value: AutocompleteValue<Multiple>) => void;
}

export function Autocomplete<Multiple extends boolean = false>(props: AutocompleteProps<Multiple>) {
  const uid = `clay-ac-${createUniqueId()}`;
  const id = () => props.id ?? uid;
  const labelId = () => `${id()}-label`;
  const listId = () => `${id()}-listbox`;
  const multiple = () => !!props.multiple;
  const initial = props.defaultValue;
  const [internal, setInternal] = createSignal<AutocompleteValue | undefined>(initial);
  const [draft, setDraft] = createSignal<string>();
  const [open, setOpen] = createSignal(false);
  const [active, setActive] = createSignal(-1);
  const expanded = () => open() && !props.disabled;
  const normalized = createMemo(() => normalizeAutocompleteOptions(props.options));
  const selected = createMemo(() =>
    autocompleteSelectedValues(props.value === undefined ? internal() : props.value, multiple()),
  );
  const inputValue = createMemo(
    () => draft() ?? autocompleteInputValue(normalized(), selected(), multiple()),
  );
  const matches = createMemo(() =>
    filterAutocompleteOptions(normalized(), draft() ?? "", selected(), {
      filterSelectedOptions: props.filterSelectedOptions,
      freeSolo: props.freeSolo,
      addOptionText: props.addOptionText,
    }),
  );
  const activeId = () =>
    expanded() && matches().items[active()] ? `${listId()}-${active()}` : undefined;
  const needsSelection = () => !!props.required && selected().length === 0;
  const recipe = createMemo(() =>
    textFieldRecipe({
      id: id(),
      size: props.size,
      error: props.error,
      disabled: props.disabled,
      fullWidth: props.fullWidth,
      helperText: props.helperText,
      describedBy: props["aria-describedby"],
    }),
  );
  let input!: HTMLInputElement;
  const capture = (element: HTMLInputElement) => {
    input = element;
  };
  let list!: HTMLDivElement;

  onSettled(() =>
    listenForReset(
      input,
      (target) => input.form === target,
      () => {
        if (props.value === undefined) setInternal(initial);
        close();
        flush();
        setValue(input, inputValue());
      },
    ),
  );
  createEffect(
    () => needsSelection() && inputValue() !== "",
    (missing) => input.setCustomValidity(missing ? "Select a value." : ""),
  );
  createEffect(activeId, (current) => {
    if (current) list.children[active()]?.scrollIntoView({ block: "nearest" });
  });
  createEffect(
    () => props.disabled,
    (disabled) => {
      if (disabled) close();
    },
  );

  function close() {
    setOpen(false);
    setActive(-1);
    setDraft(undefined);
  }

  function update(event: Event, previous: string[], next: string[]) {
    if (next === previous) return;
    const nextValue = autocompleteValue(next, multiple());
    if (props.value === undefined) setInternal(nextValue);
    // The runtime conversion above uses the same selection mode as the callback's type.
    props.onChange?.(event, nextValue as AutocompleteValue<Multiple>);
  }

  function select(event: Event, item: string) {
    const previous = selected();
    close();
    update(event, previous, addAutocompleteValue(previous, item, multiple()));
  }

  function remove(event: Event, item: string) {
    const previous = selected();
    input.focus();
    setActive(-1);
    update(event, previous, removeAutocompleteValue(previous, item));
  }

  function search(event: InputEventFor<HTMLInputElement>) {
    const next = event.currentTarget.value;
    setDraft(next);
    setActive(-1);
    setOpen(true);
    if (!multiple() && next === "" && selected().length > 0) update(event, selected(), []);
  }

  function keydown(event: KeyboardEvent) {
    if (event.isComposing || event.defaultPrevented || props.disabled) return;
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp":
        event.preventDefault();
        setOpen(true);
        setActive(
          nextAutocompleteIndex(
            active(),
            matches().items.length,
            event.key === "ArrowDown" ? 1 : -1,
          ),
        );
        break;
      case "Enter": {
        const item = expanded()
          ? (matches().items[active()]?.value ?? matches().typedValue)
          : undefined;
        if (item === undefined) return;
        event.preventDefault();
        select(event, item);
        break;
      }
      case "Escape":
        if (expanded()) {
          event.preventDefault();
          close();
        }
        break;
      case "Tab":
        if (expanded()) close();
        break;
      case "Backspace":
        if (multiple() && input.value === "" && selected().length > 0) {
          event.preventDefault();
          remove(event, selected()[selected().length - 1]);
        }
        break;
    }
  }

  return (
    <div class={["clay-text-field clay-autocomplete", props.class]} {...recipe().root}>
      <label class="clay-text-field__label" id={labelId()} for={id()}>
        {props.label}
        {props.required && <span aria-hidden="true"> *</span>}
      </label>
      <div class="clay-text-field__control">
        <div class="clay clay-text-field__input clay-autocomplete__field">
          <Show when={multiple()}>
            <For each={selected()}>
              {(item) => (
                <Chip
                  label={normalized().get(item)?.label ?? item}
                  size="small"
                  disabled={props.disabled}
                  onDelete={(event) => remove(event, item)}
                />
              )}
            </For>
          </Show>
          <input
            ref={[capture, props.ref]}
            class="clay-autocomplete__query"
            id={id()}
            type="text"
            role="combobox"
            autocomplete="off"
            aria-autocomplete="list"
            aria-expanded={expanded() ? "true" : "false"}
            aria-controls={listId()}
            aria-activedescendant={activeId()}
            aria-required={props.required ? "true" : undefined}
            required={needsSelection()}
            disabled={props.disabled}
            placeholder={props.placeholder}
            form={props.form}
            {...recipe().input}
            value={inputValue()}
            onClick={() => setOpen(true)}
            onBlur={close}
            onInput={search}
            onKeyDown={keydown}
          />
        </div>
        <div class="clay clay-autocomplete__popup" hidden={!expanded()}>
          <div
            class="clay-autocomplete__list"
            ref={(element) => {
              list = element;
            }}
            id={listId()}
            role="listbox"
            aria-labelledby={labelId()}
            aria-multiselectable={multiple() ? "true" : undefined}
          >
            <Show when={expanded()}>
              <For each={matches().items} keyed={(item) => item.value}>
                {(item, index) => (
                  <button
                    type="button"
                    role="option"
                    tabindex={-1}
                    class="clay-autocomplete__option"
                    id={`${listId()}-${index()}`}
                    aria-selected={selected().includes(item().value) ? "true" : "false"}
                    data-active={active() === index() ? "" : undefined}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={(event) => {
                      input.focus();
                      select(event, item().value);
                    }}
                  >
                    {item().label}
                  </button>
                )}
              </For>
            </Show>
          </div>
          <p
            class="clay-autocomplete__empty"
            role="status"
            hidden={!expanded() || matches().items.length > 0}
          >
            {props.noOptionsText ?? autocompleteDefaults.noOptionsText}
          </p>
        </div>
      </div>
      <Show when={props.helperText}>
        <p class="clay-text-field__helper" id={recipe().helperId}>
          {props.error && <span aria-hidden="true">!&nbsp;</span>}
          {props.helperText}
        </p>
      </Show>
      <Show when={props.name}>
        {(name) => (
          <For each={selected()}>
            {(item) => (
              <input
                type="hidden"
                name={name()}
                value={item}
                disabled={props.disabled}
                form={props.form}
              />
            )}
          </For>
        )}
      </Show>
    </div>
  );
}
