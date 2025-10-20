export async function startWorker() {
  // MSW service worker is web-only; on native, you can mock using custom Apollo links or interceptors.
  if (__DEV__) {
    console.log('[MSW] Skipping worker on native platform.');
  }
}
