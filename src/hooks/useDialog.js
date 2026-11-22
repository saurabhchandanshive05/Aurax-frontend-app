import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Keyboard behaviour for a modal dialog: Escape closes it, focus moves into it when it opens,
// Tab stays inside it, and focus returns to where it was when it closes.
// Usage: const ref = useDialog(isOpen, onClose); <div ref={ref} role="dialog" aria-modal="true" tabIndex={-1}>
export default function useDialog(open, onClose) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const node = ref.current;
    const focusables = () =>
      node ? [...node.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null) : [];

    // Focus the first field or button (not the close button when there is something else)
    const items = focusables();
    const first = items.find((el) => !/close/i.test(el.getAttribute("aria-label") || "")) || items[0];
    (first || node)?.focus?.({ preventScroll: true });

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeRef.current?.();
        return;
      }
      if (e.key !== "Tab" || !node) return;
      const list = focusables();
      if (!list.length) {
        e.preventDefault();
        return;
      }
      const firstEl = list[0];
      const lastEl = list[list.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (previous && typeof previous.focus === "function" && document.contains(previous)) {
        previous.focus({ preventScroll: true });
      }
    };
  }, [open]);

  return ref;
}
