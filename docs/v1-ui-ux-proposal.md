# Pokemon Searchlight — v1 UI/UX Proposal

A critique of v0 and a plan for the next swing. Audience: 5–9 year-olds on iPad.
Continuity over redesign — the dusky-blue lantern world stays, but it gets more
*world*, more *self*, and fewer flat overlays.

---

## What v0 got right (so we don't break it)

The core loop is genuinely magical. Drag a warm circle of light across a bruise-blue
forest, watch a chubby green friend bloom out of the dark, hear the ping. That
single interaction is the whole game and it works. The palette
(`night-deep #050714` → `spotlight-warm #fff4c8`) creates immediate atmosphere with
zero copy. The hint-pulse on idle is a thoughtful accessibility move for younger
players. Hold these. The rest of this doc is about the scaffolding *around* that
moment — which is where v0 thins out.

---

## Friction points

### 1. The complete screen is a centred Bootstrap card on a void

`Complete.tsx` renders a `bg-night-deep/95` overlay with a single column of
emoji + h2 + grid + two buttons. Worse, the celebratory `🎉` is rendering as a
tofu glyph on the desktop screenshot (`desktop__07-complete.png`) — the most
emotional moment in the loop is currently a missing-font box. Even when the emoji
*does* render, leaning on system emoji is at odds with the bespoke SVG creatures
we spent time on. It reads "AI-generated SaaS modal," not "kid finished an
adventure."

**Fix.** Replace the emoji with a custom SVG lantern bursting confetti made of
the level's palette (leaf-green flecks for Forest, pink petals for Meadow,
silver star-dust for Shore). Anchor the layout to the *bottom* of the screen
like a stage curtain, so the creatures appear to be taking a bow on a wooden
plank in front of the player rather than floating in a card. Keep the time/title,
but render them as a hand-drawn ribbon, not a centred caption. Time becomes a
souvenir, not a metric.

### 2. The reveal toast covers the creature's face

In `Scene.tsx` line 96–99, the name pill is positioned `-bottom-7` of the
creature box. On the spotlight-reveal screenshot the "Leafu" pill literally
sits across the creature's chin/mouth. The pill arrives *with* the reveal pop,
so the kid never gets a clean look at the friend they just found before being
told its name.

**Fix.** Two-stage reveal: (a) creature pops, scales 1.0 → 1.1 → 1.0 with the
ping, no label; (b) ~450ms later, a lantern-tag swings *down from above* on a
short string with the name on it. The tag attaches to the creature's head, not
its chin, and uses paper-textured background instead of pure white. This also
gives the eye time to register the character — important for kids who can't
read fluently yet.

### 3. The HUD is naked text in the top-left corner

`SceneHud` is a single bold paper-coloured string with `drop-shadow-lg`. On the
playing-fresh screenshots it almost disappears against the forest, and on
brighter scenes it competes with the spotlight. It also looks like dev chrome
rather than part of the world.

**Fix.** Wrap the level title in a small wooden signpost SVG bolted to the
top-left, with the title burned into it. Same component, three palette
variants per scene. Costs us 30 lines of SVG and gains a strong sense of place.

### 4. The remaining-tray is a row of indistinguishable grey circles

The bottom-right tray (`RemainingTray`) shows un-found creatures as
`bg-night/80 border border-paper/30` discs containing a silhouette `Creature`.
On the screenshot they read as four identical empty buttons. Kids can't use
this to plan ("which one am I still missing?") because every silhouette looks
the same in dim grey on dim grey.

**Fix.** Show un-found slots as *cards* with a subtle question-mark
silhouette + a faint coloured aura matching the creature's palette family
(green wash for Leafu, purple for Shroomi, etc.). Found slots flip with a
3D card-flip to reveal the full coloured creature + name. Now the tray is a
trophy shelf the kid wants to fill, not a status indicator.

### 5. The "🔦 / Find the hidden friends!" tutorial is an emoji block on black

