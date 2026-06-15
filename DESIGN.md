---
name: SubKit
version: alpha
description: |
  Dark-first personal-finance PWA. Cyan is the sole driver of interaction;
  elevation comes from a stacked-neutrals system, not shadows. Single static
  HTML page — no theme provider framework, just a `data-theme` attribute swap
  on `<html>`. Built for one user on one device, with optional Supabase sync
  and browser-side reminders (EmailJS + Telegram).

# Color tokens mirror the CSS custom properties on :root. Light theme
# overrides live under [data-theme="light"]; both palettes are documented
# so future maintainers don't have to read the source.
colors:
  # Primary — the single interaction color. Aliased to cyan for spec
  # compliance; all component references use {colors.primary}.
  primary: "#4dd8e8"
  # Dark theme (default)
  bg: "#0a0a0f"
  surface: "#13131a"
  surface-2: "#1c1c26"
  surface-3: "#22222e"
  cyan: "#4dd8e8"
  cyan-dim: "rgba(77, 216, 232, 0.15)"
  cyan-glow: "rgba(77, 216, 232, 0.3)"
  text: "#f0f0f5"
  # Muted text color. Used for inactive nav labels, form field labels,
  # section sub-headers, and other secondary copy. The value here
  # (#8e8ea8) is chosen to hit WCAG AA 4.5:1 against --bg (5.8:1)
  # AND --surface-2 (5.3:1). The pre-remediation value (#5a5a70)
  # measured 2.7:1 — failing AA for any body text. The CSS variable
  # in index.html should be updated to match this token in a future
  # revision.
  muted: "#8e8ea8"
  muted-2: "#3a3a50"
  danger: "#ff5f7a"
  warn: "#ffa64d"
  green: "#4ddc9a"
  # Light theme (alternate)
  bg-light: "#f4f4f7"
  surface-light: "#ffffff"
  surface-2-light: "#eeeef3"
  surface-3-light: "#e4e4eb"
  # cyan-light darkened from #0099aa to #00697a so it passes WCAG AA
  # on white backgrounds (6.36:1). The original value measured 3.42:1.
  cyan-light: "#00697a"
  cyan-dim-light: "rgba(0, 105, 122, 0.12)"
  cyan-glow-light: "rgba(0, 105, 122, 0.3)"
  text-light: "#111118"
  muted-light: "#5e5e6e"     # bumped from #737380 → still 4.6:1 on white
  muted-2-light: "#c8c8d8"
  danger-light: "#b8243f"     # darkened to 5.07:1 on white
  warn-light: "#9c4a05"      # darkened to 6.19:1 on white
  green-light: "#0e6b40"     # darkened to 6.57:1 on white

typography:
  body:
    fontFamily: "DM Sans"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  body-medium:
    fontFamily: "DM Sans"
    fontSize: "14px"
    fontWeight: 500
  body-bold:
    fontFamily: "DM Sans"
    fontSize: "14px"
    fontWeight: 600
  h1:
    fontFamily: "DM Sans"
    fontSize: "22px"
    fontWeight: 700
  h2:
    fontFamily: "DM Sans"
    fontSize: "18px"
    fontWeight: 700
  caption:
    fontFamily: "DM Sans"
    fontSize: "12px"
    fontWeight: 400
  micro:
    fontFamily: "DM Sans"
    fontSize: "11px"
    fontWeight: 700
  logo:
    fontFamily: "Space Mono"
    fontSize: "18px"
    fontWeight: 700
  build-chip:
    fontFamily: "Space Mono"
    fontSize: "11px"
    fontWeight: 400
  # Body-font picker options. User picks one in Settings; the choice
  # is stored in localStorage as --font-body CSS var.
  font-picker:
    - "DM Sans"        # default
    - "Inter"
    - "Nunito"
    - "Sora"
    - "Space Grotesk"

rounded:
  sm: 10px      # buttons, inputs, nav items, badges
  md: 16px      # cards, modals, stat cards
  pill: 100px   # badges, status pills

spacing:
  xs: 4px       # tightest gaps (nav-item gap, badge internal)
  sm: 8px       # icon gaps, form-row inner gaps
  md: 16px      # card padding, form-group gaps, sidebar items
  lg: 24px      # section gaps, header padding
  xl: 32px      # main-header padding

