import React from "react";

export default class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="ax-error" role="alert">
          <div className="ax-error__panel">
            <h1 className="ax-error__title">This page didn't load</h1>
            <p className="ax-error__text">
              Something on this page stopped working. Try loading it again. If
              it keeps happening, go back to the home page.
            </p>
            {this.state.error?.message && (
              <p className="ax-error__detail">{this.state.error.message}</p>
            )}
            <div className="ax-error__actions">
              <button
                type="button"
                className="ax-btn ax-btn--primary"
                onClick={() => this.setState({ hasError: false })}
              >
                Try again
              </button>
              <a className="ax-btn ax-btn--ghost" href="/">
                Go to home
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
