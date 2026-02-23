import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Theme } from '../constants/Theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors in child component tree and displays fallback UI
 * Prevents entire app from crashing when a component fails
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so next render shows fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error details to console
    console.error('ErrorBoundary caught an error:', error);
    console.error('Component stack:', errorInfo.componentStack);

    this.setState({
      error,
      errorInfo,
    });
  }

  handleRetry = (): void => {
    const { onReset } = this.props;
    
    // Call optional reset callback
    if (onReset) {
      onReset();
    }

    // Reset error state to re-render children
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Render custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default fallback UI
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>
              We're sorry, but something unexpected happened. Please try again.
            </Text>

            {error && (
              <ScrollView style={styles.errorDetails}>
                <Text style={styles.errorText}>
                  {error.toString()}
                </Text>
                {errorInfo && (
                  <Text style={styles.stackTrace}>
                    {errorInfo.componentStack}
                  </Text>
                )}
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.retryButton}
              onPress={this.handleRetry}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.l,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.m,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.l,
    lineHeight: 22,
  },
  errorDetails: {
    width: '100%',
    maxHeight: 200,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 8,
    padding: Theme.spacing.m,
    marginBottom: Theme.spacing.l,
  },
  errorText: {
    fontSize: 12,
    color: Theme.colors.error || '#ff6b6b',
    fontFamily: 'monospace',
  },
  stackTrace: {
    fontSize: 10,
    color: Theme.colors.text.muted,
    fontFamily: 'monospace',
    marginTop: Theme.spacing.s,
  },
  retryButton: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: Theme.spacing.m,
    paddingHorizontal: Theme.spacing.xl,
    borderRadius: 25,
    minWidth: 150,
    alignItems: 'center',
  },
  retryButtonText: {
    color: Theme.colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ErrorBoundary;