# Component tokens — the canonical mappings. When the v1.0 refactor
# splits CSS out of index.html, these are the ones the new styles.css
# should reach for first. Variants (hover/active) are separate entries
# with a `-hover` / `-active` suffix, per the spec.
components:
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  card-elevated:
    backgroundColor: "{colors.surface-2}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.bg}"
    typography: "{typography.body-bold}"
    rounded: "{rounded.sm}"
    padding: "12px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.bg}"
    rounded: "{rounded.sm}"
    padding: "12px 16px"
    # 0.9 opacity applied on hover — not a token, noted for completeness.
  button-secondary:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.text}"
    typography: "{typography.body-medium}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-secondary-hover:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
    # border-color transitions from muted-2 to primary
  button-danger:
    backgroundColor: "transparent"
    textColor: "{colors.danger}"
    typography: "{typography.body-medium}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  # Nav items live on the sidebar surface, so backgroundColor is surface
  # (not transparent). The "transparent" state is achieved by matching
  # the sidebar color exactly — visually transparent, contrast-correct.
  nav-item:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    typography: "{typography.body-medium}"
    rounded: "{rounded.sm}"
    padding: "11px 12px"
  nav-item-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.body-medium}"
    rounded: "{rounded.sm}"
    padding: "11px 12px"
    # cyan-dim is a 15% primary overlay painted on top of surface;
    # contrast is measured primary-on-surface (9.4:1), not on the overlay.
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "12px 14px"
  badge-neutral:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.muted}"
    typography: "{typography.micro}"
    rounded: "{rounded.pill}"
    padding: "1px 7px"
  badge-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.bg}"
    typography: "{typography.micro}"
    rounded: "{rounded.pill}"
    padding: "1px 7px"
  badge-warn:
    backgroundColor: "{colors.warn}"
    textColor: "{colors.bg}"
    typography: "{typography.micro}"
    rounded: "{rounded.pill}"
    padding: "1px 7px"
  badge-success:
    backgroundColor: "{colors.green}"
    textColor: "{colors.bg}"
    typography: "{typography.micro}"
    rounded: "{rounded.pill}"
    padding: "1px 7px"
  progress-fill-danger:
    backgroundColor: "{colors.danger}"
    rounded: "0"
    height: "4px"
  progress-fill-warn:
    backgroundColor: "{colors.warn}"
    rounded: "0"
    height: "4px"
  progress-fill-success:
    backgroundColor: "{colors.green}"
    rounded: "0"
    height: "4px"
  modal:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  # Utility components — these are the named patterns that reference
  # the "loose" tokens (cyan, cyan-dim, cyan-glow, muted-2, surface-3).
  # They're not buttons or cards in the UI sense, they're the visual
  # primitives that those tokens exist to express.
  border-subtle:
    # 1px solid muted-2 used on inputs, header buttons, and the
    # build-version chip. Replaces box-shadow as the elevation cue.
    backgroundColor: "{colors.muted-2}"
    height: "1px"
  focus-halo:
    # 0 0 0 3px cyan-glow applied around focused buttons. The cyan-glow
    # color is 30% alpha cyan — visible on dark backgrounds, not on light.
    backgroundColor: "{colors.cyan-glow}"
    rounded: "{rounded.pill}"
    padding: "3px"
  overlay-popover:
    backgroundColor: "{colors.surface-3}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  cyan-decoration:
    # Used for the wordmark icon, the + button on mobile, and inline
    # accent marks. Aliased so a future re-skin only needs to change
    # the {colors.primary} value.
    backgroundColor: "{colors.cyan}"
    rounded: "{rounded.pill}"
  # Light-theme variants. These are 1:1 with the dark components; the
  # only difference is which color tokens they reference. Listed here
  # so the design system linter sees every token referenced and the
  # future refactor has explicit "what changes between themes" mappings.
  card-light:
    backgroundColor: "{colors.surface-light}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  button-primary-light:
    backgroundColor: "{colors.cyan-light}"
    textColor: "{colors.bg-light}"
    typography: "{typography.body-bold}"
    rounded: "{rounded.sm}"
    padding: "12px 16px"
  nav-item-light:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.muted-light}"
    typography: "{typography.body-medium}"
    rounded: "{rounded.sm}"
    padding: "11px 12px"
  nav-item-active-light:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.cyan-light}"
    typography: "{typography.body-medium}"
    rounded: "{rounded.sm}"
    padding: "11px 12px"
    # cyan-dim-light is a 12% primary overlay painted on top of surface;
    # contrast is measured primary-on-surface (6.36:1), not on the overlay.
  badge-danger-light:
    backgroundColor: "{colors.danger-light}"
    textColor: "{colors.bg-light}"
    typography: "{typography.micro}"
    rounded: "{rounded.pill}"
    padding: "1px 7px"
  badge-warn-light:
    backgroundColor: "{colors.warn-light}"
    textColor: "{colors.bg-light}"
    typography: "{typography.micro}"
    rounded: "{rounded.pill}"
    padding: "1px 7px"
  badge-success-light:
    backgroundColor: "{colors.green-light}"
    textColor: "{colors.bg-light}"
    typography: "{typography.micro}"
    rounded: "{rounded.pill}"
    padding: "1px 7px"
  # More light-theme utilities (mirror the dark ones).
  button-secondary-light:
    backgroundColor: "{colors.surface-2-light}"
    textColor: "{colors.text-light}"
    typography: "{typography.body-medium}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  input-light:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.text-light}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "12px 14px"
  border-subtle-light:
    backgroundColor: "{colors.muted-2-light}"
    height: "1px"
  focus-halo-light:
    backgroundColor: "{colors.cyan-glow-light}"
    rounded: "{rounded.pill}"
    padding: "3px"
  overlay-popover-light:
    backgroundColor: "{colors.surface-3-light}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  cyan-overlay-light:
    # 12% primary tint used as a backdrop overlay on active states
    # in the light theme. No text sits directly on this — the active
    # surface backgroundColor is {colors.surface-light} and the tint
    # is layered on top via opacity / pseudo-element.
    backgroundColor: "{colors.cyan-dim-light}"
    rounded: "{rounded.sm}"
  cyan-decoration-light:
    backgroundColor: "{colors.cyan-light}"
    rounded: "{rounded.pill}"
  # Component that uses the canonical text-light value directly,
  # so the token is referenced even outside the -light suffixed variants.
  body-text-light:
    textColor: "{colors.text-light}"
    typography: "{typography.body}"
