import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import { SettingsProvider } from "./context/SettingsContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Contacts from "./pages/Contacts";
import Search from "./pages/Search";
import ContactDetail from "./pages/ContactDetail";
import Categories from "./pages/Categories";
import Login from "./pages/Login";
import Register from "./pages/Register";

function PrivateRoute({ children, user }) {
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <SettingsProvider>
      <BrowserRouter>
        <div className="app-bg">
          <div className="app-layout">
            {user && <Navbar user={user} />}
            <main className="app-main">
              <Routes>
                <Route path="/login"    element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<PrivateRoute user={user}><Home /></PrivateRoute>} />
                <Route path="/contacts" element={<PrivateRoute user={user}><Contacts /></PrivateRoute>} />
                <Route path="/contacts/:id" element={<PrivateRoute user={user}><ContactDetail /></PrivateRoute>} />
                <Route path="/search" element={<PrivateRoute user={user}><Search /></PrivateRoute>} />
                <Route path="/categories" element={<PrivateRoute user={user}><Categories /></PrivateRoute>} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </SettingsProvider>
  );
}