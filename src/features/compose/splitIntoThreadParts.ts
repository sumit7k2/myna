/**
 * Split a long text into thread parts where each part is at most `max` characters.
 *
 * Rules:
 * - Prefer splitting on whitespace boundaries to keep words intact
 * - Preserve original whitespace and newlines
 * - If a single token (word or whitespace run) exceeds `max`, it will be hard-split
 * - Empty input returns an empty array
 */
export function splitIntoThreadParts(text: string, max = 500): string[] {
  if (!text) return [];
  if (max <= 0) return [text];

  if (text.length <= max) return [text];

  const tokens = text.match(/\S+|\s+/g) || [text];
  const parts: string[] = [];
  let current = '';

  const pushCurrent = () => {
    if (current.length > 0) {
      parts.push(current);
      current = '';
    }
  };

  for (const token of tokens) {
    if (token.length > max) {
      // If the current buffer has anything, flush it first so we don't exceed max
      pushCurrent();
      // Hard split this oversized token into chunks
      let start = 0;
      while (start < token.length) {
        const end = Math.min(start + max, token.length);
        const chunk = token.slice(start, end);
        if (chunk.length === max) {
          parts.push(chunk);
        } else {
          // If last chunk is smaller than max, keep it in current to allow combining with subsequent tokens
          current = chunk;
        }
        start = end;
      }
      continue;
    }

    if (current.length + token.length <= max) {
      current += token;
    } else {
      pushCurrent();
      current = token;
    }
  }

  pushCurrent();
  return parts;
}

export default splitIntoThreadParts;
