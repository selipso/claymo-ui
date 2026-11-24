/**
 * Runs `apply` once a native form reset has restored control values. The `reset` event fires
 * before the fields reset (and a microtask still runs too early), so `apply` is deferred one task.
 * Listens on the control's root node so dynamic `form` attributes and Shadow DOM work, and honors
 * `event.preventDefault()`. Returns a detach function.
 */
export function afterFormReset(
  control: { readonly form: HTMLFormElement | null } & Partial<Pick<Node, "getRootNode">>,
  apply: () => void,
): () => void {
  const target: EventTarget | null =
    typeof control.getRootNode === "function" ? control.getRootNode() : control.form;
  const onReset = (event: Event) => {
    const form = control.form;
    if (!form || event.target !== form || event.defaultPrevented) return;
    setTimeout(() => {
      if (!event.defaultPrevented) apply();
    });
  };
  target?.addEventListener("reset", onReset);
  return () => target?.removeEventListener("reset", onReset);
}
