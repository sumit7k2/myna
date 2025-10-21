import { getItem, setItem } from '@/lib/storage';

export type QueueStatus = 'queued' | 'processing' | 'failed';

export type QueuedThread = {
  id: string;
  text: string;
  parts: string[];
  media: string[];
  createdAt: string;
  status?: QueueStatus;
  attempt?: number;
  nextAttemptAt?: number;
  lastError?: string | null;
};

const QUEUE_KEY = 'compose.offlineQueue';

function randomId(prefix = 'q') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function normalize(item: QueuedThread): QueuedThread {
  return {
    ...item,
    status: item.status ?? 'queued',
    attempt: item.attempt ?? 0,
    nextAttemptAt: item.nextAttemptAt ?? 0,
    lastError: item.lastError ?? null
  };
}

export function getQueue(): QueuedThread[] {
  const raw = getItem<QueuedThread[]>(QUEUE_KEY, []);
  return raw.map(normalize);
}

function setQueue(items: QueuedThread[]) {
  setItem<QueuedThread[]>(QUEUE_KEY, items.map(normalize));
  notify();
}

export function clearQueue() {
  setQueue([]);
}

export function enqueue(text: string, parts: string[], media: string[]): QueuedThread {
  const q = getQueue();
  const entry: QueuedThread = {
    id: randomId(),
    text,
    parts,
    media,
    createdAt: new Date().toISOString(),
    status: 'queued',
    attempt: 0,
    nextAttemptAt: 0,
    lastError: null
  };
  const next = [entry, ...q];
  setQueue(next);
  return entry;
}

export function cancel(id: string) {
  const q = getQueue();
  setQueue(q.filter((e) => e.id !== id));
}

export function retry(id: string) {
  const q = getQueue();
  const next = q.map((e) => (e.id === id ? { ...e, status: 'queued', attempt: 0, nextAttemptAt: 0, lastError: null } : e));
  setQueue(next);
}

export function markProcessing(id: string) {
  const q = getQueue();
  const next = q.map((e) => (e.id === id ? { ...e, status: 'processing' } : e));
  setQueue(next);
}

export function markFailed(id: string, error: string, nextAttemptAt: number, attempt: number) {
  const q = getQueue();
  const next = q.map((e) => (e.id === id ? { ...e, status: 'failed', lastError: error, nextAttemptAt, attempt } : e));
  setQueue(next);
}

export function markDone(id: string) {
  const q = getQueue();
  setQueue(q.filter((e) => e.id !== id));
}

// Simple subscription mechanism for UI updates
type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach((l) => l());
}
