export type UploadResult = {
  ok: true;
  url: string;
};

export type UploadOptions = {
  steps?: number;
  stepIntervalMs?: number;
};

/**
 * Simulates uploading a local file to a presigned URL.
 * Calls onProgress from 0 to 1 over a few steps, then resolves with the remote URL.
 * This is a stub and does not actually perform any HTTP requests.
 */
export function uploadToPresignedUrl(
  uri: string,
  presignedUrl: string,
  onProgress?: (progress: number) => void,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const steps = Math.max(1, options.steps ?? 5);
  const interval = Math.max(1, options.stepIntervalMs ?? 200);

  let current = 0;
  onProgress?.(0);

  return new Promise<UploadResult>((resolve) => {
    const id = setInterval(() => {
      current++;
      const p = Math.min(1, current / steps);
      onProgress?.(p);
      if (p >= 1) {
        clearInterval(id);
        // In a real implementation you'd use the presignedUrl to PUT the file
        // and the server would give back a canonical URL. Here we just echo
        // back the provided URL.
        resolve({ ok: true, url: presignedUrl });
      }
    }, interval);
  });
}
