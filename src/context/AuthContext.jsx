import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser, getUserByEmail } from "../services/api";

const Ctx = createContext();

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem("mn_user")) || null; } catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (user) localStorage.setItem("mn_user", JSON.stringify(user));
    else      localStorage.removeItem("mn_user");
  }, [user]);

  const login = async (email, password) => {
    setLoading(true); setError(null);
    try {
      const found = await loginUser(email, password);
      if (!found)        throw new Error("Email hoặc mật khẩu không đúng");
      if (!found.active) throw new Error("Tài khoản đã bị khóa");
      const { password: _, ...safe } = found;
      setUser(safe);
      return safe;
    } catch (e) { setError(e.message); throw e; }
    finally     { setLoading(false); }
  };

  const register = async (form) => {
    setLoading(true); setError(null);
    try {
      const existing = await getUserByEmail(form.email);
      if (existing) throw new Error("Email này đã được đăng ký");
      const colors = ["#c0392b","#2980b9","#27ae60","#e67e22","#8e44ad"];
      const newUser = await registerUser({
        ...form,
        role: "user",
        active: true,
        avatar: form.name.trim().charAt(0).toUpperCase(),
        color: colors[Math.floor(Math.random() * colors.length)],
      });
      const { password: _, ...safe } = newUser;
      setUser(safe);
      return safe;
    } catch (e) { setError(e.message); throw e; }
    finally     { setLoading(false); }
  };

  const logout = () => { setUser(null); setError(null); };

  return (
    <Ctx.Provider value={{
      user, loading, error,
      login, register, logout,
      isLoggedIn: !!user,
      isAdmin: user?.role === "admin",
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);