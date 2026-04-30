# Searchlight — Impeccable shape brief

> Captured during the v3 impeccable design pass. This is the brief that
> constrains every type, colour, motion and layout choice in the iteration.

## Domain & user

- **Product**: Searchlight, a kid-friendly hidden-creature lantern game for iPad.
- **Primary user**: 5–9 year olds, often parent-supervised.
- **Secondary user**: the adult next to them — they have to want to look at it too.

## Mood & physical scene (Law 2 — pick ONE)

**The scene I'm committing to: bedtime.**

A 7-year-old propped on pillows at 7:45pm. Blackout curtain drawn. The
overhead light is off; only the warm bedside lamp is on. The iPad rests
forearm's-length away on a duvet. A parent is reading a paperback on the
edge of the bed. The room smells like clean sheets and a stick of palo
santo from earlier. Everything is honey-coloured, low-lit and quiet. The
child is winding down — they want a calm, slightly magical "last
adventure of the day" before lights out.

**Implications this scene forces on the design:**

- Tungsten warmth, not arcade brightness.
- A paper-lantern look — *the iPad IS a paper lantern in the room*.
- Hush, not hype. No bright cartoon primaries, no party hats, no
  exclamation-mark-everything. The win moment can still feel earned, but
  it has to feel *quiet-magic earned*, not Saturday-morning earned.
- Type that reads like a bedtime storybook, not a takeaway menu.
- Motion that breathes (lantern flicker, light bloom) instead of
  bouncing (spring overshoot is wrong for this scene).

## Type stance — *replace Fredoka*

Current: Fredoka (rounded display) + "SF Pro Rounded" body. **This is
pure category reflex** — the impeccable banned-pattern list calls it out
by name: *"Children's product ≠ rounded display."*

**New stance:** **Fraunces** (variable serif, soft, slightly wonky,
storybook-warm) for display + **Nunito** (humanist sans, gentle but more
distinctive than SF Pro / Inter) for body & UI. One genuine cross-axis
contrast (serif display vs humanist sans body) instead of two competing
rounded sans typefaces.

Why this works for the bedtime scene: Fraunces' SOFT optical axis at
display sizes reads like a storybook chapter heading, not a kid-poster
shout. It still has friendly, slightly imperfect glyph shapes (the `g`
double-storey, the `a` rounded) that won't intimidate a 5-year-old.

Modular scale: **1.333 (perfect fourth)**, committed. 5 sizes:
0.75 / 0.875 / 1 / 1.333 / 1.78 / 2.37 rem (sm, base, md, lg, xl, display).

## Colour stance — Restrained

Current: pink accent (#ff6b9d) + warm yellow + green leaf + blue sky +
near-pure-black night + warm-white paper. **Banned by skill** — pure-black
surfaces, hex-not-OKLCH, "rainbow" kid-palette reflex, alpha-soup overlays.

**New stance: Restrained.** ONE brand hue (warm tungsten amber, hue ≈ 70
in OKLCH, so a touch more honey than yellow), neutrals tinted toward
that hue (warm-tinted indigo for night, warm-tinted ivory for paper). No
secondary colour. The pink accent is replaced with a deeper amber
(brass) — which is the same hue family, just lower lightness.

OKLCH primitives:

- `--lantern-50`  oklch(98.5% 0.012 70)   — warm ivory paper
- `--lantern-200` oklch(92%   0.05  70)   — soft glow
- `--lantern-500` oklch(78%   0.16  72)   — tungsten flame (the brand)
- `--lantern-700` oklch(58%   0.14  62)   — brass (warm CTA accent)
- `--night-100`   oklch(28%   0.04  280)  — first-shadow indigo
- `--night-500`   oklch(18%   0.035 275)  — deep room
- `--night-900`   oklch(10%   0.03  275)  — far night (NOT pure black)

Cohesion: every neutral is tinted toward warm-indigo so warm + cool
agree. Pink, sky-blue, green-leaf vanish from the chrome (the AI
backgrounds of course retain natural colour — we don't touch art).

The confetti icon — currently a literal pink/green/blue/yellow burst —
re-rendered as warm-tone-only (paper, lantern-200, lantern-500, brass).

60-30-10: 60% deep-night surface, 30% paper text + UI, 10% lantern
(buttons, "Find this" chip, complete moment).

## Motion stance — Quiet

Current: `cubic-bezier(.34, 1.56, .64, 1)` reveal-pop = explicit
overshoot bounce — **banned**. Springs with stiffness 220–280 and
damping 14–22 — bouncy. `transition: 0.5s easeOut` on progress bar —
default-ease reflex.

**New stance: Quiet, with one Expressive moment.** Most transitions
quietly animate filter / opacity / transform-translate at ≤ 300ms with
deliberate cubic-beziers from the impeccable token set. The single
Expressive moment is the lantern bloom on creature reveal — a 640ms
gentle bloom of the spotlight, not a spring on a card.

Replace bounce easings with `cubic-bezier(0.16, 1, 0.3, 1)` (expo-out)
for entries and `cubic-bezier(0.65, 0, 0.35, 1)` for toggles. Springs
re-tuned to overshoot-free (damping ≥ 26, stiffness 200) where they
remain. `prefers-reduced-motion` honoured: animations degrade to
opacity-only fades.

Timing buckets honoured:
- 120ms — instant feedback
- 260ms — state changes (progress fill, target swap)
- 420ms — layout (tutorial slide-in)
- 640ms — entrance (loader, card reveal)

## The one memorable thing

> **The whole UI behaves like a paper lantern at bedtime.**
>
> The iPad's edges glow softly amber when it loads. The progress pill
> glows like a wick burning down. The "Find this!" chip flickers like a
> hurricane lamp behind glass. When the kid finds a creature, the
> spotlight blooms warmer for a beat, like the lantern just got a fresh
> drop of oil. The complete moment doesn't burst — it *exhales* warm
> light across the screen.
>
> Nothing in the kid-game category does this. Everyone else picks
> Fredoka + neon primaries + bouncy springs. We're picking storybook
> serif + tungsten + breathing light.

This is what makes Searchlight unforgettable as a brand: the iPad
becomes the lantern. Every UI element is a lit-thing-in-a-dark-room.

## Anti-slop checklist (Law 1)

Could each of the choices below be guessed from "kid game" alone?

- Display font: Fraunces serif → **NO** (every AI default = Fredoka).
- Body font: Nunito → **NO** (every AI default = Inter / SF Rounded).
- Palette: warm-tungsten only → **NO** (every AI default = primaries).
- Motion: quiet breathing + one bloom → **NO** (every AI default = springs / bounces).
- Memorable thing: iPad-as-lantern → **NO** (specific physical scene reference).

All five pass the anti-slop test. The choices come from the bedtime
scene (Law 2), not the category.
