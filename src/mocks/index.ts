import { Platform } from 'react-native';
import { startWorker as startWebWorker } from './browser';
import { startWorker as startNativeWorker } from './native';

export async function startMocks() {
  if (Platform.OS === 'web') {
    await startWebWorker();
  } else {
    await startNativeWorker();
  }
}
