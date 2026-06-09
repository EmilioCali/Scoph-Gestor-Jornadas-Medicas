import { Toaster } from "react-hot-toast";
import AppRouter from "./routes/AppRouter";
import { AuthProvider } from "../features/auth/store/AuthContext";
import ErrorBoundary from "../shared/components/ErrorBoundary";
import { useUIStore } from "../shared/store/uiStore";

function GlobalLoader() {
  const isGlobalLoading = useUIStore((state) => state.isGlobalLoading);

  if (!isGlobalLoading) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
      <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-lg">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-sm font-medium text-slate-700">Procesando...</span>
      </div>
    </div>
  );
}

function GlobalErrorBanner() {
  const { globalError, clearGlobalError } = useUIStore();

  if (!globalError) return null;

  return (
    <div className="fixed left-4 right-4 top-4 z-[998] rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <p>{globalError}</p>
        <button
          type="button"
          onClick={clearGlobalError}
          className="text-red-700 transition hover:opacity-80"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <GlobalLoader />
        <GlobalErrorBanner />
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <AppRouter />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
