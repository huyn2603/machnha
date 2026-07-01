import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Shield, Truck, RefreshCcw, Headphones, Star, ChevronRight } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { Spinner, ErrBox } from "../components/UIStates";
import { useToast, Toasts } from "../components/Toast";
import { useFetch } from "../hooks/useFetch";
import { getProducts, getCategories, getTestimonials } from "../services/api";

const SLIDES = [
  { sub:"Vật Phẩm Chính Hãng – Mệnh Hợp",        bg:"linear-gradient(135deg,#0D0B08,#1a1208,#0f0c06)", accent:"#D4AF5A" },
  { sub:"Tỳ Hưu Chiêu Tài – Đẩy Lùi Vận Xui",    bg:"linear-gradient(135deg,#100a0a,#1e1008,#0a0808)", accent:"#C0392B" },
  { sub:"Trầm Hương Khánh Hòa Nguyên Chất",        bg:"linear-gradient(135deg,#080e06,#0f1a0a,#060906)", accent:"#8B7A20" },
];

export default function Home() {
  const { toasts, show } = useToast();
  const [catFilter, setCatFilter] = useState("all");
  const [slideIdx,  setSlideIdx]  = useState(0);

  const { data: products     = [], loading: pLoad, error: pErr, refetch: rP } = useFetch(getProducts,     []);
  const { data: categories   = [], loading: cLoad } = useFetch(getCategories,   []);
  const { data: testimonials = [] }                                             = useFetch(getTestimonials, []);

  useEffect(() => {
    const t = setInterval(()=>setSlideIdx(i=>(i+1)%SLIDES.length), 5000);
    return ()=>clearInterval(t);
  }, []);

  const s        = SLIDES[slideIdx];
  const sellers  = products.filter(p=>p.badge==="Bán Chạy").slice(0,4);
  const featured = products.filter(p=>catFilter==="all"||p.category===catFilter).slice(0,8);

  const FEATS = [
    { icon:<Truck size={20}/>,      title:"Miễn Phí Vận Chuyển", desc:"Đơn hàng từ 500K" },
    { icon:<Shield size={20}/>,     title:"Cam Kết Chính Hãng",  desc:"100% sản phẩm thật" },
    { icon:<RefreshCcw size={20}/>, title:"Đổi Trả 30 Ngày",     desc:"Không cần lý do" },
    { icon:<Headphones size={20}/>, title:"Tư Vấn Miễn Phí",     desc:"Qua Zalo & điện thoại" },
  ];

  return (
    <div style={{ paddingTop:88 }}>
      <Toasts list={toasts}/>

      {/* ═══ HERO — chia đôi: trái = nội dung, phải = form preview ═══ */}
      <section style={{
        minHeight:"90vh", background:s.bg,
        position:"relative",
        transition:"background 1.2s ease",
        display:"flex", alignItems:"center",
        overflow:"hidden",
      }}>
        {/* Background pattern */}
        <div style={{position:"absolute",inset:0,opacity:0.035,backgroundImage:`url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23D4AF5A' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`}}/>
        <div style={{position:"absolute",width:600,height:600,borderRadius:"50%",background:`radial-gradient(circle,${s.accent}10 0%,transparent 65%)`,top:"50%",left:"30%",transform:"translate(-50%,-50%)",pointerEvents:"none"}}/>

        <div style={{maxWidth:1320,margin:"0 auto",padding:"80px 32px 140px",width:"100%",display:"grid",gridTemplateColumns:"1fr 1fr",gap:56,alignItems:"center",position:"relative",zIndex:1}} className="hero-grid">

          {/* LEFT — tiêu đề, mô tả, CTA */}
          <div>
            <div style={{display:"inline-flex",alignItems:"center",gap:10,marginBottom:20,padding:"7px 18px",border:`1px solid ${s.accent}50`,background:`${s.accent}0D`,borderRadius:3}}>
              <span style={{color:s.accent,fontSize:"0.7rem",letterSpacing:4,textTransform:"uppercase",fontWeight:700}}>✦ {s.sub} ✦</span>
            </div>
            <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(2.8rem,5.5vw,5rem)",fontWeight:300,letterSpacing:5,lineHeight:1.1,marginBottom:24,color:"var(--white)"}}>
              Phong Thủy<br/>
              <span style={{color:"var(--gold-light)"}}>Mạch Nhà</span>
            </h1>
            <p style={{color:"var(--text-light)",fontSize:"1rem",lineHeight:1.9,maxWidth:480,marginBottom:36}}>
              Mạch Nhà là cửa hàng vật phẩm phong thủy chính hãng, giúp bạn chọn sản phẩm phù hợp với bản mệnh, mục tiêu tài lộc, bình an và không gian sống. Mỗi sản phẩm đều được chọn lọc kỹ, có mô tả rõ ràng và hướng dẫn sử dụng dễ hiểu.
            </p>
            <div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:40}}>
              <Link to="/shop" className="btn-gold" style={{display:"inline-flex",alignItems:"center",gap:8}}>
                Khám Phá Cửa Hàng <ChevronRight size={16}/>
              </Link>
              <Link to="/tu-van" className="btn-outline" style={{display:"inline-flex",alignItems:"center",gap:8}}>
                Tư Vấn Miễn Phí
              </Link>
            </div>
            <div style={{display:"flex",gap:7}}>
              {SLIDES.map((_,i)=>(
                <button key={i} onClick={()=>setSlideIdx(i)} style={{width:i===slideIdx?28:7,height:7,borderRadius:4,background:i===slideIdx?s.accent:"rgba(255,255,255,0.2)",border:"none",cursor:"pointer",transition:"all 0.35s"}}/>
              ))}
            </div>
          </div>

          {/* RIGHT — Preview form + CTA scroll */}
          <div style={{background:"rgba(13,11,8,0.6)",backdropFilter:"blur(12px)",border:`1px solid ${s.accent}30`,borderRadius:8,padding:"32px 28px"}}>
            <div style={{textAlign:"center",marginBottom:20}}>
              <img src="/assets/mach-nha-logo.png" alt="Logo Mạch Nhà" style={{width:90,height:90,objectFit:"cover",borderRadius:"50%",background:"white",marginBottom:10}}/>
              <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.7rem",fontWeight:400,letterSpacing:3,color:"var(--white)",marginBottom:8}}>
                Vật Phẩm <span className="gold-text">Hợp Mệnh</span>
              </h2>
              <p style={{color:"var(--text-light)",fontSize:"0.9rem",lineHeight:1.75}}>
                Khám phá bộ sưu tập đá quý, tượng linh vật, vòng tay và vật phẩm bài trí được chọn lọc theo ngũ hành.
              </p>
            </div>

            {/* Preview các tính năng */}
            {[
              { text:"Sản phẩm có hình ảnh, mô tả và giá rõ ràng" },
              { text:"Gợi ý mệnh phù hợp ngay trong từng sản phẩm" },
              { text:"Thanh toán COD, MoMo/VietQR hoặc chuyển khoản" },
              { text:"Hỗ trợ tư vấn riêng tại trang Tư Vấn" },
            ].map((f,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                <span style={{color:"var(--cream2)",fontSize:"0.9rem"}}>{f.text}</span>
              </div>
            ))}

            <Link
              to="/shop"
              className="btn-gold"
              style={{width:"100%",marginTop:22,padding:"14px",fontSize:"0.9rem",justifyContent:"center"}}
            >
              Xem Sản Phẩm Ngay
            </Link>
            <p style={{textAlign:"center",marginTop:10,fontSize:"0.72rem",color:"var(--text-light)"}}>
              ✦ Chọn vật phẩm đúng nhu cầu, đúng bản mệnh ✦
            </p>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{position:"absolute",bottom:0,left:0,right:0,background:"rgba(13,11,8,0.86)",backdropFilter:"blur(8px)",borderTop:"1px solid rgba(212,175,90,0.18)",display:"flex",justifyContent:"center",flexWrap:"wrap"}}>
          {[
            ["50+",  "Sản phẩm"],
            ["150+", "Khách hàng"],
            ["2025", "Năm thành lập"],
            ["98%",  "Hài lòng"],
          ].map(([num,lbl],i)=>(
            <div key={i} style={{padding:"16px 36px",borderRight:i<3?"1px solid rgba(212,175,90,0.14)":"none",textAlign:"center"}}>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.7rem",fontWeight:600,background:"linear-gradient(135deg,var(--gold-dark),var(--gold))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{num}</div>
              <div style={{fontSize:"0.7rem",color:"var(--text-light)",letterSpacing:1}}>{lbl}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FEATURES BAR ═══ */}
      <section style={{background:"var(--dark2)",borderBottom:"1px solid rgba(212,175,90,0.1)"}}>
        <div style={{maxWidth:1280,margin:"0 auto",padding:"28px 24px",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))"}}>
          {FEATS.map((f,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"18px 24px",borderRight:i<3?"1px solid rgba(212,175,90,0.08)":"none"}}>
              <div style={{color:"var(--gold)",flexShrink:0}}>{f.icon}</div>
              <div>
                <div style={{fontWeight:700,fontSize:"0.82rem",letterSpacing:0.5,marginBottom:2,color:"var(--cream)"}}>{f.title}</div>
                <div style={{fontSize:"0.76rem",color:"var(--text-light)"}}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ BEST SELLERS ═══ */}
      <section style={{padding:"72px 24px",maxWidth:1280,margin:"0 auto"}}>
        <div className="section-heading">
          <div style={{fontSize:"0.7rem",letterSpacing:4,color:"var(--gold)",textTransform:"uppercase",marginBottom:10}}>✦ Được Yêu Thích Nhất ✦</div>
          <h2 style={{letterSpacing:4,color:"var(--white)"}}>Sản Phẩm <span className="gold-text">Bán Chạy</span></h2>
          <p>Được tin tưởng bởi hàng trăm khách hàng</p>
        </div>
        {pErr   ? <ErrBox msg={pErr} onRetry={rP}/> :
         pLoad  ? <Spinner/> : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:22}}>
            {sellers.map(p=><ProductCard key={p.id} product={p} onToast={show}/>)}
          </div>
        )}
        <div style={{textAlign:"center",marginTop:32}}>
          <Link to="/shop" className="btn-outline">Xem Tất Cả Sản Phẩm</Link>
        </div>
      </section>

      {/* ═══ DANH MỤC ═══ */}
      {!cLoad && categories.length > 0 && (
        <section style={{padding:"0 24px 72px",maxWidth:1280,margin:"0 auto"}}>
          <div className="section-heading">
            <div style={{fontSize:"0.7rem",letterSpacing:4,color:"var(--gold)",textTransform:"uppercase",marginBottom:10}}>✦ Đa Dạng Lựa Chọn ✦</div>
            <h2 style={{letterSpacing:4,color:"var(--white)"}}>Khám Phá Theo <span className="gold-text">Danh Mục</span></h2>
          </div>
          <div style={{display:"flex",gap:9,flexWrap:"wrap",justifyContent:"center",marginBottom:32}}>
            {categories.map(c=>(
              <button key={c.id} onClick={()=>setCatFilter(c.id)} style={{padding:"9px 16px",border:`1px solid ${catFilter===c.id?"var(--gold)":"var(--medium)"}`,background:catFilter===c.id?"linear-gradient(135deg,var(--gold-dark),var(--gold))":"transparent",color:catFilter===c.id?"var(--black)":"var(--text-light)",cursor:"pointer",fontSize:"0.78rem",letterSpacing:1,fontFamily:"Raleway,sans-serif",fontWeight:600,transition:"all 0.3s",borderRadius:3}}>
                {c.name}
              </button>
            ))}
          </div>
          {pLoad ? <Spinner/> : (
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:22}}>
              {featured.map(p=><ProductCard key={p.id} product={p} onToast={show}/>)}
            </div>
          )}
        </section>
      )}

      {/* ═══ CTA BANNER ═══ */}
      <section style={{margin:"0 24px 72px",maxWidth:1280,marginLeft:"auto",marginRight:"auto",background:"linear-gradient(135deg,var(--dark2),var(--dark3))",border:"1px solid rgba(212,175,90,0.28)",padding:"52px 44px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:28,position:"relative",overflow:"hidden",borderRadius:4}}>
        <div style={{position:"absolute",right:-30,top:-30,width:280,height:280,borderRadius:"50%",background:"radial-gradient(circle,rgba(212,175,90,0.08) 0%,transparent 70%)"}}/>
        <div style={{position:"relative"}}>
          <div style={{fontSize:"0.7rem",letterSpacing:4,color:"var(--gold)",textTransform:"uppercase",marginBottom:10}}>✦ Tư Vấn Chuyên Sâu ✦</div>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(1.6rem,3vw,2.4rem)",fontWeight:300,letterSpacing:3,marginBottom:10,color:"var(--white)"}}>
            Tư Vấn Phong Thủy<br/><span className="gold-text">1–1 Với Thầy Phong Thủy</span>
          </h2>
          <p style={{color:"var(--text-light)",maxWidth:420,lineHeight:1.85}}>
            Phân tích chuyên sâu nhà ở, văn phòng và cuộc sống. Liên hệ ngay để đặt lịch.
          </p>
        </div>
        <div style={{display:"flex",gap:14,flexWrap:"wrap",position:"relative"}}>
          <a href="tel:0968386408" className="btn-gold">📞 Gọi: 0968 386 408</a>
          <Link to="/tu-van" className="btn-outline">Xem Dịch Vụ Tư Vấn</Link>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      {testimonials.length > 0 && (
        <section style={{background:"var(--dark2)",padding:"72px 24px"}}>
          <div style={{maxWidth:1280,margin:"0 auto"}}>
            <div className="section-heading">
              <div style={{fontSize:"0.7rem",letterSpacing:4,color:"var(--gold)",textTransform:"uppercase",marginBottom:10}}>✦ Khách Hàng Nói Gì ✦</div>
              <h2 style={{letterSpacing:4,color:"var(--white)"}}>Đánh Giá <span className="gold-text">Chân Thực</span></h2>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:22}}>
              {testimonials.map(t=>(
                <div key={t.id} style={{background:"var(--dark)",border:"1px solid rgba(212,175,90,0.15)",padding:26,borderRadius:4}}>
                  <div style={{color:"var(--gold)",fontSize:"2rem",marginBottom:10,opacity:0.35,fontFamily:"Georgia"}}>"</div>
                  <p style={{color:"var(--cream2)",fontSize:"0.9rem",lineHeight:1.85,marginBottom:18}}>{t.text}</p>
                  <div style={{borderTop:"1px solid rgba(212,175,90,0.1)",paddingTop:14,display:"flex",gap:12,alignItems:"center"}}>
                    <div style={{width:38,height:38,borderRadius:"50%",background:t.color,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:"white",flexShrink:0}}>{t.avatar}</div>
                    <div>
                      <div style={{fontWeight:700,fontSize:"0.88rem",color:"var(--cream)"}}>{t.name}</div>
                      <div style={{fontSize:"0.72rem",color:"var(--gold)",marginTop:2}}>{t.product}</div>
                    </div>
                    <div style={{marginLeft:"auto",display:"flex",gap:2}}>
                      {[1,2,3,4,5].map(s=><Star key={s} size={11} fill="var(--gold)" color="var(--gold)"/>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ BLOG TEASER ═══ */}
      <section style={{padding:"72px 24px",maxWidth:1280,margin:"0 auto"}}>
        <div className="section-heading">
          <div style={{fontSize:"0.7rem",letterSpacing:4,color:"var(--gold)",textTransform:"uppercase",marginBottom:10}}>✦ Kiến Thức Phong Thủy ✦</div>
          <h2 style={{letterSpacing:4,color:"var(--white)"}}>Bài Viết <span className="gold-text">Hữu Ích</span></h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:22}}>
          {[
            {title:"Cách Chọn Đá Phong Thủy Theo Mệnh Ngũ Hành",  cat:"Đá Quý",    img:"data:image/jpeg;base64,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", to:"/blog/1"},
            {title:"Bố Cục Phong Thủy Phòng Khách Hút Tài Lộc",    cat:"Phong Thủy",img:"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop",    to:"/blog/2"},
            {title:"Ý Nghĩa Của Tỳ Hưu Trong Phong Thủy Á Đông",  cat:"Kiến Thức", img:"data:image/jpeg;base64,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",  to:"/blog/3"},
          ].map((b,i)=>(
            <Link key={i} to={b.to} style={{textDecoration:"none"}}>
              <div style={{background:"var(--dark2)",border:"1px solid rgba(212,175,90,0.15)",overflow:"hidden",transition:"transform 0.3s,border-color 0.3s",borderRadius:4}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.borderColor="rgba(212,175,90,0.45)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.borderColor="rgba(212,175,90,0.15)";}}>
                <img src={b.img} alt={b.title} style={{width:"100%",height:185,objectFit:"cover"}}/>
                <div style={{padding:18}}>
                  <div style={{fontSize:"0.68rem",color:"var(--gold)",letterSpacing:2,marginBottom:8}}>{b.cat}</div>
                  <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.05rem",fontWeight:500,lineHeight:1.5,color:"var(--cream)",marginBottom:10}}>{b.title}</h3>
                  <span style={{fontSize:"0.8rem",color:"var(--gold)",fontWeight:700}}>Đọc thêm →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <style>{`
        @media(max-width:900px){
          .hero-grid{grid-template-columns:1fr!important;gap:32px!important;padding-bottom:140px!important;}
        }
      `}</style>
    </div>
  );
}
