export function rewriteContent(input: { content: string; style?: string }) {
  return {
    content: `[AI${input.style ? `:${input.style}` : ''}] ${input.content}`,
    confidence: 0.92
  };
}
