import { Platform } from 'react-native';
import { startWorker as startWebWorker } from './browser';
import { startWorker as startNativeWorker } from './native';

export async function startMocks() {
  if (typeof process !== 'undefined' && (process as any).env && (process as any).env.JEST_WORKER_ID) {
    // Jest environment uses a dedicated Node server; do not start platform-specific mocks here.
    return;
  }
  if (Platform.OS === 'web') {
    await startWebWorker();
  } else {
    await startNativeWorker();
  }
}
