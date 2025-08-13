// src/components/ui/EnhancedErrorBoundary.jsx
import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
    
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleReset = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { darkMode = false, fallback } = this.props;
      
      // Use custom fallback if provided
      if (fallback) {
        return fallback(this.state.error, this.handleRetry);
      }

      return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${
          darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
        }`}>
          <div className="max-w-md w-full text-center">
            <div className={`rounded-lg p-8 ${
              darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            } shadow-xl`}>
              
              {/* Error Icon */}
              <div className="mb-6">
                <AlertTriangle size={64} className="mx-auto text-red-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
                <p className="text-gray-500 mb-4">
                  An unexpected error occurred. Don't worry, your data is safe.
                </p>
              </div>

              {/* Error Details (Development only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className={`mb-6 p-4 rounded-lg text-left text-sm ${
                  darkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gray-100 border border-gray-300'
                }`}>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Bug size={16} className="mr-2" />
                    Error Details
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <strong>Message:</strong>
                      <pre className="whitespace-pre-wrap text-xs mt-1 text-red-600 dark:text-red-400">
                        {this.state.error.message}
                      </pre>
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack Trace:</strong>
                        <pre className="whitespace-pre-wrap text-xs mt-1 text-gray-600 dark:text-gray-400 max-h-32 overflow-y-auto">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw size={16} />
                  <span>Try Again</span>
                  {this.state.retryCount > 0 && (
                    <span className="text-xs bg-blue-500 px-2 py-1 rounded-full">
                      Attempt #{this.state.retryCount + 1}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={this.handleReset}
                  className={`w-full flex items-center justify-center space-x-2 px-6 py-2 rounded-lg transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Home size={16} />
                  <span>Reload Application</span>
                </button>
              </div>

              {/* Help Text */}
              <div className="mt-6 text-xs text-gray-500">
                <p>If the problem persists, try:</p>
                <ul className="mt-2 space-y-1 text-left">
                  <li>• Clearing your browser cache</li>
                  <li>• Disabling browser extensions</li>
                  <li>• Using an incognito/private window</li>
                  <li>• Checking your internet connection</li>
                </ul>
              </div>

              {/* Retry Counter */}
              {this.state.retryCount > 2 && (
                <div className={`mt-4 p-3 rounded-lg ${
                  darkMode ? 'bg-yellow-900/30 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'
                }`}>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Multiple retry attempts detected. Consider reloading the application.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for functional components
export const withErrorBoundary = (WrappedComponent, errorBoundaryProps = {}) => {
  return function WithErrorBoundaryComponent(props) {
    return (
      <EnhancedErrorBoundary {...errorBoundaryProps}>
        <WrappedComponent {...props} />
      </EnhancedErrorBoundary>
    );
  };
};

// Hook for error reporting
export const useErrorHandler = () => {
  const handleError = React.useCallback((error, errorInfo = {}) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    
    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry, LogRocket, etc.
      // errorReportingService.captureException(error, { extra: errorInfo });
    }
  }, []);

  return { handleError };
};
export { ErrorBoundary };