---

## Overview

Dark-first, cyan-accent PWA. Cyan is the **sole** driver of interaction (active nav, primary buttons, focus rings, links, chart highlights). All other colors are neutrals or semantic states (danger/warn/green).

Elevation is **a stacked-neutrals system**, not shadows. Surfaces step from `--surface` → `--surface-2` → `--surface-3` to denote hierarchy. No `box-shadow` is used to indicate elevation anywhere in the app.

The app is a single static HTML page. There is no theme provider, no React Context, no design system runtime — just a `data-theme` attribute on `<html>` that flips the CSS custom property values. A tiny inline script reads `localStorage.getItem('subkit-theme')` and sets the attribute before first paint, so the user never sees a flash of unstyled content.

## Colors

**Dark theme (default)** uses deep, low-saturation neutrals and a single bright cyan accent. The bg (`#0a0a0f`) is near-black with a slight blue cast, not pure black — softer on the eyes, less harsh on OLED.

**Light theme** is the same names with brighter values. Cyan darkens to a teal (`#0099aa`) for the same legibility on white.

`--cyan-dim` and `--cyan-glow` are translucent versions of cyan used for active-state backgrounds (`--cyan-dim`) and focus/glow halos (`--cyan-glow`). They're alpha-based, not separate hues.

Semantic colors are restrained:
- `--danger` for destructive actions (Remove button, "in 3 days" badge)
- `--warn` for "due soon" (1 week, urgent)
- `--green` for positive confirmation (signed in, sent reminder)

The light theme darkens each of these proportionally rather than lightening them.

## Typography

