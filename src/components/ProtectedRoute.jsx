import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/** Yêu cầu đăng nhập; adminOnly=true thì chỉ cho role admin */
export function ProtectedRoute({ children, adminOnly = false }) {
  const { isLoggedIn, isAdmin } = useAuth();
  const loc = useLocation();
  if (!isLoggedIn) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return children;
}

/** Redirect người đã login ra khỏi trang login/register */
export function GuestRoute({ children }) {
  const { isLoggedIn, isAdmin } = useAuth();
  if (isLoggedIn) return <Navigate to={isAdmin ? "/admin" : "/"} replace />;
  return children;
}