# AURAX design system — master rules

Source of truth for how AURAX looks and behaves. Page-specific rules go in `pages/<page>.md` next
to this file and override it. Code: `src/styles/tokens.css` (tokens), `src/styles/aura.css`
(shared classes), `src/components/ui/Icon.jsx` (icons), `src/hooks/useDialog.js` (dialogs).

## Identity
- Deep indigo night (`--ax-night #15122e`), never pure black. Raised surfaces are dusk (`--ax-dusk`).
- One interactive colour: cyan (`--ax-cyan`). Violet and rose appear only inside the aura ring /
  brand mark (`--ax-aura`). Marigold means money. Green = success, coral = error and LIVE.
- Type: Bricolage Grotesque for display headings, Instrument Sans for everything else.
- Depth comes from hairline borders (`--ax-line`); shadows only on floating layers (menus,
  dialogs, toasts, the floating button).

## Tokens (three layers)
1. **Primitive** — raw values: `--ax-night`, `--ax-cyan`, `--ax-s4`, `--ax-r-md`…
2. **Semantic** — purpose: `--ax-bg`, `--ax-surface`, `--ax-border`, `--ax-text-secondary`,
   `--ax-success` / `--ax-danger` / `--ax-warning` / `--ax-info` (+ `-soft` backgrounds),
   `--ax-link`, `--ax-z-*` layers.
3. **Component** — `--ax-control-h` (44px), `--ax-input-h` (46px), `--ax-card-pad`,
   `--ax-card-radius`, `--ax-modal-radius`, `--ax-min-text` (12px).

New or updated CSS uses semantic/component tokens. No raw hex, no ad-hoc z-index, no new radius
values. `src/styles/design-system.css` is legacy and deprecated (see its header).

| Scale | Values |
|---|---|
| Type | xs 12.8 · sm 14 · md 16 · lg 20 · xl 25 · 2xl 31 · 3xl 39 · 4xl 49 (px) |
| Space | 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 |
| Radius | xs 6 (chips) · sm 10 (buttons, inputs) · md 14 (cards, panels) · lg 20 (dialogs, hero surfaces) · pill |
| Motion | 140ms fast · 220ms default · 360ms slow; easing `--ax-ease` |
| Layers | raised 10 · fab 40 · sticky 100 · nav 1000 · banner 1100 · dropdown 1200 · drawer 1300 · cursor light 9990 · modal 9999 · toast 10000 |

## Shared building blocks
- Buttons: `.ax-btn` + `--primary` (cyan fill, one per view) / `--ghost` / `--danger`. 44px tall.
- Icons: `<Icon name="…" />` (SVG, `currentColor`). **No emoji as icons.**
- Dialogs: `useDialog(open, onClose)` + `role="dialog" aria-modal="true" aria-labelledby` +
  a close button with `aria-label="Close"`. Escape closes; focus is trapped and restored.
- Cards: `--ax-surface`, 1px `--ax-border`, `--ax-card-radius`; hover changes border/background,
  never lifts or bounces.

## Page patterns
- Pages under the public navbar clear it: `padding-top: calc(var(--navbar-height, 90px) + …)`
  (mobile: `--navbar-mobile-height`, 70px).
- Every data view has four states: **loading** (static placeholders, no pulsing), **empty**
  (what it means + the next action), **error** (plain words + Try again), **ready**.
- Numbers are real (from the API) or not shown. Self-reported values are labelled as such.
- One `h1` per page.

## Accessibility (must)
- Text contrast ≥ 4.5:1 (the text tokens are documented with their ratios).
- Visible focus on everything interactive (`--ax-focus`); never remove an outline without a
  replacement.
- Nothing readable below 12px. Touch targets ≥ 44px.
- Icon-only controls have `aria-label`; decorative SVG has `aria-hidden="true"`.
- Respect `prefers-reduced-motion` (no movement, instant transitions).

## Avoid (from the anti-slop review)
- Purple→blue gradients (`#667eea → #764ba2` and similar), gradient text, glass/neumorphic/neon
  effect classes, floating/bobbing hovers, pulsing skeletons, emoji icons, "Transform your X"
  hero copy, claims about features that don't exist.
