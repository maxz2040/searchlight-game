// Build-time guard: every CreatureKind referenced by any level must resolve
// to either a PNG sprite (preferred, canonical painterly art) or an
// SvgCreature fallback. If a level adds a kind with no PNG and no SVG entry,
// the game would render an empty <div> at runtime — this test catches that
// at CI time instead of in the spotlight beam.
//
// If you add a new kind to a level: regenerate the PNG via
// `npm run sprites:generate` (preferred) or add an SvgCreature entry in
// src/creatures/svgs-{a,b,c}.tsx as a placeholder.

import { describe, it, expect } from 'vitest';
import { LEVELS } from '../levels/levels';
import { ROSTER } from '../creatures/roster';
import { PNG_KINDS } from '../creatures/png-manifest';
import { SVG_KINDS } from '../components/SvgCreature';

describe('creature asset coverage', () => {
  const levelKinds = new Set<string>();
  for (const lvl of LEVELS) {
    for (const c of lvl.creatures) {
      levelKinds.add(c.kind);
    }
  }

  it('every kind used in a level resolves to a PNG or SvgCreature entry', () => {
    const missing: string[] = [];
    for (const kind of levelKinds) {
      const hasPng = PNG_KINDS.has(kind as never);
      const hasSvg = SVG_KINDS.has(kind as never);
      if (!hasPng && !hasSvg) missing.push(kind);
    }
    expect(missing, `unrenderable kinds (need PNG or SvgCreature): ${missing.join(', ')}`).toEqual([]);
  });

  it('every kind in ROSTER resolves to a PNG or SvgCreature entry', () => {
    const missing: string[] = [];
    for (const entry of ROSTER) {
      const hasPng = PNG_KINDS.has(entry.id as never);
      const hasSvg = SVG_KINDS.has(entry.id as never);
      if (!hasPng && !hasSvg) missing.push(entry.id);
    }
    expect(missing, `roster entries without renderer: ${missing.join(', ')}`).toEqual([]);
  });

  it('PNG manifest entries reference real /creatures/<kind>.png URLs', async () => {
    const { PNG_SPRITE } = await import('../creatures/png-manifest');
    for (const [kind, url] of Object.entries(PNG_SPRITE)) {
      expect(url).toBe(`/creatures/${kind}.png`);
    }
  });
});
