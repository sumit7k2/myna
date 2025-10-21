import { splitIntoThreadParts } from '../splitIntoThreadParts';

describe('splitIntoThreadParts', () => {
  it('returns empty array for empty input', () => {
    expect(splitIntoThreadParts('')).toEqual([]);
  });

  it('returns single part when under or equal to max', () => {
    const t1 = 'hello world';
    expect(splitIntoThreadParts(t1)).toEqual([t1]);

    const t2 = 'a'.repeat(500);
    expect(splitIntoThreadParts(t2)).toEqual([t2]);
  });

  it('splits text longer than max preserving content', () => {
    const text = 'a'.repeat(501);
    const parts = splitIntoThreadParts(text, 500);
    expect(parts.length).toBe(2);
    expect(parts[0].length).toBe(500);
    expect(parts[1].length).toBe(1);
    expect(parts.join('')).toBe(text);
  });

  it('prefers whitespace boundaries when possible', () => {
    const word = 'word';
    const text = Array.from({ length: 300 }, () => word).join(' '); // length > 500
    const parts = splitIntoThreadParts(text, 500);
    expect(parts.every((p) => p.length <= 500)).toBe(true);
    expect(parts.join('')).toBe(text);
  });

  it('handles long tokens by hard splitting', () => {
    const longWord = 'x'.repeat(600);
    const text = `start ${longWord} end`;
    const parts = splitIntoThreadParts(text, 500);
    expect(parts.length).toBeGreaterThan(1);
    expect(parts.every((p) => p.length <= 500)).toBe(true);
    expect(parts.join('')).toBe(text);
  });

  it('preserves whitespace and newlines', () => {
    const text = 'Line 1\n\nLine 2\n  indented  ';
    const parts = splitIntoThreadParts(text, 10);
    expect(parts.join('')).toBe(text);
  });
});
