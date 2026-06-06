import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, Heart, Search, Menu, X, LogOut, Settings, Crown, User, Sparkles } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { totalQty, wish } = useCart();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [dropOpen,   setDropOpen]   = useState(false);
  const [query,      setQuery]      = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const dropRef  = useRef();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => { setMobileOpen(false); setDropOpen(false); }, [location]);

  useEffect(() => {
    const h = e => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleSearch = e => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false); setQuery("");
    }
  };

  /* Nav links — "Tư Vấn" luôn hiển thị nổi bật */
  const links = [
    { to: "/",       label: "Trang Chủ" },
    { to: "/tu-van", label: "Tư Vấn",   icon: <Sparkles size={13}/>, highlight: true },
    { to: "/shop",   label: "Cửa Hàng" },
    { to: "/blog",   label: "Kiến Thức" },
    { to: "/about",  label: "Giới Thiệu" },
    { to: "/contact",label: "Liên Hệ" },
    ...(isAdmin ? [{ to: "/admin", label: "Quản Trị", icon: <Crown size={13}/>, admin: true }] : []),
  ];

  const isActive = path => location.pathname === path;

  const navBg = scrolled
    ? "rgba(16,14,10,0.97)"
    : "linear-gradient(to bottom, rgba(16,14,10,0.92), transparent)";

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        transition: "all 0.4s",
        background: navBg,
        backdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(212,175,90,0.22)" : "none",
      }}>
        {/* Topbar */}
        <div style={{
          background: "linear-gradient(135deg, var(--gold-dark), var(--gold), var(--gold-dark))",
          textAlign: "center", padding: "6px",
          fontSize: "0.72rem", fontWeight: 800, letterSpacing: "2.5px", color: "#0D0B08",
        }}>
          ✦ PHONG THỦY MẠCH NHÀ – MIỄN PHÍ VẬN CHUYỂN ĐƠN HÀNG TRÊN 500.000Đ ✦
        </div>

        <div style={{
          maxWidth: 1320, margin: "0 auto", padding: "0 28px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: 72,
        }}>
          {/* Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <div style={{
              width: 42, height: 42, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--gold-dark), var(--gold))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.35rem", boxShadow: "0 0 16px rgba(212,175,90,0.3)",
            }}>☯</div>
            <div>
              <div style={{
                fontFamily: "'Cormorant Garamond',serif", fontSize: "1.22rem",
                fontWeight: 700, letterSpacing: 2.2,
                background: "linear-gradient(135deg, var(--gold-dark), var(--gold), var(--gold-light))",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>PHONG THỦY</div>
              <div style={{
                fontFamily: "'Cormorant Garamond',serif", fontSize: "1.22rem",
                fontWeight: 700, letterSpacing: 2.2, lineHeight: 0.9,
                background: "linear-gradient(135deg, var(--gold-dark), var(--gold), var(--gold-light))",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>MẠCH NHÀ</div>
            </div>
          </Link>

          {/* Desktop links */}
          <div style={{ display: "flex", gap: 2, alignItems: "center" }} className="desk-nav">
            {links.map(l => {
              const active = isActive(l.to);
              return (
                <Link key={l.to} to={l.to} style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "7px 10px",
                  fontSize: "0.78rem", letterSpacing: 0.8, textTransform: "uppercase", fontWeight: 700,
                  color: l.admin ? "var(--gold)" : l.highlight && active ? "var(--black)" : l.highlight ? "var(--gold-light)" : active ? "var(--gold)" : "var(--cream)",
                  background: l.highlight
                    ? active
                      ? "linear-gradient(135deg,var(--gold-dark),var(--gold))"
                      : "rgba(212,175,90,0.14)"
                    : active ? "rgba(212,175,90,0.1)" : "transparent",
                  border: l.highlight ? `1px solid ${active ? "var(--gold-light)" : "rgba(212,175,90,0.45)"}` : "1px solid transparent",
                  borderRadius: 999,
                  boxShadow: l.highlight ? "0 0 18px rgba(212,175,90,0.16)" : "none",
                  transition: "all 0.25s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.color = "var(--gold)"; e.currentTarget.style.background = "rgba(212,175,90,0.1)"; }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = l.admin ? "var(--gold)" : l.highlight && active ? "var(--black)" : l.highlight ? "var(--gold-light)" : active ? "var(--gold)" : "var(--cream)";
                    e.currentTarget.style.background = l.highlight
                      ? active
                        ? "linear-gradient(135deg,var(--gold-dark),var(--gold))"
                        : "rgba(212,175,90,0.14)"
                      : active ? "rgba(212,175,90,0.1)" : "transparent";
                  }}
                >
                  {l.icon && l.icon}
                  {l.label}
                  {l.badge && (
                    <span style={{ fontSize:"0.55rem", fontWeight:800, letterSpacing:0.5, padding:"1px 5px", background:"rgba(212,175,90,0.25)", color:"var(--gold)", borderRadius:3, marginLeft:2 }}>
                      {l.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right icons */}
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            {/* Search */}
            <button onClick={() => setSearchOpen(p => !p)} style={{
              background: "none", border: "none", color: "var(--cream2)", cursor: "pointer",
              padding: 6, borderRadius: "50%", transition: "color 0.2s",
            }}
              onMouseEnter={e=>e.currentTarget.style.color="var(--gold)"}
              onMouseLeave={e=>e.currentTarget.style.color="var(--cream2)"}
            >
              <Search size={20}/>
            </button>

            {/* Wishlist — chỉ khi đăng nhập */}
            {isLoggedIn && (
              <Link to="/wishlist" style={{ position: "relative", color: "var(--cream2)", transition: "color 0.2s" }}
                onMouseEnter={e=>e.currentTarget.style.color="var(--gold)"}
                onMouseLeave={e=>e.currentTarget.style.color="var(--cream2)"}
              >
                <Heart size={20}/>
                {wish?.length > 0 && (
                  <span style={{ position:"absolute", top:-7, right:-7, background:"var(--red-light)", color:"white", borderRadius:"50%", width:17, height:17, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.6rem", fontWeight:800 }}>
                    {wish.length}
                  </span>
                )}
              </Link>
            )}

            {/* Cart — luôn hiển thị */}
            <Link to="/cart" style={{ position: "relative", color: "var(--cream2)", transition: "color 0.2s" }}
              onMouseEnter={e=>e.currentTarget.style.color="var(--gold)"}
              onMouseLeave={e=>e.currentTarget.style.color="var(--cream2)"}
            >
              <ShoppingCart size={20}/>
              {totalQty > 0 && (
                <span style={{ position:"absolute", top:-7, right:-7, background:"linear-gradient(135deg,var(--gold-dark),var(--gold))", color:"#0D0B08", borderRadius:"50%", width:17, height:17, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.6rem", fontWeight:800 }}>
                  {totalQty}
                </span>
              )}
            </Link>

            {/* User dropdown / Login btn */}
            {isLoggedIn ? (
              <div style={{ position: "relative" }} ref={dropRef}>
                <button onClick={() => setDropOpen(p => !p)} style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: user?.color || "var(--gold)",
                  border: "2px solid var(--gold)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, color: "#0D0B08", cursor: "pointer",
                  fontSize: "0.92rem",
                  boxShadow: "0 0 10px rgba(212,175,90,0.25)",
                }}>
                  {user?.avatar}
                </button>

                {dropOpen && (
                  <div style={{
                    position: "absolute", right: 0, top: 44, width: 210,
                    background: "var(--dark2)", border: "1px solid rgba(212,175,90,0.28)",
                    boxShadow: "0 18px 44px rgba(0,0,0,0.6)", zIndex: 999,
                    borderRadius: 4,
                  }}>
                    <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(212,175,90,0.12)" }}>
                      <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--white)" }}>{user?.name}</div>
                      <div style={{ fontSize: "0.72rem", color: isAdmin ? "var(--gold)" : "var(--text-light)", marginTop: 2 }}>
                        {isAdmin ? "👑 Admin" : "👤 Thành viên"}
                      </div>
                    </div>

                    {[
                      { to: "/account", icon: <User size={14}/>,     label: "Tài Khoản" },
                      { to: "/tu-van",  icon: <Sparkles size={14}/>, label: "Tư Vấn Phong Thủy" },
                      ...(isAdmin ? [{ to: "/admin", icon: <Settings size={14}/>, label: "Quản Trị" }] : []),
                    ].map(item => (
                      <Link key={item.to} to={item.to} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "11px 16px", color: "var(--cream2)",
                        fontSize: "0.87rem", borderBottom: "1px solid rgba(255,255,255,0.04)",
                        transition: "background 0.2s",
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(212,175,90,0.08)"; e.currentTarget.style.color = "var(--gold)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--cream2)"; }}
                      >
                        <span style={{ color: "var(--gold)" }}>{item.icon}</span> {item.label}
                      </Link>
                    ))}

                    <button onClick={() => { logout(); navigate("/"); }} style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 10,
                      padding: "11px 16px", background: "none", border: "none",
                      color: "#e74c3c", fontSize: "0.87rem", cursor: "pointer",
                      fontFamily: "Raleway,sans-serif", transition: "background 0.2s",
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(192,57,43,0.1)"}
                      onMouseLeave={e => e.currentTarget.style.background = "none"}
                    >
                      <LogOut size={14}/> Đăng Xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-gold" style={{ padding: "9px 20px", fontSize: "0.78rem", letterSpacing: 2 }}>
                Đăng Nhập
              </Link>
            )}

            {/* Mobile menu btn */}
            <button onClick={() => setMobileOpen(p => !p)} style={{
              background: "none", border: "none", color: "var(--cream)", cursor: "pointer", display: "none",
            }} className="mob-btn">
              {mobileOpen ? <X size={22}/> : <Menu size={22}/>}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div style={{ background: "var(--dark2)", borderTop: "1px solid rgba(212,175,90,0.2)", padding: "14px 28px" }}>
            <form onSubmit={handleSearch} style={{ maxWidth: 580, margin: "0 auto", display: "flex", gap: 10 }}>
              <input
                autoFocus value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm phong thủy..."
                style={{ flex: 1, padding: "11px 16px", background: "var(--dark)", border: "1px solid var(--medium)", color: "var(--cream)", fontFamily: "Raleway,sans-serif", fontSize: "0.95rem", outline: "none", borderRadius: 3 }}
              />
              <button type="submit" className="btn-gold" style={{ padding: "11px 20px", borderRadius: 3 }}>Tìm</button>
            </form>
          </div>
        )}

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{ background: "var(--dark)", borderTop: "1px solid rgba(212,175,90,0.2)", padding: "16px 24px 24px" }}>
            {links.map(l => (
              <Link key={l.to} to={l.to} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)",
                fontSize: "0.9rem", letterSpacing: 2, fontWeight: 600,
                color: isActive(l.to) ? "var(--gold)" : l.highlight ? "var(--gold-light)" : "var(--cream2)",
              }}>
                {l.icon && l.icon} {l.label}
              </Link>
            ))}
            {!isLoggedIn && (
              <div style={{ marginTop: 16 }}>
                <Link to="/login" className="btn-gold" style={{ display: "block", textAlign: "center", padding: 12, borderRadius: 3 }}>Đăng Nhập</Link>
              </div>
            )}
          </div>
        )}
      </nav>

      <style>{`
        @media(max-width:1024px){ .desk-nav{ display:none!important; } .mob-btn{ display:block!important; } }
      `}</style>
    </>
  );
}
