import { getItem, setItem } from '@/lib/storage';

export type QueuedThread = {
  id: string;
  text: string;
  parts: string[];
  media: string[];
  createdAt: string;
};

const QUEUE_KEY = 'compose.offlineQueue';

function randomId(prefix = 'q') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getQueue(): QueuedThread[] {
  return getItem<QueuedThread[]>(QUEUE_KEY, []);
}

export function clearQueue() {
  setItem<QueuedThread[]>(QUEUE_KEY, []);
}

export function enqueue(text: string, parts: string[], media: string[]): QueuedThread {
  const q = getQueue();
  const entry: QueuedThread = {
    id: randomId(),
    text,
    parts,
    media,
    createdAt: new Date().toISOString()
  };
  const next = [entry, ...q];
  setItem<QueuedThread[]>(QUEUE_KEY, next);
  return entry;
}
