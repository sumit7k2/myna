import { tokenStorage } from '@/lib/auth/tokenStorage';
import { ENV } from '@/lib/env';

/**
 * Manual refresh stub. In normal operation, token refresh is handled by the Apollo error link.
 * You can call this function to force-refresh the access token using the refresh token if needed.
 */
export async function refresh(): Promise<boolean> {
  const refreshToken = await tokenStorage.getRefreshToken();
  if (!refreshToken) return false;
  const myFetch: any = (globalThis as any).fetch;
  if (!myFetch) return false;
  try {
    const res = await myFetch(ENV.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        query:
          'mutation Refresh($refreshToken: String!) { refresh(refreshToken: $refreshToken) { accessToken } }',
        variables: { refreshToken }
      })
    });
    const json = await res.json();
    const newAccessToken = json?.data?.refresh?.accessToken as string | undefined;
    if (newAccessToken) {
      await tokenStorage.setAccessToken(newAccessToken);
      return true;
    }
  } catch (e) {
    // noop
  }
  return false;
}
