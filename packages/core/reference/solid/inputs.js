const controlledChecked = {
  type: "boolean",
  description:
    "Controlled checked state. Omit to let the native input handle user changes and form reset.",
};
const defaultChecked = {
  type: "boolean",
  default: false,
  description: "Initial and native form reset state when checked is omitted.",
};
const radioValue = ["string", "number"];
const fieldValue = ["string", "number", "null"];
const autocompleteValue = {
  type: ["string", "null", "array"],
  items: { type: "string" },
};
const externalForm = {
  type: "string",
  description: "Id of the associated form when the control is not nested in it.",
};
const nativeCheckedEvents = [
  "onChange(event, checked): runs on native change with the next checked state. Form reset does not fire it.",
];

export default {
  Checkbox: {
    props: {
      checked: controlledChecked,
      defaultChecked,
      indeterminate: {
        type: "boolean",
        default: false,
        description:
          "Controlled mixed state. The current prop is reapplied after a toggle and is independent of the submitted checked state.",
      },
    },
    content: [],
    events: nativeCheckedEvents,
    examples: [
      {
        title: "Reset a checkbox",
        source: `import { Button, Checkbox, FormControlLabel } from "@claymo/solid";

export default function Example() {
  return (
    <form>
      <FormControlLabel label="Email updates" control={<Checkbox name="updates" value="yes" defaultChecked />} />
      <Button type="reset" variant="outlined">Reset</Button>
    </form>
  );
}
`,
      },
      {
        title: "Control a mixed checkbox",
        source: `import { createSignal } from "solid-js";
import { Checkbox, FormControlLabel } from "@claymo/solid";

export default function Example() {
  const [count, setCount] = createSignal(1);
  return (
    <FormControlLabel
      label="Select both items"
      control={
        <Checkbox
          checked={count() === 2}
          indeterminate={count() === 1}
          onChange={(_, checked) => setCount(checked ? 2 : 0)}
        />
      }
    />
  );
}
`,
      },
    ],
  },
  Radio: {
    props: {
      name: {
        type: "string",
        description: "Native field name; inherits the RadioGroup name when omitted inside a group.",
      },
      checked: {
        ...controlledChecked,
        description: "Standalone controlled checked state; ignored inside RadioGroup.",
      },
      defaultChecked: {
        ...defaultChecked,
        description: "Standalone initial and native form reset state; ignored inside RadioGroup.",
      },
      form: externalForm,
    },
    required: ["value"],
    content: [],
    events: [
      "onChange(event, value): runs on the newly checked radio with its original string or number value.",
    ],
    examples: [
      {
        title: "Radio selected by default",
        source: `import { FormControlLabel, Radio } from "@claymo/solid";

export default function Example() {
  return <FormControlLabel label="Paper" control={<Radio name="format" value="paper" defaultChecked />} />;
}
`,
      },
    ],
  },
  RadioGroup: {
    props: {
      disabled: {
        type: "boolean",
        default: false,
        description: "Disables all Claymo Radio controls in the group through context.",
      },
      name: {
        type: "string",
        description:
          "Shared native name inherited by child radios; generated if omitted. Set an explicit name to read it from FormData.",
      },
      value: {
        type: radioValue,
        description: "Controlled selection. Compared to each radio by serialized value.",
      },
      defaultValue: {
        type: radioValue,
        description: "Initial selection and form reset default when uncontrolled.",
      },
      required: {
        type: "boolean",
        default: false,
        description: "Passes required to the radios for native validation.",
      },
    },
    content: [
      "Use options or JSX children, not both. For children, pass Radio components with unique serialized values, typically wrapped in FormControlLabel.",
    ],
    events: [
      "onChange(event, value): called after a user chooses a radio. Value keeps the radio’s original string or number type. Form reset does not fire it.",
    ],
    examples: [
      {
        title: "Reset a radio group",
        source: `import { Button, FormControlLabel, Radio, RadioGroup } from "@claymo/solid";

export default function Example() {
  return (
    <form>
      <RadioGroup name="format" aria-label="Preferred format" defaultValue="paper" required>
        <FormControlLabel label="Paper" control={<Radio value="paper" />} />
        <FormControlLabel label="Digital" control={<Radio value="digital" />} />
      </RadioGroup>
      <Button type="reset" variant="outlined">Reset</Button>
    </form>
  );
}
`,
      },
      {
        title: "Control a data-driven radio group",
        source: `import { createSignal } from "solid-js";
import { RadioGroup } from "@claymo/solid";

export default function Example() {
  const [copies, setCopies] = createSignal<string | number>(1);
  return (
    <RadioGroup
      aria-label="Copies"
      name="copies"
      value={copies()}
      row
      options={[{ value: 1, label: "One" }, { value: 2, label: "Two" }, { value: 3, label: "Three", disabled: true }]}
      onChange={(_, next) => setCopies(next)}
    />
  );
}
`,
      },
    ],
  },
  FormControlLabel: {
    props: {
      label: { type: "string", description: "Visible text; JSX content is also accepted." },
      disabled: {
        type: "boolean",
        default: false,
        description:
          "Dims the label and disables a nested Claymo Checkbox, Radio, or Switch through context.",
      },
    },
    required: ["label"],
    content: [
      "control: required JSX for the Checkbox, Radio, or Switch to label.",
      "label: visible text or JSX content.",
    ],
    events: ["Use the wrapped control’s native handlers or onChange callback."],
    examples: [
      {
        title: "Label before the switch",
        source: `import { FormControlLabel, Switch } from "@claymo/solid";

export default function Example() {
  return <FormControlLabel label="Notifications" labelPlacement="start" control={<Switch name="notifications" />} />;
}
`,
      },
    ],
  },
  Switch: {
    props: { checked: controlledChecked, defaultChecked, form: externalForm },
    content: [],
    events: nativeCheckedEvents,
    examples: [
      {
        title: "Email alerts switch",
        source: `import { createSignal } from "solid-js";
import { FormControlLabel, Switch } from "@claymo/solid";

export default function Example() {
  const [enabled, setEnabled] = createSignal(true);
  return (
    <FormControlLabel
      label="Email alerts"
      control={<Switch name="alerts" value="yes" checked={enabled()} onChange={(_, checked) => setEnabled(checked)} />}
    />
  );
}
`,
      },
    ],
  },
  Slider: {
    props: {
      value: {
        type: "number",
        description: "Controlled numeric value, bounded and rounded to the current step grid.",
      },
      defaultValue: {
        type: "number",
        description:
          "Initial and form reset value when uncontrolled. Defaults to the starting minimum.",
      },
    },
    required: ["aria-label"],
    content: [],
    events: [
      "onInput(event): native input handler; runs first.",
      "onChange(event, value): runs on every input with its numeric value. Form reset does not fire it.",
      "Observe the native committed change with a handler on an ancestor or an event listener on the range input ref.",
    ],
    examples: [
      {
        title: "Reset a volume slider",
        source: `import { Button, Slider } from "@claymo/solid";

export default function Example() {
  return (
    <form>
      <Slider name="volume" aria-label="Volume" defaultValue={25} step={25} marks valueLabelDisplay="on" />
      <Button type="reset" variant="outlined">Reset</Button>
    </form>
  );
}
`,
      },
    ],
  },
  TextField: {
    props: {
      value: {
        type: fieldValue,
        description:
          "Controlled native control value. In select mode, match an option’s submitted string. Null represents an empty value.",
      },
      defaultValue: {
        type: fieldValue,
        description:
          "Initial and form reset value when uncontrolled. With no value or defaultValue, a select uses its native option defaults.",
      },
      cols: {
        type: ["number", "string"],
        description: "Native textarea column width in multiline mode.",
      },
      wrap: {
        type: "string",
        enum: ["hard", "soft", "off"],
        description: "Native textarea wrap mode.",
      },
    },
    content: [
      "startAdornment and endAdornment: JSX for an icon-sized adornment at an inline edge.",
      "children: native option and optgroup JSX in select mode when options is omitted.",
    ],
    events: [
      "onInput(event): optional native input handler on the control; runs before onChange when applicable.",
      "onChange(event): runs after input on text fields and textareas, or after change on select. Read event.currentTarget.value.",
    ],
    examples: [
      {
        title: "Text and select fields",
        source: `import { Button, TextField } from "@claymo/solid";

export default function Example() {
  return (
    <form>
      <TextField label="Display name" name="displayName" required helperText="Shown on your profile" />
      <TextField label="Shelf" name="shelf" select defaultValue="paper">
        <optgroup label="Formats">
          <option value="paper">Paper</option>
          <option value="digital">Digital</option>
        </optgroup>
      </TextField>
      <Button type="reset" variant="outlined">Reset</Button>
    </form>
  );
}
`,
      },
      {
        title: "Filled fields with adornments and multiline text",
        source: `import { TextField } from "@claymo/solid";

export default function Example() {
  return (
    <div>
      <TextField
        label="Cost"
        type="number"
        defaultValue={50}
        min={0}
        variant="filled"
        startAdornment={<span aria-hidden="true">$</span>}
        endAdornment={<span aria-hidden="true">USD</span>}
      />
      <TextField label="Notes" name="notes" multiline rows={4} fullWidth helperText="Add delivery instructions." />
    </div>
  );
}
`,
      },
    ],
  },
  Autocomplete: {
    props: {
      value: {
        ...autocompleteValue,
        description:
          "Controlled selection: a string or null in single mode, or an array of strings in multiple mode.",
      },
      defaultValue: {
        ...autocompleteValue,
        description:
          "Initial and form reset selection when uncontrolled. Defaults to no selection.",
      },
      form: externalForm,
    },
    required: ["options", "label"],
    content: [],
    events: [
      "onChange(event, value): runs on a user selection change with the native event and new value (string or null for single selection; string[] for multiple). Form reset does not fire it.",
    ],
    examples: [
      {
        title: "Tags (multiple)",
        source: `import { Autocomplete } from "@claymo/solid";

const options = [
  { label: "TypeScript", value: "typescript" },
  { label: "Astro", value: "astro" },
  { label: "Svelte", value: "svelte" },
  { label: "Playwright", value: "playwright" },
];

export default function Example() {
  return <Autocomplete label="Tags" options={options} multiple filterSelectedOptions defaultValue={["typescript", "astro"]} placeholder="Find a tag" />;
}
`,
      },
      {
        title: "Creatable tags (freeSolo)",
        source: `import { createSignal } from "solid-js";
import { Autocomplete } from "@claymo/solid";

const options = ["CSS", "Accessibility", "TypeScript"];

export default function Example() {
  const [topics, setTopics] = createSignal(["TypeScript"]);
  return (
    <>
      <Autocomplete label="Topics" options={options} multiple freeSolo value={topics()} onChange={(_, next) => setTopics(next)} />
      <p>Selected values: <output aria-label="Selected topics">{topics().join(", ") || "None"}</output></p>
    </>
  );
}
`,
      },
      {
        title: "Single value in a form",
        source: `import { createSignal } from "solid-js";
import { Autocomplete, Button } from "@claymo/solid";

const options = [{ label: "Paper", value: "paper" }, { label: "Digital", value: "digital" }];

export default function Example() {
  const [submitted, setSubmitted] = createSignal("");
  return (
    <form onSubmit={(event) => {
      event.preventDefault();
      setSubmitted(String(new FormData(event.currentTarget).get("shelf") ?? ""));
    }}>
      <Autocomplete label="Shelf" name="shelf" required options={options} />
      <Button type="submit">Save shelf</Button>
      <Button type="reset" variant="outlined">Reset</Button>
      <p>Submitted value: <output aria-label="Submitted shelf">{submitted()}</output></p>
    </form>
  );
}
`,
      },
    ],
  },
};
