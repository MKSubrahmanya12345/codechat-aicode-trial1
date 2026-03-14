import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Drivers from './pages/Drivers';
import Vehicles from './pages/Vehicles';
import Routes_ from './pages/Routes';
import Alerts from './pages/Alerts';
import Invoices from './pages/Invoices';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import ToastContainer from './components/ToastContainer';
import HackathonMode from './components/HackathonMode'; // ??$$$

// ??$$$ Auth Context
export const AuthContext = createContext(null);
export const ToastContext = createContext(null);

export const useAuth = () => useContext(AuthContext);
export const useToast = () => useContext(ToastContext);

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

// Authenticated layout
const AppLayout = ({ children, isHackathon, onToggleHackathon }) => (
  <div className={`app-layout${isHackathon ? ' hackathon-mode-active' : ''}`}>
    <HackathonMode isHackathon={isHackathon} onToggle={onToggleHackathon} />
    <Sidebar />
    <div className="main-content">
      <Topbar />
      <main className="page-content animate-in">{children}</main>
    </div>
  </div>
);

function App() {
  const [token, setToken] = useState(localStorage.getItem('lg_token') || null);
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('lg_user');
    return u ? JSON.parse(u) : null;
  });
  const [toasts, setToasts] = useState([]);
  // ??$$$ Hackathon mode - persists across page reloads
  const [isHackathon, setIsHackathon] = useState(() => localStorage.getItem('lg_hackathon') === 'true');

  const toggleHackathon = () => {
    const next = !isHackathon;
    setIsHackathon(next);
    localStorage.setItem('lg_hackathon', String(next));
    // Add/remove body class for layout offset
    document.body.classList.toggle('hackathon-mode-active', next);
  };

  // Sync body class on mount
  useEffect(() => {
    document.body.classList.toggle('hackathon-mode-active', isHackathon);
  }, []);

  const login = (tok, userData) => {
    setToken(tok);
    setUser(userData);
    localStorage.setItem('lg_token', tok);
    localStorage.setItem('lg_user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('lg_token');
    localStorage.removeItem('lg_user');
  };

  // ??$$$ Toast helper
  const addToast = (type, title, msg) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, title, msg }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      <ToastContext.Provider value={{ addToast }}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout isHackathon={isHackathon} onToggleHackathon={toggleHackathon}>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/drivers" element={<Drivers />} />
                      <Route path="/vehicles" element={<Vehicles />} />
                      <Route path="/routes" element={<Routes_ />} />
                      <Route path="/alerts" element={<Alerts />} />
                      <Route path="/invoices" element={<Invoices />} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
          <ToastContainer toasts={toasts} />
        </BrowserRouter>
      </ToastContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
