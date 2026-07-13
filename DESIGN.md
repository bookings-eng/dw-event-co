---
name: DW Event Co
description: Party & event rental storefront — friendly, local, pill-and-card system in fresh green and soft linen
colors:
  brand-green: "#209d50"
  brand-green-deep: "#187a3d"
  soft-linen: "#f5f5f3"
  charcoal-ink: "#1a1a1a"
  near-black: "#14171a"
  surface-white: "#ffffff"
  backdrop-warm: "#f5f4ed"
  status-pending-bg: "#fef9c3"
  status-pending-text: "#854d0e"
  status-alert: "#dc2626"
typography:
  display:
    fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.2em"
rounded:
  pill: "9999px"
  card: "16px"
  control: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  section: "64px"
components:
  button-primary:
    backgroundColor: "{colors.brand-green}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.brand-green-deep}"
  button-primary-large:
    backgroundColor: "{colors.brand-green}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.pill}"
    padding: "16px 32px"
  card:
    backgroundColor: "{colors.surface-white}"
    rounded: "{rounded.card}"
    padding: "20px"
  badge-brand:
    backgroundColor: "#e9f5ee"
    textColor: "{colors.brand-green}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  input:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.charcoal-ink}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
---

# Design System: DW Event Co

## 1. Overview

**Creative North Star: "The Front Porch Handoff"**

DW Event Co's interface should feel like a neighbor showing up with exactly what you asked for, on time, with a smile — not a faceless checkout flow. Every surface stays soft-edged and legible: pill-shaped buttons, gently rounded cards, a warm neutral canvas, and one confident brand green used to mark the actions and states that matter (availability, primary CTAs, active selections). The system is deliberately unglamorous in its neutrals so the green — and the words next to it — can do the work.

This build inherits the live flow of dweventco.com (hero with date picker → browse/quote → checkout) and should refine that path rather than restructure it. The system explicitly rejects a faceless-marketplace or generic-SaaS feel: no cold corporate grids, no manufactured trust badges standing in for real proof, no visual flourish that doesn't help someone get from "I need chairs for Saturday" to a booked, paid order.

**Key Characteristics:**
- Pill-shaped controls (buttons, badges, calendar cells, the cart icon) as the dominant interactive shape
- Rounded-corner cards (16px) on a soft, low-chroma neutral canvas
- One saturated brand green, used sparingly and consistently for actions, availability, and active state
- Gentle shadow lift on hover rather than heavy layering — depth is a hint, not a statement
- Text hierarchy built from opacity steps on a single ink color, not a palette of grays

## 2. Colors

A restrained palette: one saturated accent, a small set of near-neutral surfaces, and two narrow functional colors for status. The accent carries meaning (available, active, go); everything else stays quiet so it doesn't compete.

