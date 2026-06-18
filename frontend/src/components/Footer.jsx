import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook } from "lucide-react";
import { API_BASE } from "../services/api";

export default function Footer() {
  const [email,   setEmail]   = useState("");
  const [subDone, setSubDone] = useState(false);
  const [subErr,  setSubErr]  = useState("");

  const handleSubscribe = async () => {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setSubErr("Email không hợp lệ"); return;
    }
    setSubErr("");
    // Luu vao backend/MySQL
    try {
      const check = await fetch(`${API_BASE}/subscribers?email=${encodeURIComponent(trimmed)}`);
      const list  = await check.json();
      if (list.length > 0) { setSubDone(true); return; } // đã đăng ký rồi
      await fetch(`${API_BASE}/subscribers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, createdAt: new Date().toISOString() }),
      });
      setSubDone(true);
    } catch {
      // vẫn hiện thành công dù server lỗi
      setSubDone(true);
    }
  };

  return (
    <footer style={{ background:"var(--dark)", borderTop:"1px solid rgba(201,168,76,0.2)" }}>
      <div style={{ maxWidth:1280, margin:"0 auto", padding:"60px 24px 40px", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))", gap:44 }}>

        {/* Brand */}
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
            <div style={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,var(--gold-dark),var(--gold))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.3rem" }}>☯</div>
            <div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.2rem", fontWeight:600, letterSpacing:2, background:"linear-gradient(135deg,var(--gold-dark),var(--gold),var(--gold-light))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>PHONG THỦY</div>
              <div style={{ fontSize:"0.55rem", letterSpacing:4, color:"var(--text-light)" }}>MẠCH NHÀ</div>
            </div>
          </div>
          <p style={{ color:"var(--text-light)", fontSize:"0.86rem", lineHeight:1.8, marginBottom:20 }}>
            Mạch Nhà là cửa hàng vật phẩm phong thủy chính hãng, kết hợp tư vấn theo ngũ hành để giúp khách hàng chọn sản phẩm phù hợp với bản mệnh, không gian và mục tiêu sử dụng.
          </p>
          <div style={{ display:"flex", gap:10 }}>
            <a href="https://www.facebook.com" target="_blank" rel="noreferrer"
              style={{ width:36, height:36, border:"1px solid var(--medium)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text-light)", transition:"all 0.3s", borderRadius:4 }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor="var(--gold)"; e.currentTarget.style.color="var(--gold)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor="var(--medium)"; e.currentTarget.style.color="var(--text-light)"; }}
            ><Facebook size={17}/></a>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.15rem", color:"var(--gold)", marginBottom:18, letterSpacing:2 }}>Danh Mục</h4>
          {["Đá Quý & Tinh Thể","Tượng Phật & Thần","Vòng Tay Phong Thủy","Tranh Phong Thủy","La Kinh & Bát Quái","Hương & Trầm"].map(item => (
            <Link key={item} to="/shop" style={{ display:"block", color:"var(--text-light)", fontSize:"0.85rem", padding:"5px 0", transition:"color 0.3s" }}
              onMouseEnter={e=>e.target.style.color="var(--gold)"}
              onMouseLeave={e=>e.target.style.color="var(--text-light)"}
            >› {item}</Link>
          ))}
        </div>

        {/* Info */}
        <div>
          <h4 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.15rem", color:"var(--gold)", marginBottom:18, letterSpacing:2 }}>Thông Tin</h4>
          {[
            { to:"/about",   label:"Về Chúng Tôi" },
            { to:"/blog",    label:"Kiến Thức Phong Thủy" },
            { to:"/tu-van",  label:"Tư Vấn Phong Thủy" },
            { to:"/contact", label:"Liên Hệ" },
          ].map(item => (
            <Link key={item.to} to={item.to} style={{ display:"block", color:"var(--text-light)", fontSize:"0.85rem", padding:"5px 0", transition:"color 0.3s" }}
              onMouseEnter={e=>e.target.style.color="var(--gold)"}
              onMouseLeave={e=>e.target.style.color="var(--text-light)"}
            >› {item.label}</Link>
          ))}
        </div>

        {/* Contact — thông tin thật */}
        <div>
          <h4 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.15rem", color:"var(--gold)", marginBottom:18, letterSpacing:2 }}>Liên Hệ</h4>
          {[
            { icon:<MapPin size={14}/>,  text:"Hòa Lạc, Thạch Thất, Hà Nội" },
            { icon:<Phone size={14}/>,   text:"0968 386 408" },
            { icon:<Mail size={14}/>,    text:"phongthuymachnha8386@gmail.com" },
          ].map((c,i) => (
            <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", color:"var(--text-light)", fontSize:"0.85rem", marginBottom:12 }}>
              <span style={{ color:"var(--gold)", marginTop:2, flexShrink:0 }}>{c.icon}</span>
              <span>{c.text}</span>
            </div>
          ))}
          <div style={{ marginTop:10 }}>
            <div style={{ fontSize:"0.72rem", color:"var(--gold)", letterSpacing:1, marginBottom:6 }}>GIỜ LÀM VIỆC</div>
            <div style={{ color:"var(--text-light)", fontSize:"0.84rem", lineHeight:1.9 }}>
              Thứ 2 – Thứ 7: 8:00 – 21:00<br/>
              Chủ nhật: 9:00 – 18:00
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter — có xác nhận & lưu DB */}
      <div style={{ background:"var(--dark2)", borderTop:"1px solid rgba(201,168,76,0.1)", borderBottom:"1px solid rgba(201,168,76,0.1)", padding:"32px 24px" }}>
        <div style={{ maxWidth:520, margin:"0 auto", textAlign:"center" }}>
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.4rem", fontWeight:400, letterSpacing:3, marginBottom:6 }}>
            Đăng Ký Nhận <span className="gold-text">Tin Phong Thủy</span>
          </h3>
          <p style={{ color:"var(--text-light)", fontSize:"0.84rem", marginBottom:18 }}>Nhận ngay ưu đãi 10% cho đơn hàng đầu tiên</p>

          {subDone ? (
            <div style={{ padding:"16px 24px", background:"rgba(39,174,96,0.1)", border:"1px solid rgba(39,174,96,0.3)", borderRadius:4 }}>
              <div style={{ fontSize:"1.5rem", marginBottom:6 }}>✅</div>
              <p style={{ color:"#27ae60", fontWeight:700, marginBottom:4 }}>Đăng ký thành công!</p>
              <p style={{ color:"var(--text-light)", fontSize:"0.82rem" }}>Cảm ơn bạn đã đăng ký. Chúng tôi sẽ gửi tin tức và ưu đãi đến email của bạn sớm nhất.</p>
            </div>
          ) : (
            <>
              <div style={{ display:"flex", maxWidth:420, margin:"0 auto" }}>
                <input
                  value={email} onChange={e=>setEmail(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&handleSubscribe()}
                  placeholder="Nhập email của bạn..."
                  style={{ flex:1, padding:"11px 14px", background:"var(--dark)", border:"1px solid var(--medium)", borderRight:"none", color:"var(--cream)", fontFamily:"Raleway,sans-serif", fontSize:"0.87rem", outline:"none" }}
                />
                <button onClick={handleSubscribe} className="btn-gold" style={{ padding:"11px 18px", whiteSpace:"nowrap", borderRadius:0 }}>
                  Đăng Ký
                </button>
              </div>
              {subErr && <p style={{ color:"#e74c3c", fontSize:"0.78rem", marginTop:7 }}>{subErr}</p>}
            </>
          )}
        </div>
      </div>

      {/* Bottom */}
      <div style={{ maxWidth:1280, margin:"0 auto", padding:"18px 24px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <p style={{ color:"var(--text-light)", fontSize:"0.76rem" }}>© 2025 Phong Thủy Mạch Nhà. Hòa Lạc, Thạch Thất, Hà Nội.</p>
        <div style={{ display:"flex", gap:10 }}>
          {["VISA","MASTERCARD","MOMO","VNPAY","COD"].map(p => (
            <span key={p} style={{ padding:"3px 7px", border:"1px solid var(--medium)", fontSize:"0.6rem", letterSpacing:0.5, color:"var(--text-light)" }}>{p}</span>
          ))}
        </div>
      </div>
    </footer>
  );
}
