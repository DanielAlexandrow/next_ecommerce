import React from 'react';

interface Props {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        if (!error) {
            console.error('ErrorBoundary: Received empty error object');
            return {
                hasError: true,
                error: new Error('Unknown error occurred'),
                errorInfo: null
            };
        }
        return {
            hasError: true,
            error,
            errorInfo: null
        };
    }

    componentDidCatch(error: Error | null, errorInfo: React.ErrorInfo | null): void {
        if (!error) {
            console.error('ErrorBoundary.componentDidCatch: Received empty error object');
            return;
        }

        if (!errorInfo) {
            console.error('ErrorBoundary.componentDidCatch: Received empty errorInfo object');
            return;
        }

        // Log the error
        console.error('Error caught by ErrorBoundary:', {
            error: error?.message || 'Unknown error',
            component: errorInfo?.componentStack || 'Unknown component',
            stack: error?.stack || 'No stack trace available'
        });

        this.setState({
            error,
            errorInfo
        });
    }

    render(): React.ReactNode {
        const { hasError, error, errorInfo } = this.state;
        const { children, fallback } = this.props;

        if (!children) {
            console.error('ErrorBoundary: No children provided');
            return (
                <div className="error-boundary-message">
                    <h2>Configuration Error</h2>
                    <p>No content provided to error boundary</p>
                </div>
            );
        }

        if (hasError) {
            // Use custom fallback if provided
            if (fallback) {
                return fallback;
            }

            // Default error UI
            return (
                <div className="error-boundary-message">
                    <h2>Something went wrong</h2>
                    <details style={{ whiteSpace: 'pre-wrap' }}>
                        <summary>Error Details</summary>
                        <p>{error?.toString() || 'Unknown error'}</p>
                        <p>Component Stack:</p>
                        <pre>{errorInfo?.componentStack || 'No stack trace available'}</pre>
                    </details>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                        className="error-reset-button"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return children;
    }
}