### Primary
- **Fresh Grass Green** (#209d50): The single brand accent. Primary buttons, active calendar days, availability badges, focus rings, footer accent bar, cart-count badge. Used deliberately, not decoratively — if it's green, it's actionable or it's telling you something is available.
- **Fresh Grass Green, Deep** (#187a3d): Hover/pressed state for anything using the primary green. Never used at rest.

### Neutral
- **Soft Linen** (#f5f5f3): Page background. A near-neutral warm gray, not a saturated cream — it reads as quiet paper, not as a styling statement.
- **Charcoal Text** (#1a1a1a): Default body and heading text (`--foreground`).
- **Near-Black** (#14171a): Deepest surface color (`--ink`) — footer background, the small logo badge in the solid header. Distinct from Charcoal Text; used as a surface, not as a text color.
- **Surface White** (#ffffff): Cards, modals, the solid (non-overlay) header bar, inputs.
- **Backdrop Warm** (#f5f4ed): Base tone for the Products page's decorative backdrop wash — paired with soft brand-green radial glows and a faint dot-grid texture. Page-specific; not a general-purpose surface color.

### Status
- **Pending** (bg #fef9c3 / text #854d0e): Payment-pending badge in the admin table. The only warm-hued status color in the system — reserve it for "needs attention," not for anything decorative.
- **Alert** (#dc2626): Insufficient-availability warnings in the cart/checkout. Text only, no background fill — keep it rare and specific to real problems.

### Named Rules
**The One Green Rule.** Fresh Grass Green appears only on things a user can act on or that report live availability. It never appears as pure decoration (no green headlines, no green dividers for their own sake) — the blurred brand-green glows in the Footer and Products backdrop are the one deliberate exception, and stay at low opacity (≤20%) so they read as atmosphere, not accent.

## 3. Typography

**Display/Body Font:** Geist Sans (via `next/font/google`), falling back to Arial/Helvetica/sans-serif
**Mono Font:** Geist Mono is loaded but not currently used in any visible UI — leave it wired for future code/number-forward contexts (e.g. a receipts view), don't force it into use.

**Character:** One typeface, multiple weights — no serif/sans pairing. Hierarchy comes from size, weight, and tracking, not from switching families. This keeps the system fast and unfussy, matching the "no phone call needed" positioning.

### Hierarchy
- **Display** (weight 800, `clamp(2.25rem, 5vw, 3.75rem)`, line-height 1.05, tracking -0.02em): The homepage hero headline only ("Get a Quote Instantly!"). Reserve for the single most important line on a page.
- **Headline** (weight 700, 1.875rem/30px, line-height 1.2): Section and page titles — "Frequently Asked Questions," "Checkout."
- **Title** (weight 700, 1.125rem/18px, line-height 1.3): Card and modal titles — "Your Cart," "Choose your event date," product names.
- **Body** (weight 400–500, 0.875rem/14px, line-height 1.6): Default UI and copy text. Muted variants use opacity on Charcoal Text (`/80`, `/70`, `/60`, `/50`, `/40`) rather than a separate gray palette — pick the opacity step by how important the text is, not by convention.
- **Label** (weight 600, 0.75rem/12px, line-height 1.4, tracking 0.2em, uppercase): Small structural labels — Footer column headers, the "FAQ" eyebrow. Used sparingly (a handful of places, not every section) — see Do's and Don'ts.

### Named Rules
**The Opacity-Not-Gray Rule.** Secondary and tertiary text is Charcoal Text at reduced opacity (`text-foreground/70`, `/50`, etc.), never a separate named gray. This keeps every text color perceptibly related to the same ink, and keeps contrast decisions explicit and testable per instance.

## 4. Elevation

Flat by default, with a soft ambient lift on interaction — not Material-style tonal layering. Cards and interactive panels sit at rest with a barely-there shadow, and gain a slightly stronger one on hover as the only depth cue that something is interactive. Modals get a visibly heavier shadow plus a dark scrim, so they read as unambiguously above the page. A second, decorative kind of "elevation" — soft blurred brand-green glows — is used purely atmospherically on the Footer and the Products backdrop; it signals warmth, not stacking order.

### Shadow Vocabulary
- **Resting card** (`box-shadow: 0 1px 2px rgba(0,0,0,0.05)` — Tailwind `shadow-sm`): Default state for product cards, FAQ items, cart/checkout panels.
- **Hover lift** (`box-shadow: 0 4px 6px rgba(0,0,0,0.07)` — Tailwind `shadow-md`): Card hover state only. Pairs with a `transition-shadow`, never instant.
- **Hero CTA** (`box-shadow: 0 10px 15px rgba(0,0,0,0.1)` — Tailwind `shadow-lg`): The one button on the page that needs to visually pop off a photo background.
- **Modal** (`box-shadow: 0 20px 25px rgba(0,0,0,0.1)` — Tailwind `shadow-xl`) over a `bg-black/50` scrim: Date picker, product detail, and any future dialog.

### Named Rules
**The Ambient-Not-Architectural Rule.** Shadows here communicate "this is touchable" or "this is above everything else" — never used to fake a layered surface system. If a shadow isn't attached to hover or an overlay, it shouldn't be there.

## 5. Components

Friendly and approachable throughout: soft edges everywhere, nothing sharp-cornered or clinical. Pills for anything you tap to act; rounded cards for anything you read.

### Buttons
- **Shape:** Fully rounded / pill (`border-radius: 9999px`) — the system's single most consistent signature, used identically for primary CTAs, quantity steppers, icon buttons, and calendar-day selection.
- **Primary:** Fresh Grass Green background, white text, semibold weight (`padding: 8px 16px` standard; `16px 32px` for the homepage hero CTA, which also carries the Hero-CTA shadow).
- **Hover:** Background steps to Fresh Grass Green, Deep. No scale/transform — a pure color transition (`transition-colors`).
- **Ghost / Icon:** Transparent background, `hover:bg-black/5` (or `hover:bg-white/10` on the photo-overlay header). Used for the phone-number link, close buttons, calendar nav arrows, the cart icon.
- **Disabled:** `bg-black/5`, muted text at 40% opacity, `cursor-not-allowed` — never just a lower-opacity copy of the primary button.

### Badges / Chips
- **Availability pill:** Fresh Grass Green at ~10% opacity background (`#e9f5ee`), Fresh Grass Green text, fully rounded, `padding: 4px 10px`, `text-xs font-medium`. Used for "N available" and for payment-status badges that mean "good" (paid/deposit paid).
- **Muted pill:** `bg-black/5`, Charcoal Text at 50% opacity — same shape, for "Unavailable" and neutral states.
- **Pending pill:** Pending status color pair (`#fef9c3` / `#854d0e`) — reserved for payment-status "needs attention" in the admin table only.

### Cards / Containers
- **Corner Style:** 16px radius (`rounded-2xl`) on every card — product cards, FAQ items, cart summary, checkout form sections, the date-picker modal body.
- **Background:** Surface White, always — cards never sit on anything but a solid white fill.
- **Shadow Strategy:** Resting card → Hover lift (see Elevation). Static/non-interactive cards (checkout form sections) keep the resting shadow only, no hover state.
- **Internal Padding:** 20px (`p-5`), stepping to 24px (`p-6`) at `sm:` and above.

### Inputs / Fields
- **Style:** 8px radius (`rounded-lg`, distinct from the card radius), `border border-black/10`, Surface White background, `padding: 8px 12px`.
- **Focus:** Border shifts to Fresh Grass Green, `outline: none` — no glow/ring, the border color change is the entire focus signal.
- **Label:** Small (`text-sm`), stacked above the field, part of the same `<label>` element — not floating/inline.

### Navigation
- **Two header modes, same component:** `overlay` (transparent, absolute-positioned, white text and icons, sits inside the Hero over a photo with a dark gradient scrim behind it) and solid (`sticky`, white/95 with backdrop-blur, `border-b border-black/5`, Charcoal Text). Interior pages use solid; the homepage hero uses overlay.
- **Brand mark:** Wordmark + "Party & Event Rentals" kicker on solid pages; logo image only on overlay.
- **Cart indicator:** Pill icon button with a small circular Fresh Grass Green count badge, top-right, in both header modes.

### Modal / Dialog
- **Structure:** Fixed full-screen `bg-black/50` scrim, centered white panel, 16px radius, Modal shadow, `p-5 sm:p-6`. Closes on scrim click, Escape key, and an explicit ghost close button (top-right).
- **Used for:** Date range picker, product detail. Keep this as the one modal pattern — don't introduce a second dialog style (e.g. a slide-over) without a strong reason.

## 6. Do's and Don'ts

### Do:
- **Do** keep Fresh Grass Green tied to action and availability — buttons, active states, "in stock," cart count. If it's not one of those, it probably shouldn't be green.
- **Do** use the pill shape (9999px) for every tappable control, and reserve the 16px card radius for containers you read rather than tap.
- **Do** build secondary/muted text from opacity on Charcoal Text (`/40` through `/80`), not a separate gray scale.
- **Do** keep new dialogs and overlays inside the existing modal pattern (dark scrim + white rounded-2xl panel) rather than introducing drawers, toasts, or a second overlay language.
- **Do** preserve the existing site flow — hero with date picker → browse/quote → checkout — when extending or restyling pages; changes should refine this path, not restructure it (per PRODUCT.md).
- **Do** lean on transparent pricing and a clearly stated service area as trust signals; there are no testimonials/reviews to feature yet, so don't fake that proof with placeholder quotes or stock "5-star" iconography.

### Don't:
- **Don't** introduce a second accent color. If something new needs a color beyond Fresh Grass Green and the two status colors, treat that as a design decision to flag, not a default to reach for.
- **Don't** spread the uppercase-tracked label pattern (Footer headers, the FAQ eyebrow) onto every section — it's a light, occasional structural marker in this system, not a standing kicker above each block.
- **Don't** use `border-left`/`border-right` colored stripes as a card or list accent anywhere in this system.
- **Don't** use gradient text (`background-clip: text` on a gradient) — emphasis comes from weight/size/color, never a text gradient.
- **Don't** use glassmorphism/backdrop-blur as a default card treatment — the one approved `backdrop-blur` use is the solid sticky header, not a general pattern.
- **Don't** darken the neutral background toward a heavier cream/tan — Soft Linen is intentionally close to neutral gray; don't let it drift toward the saturated "warm SaaS beige" the palette explicitly avoids.
- **Don't** stack multiple shadows or add Material-style tonal surface layers — one resting shadow, one hover shadow, done.
