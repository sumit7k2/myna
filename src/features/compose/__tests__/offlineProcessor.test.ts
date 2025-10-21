import { enqueue, clearQueue, getQueue } from '../offlineQueue';
import { processDue, startQueueProcessor, stopQueueProcessor, type Sender } from '../offlineProcessor';

jest.useFakeTimers();

describe('offlineProcessor retry/backoff', () => {
  beforeEach(() => {
    clearQueue();
    stopQueueProcessor();
    jest.clearAllTimers();
  });

  it('retries failed items with exponential backoff and eventually succeeds', async () => {
    enqueue('Test post', ['Test post'], []);

    let attempts = 0;
    const sender: Sender = async () => {
      attempts += 1;
      if (attempts < 3) {
        throw new Error('Network error');
      }
      // success on third attempt
    };

    // Start a fast processor loop
    startQueueProcessor(sender, 50);

    // First tick processes and fails
    await Promise.resolve();
    jest.advanceTimersByTime(60);

    // Let timers advance to allow backoff retries
    jest.advanceTimersByTime(500);

    // Queue should be empty after success
    expect(getQueue().length).toBe(0);
  });
});
