import React from "react";

/**
 * App-wide error boundary — stops a single component crash from white-screening
 * the whole app (e.g. the earlier "cities is not iterable"). Shows a friendly
 * recovery card instead.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Uncaught error:", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-night-950 px-6 text-center text-white">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-lime-400/15 text-3xl">⛰️</span>
        <h1 className="text-2xl font-extrabold tracking-tight">Something went off-trail</h1>
        <p className="max-w-md text-white/60">An unexpected error occurred. Try reloading the page — if it keeps happening, head back home.</p>
        <div className="mt-2 flex gap-3">
          <button onClick={() => window.location.reload()} className="rounded-full bg-lime-400 px-6 py-3 text-sm font-bold text-night-950 transition-transform hover:-translate-y-0.5">
            Reload
          </button>
          <a href="/user" className="rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-white transition-colors hover:border-lime-400 hover:text-lime-400">
            Go home
          </a>
        </div>
      </div>
    );
  }
}
