import { apolloClient } from '@/lib/apollo';
import { gql } from '@apollo/client';
import {
  getQueue,
  markProcessing,
  markFailed,
  markDone,
  type QueuedThread
} from './offlineQueue';

export type Sender = (entry: QueuedThread) => Promise<void>;

const CREATE_POST = gql`
  mutation CreatePost($content: String!) {
    createPost(content: $content) { id }
  }
`;

async function defaultSender(entry: QueuedThread) {
  // For simplicity, post only the first part. In a real app, we'd chain each part.
  const content = entry.parts[0] || entry.text;
  await apolloClient.mutate({ mutation: CREATE_POST, variables: { content } });
}

function backoffMs(attempt: number, base = 200, max = 5000) {
  const exp = Math.min(max, base * Math.pow(2, Math.max(0, attempt - 1)));
  // add small jitter (+/- 25%)
  const jitter = exp * 0.25;
  return Math.floor(exp + (Math.random() * jitter - jitter / 2));
}

let processing = false;
let interval: any | null = null;

export async function processDue(sender: Sender = defaultSender) {
  if (processing) return;
  processing = true;
  try {
    const now = Date.now();
    const q = getQueue();
    const due = q.filter((e) => e.status === 'queued' || (e.status === 'failed' && (e.nextAttemptAt ?? 0) <= now));

    for (const entry of due) {
      // mark processing
      markProcessing(entry.id);
      try {
        await sender(entry);
        markDone(entry.id);
      } catch (err: any) {
        const prevAttempt = entry.attempt ?? 0;
        const attempt = prevAttempt + 1;
        const wait = backoffMs(attempt);
        const next = Date.now() + wait;
        const message = err?.message || 'Unknown error';
        markFailed(entry.id, message, next, attempt);
      }
    }
  } finally {
    processing = false;
  }
}

export function startQueueProcessor(sender: Sender = defaultSender, tickMs = 250) {
  if (interval) return () => stopQueueProcessor();
  interval = setInterval(() => {
    void processDue(sender);
  }, tickMs);
  return () => stopQueueProcessor();
}

export function stopQueueProcessor() {
  if (interval) clearInterval(interval);
  interval = null;
}
