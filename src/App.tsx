import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useMeasureChangeNotifier } from "./hooks/useMeasureChangeNotifier";
import { TabBar } from "./components/layout/TabBar";
import { Login } from "./pages/Login";
import { HouseholdSetup } from "./pages/HouseholdSetup";
import { Home } from "./pages/Home";
import { Vergleich } from "./pages/Vergleich";
import { Statistik } from "./pages/Statistik";
import { Einstellungen } from "./pages/Einstellungen";

function AppShell() {
  const { user } = useAuth();
  useMeasureChangeNotifier(user?.householdId ?? null, user?.uid);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vergleich" element={<Vergleich />} />
        <Route path="/statistik" element={<Statistik />} />
        <Route path="/einstellungen" element={<Einstellungen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <TabBar />
    </>
  );
}

function Gate() {
  const { firebaseUser, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface-grouped dark:bg-surface-grouped-dark">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ios-blue border-t-transparent" />
      </div>
    );
  }

  if (!firebaseUser) return <Login />;
  if (!user?.householdId) return <HouseholdSetup />;
  return <AppShell />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <Gate />
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
