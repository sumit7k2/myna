import React from 'react';
import { YStack, Button, Paragraph } from 'tamagui';
import * as Sentry from 'sentry-expo';

export type ErrorBoundaryProps = {
  fallback?: React.ReactNode;
};

type State = { hasError: boolean; error?: Error | null };

export class ErrorBoundary extends React.Component<React.PropsWithChildren<ErrorBoundaryProps>, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    try {
      (Sentry as any).Native.captureException?.(error, { extra: { errorInfo } });
    } catch {}
  }

  private reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <YStack f={1} ai="center" jc="center" gap="$3" p="$4">
          <Paragraph>Something went wrong.</Paragraph>
          <Button onPress={this.reset}>Try again</Button>
        </YStack>
      );
    }
    return this.props.children as any;
  }
}

export default ErrorBoundary;
