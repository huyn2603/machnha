import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Phone, Calendar } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { requestPasswordOtp, resetPassword, verifyPasswordOtp } from "../services/api";

export default function AuthPage() {
  const { login, register, loading, error } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from || "/";
  const [tab,   setTab]   = useState(location.state?.tab || "login");
  const [showPw,setShowPw]= useState(false);
  const [ferr,  setFerr]  = useState({});
  const [forgotStep, setForgotStep] = useState(null);
  const [forgot, setForgot] = useState({ email:"", otp:"", newPassword:"", confirm:"", resetToken:"" });
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");

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
    if (rd.password.length < 8)                             errs.password = "Tối thiểu 8 ký tự";
    if (rd.password !== rd.confirm)                         errs.confirm  = "Mật khẩu không khớp";
    if (!rd.phone.match(/^[0-9]{10,11}$/))                  errs.phone    = "Số điện thoại không hợp lệ";
    if (Object.keys(errs).length) { setFerr(errs); return; }
    try {
      await register({ name:rd.name, email:rd.email, password:rd.password, phone:rd.phone, birthYear:rd.birthYear?parseInt(rd.birthYear):null, gender:rd.gender||null });
      navigate(from, { replace:true });
    } catch {}
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setFerr({}); setForgotMessage(""); setForgotLoading(true);
    try {
      if (forgotStep === "email") {
        if (!forgot.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) throw new Error("Email không hợp lệ");
        const result = await requestPasswordOtp(forgot.email);
        setForgotMessage(result.message);
        setForgotStep("otp");
      } else if (forgotStep === "otp") {
        if (!/^\d{6}$/.test(forgot.otp)) throw new Error("OTP phải gồm đúng 6 chữ số");
        const result = await verifyPasswordOtp(forgot.email, forgot.otp);
        setForgot(p => ({ ...p, resetToken:result.resetToken }));
        setForgotMessage("OTP chính xác. Hãy tạo mật khẩu mới.");
        setForgotStep("reset");
      } else {
        if (forgot.newPassword.length < 8) throw new Error("Mật khẩu mới phải có ít nhất 8 ký tự");
        if (forgot.newPassword !== forgot.confirm) throw new Error("Mật khẩu xác nhận không khớp");
        const result = await resetPassword(forgot.email, forgot.resetToken, forgot.newPassword);
        setForgotMessage(result.message);
        setLd({ email:forgot.email, password:"" });
        setForgotStep("done");
      }
    } catch (err) {
      setFerr({ forgot:err.message });
    } finally {
      setForgotLoading(false);
    }
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
          <img src="/assets/mach-nha-logo.png" alt="Logo Mạch Nhà" style={{ width:86, height:86, objectFit:"cover", borderRadius:"50%", marginBottom:8, background:"white" }}/>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.5rem", fontWeight:500, letterSpacing:4, background:"linear-gradient(135deg,var(--gold-dark),var(--gold),var(--gold-light))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            Phong Thủy Mạch Nhà
          </h1>
          <p style={{ color:"var(--text-light)", fontSize:"0.75rem", letterSpacing:2, marginTop:4 }}>
            {forgotStep ? "Khôi phục mật khẩu an toàn" : tab==="login" ? "Chào mừng trở lại" : "Tạo tài khoản mới"}
          </p>
        </div>

        {/* Tabs */}
        {!forgotStep && <div style={{ display:"flex", marginBottom:24, borderBottom:"1px solid rgba(201,168,76,0.15)" }}>
          {["login","register"].map(t => (
            <button key={t} onClick={()=>{ setTab(t); setFerr({}); }} style={{ flex:1, padding:"11px 0", background:"none", border:"none", borderBottom:`2px solid ${tab===t?"var(--gold)":"transparent"}`, color: tab===t?"var(--gold)":"var(--text-light)", cursor:"pointer", fontFamily:"Raleway,sans-serif", fontWeight:700, fontSize:"0.78rem", letterSpacing:2, textTransform:"uppercase", transition:"all 0.3s", marginBottom:-1 }}>
              {t==="login" ? "Đăng Nhập" : "Đăng Ký"}
            </button>
          ))}
        </div>}

        {/* API error */}
        {error && <div style={{ background:"rgba(192,57,43,0.1)", border:"1px solid rgba(192,57,43,0.4)", padding:"11px 15px", marginBottom:18, fontSize:"0.83rem", color:"#e74c3c", borderRadius:2 }}>⚠️ {error}</div>}

        {forgotStep ? (
          <form onSubmit={handleForgot}>
            <div style={{ display:"flex", justifyContent:"center", gap:7, marginBottom:22 }}>
              {["email","otp","reset"].map((step, index) => {
                const current = ["email","otp","reset"].indexOf(forgotStep);
                return <span key={step} style={{ width:42, height:4, borderRadius:4, background:index <= current ? "var(--gold)" : "rgba(201,168,76,0.18)" }}/>;
              })}
            </div>
            {forgotMessage && <div style={{ background:"rgba(39,174,96,0.1)", border:"1px solid rgba(39,174,96,0.4)", padding:"11px 15px", marginBottom:16, fontSize:"0.82rem", color:"#7bd89c" }}>{forgotMessage}</div>}
            {ferr.forgot && <div style={{ background:"rgba(192,57,43,0.1)", border:"1px solid rgba(192,57,43,0.4)", padding:"11px 15px", marginBottom:16, fontSize:"0.82rem", color:"#e74c3c" }}>⚠️ {ferr.forgot}</div>}

            {forgotStep === "email" && <div style={{ marginBottom:18 }}>
              <label style={{ display:"block", fontSize:"0.68rem", letterSpacing:2, color:"var(--gold)", textTransform:"uppercase", marginBottom:7, fontWeight:700 }}>Email đã đăng ký</label>
              <div style={{ position:"relative" }}><Mail size={14} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"var(--text-light)" }}/><input type="email" value={forgot.email} onChange={e=>setForgot(p=>({...p,email:e.target.value}))} style={inp()} autoFocus required/></div>
            </div>}

            {forgotStep === "otp" && <div style={{ marginBottom:18 }}>
              <label style={{ display:"block", fontSize:"0.68rem", letterSpacing:2, color:"var(--gold)", textTransform:"uppercase", marginBottom:7, fontWeight:700 }}>Mã OTP trong email</label>
              <input inputMode="numeric" maxLength={6} value={forgot.otp} onChange={e=>setForgot(p=>({...p,otp:e.target.value.replace(/\D/g,"")}))} style={inp({ padding:"14px", textAlign:"center", fontSize:"1.35rem", letterSpacing:10 })} autoFocus required/>
              <p style={{ color:"var(--text-light)", fontSize:"0.74rem", marginTop:8 }}>Mã gồm 6 số và hết hạn sau 10 phút.</p>
            </div>}

            {forgotStep === "reset" && <>
              <div style={{ marginBottom:13 }}><label style={{ display:"block", fontSize:"0.68rem", letterSpacing:2, color:"var(--gold)", textTransform:"uppercase", marginBottom:7, fontWeight:700 }}>Mật khẩu mới</label><div style={{ position:"relative" }}><Lock size={14} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"var(--text-light)" }}/><input type={showPw?"text":"password"} value={forgot.newPassword} onChange={e=>setForgot(p=>({...p,newPassword:e.target.value}))} style={inp({ paddingRight:40 })} minLength={8} required/><button type="button" onClick={()=>setShowPw(p=>!p)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"var(--text-light)", cursor:"pointer" }}>{showPw ? <EyeOff size={15}/> : <Eye size={15}/>}</button></div></div>
              <div style={{ marginBottom:18 }}><label style={{ display:"block", fontSize:"0.68rem", letterSpacing:2, color:"var(--gold)", textTransform:"uppercase", marginBottom:7, fontWeight:700 }}>Nhập lại mật khẩu mới</label><div style={{ position:"relative" }}><Lock size={14} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"var(--text-light)" }}/><input type="password" value={forgot.confirm} onChange={e=>setForgot(p=>({...p,confirm:e.target.value}))} style={inp()} minLength={8} required/></div></div>
            </>}

            {forgotStep === "done" ? <button type="button" className="btn-gold" style={{ width:"100%", padding:"13px" }} onClick={()=>{ setForgotStep(null); setForgotMessage(""); setFerr({}); }}>Đăng Nhập Ngay</button> : <button type="submit" className="btn-gold" style={{ width:"100%", padding:"13px" }} disabled={forgotLoading}>{forgotLoading ? "Đang xử lý..." : forgotStep === "email" ? "Gửi Mã OTP" : forgotStep === "otp" ? "Xác Minh OTP" : "Đổi Mật Khẩu"}</button>}
            {forgotStep !== "done" && <button type="button" onClick={()=>{ setForgotStep(null); setForgotMessage(""); setFerr({}); }} style={{ width:"100%", marginTop:12, padding:8, border:0, background:"none", color:"var(--text-light)", cursor:"pointer" }}>← Quay lại đăng nhập</button>}
          </form>
        ) : tab === "login" ? (
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
              <button type="button" onClick={()=>{ setForgotStep("email"); setForgot(p=>({...p,email:ld.email})); setFerr({}); }} style={{ fontSize:"0.75rem", color:"var(--gold)", cursor:"pointer", border:0, background:"none", padding:0 }}>Quên mật khẩu?</button>
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