`Tutorial.tsx` puts a flat circle gradient with a 🔦 emoji on a `bg-night-deep/95`
overlay. There's no demo of the actual mechanic. A 5-year-old sees a torch
icon and a button — they don't connect "drag your finger" to the verb until
they're already in the level fumbling.

**Fix.** Show the tutorial *over the first level* with a translucent
veil. Animate a glowing ghost-finger in a slow figure-8 across the screen
that drags an actual demo spotlight, revealing one demo creature, then fading.
The "Let's go" button only appears after the demo finishes. Verb taught by
imitation, no reading required.

### 6. The loader names the lantern but doesn't show one

`Loader.tsx` says "Tuning the lantern..." while displaying… a flat warm circle.
The product name is *Searchlight*. The loader is the first thing every player
sees and it's currently a generic progress-dot pattern.

**Fix.** Render an actual lantern SVG (the same one we'll use elsewhere — define
it once) being lit from below, with the flame growing as `progress` increases.
At 100% the flame "catches" with a warm bloom and the loader pushes down into
the tutorial. One asset, three uses (loader, complete screen, wooden signpost).

### 7. No sense of progression between levels

Three levels exist (`Whispering Forest`, `Meadow at Dusk`, `Starlit Shore`)
but the player flow is hard-walled: complete → next → complete → next. There's
no map, no preview, no choice. For 5–9 year-olds in particular, *picking* a
level is a meaningful agency moment.

**Fix.** Insert a level-select between Complete and the next Scene: a hand-drawn
nighttime map with three lanterns marking each level, a dotted path between
them, and small cameo silhouettes of who's hiding in each. Levels you've
finished show their creatures revealed; future levels show silhouettes only.
Cheap, charming, expandable to 6+ levels later.

### 8. The world is empty when the spotlight is parked

Look at any of the `playing-fresh` screenshots: the un-lit area is uniform
`#0a0d1f` with only the faintest creature silhouettes. There's no ambient
life. A kid who looks up from the spotlight for two seconds sees a black
screen and disengages.

**Fix.** Add ambient layers that live *outside* the spotlight: drifting
fireflies in Forest, slow petal-fall in Meadow, twinkling stars + occasional
shooting star in Shore. Each is a 4–8kb SVG sprite + a CSS keyframe, no JS.
Cheap atmosphere; transforms the dead-time between drags into a place worth
being in.

---

## The ambitious bet: **make the kid the protagonist**

v0 lets you find friends. v1 should let you *be* one.

Add a one-time "Add yourself!" onboarding step: the kid (or parent) takes a
photo with the iPad camera, the app sends it to Higgsfield's anime-style
endpoint, and ~6 seconds later the child sees themselves as a chibi anime
character, drawn in the same palette as Leafu and Shroomi. That avatar then:

- Joins the roster of "hideable" characters across all levels — they appear
  in scenes alongside the eight existing creatures, peeking out from behind
  trees or under mushrooms.
- Stars in the complete-screen lineup, taking a bow next to the friends they
  found.
- Becomes a save-slot identity: "Mira's lantern" instead of player 1.

It also makes the game *shareable* in the parent-magic-moment sense. The
parent screenshots their kid's anime self standing next to Leafu in a meadow
and that picture goes in the family group chat. We earn another ten installs
per delighted parent.

Why this is the right ambitious bet (and not, say, multiplayer): it amplifies
the existing core loop (looking for hidden friends now includes looking for
*yourself*), it reuses every level we already built, and it slots cleanly
between Loader and Tutorial without disturbing the gameplay code. The Scene
component just needs to know about an extra "creature" whose `kind` is
`avatar:<id>`. Higgsfield handles the hard part.

Risks to mitigate: the photo flow has to be *fast* (skippable to a "use a
lantern instead" default avatar if the parent doesn't want to upload), the
generated image has to feel like it belongs (style-locked Higgsfield prompt
matching our palette + line weight), and the avatar must read at small sizes
in the spotlight (chibi, big head, simplified body — same proportions as the
existing creatures). Get these right and we have a moat: *no other hidden-object
game has the kid in it.*

The mockup at `v1-mockup.html` walks the full proposed flow.
