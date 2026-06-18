import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Phone, Calendar } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const { login, register, loading, error } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from || "/";
  const [tab,   setTab]   = useState(location.state?.tab || "login");
  const [showPw,setShowPw]= useState(false);
  const [ferr,  setFerr]  = useState({});

  const [ld, setLd] = useState({ email:"", password:"" });
  const [rd, setRd] = useState({ name:"", email:"", password:"", confirm:"", phone:"", birthYear:"", gender:"" });

  const handleLogin = async (e) => {
    e.preventDefault(); setFerr({});
    try {
      const u = await login(ld.email, ld.password);
      navigate(u.role === "admin" ? "/admin" : from, { replace:true });
    } catch {}
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!rd.name.trim())                                    errs.name     = "Vui lòng nhập họ tên";
    if (!rd.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))     errs.email    = "Email không hợp lệ";
    if (rd.password.length < 6)                             errs.password = "Tối thiểu 6 ký tự";
    if (rd.password !== rd.confirm)                         errs.confirm  = "Mật khẩu không khớp";
    if (!rd.phone.match(/^[0-9]{10,11}$/))                  errs.phone    = "Số điện thoại không hợp lệ";
    if (Object.keys(errs).length) { setFerr(errs); return; }
    try {
      await register({ name:rd.name, email:rd.email, password:rd.password, phone:rd.phone, birthYear:rd.birthYear?parseInt(rd.birthYear):null, gender:rd.gender||null });
      navigate(from, { replace:true });
    } catch {}
  };

  const inp = (style={}) => ({
    width:"100%", padding:"11px 14px 11px 40px", background:"var(--dark)",
    border:"1px solid rgba(201,168,76,0.25)", color:"var(--cream)",
    fontFamily:"Raleway,sans-serif", fontSize:"0.9rem", outline:"none", borderRadius:2,
    transition:"border-color 0.3s", ...style,
  });

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--black)", padding:"100px 24px 40px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(201,168,76,0.06) 0%,transparent 70%)", top:"50%", left:"50%", transform:"translate(-50%,-50%)" }}/>

      <div style={{ width:"100%", maxWidth:430, position:"relative", background:"var(--dark2)", border:"1px solid rgba(201,168,76,0.25)", padding:"38px 34px", boxShadow:"0 24px 64px rgba(0,0,0,0.6)" }}>

        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:"2.2rem", marginBottom:8 }}>☯</div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.5rem", fontWeight:500, letterSpacing:4, background:"linear-gradient(135deg,var(--gold-dark),var(--gold),var(--gold-light))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            Phong Thủy Mạch Nhà
          </h1>
          <p style={{ color:"var(--text-light)", fontSize:"0.75rem", letterSpacing:2, marginTop:4 }}>
            {tab==="login" ? "Chào mừng trở lại" : "Tạo tài khoản mới"}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", marginBottom:24, borderBottom:"1px solid rgba(201,168,76,0.15)" }}>
          {["login","register"].map(t => (
            <button key={t} onClick={()=>{ setTab(t); setFerr({}); }} style={{ flex:1, padding:"11px 0", background:"none", border:"none", borderBottom:`2px solid ${tab===t?"var(--gold)":"transparent"}`, color: tab===t?"var(--gold)":"var(--text-light)", cursor:"pointer", fontFamily:"Raleway,sans-serif", fontWeight:700, fontSize:"0.78rem", letterSpacing:2, textTransform:"uppercase", transition:"all 0.3s", marginBottom:-1 }}>
              {t==="login" ? "Đăng Nhập" : "Đăng Ký"}
            </button>
          ))}
        </div>

        {/* API error */}
        {error && <div style={{ background:"rgba(192,57,43,0.1)", border:"1px solid rgba(192,57,43,0.4)", padding:"11px 15px", marginBottom:18, fontSize:"0.83rem", color:"#e74c3c", borderRadius:2 }}>⚠️ {error}</div>}

        {tab === "login" ? (
          <form onSubmit={handleLogin}>
            {/* Email */}
            <div style={{ marginBottom:14 }}>
              <label style={{ display:"block", fontSize:"0.68rem", letterSpacing:2, color:"var(--gold)", textTransform:"uppercase", marginBottom:7, fontWeight:700 }}>Email</label>
              <div style={{ position:"relative" }}>
                <Mail size={14} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"var(--text-light)" }}/>
                <input type="email" value={ld.email} onChange={e=>setLd(p=>({...p,email:e.target.value}))} style={inp()} required/>
              </div>
            </div>
            {/* Password */}
            <div style={{ marginBottom:8 }}>
              <label style={{ display:"block", fontSize:"0.68rem", letterSpacing:2, color:"var(--gold)", textTransform:"uppercase", marginBottom:7, fontWeight:700 }}>Mật Khẩu</label>
              <div style={{ position:"relative" }}>
                <Lock size={14} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"var(--text-light)" }}/>
                <input type={showPw?"text":"password"} value={ld.password} onChange={e=>setLd(p=>({...p,password:e.target.value}))} style={inp({ paddingRight:40 })} required/>
                <button type="button" onClick={()=>setShowPw(p=>!p)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"var(--text-light)", cursor:"pointer" }}>
                  {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>
            <div style={{ textAlign:"right", marginBottom:18 }}>
              <span style={{ fontSize:"0.75rem", color:"var(--gold)", cursor:"pointer" }}>Quên mật khẩu?</span>
            </div>
            <button type="submit" className="btn-gold" style={{ width:"100%", padding:"13px" }} disabled={loading}>
              {loading ? "Đang đăng nhập..." : "✦ Đăng Nhập ✦"}
            </button>

          </form>
        ) : (
          <form onSubmit={handleRegister}>
            {/* Name */}
            <div style={{ marginBottom:13 }}>
              <label style={{ display:"block", fontSize:"0.68rem", letterSpacing:2, color:"var(--gold)", textTransform:"uppercase", marginBottom:7, fontWeight:700 }}>Họ và Tên *</label>
              <div style={{ position:"relative" }}>
                <User size={14} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"var(--text-light)" }}/>
                <input value={rd.name} onChange={e=>setRd(p=>({...p,name:e.target.value}))} style={inp({ borderColor:ferr.name?"#e74c3c":undefined })}/>
              </div>
              {ferr.name && <p style={{ color:"#e74c3c", fontSize:"0.72rem", marginTop:3 }}>{ferr.name}</p>}
            </div>
            {/* Email */}
            <div style={{ marginBottom:13 }}>
              <label style={{ display:"block", fontSize:"0.68rem", letterSpacing:2, color:"var(--gold)", textTransform:"uppercase", marginBottom:7, fontWeight:700 }}>Email *</label>
              <div style={{ position:"relative" }}>
                <Mail size={14} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"var(--text-light)" }}/>
                <input type="email" value={rd.email} onChange={e=>setRd(p=>({...p,email:e.target.value}))} style={inp({ borderColor:ferr.email?"#e74c3c":undefined })}/>
              </div>
              {ferr.email && <p style={{ color:"#e74c3c", fontSize:"0.72rem", marginTop:3 }}>{ferr.email}</p>}
            </div>
            {/* Phone */}
            <div style={{ marginBottom:13 }}>
              <label style={{ display:"block", fontSize:"0.68rem", letterSpacing:2, color:"var(--gold)", textTransform:"uppercase", marginBottom:7, fontWeight:700 }}>Số Điện Thoại *</label>
              <div style={{ position:"relative" }}>
                <Phone size={14} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"var(--text-light)" }}/>
                <input type="tel" value={rd.phone} onChange={e=>setRd(p=>({...p,phone:e.target.value}))} style={inp({ borderColor:ferr.phone?"#e74c3c":undefined })}/>
              </div>
              {ferr.phone && <p style={{ color:"#e74c3c", fontSize:"0.72rem", marginTop:3 }}>{ferr.phone}</p>}
            </div>
            {/* Year + Gender */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:13 }}>
              <div>
                <label style={{ display:"block", fontSize:"0.68rem", letterSpacing:2, color:"var(--gold)", textTransform:"uppercase", marginBottom:7, fontWeight:700 }}>Năm Sinh</label>
                <div style={{ position:"relative" }}>
                  <Calendar size={13} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"var(--text-light)" }}/>
                  <input type="number" value={rd.birthYear} onChange={e=>setRd(p=>({...p,birthYear:e.target.value}))} placeholder="1990" min="1940" max="2010"
                    style={{ width:"100%", padding:"11px 10px 11px 30px", background:"var(--dark)", border:"1px solid rgba(201,168,76,0.25)", color:"var(--cream)", fontFamily:"Raleway,sans-serif", fontSize:"0.87rem", outline:"none" }}/>
                </div>
              </div>
              <div>
                <label style={{ display:"block", fontSize:"0.68rem", letterSpacing:2, color:"var(--gold)", textTransform:"uppercase", marginBottom:7, fontWeight:700 }}>Giới Tính</label>
                <select value={rd.gender} onChange={e=>setRd(p=>({...p,gender:e.target.value}))}
                  style={{ width:"100%", padding:"11px 10px", background:"var(--dark)", border:"1px solid rgba(201,168,76,0.25)", color: rd.gender?"var(--cream)":"var(--text-light)", fontFamily:"Raleway,sans-serif", fontSize:"0.87rem", outline:"none" }}>
                  <option value="">-- Chọn --</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
              </div>
            </div>
            {/* Password */}
            <div style={{ marginBottom:13 }}>
              <label style={{ display:"block", fontSize:"0.68rem", letterSpacing:2, color:"var(--gold)", textTransform:"uppercase", marginBottom:7, fontWeight:700 }}>Mật Khẩu *</label>
              <div style={{ position:"relative" }}>
                <Lock size={14} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"var(--text-light)" }}/>
                <input type={showPw?"text":"password"} value={rd.password} onChange={e=>setRd(p=>({...p,password:e.target.value}))} style={inp({ paddingRight:40, borderColor:ferr.password?"#e74c3c":undefined })}/>
                <button type="button" onClick={()=>setShowPw(p=>!p)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"var(--text-light)", cursor:"pointer" }}>
                  {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
              {ferr.password && <p style={{ color:"#e74c3c", fontSize:"0.72rem", marginTop:3 }}>{ferr.password}</p>}
            </div>
            {/* Confirm */}
            <div style={{ marginBottom:18 }}>
              <label style={{ display:"block", fontSize:"0.68rem", letterSpacing:2, color:"var(--gold)", textTransform:"uppercase", marginBottom:7, fontWeight:700 }}>Xác Nhận Mật Khẩu *</label>
              <div style={{ position:"relative" }}>
                <Lock size={14} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"var(--text-light)" }}/>
                <input type="password" value={rd.confirm} onChange={e=>setRd(p=>({...p,confirm:e.target.value}))} style={inp({ borderColor:ferr.confirm?"#e74c3c":undefined })}/>
              </div>
              {ferr.confirm && <p style={{ color:"#e74c3c", fontSize:"0.72rem", marginTop:3 }}>{ferr.confirm}</p>}
            </div>
            <button type="submit" className="btn-gold" style={{ width:"100%", padding:"13px" }} disabled={loading}>
              {loading ? "Đang đăng ký..." : "✦ Tạo Tài Khoản ✦"}
            </button>
          </form>
        )}

        <p style={{ textAlign:"center", marginTop:18, fontSize:"0.76rem", color:"var(--text-light)" }}>
          <Link to="/" style={{ color:"var(--gold)" }}>← Về Trang Chủ</Link>
        </p>
      </div>
    </div>
  );
}