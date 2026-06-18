import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider }   from "./context/AuthContext";
import { CartProvider }   from "./context/CartContext";
import { ProtectedRoute, GuestRoute } from "./components/ProtectedRoute";
import Navbar        from "./components/Navbar";
import Footer        from "./components/Footer";
import Home          from "./pages/Home";
import Shop          from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart          from "./pages/Cart";
import Checkout      from "./pages/Checkout";
import AuthPage      from "./pages/AuthPage";
import AdminPage     from "./pages/AdminPage";
import TuVanPage     from "./pages/TuVanPage";
import { Wishlist, About, Contact, Blog, BlogDetail, Account } from "./pages/OtherPages";
import "./index.css";

/* ── Widget hỗ trợ góc màn hình ── */
function SupportWidget() {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ position:"fixed", bottom:28, right:28, zIndex:8888, display:"flex", flexDirection:"column", alignItems:"flex-end", gap:12 }}>
      {/* Menu mở rộng */}
      {open && (
        <div style={{ background:"var(--dark2)", border:"1px solid rgba(212,175,90,0.35)", borderRadius:12, overflow:"hidden", boxShadow:"0 16px 48px rgba(0,0,0,0.7)", minWidth:240, animation:"fadeUp 0.25s ease" }}>
          {/* Header */}
          <div style={{ padding:"14px 20px", background:"linear-gradient(135deg,rgba(212,175,90,0.15),rgba(212,175,90,0.06))", borderBottom:"1px solid rgba(212,175,90,0.2)" }}>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.1rem", color:"var(--gold)", fontWeight:600, letterSpacing:1 }}>Hỗ Trợ Ngay</div>
            <div style={{ fontSize:"0.78rem", color:"var(--text-light)", marginTop:2 }}>Phong Thủy Mạch Nhà</div>
          </div>
          {[
            { icon:"📞", label:"Gọi điện", sub:"0968 386 408",   href:"tel:0968386408",                              color:"#27ae60" },
            { icon:"💬", label:"Zalo",      sub:"Chat ngay",       href:"https://zalo.me/0968386408",                 color:"#0068FF" },
            { icon:"📧", label:"Email",     sub:"phongthuymachnha8386@gmail.com", href:"mailto:phongthuymachnha8386@gmail.com", color:"#e74c3c" },
          ].map((item,i)=>(
            <a key={i} href={item.href} target={item.href.startsWith("http")?"_blank":undefined} rel="noreferrer"
              style={{ display:"flex", alignItems:"center", gap:14, padding:"13px 20px", textDecoration:"none", borderBottom:"1px solid rgba(255,255,255,0.05)", transition:"background 0.2s" }}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(212,175,90,0.1)"}
              onMouseLeave={e=>e.currentTarget.style.background="none"}
            >
              <div style={{ width:40, height:40, borderRadius:"50%", background:`${item.color}20`, border:`1.5px solid ${item.color}60`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.15rem", flexShrink:0 }}>{item.icon}</div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:"0.9rem", color:"var(--cream)", marginBottom:2 }}>{item.label}</div>
                <div style={{ fontSize:"0.76rem", color:"var(--text-light)", wordBreak:"break-all", lineHeight:1.35 }}>{item.sub}</div>
              </div>
            </a>
          ))}
          <div style={{ padding:"11px 20px", background:"rgba(212,175,90,0.04)" }}>
            <div style={{ fontSize:"0.74rem", color:"var(--text-light)", textAlign:"center" }}>8:00 – 21:00 hằng ngày</div>
          </div>
        </div>
      )}

      {/* Toggle button — to hơn, rõ hơn */}
      <button
        onClick={()=>setOpen(p=>!p)}
        style={{
          width:64, height:64, borderRadius:"50%",
          background: open
            ? "linear-gradient(135deg,#c0392b,#e74c3c)"
            : "linear-gradient(135deg,var(--gold-dark),var(--gold),var(--gold-light))",
          border: open ? "2px solid rgba(255,255,255,0.2)" : "2px solid rgba(212,175,90,0.5)",
          cursor:"pointer", fontSize:"1.6rem",
          boxShadow: open
            ? "0 6px 20px rgba(192,57,43,0.5)"
            : "0 8px 28px rgba(212,175,90,0.45)",
          transition:"all 0.3s",
          display:"flex", alignItems:"center", justifyContent:"center",
          animation: open ? "none" : "pulseGold 2.5s ease infinite",
        }}
        title={open?"Đóng":"Liên hệ hỗ trợ"}
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}

function Layout({ children }) {
  return (
    <>
      <Navbar/>
      <main>{children}</main>
      <Footer/>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>

            {/* ═══ PUBLIC — không cần đăng nhập ═══ */}
            <Route path="/"            element={<Layout><Home/></Layout>}/>
            <Route path="/about"       element={<Layout><About/></Layout>}/>
            <Route path="/contact"     element={<Layout><Contact/></Layout>}/>
            <Route path="/tu-van"      element={<Layout><TuVanPage/></Layout>}/>
            <Route path="/shop"        element={<Layout><Shop/></Layout>}/>
            <Route path="/product/:id" element={<Layout><ProductDetail/></Layout>}/>
            <Route path="/blog"        element={<Layout><Blog/></Layout>}/>
            <Route path="/blog/:id"    element={<Layout><BlogDetail/></Layout>}/>

            {/* ═══ GUEST ONLY (đã login thì redirect) ═══ */}
            <Route path="/login" element={<GuestRoute><AuthPage/></GuestRoute>}/>

            {/* ═══ PROTECTED — cần đăng nhập ═══ */}
            <Route path="/cart"     element={<Layout><Cart/></Layout>}/>
            <Route path="/checkout" element={<ProtectedRoute><Layout><Checkout/></Layout></ProtectedRoute>}/>
            <Route path="/wishlist" element={<ProtectedRoute><Layout><Wishlist/></Layout></ProtectedRoute>}/>
            <Route path="/account"  element={<ProtectedRoute><Layout><Account/></Layout></ProtectedRoute>}/>

            {/* ═══ ADMIN ONLY ═══ */}
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage/></ProtectedRoute>}/>

            {/* ═══ 404 ═══ */}
            <Route path="*" element={
              <Layout>
                <div style={{ paddingTop:160, textAlign:"center", minHeight:"60vh" }}>
                  <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"5rem", color:"var(--gold)", opacity:0.35 }}>404</h1>
                  <p style={{ color:"var(--text-light)", marginBottom:22 }}>Trang bạn tìm không tồn tại</p>
                  <a href="/" className="btn-gold">Về Trang Chủ</a>
                </div>
              </Layout>
            }/>
          </Routes>
          <SupportWidget/>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