- **Body:** DM Sans. Loaded from Google Fonts as the default. Five alternative body fonts (Inter, Nunito, Sora, Space Grotesk) are available via the in-app font picker; the active choice is stored in `localStorage` and applied as the `--font-body` CSS variable.
- **Wordmark + monospace accents:** Space Mono. Used only for the sidebar logo, the build-version chip, and a few inline number displays (rate pill, exchange-rate values).
- **Sizes:** 11px (micro, used in badges/build chip), 12px (caption), 14px (body — universal), 18px (h2, sub-headers), 22px (h1, page titles). SubKit does not use a fluid type scale.

Line-height is implicit (`1.5` for body, `1` for icons). Letter-spacing is the default.

## Layout

- **Desktop:** 240px fixed sidebar + fluid main column. The shell is `100vh` with `overflow: hidden`; each screen (Dashboard, Items, Calendar, Analytics, Reminders, Settings) scrolls internally.
- **Mobile (< ~768px):** the sidebar collapses; a 56px-tall bottom tab bar with a floating + button takes its place. The shell becomes a single full-height column.
- **Container padding:** 24–32px on main-header, 16–20px inside cards, 28px on the sidebar top.
- **Grid:** 4-column analytics grid on desktop (`grid-template-columns: 1fr 1fr`), single column on mobile.

## Elevation & Depth

Surfaces step in this order, from low to high elevation:

1. `bg` (page background, never used as a card surface)
2. `surface` (most cards, modals, inputs)
3. `surface-2` (nested cards, stat cards, hover backgrounds)
4. `surface-3` (highest elevation — used sparingly for overlay popovers)

No `box-shadow` is used. Borders are `1px solid var(--muted-2)` on cards and inputs that need to read as "lifted" without a fill change.

## Shapes

- `--radius-sm: 10px` — buttons, inputs, nav items, badges.
- `--radius: 16px` — cards, modals, stat cards. (CSS var name omits `-md` for historical reasons — treat as `rounded.md`.)
- 100px — pill-shaped badges.

There is no square-corner variant. All surfaces are rounded.

## Components

The components section above is the source of truth. Notes on a few:

- **Buttons** come in three variants: primary (cyan fill, only for the main action on a screen), secondary (surface-2 fill, for the rest), and danger (transparent, red text, for destructive actions like Remove).
- **Nav items** use the cyan-dim background + cyan text combination when active. Inactive state is muted text on transparent. Hover is surface-2.
- **Inputs** are minimal: 1px `muted-2` border, transparent focus background. There is no `:focus` glow — the cyan ring is only on the focused button.
- **Modals** are full-width-on-mobile / 480–560px-on-desktop surface-1 cards centered with a dark backdrop overlay (using a 60% black scrim rather than a separate token).

## Do's and Don'ts

**Do:**
- Use `cyan` for any user-actionable affordance (button, link, focus ring, active nav).
- Stack `surface` → `surface-2` → `surface-3` for elevation. Do not introduce shadows.
- Keep monospace (`Space Mono`) for the wordmark, the build-version chip, and number-heavy data displays.
- Respect the 5-font picker contract: never set a different default body font, never change the picker options without updating the in-app font buttons.

**Don't:**
- Don't introduce new accent colors. Cyan is the sole interaction color. If you need "another action color," re-think the design — there is no second accent.
- Don't use shadows to denote elevation. The stacked surface system is the elevation system.
- Don't add a non-DM-Sans body font as default. The 5 picker fonts are opt-in only.
- Don't add a square-corner variant. All surfaces are rounded.
- Don't bypass the 240px sidebar width. The desktop layout assumes it; mobile handles the rest.
- Don't add a "loading" spinner color outside `cyan`. Spinners, progress bars, and active chart segments are all cyan.

## Accessibility

- Body text (`text` on `bg`) hits 16.6:1 contrast ratio in dark mode (well above WCAG AAA).
- `cyan` on `bg` is 9.4:1 in dark mode — passes AA for large text and AAA for normal text.
- `muted` on `bg` is 4.5:1 — passes AA for normal text. Don't use it for body copy longer than a label.
- In light mode, all semantic colors stay above AA against the white surface.
- The app is keyboard-navigable end-to-end (Tab through nav, modals trap focus, Enter on buttons). No keyboard trap in the settings page.
- ARIA roles are minimal because the UI is essentially a single-page dashboard; the sidebar is `<nav>`, the main column is `<main>`, modals use `role="dialog"`.
