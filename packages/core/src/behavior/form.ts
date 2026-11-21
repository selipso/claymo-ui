/**
 * Runs `apply` once a native form reset has restored control values. The `reset` event fires
 * before the fields reset (and a microtask still runs too early), so `apply` is deferred one task.
 * Returns a detach function.
 */
export function afterFormReset(
  control: { readonly form: HTMLFormElement | null },
  apply: () => void,
): () => void {
  const form = control.form;
  const later = () => setTimeout(apply);
  form?.addEventListener("reset", later);
  return () => form?.removeEventListener("reset", later);
}
