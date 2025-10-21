import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { logError } from '@/lib/logging';

type Props = {
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

type State = { hasError: boolean; error?: any };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true } as State;
  }

  componentDidCatch(error: any, errorInfo: any) {
    logError(error, { errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return <>{this.props.fallback}</>;
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}
          accessible accessibilityRole="alert" accessibilityLabel="An error occurred">
          <Text accessibilityRole="header" style={{ fontSize: 18, marginBottom: 12 }}>Something went wrong</Text>
          <Text style={{ marginBottom: 16 }}>Please try again.</Text>
          <Pressable onPress={this.handleReset} accessibilityRole="button" accessibilityLabel="Try again">
            <Text style={{ color: '#0a84ff' }}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children as any;
  }
}
