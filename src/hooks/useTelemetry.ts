import { useEffect, useRef } from 'react';
import { logEvent } from '@/lib/logging';

export function useScreenView(screenName: string) {
  useEffect(() => {
    logEvent('screen_view', { screen: screenName });
  }, [screenName]);
}

export function useRenderTime(name: string) {
  const startedAt = useRef<number>(Date.now());
  useEffect(() => {
    const ms = Date.now() - startedAt.current;
    logEvent('render_time', { name, duration_ms: ms });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
