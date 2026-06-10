import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary capturó un error", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
          <div className="max-w-md w-full rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mb-4 text-5xl">⚠️</div>
            <h1 className="text-xl font-semibold text-slate-800">
              Ocurrió un problema inesperado
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              La aplicación no pudo continuar. Intenta recargar la página o volver a ingresar.
            </p>
            <button
              type="button"
              onClick={this.handleRetry}
              className="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
