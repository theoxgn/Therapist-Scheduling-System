import React from 'react';

// Error Handler Component
const ErrorHandler = ({ error }) => {
  const isDev = process.env.NODE_ENV === 'development';
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-4 text-center">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="w-12 h-12 mx-auto mb-4 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">
            {isDev ? error.message : 'An unexpected error occurred. Please try again later.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Reload page
          </button>
        </div>
        {isDev && error.stack && (
          <div className="p-4 bg-gray-800 rounded-lg shadow-md overflow-x-auto">
            <pre className="text-left text-sm text-gray-300 whitespace-pre-wrap">
              {error.stack}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

// Error Boundary Component
export class ApiErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to error reporting service
    console.error('API Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorHandler error={this.state.error} />;
    }
    return this.props.children;
  }
}

export default ApiErrorBoundary;