import { describe, expect, it } from 'vitest';
import {
  calculateTokenScore,
  evaluateInteractiveMatch,
  normalizeMatchText,
  parseInteractiveScript,
} from '../js/features/interactive-engine.js';

const script = `
#shipping
trigger: kargo, teslimat
alias: paket nerede, kargom nerede
---
Destek | Kargonuzu kontrol ediyorum.

#support
trigger: destek, yardim
alias: destek lazim, yardim eder misin
---
Destek | Size yardimci olayim.

#default
trigger: *
---
Destek | Bunu anlayamadim.
`;

function parseBlocks(source = script) {
  return parseInteractiveScript(source);
}

describe('interactive matching', () => {
  it('normalizes input for matching', () => {
    expect(normalizeMatchText('  KARGO   Nerede  ')).toBe('kargo nerede');
  });

  it('parses aliases separately from triggers', () => {
    const { blocks } = parseBlocks();
    const shipping = blocks.find(block => block.name === 'shipping');

    expect(shipping.triggers).toEqual(['kargo', 'teslimat']);
    expect(shipping.aliases).toEqual(['paket nerede', 'kargom nerede']);
  });

  it('keeps exact match as the first priority', () => {
    const { blocks, defaultBlock } = parseBlocks(`
#short
trigger: kar
---
Destek | Kisa.

#exact
trigger: kargo nerede
---
Destek | Exact.

#default
trigger: *
---
Destek | Default.
`);

    const match = evaluateInteractiveMatch('kargo nerede', blocks, defaultBlock, {
      contains: true,
      scoreFallback: true,
    });

    expect(match.type).toBe('exact');
    expect(match.block.name).toBe('exact');
  });

  it('does not use contains matching when the option is off', () => {
    const { blocks, defaultBlock } = parseBlocks();
    const match = evaluateInteractiveMatch('kargo nerede acaba', blocks, defaultBlock, {
      contains: false,
      scoreFallback: false,
    });

    expect(match.type).toBe('default');
    expect(match.block.name).toBe('default');
  });

  it('matches trigger text with contains mode', () => {
    const { blocks, defaultBlock } = parseBlocks();
    const match = evaluateInteractiveMatch('kargo nerede acaba', blocks, defaultBlock, {
      contains: true,
    });

    expect(match.type).toBe('contains');
    expect(match.term).toBe('kargo');
    expect(match.block.name).toBe('shipping');
  });

  it('matches alias text with contains mode', () => {
    const { blocks, defaultBlock } = parseBlocks();
    const match = evaluateInteractiveMatch('paket nerede bilgi verir misin', blocks, defaultBlock, {
      contains: true,
    });

    expect(match.type).toBe('contains');
    expect(match.source).toBe('alias');
    expect(match.term).toBe('paket nerede');
    expect(match.block.name).toBe('shipping');
  });

  it('uses token score fallback when no exact or contains match exists', () => {
    const { blocks, defaultBlock } = parseBlocks();
    const match = evaluateInteractiveMatch('paket durumu nedir', blocks, defaultBlock, {
      scoreFallback: true,
    });

    expect(match.type).toBe('score');
    expect(match.source).toBe('alias');
    expect(match.block.name).toBe('shipping');
    expect(match.score).toBeGreaterThan(0);
  });

  it('keeps default fallback when no candidate matches', () => {
    const { blocks, defaultBlock } = parseBlocks();
    const match = evaluateInteractiveMatch('tamamen alakasiz', blocks, defaultBlock, {
      contains: true,
      scoreFallback: true,
    });

    expect(match.type).toBe('default');
    expect(match.block.name).toBe('default');
  });

  it('selects the strongest scoring candidate deterministically', () => {
    const { blocks, defaultBlock } = parseBlocks(`
#generic
trigger: paket
alias: paket bilgi
---
Destek | Genel.

#specific
trigger: teslimat
alias: paket nerede bilgi
---
Destek | Detay.
`);

    const match = evaluateInteractiveMatch('paket nerede bilgi', blocks, defaultBlock, {
      scoreFallback: true,
    });

    expect(match.type).toBe('exact');
    expect(match.block.name).toBe('specific');
  });

  it('calculates token overlap score', () => {
    expect(calculateTokenScore('paket nerede bilgi', 'paket bilgi')).toBeCloseTo(2 / 3);
  });
});
