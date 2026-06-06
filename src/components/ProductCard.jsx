import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star, Eye } from "lucide-react";
import { useCart } from "../context/CartContext";

const fmt = n => n.toLocaleString("vi-VN") + "₫";

export default function ProductCard({ product: p, onToast }) {
  const { dispatch, wish } = useCart();
  const [hov, setHov] = useState(false);
  const inWish = wish?.find(i => i.id === p.id);
  const disc   = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);

  const addCart = (e) => {
    e.preventDefault();
    dispatch({ type:"ADD", p });
    onToast?.(`✅ Đã thêm "${p.name}" vào giỏ`);
  };
  const toggleWish = (e) => {
    e.preventDefault();
    dispatch({ type:"WISH_TOGGLE", p });
    onToast?.(inWish ? "💔 Đã xóa khỏi yêu thích" : "❤️ Đã thêm vào yêu thích");
  };

  return (
    <Link to={`/product/${p.id}`} style={{ textDecoration:"none" }}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: "var(--dark2)",
          border: `1px solid ${hov ? "rgba(201,168,76,0.5)" : "rgba(201,168,76,0.15)"}`,
          transition: "all 0.35s",
          transform: hov ? "translateY(-5px)" : "none",
          boxShadow: hov ? "0 18px 48px rgba(0,0,0,0.45)" : "none",
          cursor: "pointer",
          overflow: "hidden",
        }}
      >
        {/* Image */}
        <div style={{ position:"relative", paddingBottom:"100%", background:"var(--dark3)", overflow:"hidden" }}>
          <img src={p.image} alt={p.name} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.5s", transform: hov ? "scale(1.08)" : "scale(1)" }} />
          
          {/* Hover overlay */}
          <div style={{ position:"absolute", inset:0, background:"rgba(13,11,8,0.4)", display:"flex", alignItems:"center", justifyContent:"center", gap:12, opacity: hov ? 1 : 0, transition:"opacity 0.3s" }}>
            <button onClick={addCart} style={{ width:44, height:44, borderRadius:"50%", background:"linear-gradient(135deg,var(--gold-dark),var(--gold))", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--black)" }}>
              <ShoppingCart size={18}/>
            </button>
            <Link to={`/product/${p.id}`} onClick={e=>e.stopPropagation()} style={{ width:44, height:44, borderRadius:"50%", background:"rgba(255,255,255,0.1)", backdropFilter:"blur(4px)", border:"1px solid rgba(255,255,255,0.2)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"white" }}>
              <Eye size={18}/>
            </Link>
          </div>

          {/* Badges */}
          <div style={{ position:"absolute", top:12, left:12, display:"flex", flexDirection:"column", gap:5 }}>
            {p.badge && <span style={{ background:p.badgeColor, color:"white", padding:"3px 8px", fontSize:"0.63rem", fontWeight:700, letterSpacing:1 }}>{p.badge}</span>}
            {disc > 0 && <span style={{ background:"var(--dark)", border:"1px solid var(--gold-dark)", color:"var(--gold)", padding:"3px 8px", fontSize:"0.63rem", fontWeight:700 }}>-{disc}%</span>}
          </div>

          {/* Wishlist btn */}
          <button onClick={toggleWish} style={{ position:"absolute", top:12, right:12, width:34, height:34, borderRadius:"50%", background: inWish ? "var(--red-light)" : "rgba(13,11,8,0.7)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color: inWish ? "white" : "var(--text-light)", transition:"all 0.3s" }}>
            <Heart size={15} fill={inWish ? "white" : "none"}/>
          </button>
        </div>

        {/* Info */}
        <div style={{ padding:16 }}>
          <div style={{ fontSize:"0.68rem", letterSpacing:2, color:"var(--gold-dark)", textTransform:"uppercase", marginBottom:5 }}>Mệnh {p.element}</div>
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.02rem", fontWeight:500, lineHeight:1.4, color:"var(--cream)", marginBottom:10, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{p.name}</h3>

          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
            {[1,2,3,4,5].map(s => <Star key={s} size={11} fill={s<=Math.round(p.rating)?"var(--gold)":"none"} color={s<=Math.round(p.rating)?"var(--gold)":"var(--medium)"}/>)}
            <span style={{ fontSize:"0.72rem", color:"var(--text-light)" }}>({p.reviews})</span>
            <span style={{ fontSize:"0.68rem", color:"var(--text-light)", marginLeft:"auto" }}>Đã bán {p.sold?.toLocaleString()}</span>
          </div>

          <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:12 }}>
            <span style={{ fontFamily:"'Be Vietnam Pro','Raleway',sans-serif", fontVariantNumeric:"tabular-nums", fontSize:"1.05rem", fontWeight:800, letterSpacing:"-0.3px", background:"linear-gradient(135deg,var(--gold-dark),var(--gold))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{fmt(p.price)}</span>
            {p.originalPrice > p.price && <span style={{ fontFamily:"'Be Vietnam Pro','Raleway',sans-serif", fontVariantNumeric:"tabular-nums", fontSize:"0.8rem", color:"var(--text-light)", textDecoration:"line-through", fontWeight:500 }}>{fmt(p.originalPrice)}</span>}
          </div>

          <button onClick={addCart} style={{ width:"100%", padding:9, background: hov ? "linear-gradient(135deg,var(--gold-dark),var(--gold))" : "transparent", border:"1px solid var(--gold-dark)", color: hov ? "var(--black)" : "var(--gold)", fontSize:"0.73rem", letterSpacing:2, fontWeight:700, textTransform:"uppercase", cursor:"pointer", transition:"all 0.35s", fontFamily:"Raleway,sans-serif" }}>
            Thêm Vào Giỏ
          </button>
        </div>
      </div>
    </Link>
  );
}