import { uploadToPresignedUrl } from '@/features/compose/uploadAdapter';

jest.useFakeTimers();

describe('uploadToPresignedUrl stub', () => {
  it('reports progress from 0 to 1 and resolves', async () => {
    const progresses: number[] = [];
    const promise = uploadToPresignedUrl('file://a.jpg', 'https://example.com/a.jpg', (p) => progresses.push(p), {
      steps: 3,
      stepIntervalMs: 100
    });

    // Advance timers to complete upload
    jest.advanceTimersByTime(350);

    const res = await promise;
    expect(res.ok).toBe(true);
    expect(res.url).toBe('https://example.com/a.jpg');

    // Should start at 0 and include 1 at the end
    expect(progresses[0]).toBe(0);
    expect(progresses[progresses.length - 1]).toBe(1);
    // Monotonic non-decreasing
    for (let i = 1; i < progresses.length; i++) {
      expect(progresses[i]).toBeGreaterThanOrEqual(progresses[i - 1]);
    }
  });
});
