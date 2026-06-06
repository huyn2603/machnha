import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, Tag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const fmt = n => n.toLocaleString("vi-VN") + "₫";

const COUPONS = { MACHNHA10:10, MACHNHA20:20, NEWUSER15:15 };

export default function Cart() {
  const { items, totalQty, totalPrice, dispatch } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [coupon,   setCoupon]   = useState("");
  const [applied,  setApplied]  = useState(null);
  const [cErr,     setCErr]     = useState("");

  const disc     = applied ? Math.round(totalPrice * COUPONS[applied] / 100) : 0;
  const shipping = totalPrice >= 500000 ? 0 : 35000;
  const total    = totalPrice - disc + shipping;

  const applyCoupon = () => {
    const code = coupon.toUpperCase();
    if (COUPONS[code]) { setApplied(code); setCErr(""); }
    else { setCErr("Mã giảm giá không hợp lệ"); setApplied(null); }
  };

  if (items.length === 0) return (
    <div style={{ paddingTop:155, minHeight:"70vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:18 }}>
      <div style={{ fontSize:"4.5rem", opacity:0.2 }}>🛒</div>
      <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.9rem", fontWeight:300, letterSpacing:3 }}>Giỏ Hàng Trống</h2>
      <p style={{ color:"var(--text-light)" }}>Hãy thêm sản phẩm phong thủy yêu thích vào giỏ hàng</p>
      <Link to="/shop" className="btn-gold">Tiếp Tục Mua Sắm</Link>
    </div>
  );

  return (
    <div style={{ paddingTop:130, maxWidth:1280, margin:"0 auto", padding:"130px 24px 60px" }}>
      <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(1.9rem,4vw,2.7rem)", fontWeight:300, letterSpacing:4, marginBottom:7 }}>
        Giỏ Hàng <span className="gold-text">Của Bạn</span>
      </h1>
      <p style={{ color:"var(--text-light)", marginBottom:36 }}>{totalQty} sản phẩm</p>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:28 }} className="cart-grid">
        {/* Items */}
        <div>
          {/* Header */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 110px 120px 110px 36px", gap:14, padding:"10px 18px", background:"var(--dark2)", fontSize:"0.68rem", letterSpacing:2, textTransform:"uppercase", color:"var(--text-light)", marginBottom:1 }}>
            <span>Sản Phẩm</span><span style={{ textAlign:"center" }}>Đơn Giá</span><span style={{ textAlign:"center" }}>Số Lượng</span><span style={{ textAlign:"right" }}>Thành Tiền</span><span/>
          </div>

          {items.map(item => (
            <div key={item.id} style={{ display:"grid", gridTemplateColumns:"1fr 110px 120px 110px 36px", gap:14, padding:"18px", background:"var(--dark2)", borderBottom:"1px solid rgba(255,255,255,0.04)", alignItems:"center" }}>
              <div style={{ display:"flex", gap:13, alignItems:"center" }}>
                <img src={item.image} alt={item.name} style={{ width:64, height:64, objectFit:"cover", border:"1px solid rgba(201,168,76,0.2)", flexShrink:0 }}/>
                <div>
                  <Link to={`/product/${item.id}`} style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"0.97rem", color:"var(--cream)", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{item.name}</Link>
                  <div style={{ fontSize:"0.68rem", color:"var(--gold-dark)", letterSpacing:1, marginTop:3 }}>Mệnh {item.element}</div>
                </div>
              </div>

              <div style={{ textAlign:"center", color:"var(--gold)", fontWeight:600, fontSize:"0.87rem" }}>{fmt(item.price)}</div>

              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", border:"1px solid var(--medium)" }}>
                <button onClick={()=>dispatch({ type:"SET_QTY", id:item.id, qty:item.qty-1 })} style={{ width:30, height:34, background:"none", border:"none", color:"var(--cream)", cursor:"pointer" }}><Minus size={12}/></button>
                <span style={{ width:34, textAlign:"center", fontSize:"0.87rem" }}>{item.qty}</span>
                <button onClick={()=>dispatch({ type:"SET_QTY", id:item.id, qty:item.qty+1 })} style={{ width:30, height:34, background:"none", border:"none", color:"var(--cream)", cursor:"pointer" }}><Plus size={12}/></button>
              </div>

              <div style={{ textAlign:"right", fontWeight:700, background:"linear-gradient(135deg,var(--gold-dark),var(--gold))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", fontSize:"0.92rem" }}>
                {fmt(item.price * item.qty)}
              </div>

              <button onClick={()=>dispatch({ type:"REMOVE", id:item.id })} style={{ background:"none", border:"none", color:"var(--text-light)", cursor:"pointer", display:"flex", alignItems:"center" }}>
                <Trash2 size={15}/>
              </button>
            </div>
          ))}

          <div style={{ marginTop:18, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <Link to="/shop" style={{ color:"var(--gold)", fontSize:"0.83rem", letterSpacing:1 }}>← Tiếp tục mua sắm</Link>
            <button onClick={()=>dispatch({ type:"CLEAR" })} style={{ background:"none", border:"1px solid var(--medium)", color:"var(--text-light)", padding:"7px 14px", cursor:"pointer", fontSize:"0.78rem", fontFamily:"Raleway,sans-serif" }}>Xóa Tất Cả</button>
          </div>
        </div>

        {/* Summary */}
        <div>
          <div style={{ background:"var(--dark2)", border:"1px solid rgba(201,168,76,0.2)", padding:26 }}>
            <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.35rem", letterSpacing:2, marginBottom:22, color:"var(--gold)" }}>Tổng Đơn Hàng</h3>

            {/* Coupon */}
            <div style={{ marginBottom:22 }}>
              <div style={{ fontSize:"0.68rem", letterSpacing:2, color:"var(--text-light)", marginBottom:9, textTransform:"uppercase" }}>Mã Giảm Giá</div>
              <div style={{ display:"flex", gap:7 }}>
                <div style={{ position:"relative", flex:1 }}>
                  <Tag size={13} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:"var(--text-light)" }}/>
                  <input value={coupon} onChange={e=>setCoupon(e.target.value)} placeholder="Nhập mã..."
                    style={{ width:"100%", padding:"9px 11px 9px 30px", background:"var(--dark)", border:`1px solid ${cErr?"#e74c3c":"var(--medium)"}`, color:"var(--cream)", fontFamily:"Raleway,sans-serif", fontSize:"0.85rem", outline:"none" }}/>
                </div>
                <button onClick={applyCoupon} className="btn-gold" style={{ padding:"9px 13px", whiteSpace:"nowrap", fontSize:"0.76rem" }}>Áp Dụng</button>
              </div>
              {cErr    && <div style={{ color:"#e74c3c", fontSize:"0.74rem", marginTop:5 }}>{cErr}</div>}
              {applied && <div style={{ color:"#27ae60", fontSize:"0.74rem", marginTop:5 }}>✓ Mã {applied} (−{COUPONS[applied]}%)</div>}
              <div style={{ fontSize:"0.68rem", color:"var(--text-light)", marginTop:5 }}>Thử: MACHNHA10, MACHNHA20, NEWUSER15</div>
            </div>

            {/* Price breakdown */}
            <div style={{ borderTop:"1px solid rgba(201,168,76,0.15)", paddingTop:18 }}>
              {[
                ["Tạm tính",   fmt(totalPrice)],
                ...(disc > 0 ? [["Giảm giá", `−${fmt(disc)}`]] : []),
                ["Vận chuyển", shipping === 0 ? "Miễn phí" : fmt(shipping)],
              ].map(([k,v]) => (
                <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", fontSize:"0.87rem" }}>
                  <span style={{ color:"var(--text-light)" }}>{k}</span>
                  <span style={{ color: v.startsWith("−")?"#27ae60":v==="Miễn phí"?"#27ae60":"var(--cream)", fontWeight: v==="Miễn phí"?600:400 }}>{v}</span>
                </div>
              ))}
              <div style={{ display:"flex", justifyContent:"space-between", padding:"14px 0 0", borderTop:"1px solid rgba(201,168,76,0.2)", marginTop:7 }}>
                <span style={{ fontWeight:700, letterSpacing:1, textTransform:"uppercase", fontSize:"0.8rem" }}>Tổng Cộng</span>
                <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.45rem", fontWeight:600, background:"linear-gradient(135deg,var(--gold-dark),var(--gold))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{fmt(total)}</span>
              </div>
            </div>

            {!isLoggedIn && (
              <div style={{ padding:"12px 16px", background:"rgba(212,175,90,0.07)", border:"1px solid rgba(212,175,90,0.25)", borderRadius:4, marginBottom:12, fontSize:"0.85rem", color:"var(--cream2)", textAlign:"center" }}>
                💡 Vui lòng <Link to="/login" state={{from:"/checkout"}} style={{ color:"var(--gold)", fontWeight:700 }}>đăng nhập</Link> hoặc <Link to="/login" state={{tab:"register",from:"/checkout"}} style={{ color:"var(--gold)", fontWeight:700 }}>đăng ký</Link> để đặt hàng
              </div>
            )}
                        <button onClick={()=>{ if (!isLoggedIn) { navigate("/login", {state:{from:"/checkout"}}); } else { navigate("/checkout"); } }} className="btn-gold" style={{ width:"100%", marginTop:22, padding:15, fontSize:"0.87rem", display:"flex", alignItems:"center", justifyContent:"center", gap:9 }}>
              <ShoppingBag size={17}/> Tiến Hành Thanh Toán
            </button>

            <div style={{ marginTop:14, textAlign:"center" }}>
              <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:7 }}>
                {["VISA","MasterCard","MoMo","VNPay","COD"].map(p => <span key={p} style={{ padding:"2px 6px", border:"1px solid var(--medium)", fontSize:"0.58rem", color:"var(--text-light)" }}>{p}</span>)}
              </div>
              <p style={{ fontSize:"0.72rem", color:"var(--text-light)" }}>🔒 Thanh toán an toàn & bảo mật</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`@media(max-width:900px){.cart-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}