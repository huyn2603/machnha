import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Truck, Shield, RefreshCcw, Star, ChevronRight, Minus, Plus, Send } from "lucide-react";
import { Spinner, ErrBox } from "../components/UIStates";
import { useFetch } from "../hooks/useFetch";
import { getProductById, getProducts } from "../services/api";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast, Toasts } from "../components/Toast";

const fmt = n => n?.toLocaleString("vi-VN") + "₫";

/* ── Hệ thống đánh giá ── */
function ReviewSection({ product, user, isLoggedIn }) {
  const [reviews, setReviews] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`reviews_${product.id}`) || "[]");
      return saved;
    } catch { return []; }
  });
  const [rating,  setRating]  = useState(5);
  const [hover,   setHover]   = useState(0);
  const [content, setContent] = useState("");
  const [submitting, setSub]  = useState(false);
  const [submitted,  setDone] = useState(false);

  const alreadyReviewed = user && reviews.some(r => r.email === user.email);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() || content.length < 10) return;
    setSub(true);
    const newReview = {
      id:      Date.now(),
      name:    user.name,
      email:   user.email,
      avatar:  user.avatar,
      color:   user.color || "var(--gold)",
      rating,
      content: content.trim(),
      date:    new Date().toLocaleDateString("vi-VN"),
    };
    const updated = [newReview, ...reviews];
    setReviews(updated);
    localStorage.setItem(`reviews_${product.id}`, JSON.stringify(updated));
    setContent(""); setRating(5); setSub(false); setDone(true);
    setTimeout(()=>setDone(false), 3000);
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1)
    : product.rating;

  return (
    <div>
      {/* Summary */}
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:24,padding:"18px 20px",background:"rgba(212,175,90,0.05)",border:"1px solid rgba(212,175,90,0.15)",borderRadius:3}}>
        <div style={{textAlign:"center",paddingRight:20,borderRight:"1px solid rgba(212,175,90,0.15)"}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"3rem",fontWeight:600,color:"var(--gold)",lineHeight:1}}>{avgRating}</div>
          <div style={{display:"flex",gap:3,justifyContent:"center",margin:"6px 0"}}>
            {[1,2,3,4,5].map(s=><Star key={s} size={14} fill={s<=Math.round(parseFloat(avgRating))?"var(--gold)":"none"} color={s<=Math.round(parseFloat(avgRating))?"var(--gold)":"var(--medium)"}/>)}
          </div>
          <div style={{fontSize:"0.75rem",color:"var(--text-light)"}}>{product.reviews + reviews.length} đánh giá</div>
        </div>
        <div style={{flex:1}}>
          {[5,4,3,2,1].map(star=>{
            const count = reviews.filter(r=>r.rating===star).length + (star===5?Math.floor(product.reviews*0.65):star===4?Math.floor(product.reviews*0.25):star===3?Math.floor(product.reviews*0.07):star===2?Math.floor(product.reviews*0.02):Math.floor(product.reviews*0.01));
            const total = product.reviews + reviews.length;
            const pct   = total > 0 ? (count/total*100).toFixed(0) : 0;
            return (
              <div key={star} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                <span style={{fontSize:"0.75rem",color:"var(--text-light)",width:14,textAlign:"right"}}>{star}</span>
                <Star size={11} fill="var(--gold)" color="var(--gold)"/>
                <div style={{flex:1,height:6,background:"rgba(212,175,90,0.1)",borderRadius:3,overflow:"hidden"}}>
                  <div style={{width:`${pct}%`,height:"100%",background:"var(--gold)",borderRadius:3,transition:"width 0.5s"}}/>
                </div>
                <span style={{fontSize:"0.72rem",color:"var(--text-light)",width:28}}>{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form đánh giá */}
      {isLoggedIn && !alreadyReviewed ? (
        <div style={{background:"var(--dark2)",border:"1px solid rgba(212,175,90,0.2)",padding:"22px",borderRadius:3,marginBottom:24}}>
          <h4 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.15rem",color:"var(--gold)",marginBottom:16}}>Viết Đánh Giá Của Bạn</h4>
          {submitted && <div style={{color:"#4CAF50",fontSize:"0.87rem",marginBottom:12,padding:"10px 14px",background:"rgba(76,175,80,0.1)",border:"1px solid rgba(76,175,80,0.25)",borderRadius:3}}>✅ Cảm ơn bạn đã đánh giá!</div>}
          <form onSubmit={handleSubmit}>
            {/* Stars selector */}
            <div style={{marginBottom:16}}>
              <div style={{fontSize:"0.72rem",color:"var(--gold-light)",letterSpacing:2,textTransform:"uppercase",marginBottom:8,fontWeight:700}}>Đánh Giá Sao</div>
              <div style={{display:"flex",gap:6}}>
                {[1,2,3,4,5].map(s=>(
                  <button key={s} type="button"
                    onClick={()=>setRating(s)}
                    onMouseEnter={()=>setHover(s)}
                    onMouseLeave={()=>setHover(0)}
                    style={{background:"none",border:"none",cursor:"pointer",padding:2,transition:"transform 0.15s",transform:(hover||rating)>=s?"scale(1.2)":"scale(1)"}}>
                    <Star size={24} fill={(hover||rating)>=s?"var(--gold)":"none"} color={(hover||rating)>=s?"var(--gold)":"var(--medium)"}/>
                  </button>
                ))}
                <span style={{fontSize:"0.85rem",color:"var(--text-light)",marginLeft:8,alignSelf:"center"}}>
                  {["","Tệ","Không tốt","Bình thường","Tốt","Xuất sắc"][hover||rating]}
                </span>
              </div>
            </div>
            {/* Content */}
            <div className="form-group" style={{marginBottom:14}}>
              <label>Nhận Xét *</label>
              <textarea value={content} onChange={e=>setContent(e.target.value)} rows={4}
                placeholder="Chia sẻ trải nghiệm thực tế của bạn về sản phẩm..."
                style={{resize:"vertical",background:"var(--dark)",border:"1px solid var(--medium)",color:"var(--cream)",padding:"11px 14px",fontFamily:"Raleway,sans-serif",outline:"none",borderRadius:3,fontSize:"0.92rem"}}/>
              <span style={{fontSize:"0.72rem",color:"var(--text-light)"}}>{content.length}/500 ký tự (tối thiểu 10)</span>
            </div>
            <button type="submit" className="btn-gold" style={{display:"flex",alignItems:"center",gap:8}} disabled={submitting||content.length<10}>
              <Send size={15}/> {submitting?"Đang gửi...":"Gửi Đánh Giá"}
            </button>
          </form>
        </div>
      ) : isLoggedIn && alreadyReviewed ? (
        <div style={{padding:"14px 18px",background:"rgba(76,175,80,0.08)",border:"1px solid rgba(76,175,80,0.25)",borderRadius:3,marginBottom:24,fontSize:"0.88rem",color:"#4CAF50"}}>
          ✓ Bạn đã đánh giá sản phẩm này
        </div>
      ) : (
        <div style={{padding:"16px 18px",background:"rgba(212,175,90,0.05)",border:"1px solid rgba(212,175,90,0.18)",borderRadius:3,marginBottom:24}}>
          <span style={{color:"var(--text-light)",fontSize:"0.9rem"}}>
            <Link to="/login" style={{color:"var(--gold)",fontWeight:700}}>Đăng nhập</Link> để viết đánh giá
          </span>
        </div>
      )}

      {/* Review list */}
      {reviews.length > 0 ? (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {reviews.map(r=>(
            <div key={r.id} style={{background:"var(--dark2)",border:"1px solid rgba(212,175,90,0.12)",padding:"18px 20px",borderRadius:3}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div style={{display:"flex",gap:12,alignItems:"center"}}>
                  <div style={{width:38,height:38,borderRadius:"50%",background:r.color,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:"white",flexShrink:0}}>{r.avatar}</div>
                  <div>
                    <div style={{fontWeight:700,fontSize:"0.9rem",color:"var(--white)"}}>{r.name}</div>
                    <div style={{fontSize:"0.73rem",color:"var(--text-light)",marginTop:1}}>{r.date}</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:2}}>
                  {[1,2,3,4,5].map(s=><Star key={s} size={13} fill={s<=r.rating?"var(--gold)":"none"} color={s<=r.rating?"var(--gold)":"var(--medium)"}/>)}
                </div>
              </div>
              <p style={{color:"var(--cream2)",fontSize:"0.9rem",lineHeight:1.8}}>{r.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <div style={{textAlign:"center",padding:"36px",color:"var(--text-light)",fontSize:"0.9rem",border:"1px dashed rgba(212,175,90,0.15)",borderRadius:3}}>
          Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!
        </div>
      )}
    </div>
  );
}


/* ════════════════════════════════════════
   Image Gallery
   Ảnh lấy từ product.images[] trong database
════════════════════════════════════════ */
function ProductImageGallery({ product, disc }) {
  const [active,  setActive]  = React.useState(0);
  // Dùng product.images[] nếu có, fallback về [product.image]
  const images = (product.images && product.images.length > 0)
    ? product.images
    : [product.image];

  return (
    <div>
      {/* Main image */}
      <div style={{position:"relative",aspectRatio:"1",background:"linear-gradient(135deg,var(--dark3),var(--dark2))",border:"1px solid rgba(212,175,90,0.2)",overflow:"hidden",borderRadius:4,marginBottom:10}}>
        <img src={images[active]} alt={product.name}
          style={{width:"100%",height:"100%",objectFit:"cover",transition:"all 0.4s"}}/>
        {product.badge&&<span style={{position:"absolute",top:14,left:14,background:product.badgeColor,color:"white",padding:"4px 10px",fontSize:"0.7rem",fontWeight:800,letterSpacing:1,borderRadius:2}}>{product.badge}</span>}
        {disc>0&&<span style={{position:"absolute",top:product.badge?46:14,left:14,background:"var(--dark)",border:"1px solid var(--gold-dark)",color:"var(--gold)",padding:"4px 10px",fontSize:"0.7rem",fontWeight:800,borderRadius:2}}>-{disc}%</span>}
        {/* Image counter */}
        <div style={{position:"absolute",bottom:12,right:12,background:"rgba(13,11,8,0.7)",backdropFilter:"blur(4px)",padding:"4px 10px",borderRadius:20,fontSize:"0.72rem",color:"var(--cream2)"}}>
          {active+1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      <div style={{display:"grid",gridTemplateColumns:`repeat(${images.length},1fr)`,gap:8,marginBottom:12}}>
        {images.map((img,i)=>(
          <div key={i} onClick={()=>setActive(i)} style={{aspectRatio:"1",overflow:"hidden",borderRadius:3,cursor:"pointer",border:`2px solid ${active===i?"var(--gold)":"rgba(212,175,90,0.15)"}`,transition:"border-color 0.2s",opacity:active===i?1:0.65}}>
            <img src={img} alt={`${product.name} ${i+1}`} style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform 0.3s"}}
              onMouseEnter={e=>e.target.style.transform="scale(1.08)"}
              onMouseLeave={e=>e.target.style.transform="none"}/>
          </div>
        ))}
      </div>

    </div>
  );
}

/* ════════════════════════════════════════
   ProductDetail Page
════════════════════════════════════════ */
export default function ProductDetail() {
  const { id }             = useParams();
  const navigate           = useNavigate();
  const { dispatch, wish } = useCart();
  const { isLoggedIn, user } = useAuth();
  const { toasts, show }   = useToast();
  const [qty,   setQty]    = useState(1);
  const [tab,   setTab]    = useState("desc");

  const { data: product, loading, error, refetch } = useFetch(()=>getProductById(id), [id]);
  const { data: allProds = [] }                     = useFetch(getProducts, []);

  if (loading) return <div style={{paddingTop:160}}><Spinner/></div>;
  if (error)   return <div style={{paddingTop:160}}><ErrBox msg={error} onRetry={refetch}/></div>;
  if (!product) return null;

  const inWish  = wish?.find(i=>i.id===product.id);
  const disc    = Math.round(((product.originalPrice-product.price)/product.originalPrice)*100);
  const related = allProds.filter(p=>p.category===product.category&&p.id!==product.id).slice(0,4);

  const handleCart = () => {
    for (let i=0;i<qty;i++) dispatch({type:"ADD",p:product});
    show(`✅ Đã thêm ${qty} "${product.name}" vào giỏ`);
  };
  const handleBuy = () => {
    for (let i=0;i<qty;i++) dispatch({type:"ADD",p:product});
    navigate("/cart");
  };

  return (
    <div style={{paddingTop:120,minHeight:"100vh"}}>
      <Toasts list={toasts}/>

      {/* Breadcrumb */}
      <div style={{maxWidth:1280,margin:"0 auto",padding:"18px 24px",display:"flex",gap:7,alignItems:"center",fontSize:"0.85rem",color:"var(--text-light)"}}>
        <Link to="/"     style={{color:"var(--text-light)"}}>Trang Chủ</Link><ChevronRight size={13}/>
        <Link to="/shop" style={{color:"var(--text-light)"}}>Cửa Hàng</Link><ChevronRight size={13}/>
        <span style={{color:"var(--gold)"}}>{product.name}</span>
      </div>

      {/* Main */}
      <div style={{maxWidth:1280,margin:"0 auto",padding:"0 24px 60px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:52}} className="pd-grid">

        {/* Image Gallery */}
        <ProductImageGallery product={product} disc={disc}/>

        {/* Info */}
        <div>
          <div style={{fontSize:"0.74rem",letterSpacing:3.5,color:"var(--gold)",textTransform:"uppercase",marginBottom:10}}>Mệnh {product.element}</div>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(1.8rem,3vw,2.5rem)",fontWeight:500,lineHeight:1.25,marginBottom:14,color:"var(--white)"}}>{product.name}</h1>

          {/* Stars — nhỏ hơn, thực tế hơn */}
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18}}>
            <div style={{display:"flex",gap:2}}>{[1,2,3,4,5].map(s=><Star key={s} size={14} fill={s<=Math.round(product.rating)?"var(--gold)":"none"} color={s<=Math.round(product.rating)?"var(--gold)":"var(--medium)"}/>)}</div>
            <span style={{color:"var(--gold)",fontWeight:700,fontSize:"0.88rem"}}>{product.rating}</span>
            <span style={{color:"var(--text-light)",fontSize:"0.82rem"}}>({product.reviews} đánh giá)</span>
            <span style={{color:"var(--text-light)",fontSize:"0.78rem"}}>· {product.sold?.toLocaleString()} đã mua</span>
          </div>

          {/* Price */}
          <div style={{display:"flex",alignItems:"baseline",gap:14,padding:"18px 0",borderTop:"1px solid rgba(212,175,90,0.16)",borderBottom:"1px solid rgba(212,175,90,0.16)",marginBottom:20}}>
            <span style={{fontFamily:"'Be Vietnam Pro','Raleway',sans-serif",fontVariantNumeric:"tabular-nums",fontFeatureSettings:'"tnum"',fontSize:"2rem",fontWeight:800,letterSpacing:"-0.5px",background:"linear-gradient(135deg,var(--gold-dark),var(--gold))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{fmt(product.price)}</span>
            {product.originalPrice>product.price&&<span style={{fontFamily:"'Be Vietnam Pro','Raleway',sans-serif",fontVariantNumeric:"tabular-nums",fontSize:"1rem",color:"var(--text-light)",textDecoration:"line-through",fontWeight:500}}>{fmt(product.originalPrice)}</span>}
            {disc>0&&<span style={{background:"rgba(192,57,43,0.16)",color:"#e74c3c",padding:"3px 9px",fontSize:"0.78rem",fontWeight:800,borderRadius:3}}>Tiết kiệm {fmt(product.originalPrice-product.price)}</span>}
          </div>

          <p style={{color:"var(--cream2)",lineHeight:2,marginBottom:16,fontSize:"0.97rem"}}>{product.description}</p>
          <p style={{color:"var(--text-light)",lineHeight:1.85,marginBottom:20,fontSize:"0.9rem",padding:"13px 15px",background:"rgba(212,175,90,0.04)",border:"1px solid rgba(212,175,90,0.1)",borderRadius:3}}>
            ✦ <em>Sản phẩm được chọn lọc kỹ lưỡng, kiểm tra chất lượng trước khi giao. Kèm hộp quà sang trọng, chứng chỉ nguồn gốc và hướng dẫn sử dụng phong thủy.</em>
          </p>

          {/* Features */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:20}}>
            {(product.features||[]).map((f,i)=>(
              <div key={i} style={{display:"flex",gap:7,alignItems:"center",fontSize:"0.88rem"}}>
                <span style={{color:"var(--gold)",fontSize:"1rem"}}>✓</span>
                <span style={{color:"var(--cream2)"}}>{f}</span>
              </div>
            ))}
          </div>

          {/* Destiny */}
          <div style={{marginBottom:24}}>
            <span style={{fontSize:"0.76rem",color:"var(--text-light)",letterSpacing:1.5,marginRight:10}}>PHÙ HỢP MỆNH:</span>
            {(product.destiny||[]).map(d=><span key={d} style={{display:"inline-block",padding:"3px 11px",border:"1px solid var(--gold-dark)",color:"var(--gold)",fontSize:"0.78rem",marginRight:7,marginBottom:4,borderRadius:3}}>{d}</span>)}
          </div>

          {/* Qty */}
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
            <div style={{display:"flex",alignItems:"center",border:"1px solid var(--medium)",borderRadius:3}}>
              <button onClick={()=>setQty(q=>Math.max(1,q-1))} style={{width:38,height:42,background:"none",border:"none",color:"var(--cream)",cursor:"pointer",fontSize:"1.2rem"}}>−</button>
              <span style={{width:42,textAlign:"center",fontWeight:700,fontSize:"1rem"}}>{qty}</span>
              <button onClick={()=>setQty(q=>Math.min(product.stock,q+1))} style={{width:38,height:42,background:"none",border:"none",color:"var(--cream)",cursor:"pointer",fontSize:"1.2rem"}}>+</button>
            </div>
            <span style={{fontSize:"0.85rem",color:"var(--text-light)"}}>
              Còn <strong style={{color:product.stock<10?"#e74c3c":"var(--cream)"}}>{product.stock}</strong> sản phẩm
            </span>
          </div>

          {/* Buttons */}
          <div style={{display:"flex",gap:10,marginBottom:18,flexWrap:"wrap"}}>
            <button onClick={handleCart} className="btn-outline" style={{flex:1,justifyContent:"center"}}><ShoppingCart size={17}/> Thêm Vào Giỏ</button>
            <button onClick={handleBuy}  className="btn-gold"    style={{flex:1,justifyContent:"center"}}>Mua Ngay</button>
            <button onClick={()=>{dispatch({type:"WISH_TOGGLE",p:product});show(inWish?"💔 Đã xóa khỏi yêu thích":"❤️ Đã thêm vào yêu thích");}}
              style={{width:48,height:48,background:inWish?"var(--red-light)":"transparent",border:`1.5px solid ${inWish?"var(--red-light)":"var(--medium)"}`,color:inWish?"white":"var(--text-light)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:3,transition:"all 0.3s"}}>
              <Heart size={18} fill={inWish?"white":"none"}/>
            </button>
          </div>

          {!isLoggedIn&&(
            <div style={{padding:"11px 15px",background:"rgba(212,175,90,0.06)",border:"1px solid rgba(212,175,90,0.18)",borderRadius:3,marginBottom:16,fontSize:"0.87rem",color:"var(--text-light)"}}>
              💡 <Link to="/login" style={{color:"var(--gold)",fontWeight:700}}>Đăng nhập</Link> để thêm vào giỏ và thanh toán
            </div>
          )}

          {/* Shipping */}
          <div style={{display:"flex",flexDirection:"column",gap:10,padding:16,background:"rgba(212,175,90,0.04)",border:"1px solid rgba(212,175,90,0.14)",borderRadius:3}}>
            {[{icon:<Truck size={15}/>,text:"Miễn phí vận chuyển toàn quốc"},{icon:<Shield size={15}/>,text:"Cam kết chính hãng 100%"},{icon:<RefreshCcw size={15}/>,text:"Đổi trả trong 30 ngày"}].map((item,i)=>(
              <div key={i} style={{display:"flex",gap:9,alignItems:"center",fontSize:"0.88rem",color:"var(--cream2)"}}>
                <span style={{color:"var(--gold)"}}>{item.icon}</span>{item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{maxWidth:1280,margin:"0 auto",padding:"0 24px 60px"}}>
        <div style={{display:"flex",borderBottom:"1px solid rgba(212,175,90,0.2)",marginBottom:28}}>
          {[{id:"desc",label:"Mô Tả"},{id:"reviews",label:`Đánh Giá (${product.reviews})`},{id:"shipping",label:"Vận Chuyển"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"13px 28px",background:"none",border:"none",borderBottom:`2px solid ${tab===t.id?"var(--gold)":"transparent"}`,color:tab===t.id?"var(--gold)":"var(--text-light)",cursor:"pointer",fontFamily:"Raleway,sans-serif",fontWeight:700,fontSize:"0.85rem",letterSpacing:1.5,textTransform:"uppercase",marginBottom:-1,transition:"all 0.2s"}}>{t.label}</button>
          ))}
        </div>

        {tab==="desc"&&(
          <div style={{maxWidth:700}}>
            <p style={{color:"var(--cream2)",lineHeight:2,marginBottom:18,fontSize:"0.97rem"}}>{product.description}</p>
            <p style={{color:"var(--text-light)",lineHeight:1.9,marginBottom:20,fontSize:"0.92rem"}}>
              Sản phẩm được chế tác từ nguyên liệu tự nhiên cao cấp, qua quy trình kiểm định nghiêm ngặt. Mỗi vật phẩm đều được làm phong thủy và kèm chứng nhận nguồn gốc. Nếu cần tư vấn về vị trí đặt phù hợp với không gian của bạn, hãy <Link to="/tu-van" style={{color:"var(--gold)"}}>liên hệ tư vấn miễn phí</Link>.
            </p>
            <ul style={{paddingLeft:20}}>{(product.features||[]).map((f,i)=><li key={i} style={{color:"var(--text-light)",marginBottom:9,fontSize:"0.93rem",lineHeight:1.7}}>{f}</li>)}</ul>
          </div>
        )}

        {tab==="reviews"&&<ReviewSection product={product} user={user} isLoggedIn={isLoggedIn}/>}

        {tab==="shipping"&&(
          <div style={{maxWidth:580}}>
            {[["Thời gian giao hàng","2–5 ngày làm việc"],["Phí vận chuyển","Miễn phí đơn từ 500.000đ"],["Đổi trả","30 ngày không điều kiện"],["Đóng gói","Hộp quà sang trọng, chống sốc"]].map(([k,v])=>(
              <div key={k} style={{display:"flex",padding:"14px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                <span style={{width:190,color:"var(--text-light)",fontSize:"0.88rem"}}>{k}</span>
                <span style={{color:"var(--cream2)",fontSize:"0.92rem"}}>{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related */}
      {related.length>0&&(
        <div style={{background:"var(--dark2)",padding:"56px 24px"}}>
          <div style={{maxWidth:1280,margin:"0 auto"}}>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2rem",letterSpacing:4,marginBottom:28,textAlign:"center",color:"var(--white)"}}>
              Sản Phẩm <span className="gold-text">Liên Quan</span>
            </h2>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(235px,1fr))",gap:22}}>
              {related.map(p=><ProductCard key={p.id} product={p} onToast={show}/>)}
            </div>
          </div>
        </div>
      )}

      <style>{`@media(max-width:768px){.pd-grid{grid-template-columns:1fr!important;gap:28px!important}}`}</style>
    </div>
  );
}
