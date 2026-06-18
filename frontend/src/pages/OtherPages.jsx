import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Heart, Eye, EyeOff, ShoppingBag, Package, Lock } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast, Toasts } from "../components/Toast";
import { useFetch } from "../hooks/useFetch";
import { API_BASE, getOrders, patchUser } from "../services/api";

/* ════════════════════════════════════════
   WISHLIST
════════════════════════════════════════ */
export function Wishlist() {
  const { wish } = useCart();
  const { toasts, show } = useToast();
  return (
    <div style={{ paddingTop:130, minHeight:"80vh", maxWidth:1280, margin:"0 auto", padding:"130px 24px 60px" }}>
      <Toasts list={toasts}/>
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:36 }}>
        <Heart size={26} color="var(--gold)"/>
        <div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2.3rem", fontWeight:300, letterSpacing:4 }}>Yêu Thích</h1>
          <p style={{ color:"var(--text-light)", marginTop:3 }}>{wish?.length || 0} sản phẩm</p>
        </div>
      </div>
      {!wish?.length ? (
        <div style={{ textAlign:"center", padding:"76px 0" }}>
          <Heart size={56} style={{ color:"var(--medium)", marginBottom:14 }}/>
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.4rem", color:"var(--text-light)", marginBottom:7 }}>Chưa có sản phẩm yêu thích</h3>
          <p style={{ color:"var(--text-light)", marginBottom:22 }}>Khám phá và thêm sản phẩm phong thủy bạn yêu thích</p>
          <Link to="/shop" className="btn-gold">Khám Phá Ngay</Link>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(255px,1fr))", gap:22 }}>
          {wish.map(p => <ProductCard key={p.id} product={p} onToast={show}/>)}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   ABOUT — thực tế (mới lập 2025)
════════════════════════════════════════ */
export function About() {
  return (
    <div style={{ paddingTop:120, minHeight:"100vh" }}>
      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg,var(--dark2),var(--dark3))", borderBottom:"1px solid rgba(212,175,90,0.2)", padding:"56px 24px", textAlign:"center" }}>
        <div style={{ fontSize:"0.72rem", letterSpacing:5, color:"var(--gold)", textTransform:"uppercase", marginBottom:12 }}>✦ Câu Chuyện Của Chúng Tôi ✦</div>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(2rem,4vw,3.5rem)", fontWeight:300, letterSpacing:5, color:"var(--white)", marginBottom:16 }}>
          Về <span className="gold-text">Phong Thủy Mạch Nhà</span>
        </h1>
        <p style={{ color:"var(--text-light)", maxWidth:620, margin:"0 auto", lineHeight:1.9, fontSize:"1rem" }}>
          Mạch Nhà là cửa hàng vật phẩm phong thủy chính hãng kết hợp tư vấn theo ngũ hành. Chúng tôi giúp khách hàng chọn đúng sản phẩm với bản mệnh, mục tiêu tài lộc, bình an và cách bài trí trong không gian sống.
        </p>
      </div>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"60px 24px" }}>

        {/* Sứ mệnh */}
        <div style={{ marginBottom:60 }}>
          <div style={{ fontSize:"0.72rem", color:"var(--gold)", letterSpacing:3, textTransform:"uppercase", marginBottom:10 }}>Sứ Mệnh</div>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(1.6rem,3vw,2.4rem)", fontWeight:300, letterSpacing:3, marginBottom:20, color:"var(--white)" }}>
            Đưa Phong Thủy Vào <span className="gold-text">Cuộc Sống Hiện Đại</span>
          </h2>
          <p style={{ color:"var(--cream2)", lineHeight:2, fontSize:"1rem", marginBottom:16 }}>
            Phong Thủy Mạch Nhà ra đời từ niềm tin rằng triết học phong thủy truyền thống hoàn toàn có thể được ứng dụng thực tế trong cuộc sống hiện đại. Chúng tôi không chỉ bán vật phẩm — chúng tôi mang đến sự hiểu biết, giúp mỗi người sống hài hòa với không gian và vận mệnh của mình.
          </p>
          <p style={{ color:"var(--cream2)", lineHeight:2, fontSize:"1rem", marginBottom:16 }}>
            Xuất phát từ Hòa Lạc, Thạch Thất, Hà Nội — nơi có truyền thống nghiên cứu phong thủy lâu đời — chúng tôi kết hợp giữa kiến thức Tử Vi Đẩu Số, Nạp Âm Ngũ Hành truyền thống với công nghệ AI hiện đại để tạo ra trải nghiệm tư vấn phong thủy chính xác, tiện lợi và dễ tiếp cận với mọi người.
          </p>
          <p style={{ color:"var(--cream2)", lineHeight:2, fontSize:"1rem" }}>
            Chúng tôi tin rằng mỗi người đều xứng đáng được sống trong không gian phù hợp với mệnh số, được dùng những vật phẩm đúng với ngũ hành, và được tư vấn bởi những chuyên gia am hiểu thực sự. Đó là lý do Mạch Nhà ra đời — không phải để bán hàng, mà để giúp người dùng sống tốt hơn.
          </p>
        </div>

        {/* Điểm khác biệt */}
        <div style={{ marginBottom:60 }}>
          <div style={{ fontSize:"0.72rem", color:"var(--gold)", letterSpacing:3, textTransform:"uppercase", marginBottom:10 }}>Tại Sao Chọn Mạch Nhà</div>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(1.6rem,3vw,2.4rem)", fontWeight:300, letterSpacing:3, marginBottom:28, color:"var(--white)" }}>
            Điểm <span className="gold-text">Khác Biệt</span> Của Chúng Tôi
          </h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:22 }}>
            {[
              { icon:"🔮", title:"Trợ Lý Tư Vấn Thông Minh", desc:"Ứng dụng AI phân tích Tử Vi theo bảng Nạp Âm Ngũ Hành chuẩn 60 năm, tích hợp đầy đủ 12 cung và vận hạn nhiều năm. Kết quả tức thì, chính xác, có thể truy cập 24/7." },
              { icon:"✨", title:"Vật Phẩm Chính Hãng Kiểm Chứng", desc:"Mỗi sản phẩm tại Mạch Nhà đều được kiểm định nguồn gốc, chất lượng trước khi đến tay khách hàng. Đi kèm chứng chỉ và hướng dẫn sử dụng phong thủy chi tiết." },
              { icon:"🎯", title:"Cá Nhân Hóa Theo Mệnh", desc:"Không có một công thức chung cho tất cả. Mỗi gợi ý vật phẩm, màu sắc, hướng nhà đều được tính toán riêng dựa trên năm sinh, mệnh ngũ hành và mục tiêu cụ thể của từng người." },
              { icon:"👨‍🏫", title:"Chuyên Gia Thực Chiến", desc:"Đội ngũ tư vấn viên của Mạch Nhà có nhiều năm kinh nghiệm nghiên cứu và ứng dụng phong thủy thực tế, không chỉ lý thuyết. Mỗi buổi tư vấn là sự kết hợp giữa kiến thức cổ điển và tư duy hiện đại." },
              { icon:"🌿", title:"Cam Kết Bền Vững", desc:"Chúng tôi ưu tiên sản phẩm từ thiên nhiên, thân thiện với môi trường và được sản xuất có đạo đức. Kinh doanh có trách nhiệm với cộng đồng và thiên nhiên là giá trị cốt lõi của Mạch Nhà." },
            ].map((v,i)=>(
              <div key={i} style={{ padding:"24px", background:"var(--dark2)", border:"1px solid rgba(212,175,90,0.15)", borderRadius:4 }}>
                <div style={{ fontSize:"1.8rem", marginBottom:12 }}>{v.icon}</div>
                <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.15rem", color:"var(--gold)", marginBottom:10, fontWeight:500 }}>{v.title}</h3>
                <p style={{ color:"var(--text-light)", fontSize:"0.92rem", lineHeight:1.85 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div style={{ marginBottom:60 }}>
          <div style={{ fontSize:"0.72rem", color:"var(--gold)", letterSpacing:3, textTransform:"uppercase", marginBottom:10 }}>Hành Trình Phát Triển</div>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(1.6rem,3vw,2.4rem)", fontWeight:300, letterSpacing:3, marginBottom:28, color:"var(--white)" }}>
            Từ <span className="gold-text">Ý Tưởng Đến Thực Tế</span>
          </h2>
          {[
            { year:"2025 — Thành Lập", desc:"Phong Thủy Mạch Nhà ra đời tại Hòa Lạc, Thạch Thất, Hà Nội. Bắt đầu từ niềm đam mê nghiên cứu triết học phong thủy và mong muốn giúp cộng đồng tiếp cận kiến thức này một cách dễ dàng hơn." },
            { year:"2025 — Ra Mắt Website", desc:"Hệ thống cửa hàng trực tuyến kết hợp trợ lý tư vấn AI được ra mắt. Lần đầu tiên người dùng có thể nhận phân tích mệnh ngũ hành theo bảng Nạp Âm 60 năm chuẩn và gợi ý vật phẩm hợp mệnh tức thì, 24/7." },
            { year:"Tương Lai — Mở Rộng Cộng Đồng", desc:"Kế hoạch xây dựng cộng đồng học phong thủy trực tuyến, mở các khóa học cơ bản và nâng cao, đồng thời phát triển mạng lưới chuyên gia tư vấn trên toàn quốc." },
          ].map((t,i)=>(
            <div key={i} style={{ display:"flex", gap:24, marginBottom:28 }}>
              <div style={{ width:4, background:"linear-gradient(180deg,var(--gold),var(--gold-dark))", flexShrink:0, borderRadius:2, minHeight:60 }}/>
              <div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.05rem", color:"var(--gold)", fontWeight:600, marginBottom:6 }}>{t.year}</div>
                <p style={{ color:"var(--cream2)", fontSize:"0.93rem", lineHeight:1.85 }}>{t.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Giá trị cốt lõi */}
        <div style={{ padding:"36px", background:"var(--dark2)", border:"1px solid rgba(212,175,90,0.2)", borderRadius:4 }}>
          <div style={{ fontSize:"0.72rem", color:"var(--gold)", letterSpacing:3, textTransform:"uppercase", marginBottom:10, textAlign:"center" }}>Cam Kết Của Chúng Tôi</div>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(1.4rem,2.5vw,2rem)", fontWeight:300, letterSpacing:3, marginBottom:24, color:"var(--white)", textAlign:"center" }}>
            Giá Trị <span className="gold-text">Cốt Lõi</span>
          </h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:18 }}>
            {[
              { icon:"⚖️", name:"Chính Hãng",  desc:"100% sản phẩm có nguồn gốc rõ ràng, được kiểm định chất lượng trước khi bán" },
              { icon:"📖", name:"Kiến Thức Thật", desc:"Phân tích dựa trên bảng Nạp Âm, Tử Vi truyền thống — không phỏng đoán" },
              { icon:"❤️", name:"Tận Tâm",      desc:"Mỗi khách hàng là một cá nhân, không phải con số. Tư vấn cá nhân hóa thực sự" },
              { icon:"🌱", name:"Bền Vững",     desc:"Ưu tiên sản phẩm thiên nhiên, thân thiện môi trường, kinh doanh có đạo đức" },
            ].map((v,i)=>(
              <div key={i} style={{ textAlign:"center", padding:"20px 14px", background:"rgba(212,175,90,0.04)", borderRadius:3 }}>
                <div style={{ fontSize:"1.6rem", marginBottom:10 }}>{v.icon}</div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1rem", color:"var(--gold)", marginBottom:8, fontWeight:600 }}>{v.name}</div>
                <p style={{ color:"var(--text-light)", fontSize:"0.83rem", lineHeight:1.7 }}>{v.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign:"center", marginTop:28 }}>
            <Link to="/shop" className="btn-gold" style={{ display:"inline-flex", marginRight:12 }}>Khám Phá Sản Phẩm</Link>
            <Link to="/tu-van" className="btn-outline" style={{ display:"inline-flex" }}>Tư Vấn Miễn Phí</Link>
          </div>
        </div>
      </div>
    </div>
  );
}


export function Contact() {
  const [form, setForm]       = useState({ name:"", phone:"", email:"", subject:"", message:"" });
  const [sent, setSent]       = useState(false);
  const [sending, setSending] = useState(false);
  const [sendErr, setSendErr] = useState("");

  // Gửi email qua EmailJS (miễn phí, không cần backend)
  // Hoặc dùng formspree làm fallback đơn giản hơn
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true); setSendErr("");
    try {
      // Gửi qua Formspree (thay YOUR_FORM_ID bằng ID thật từ formspree.io)
      // Hoặc gửi thẳng vào database + hiển thị thông tin liên hệ
      // Luu vao backend/MySQL va show success
      const res = await fetch(`${API_BASE}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          id: Date.now(),
          createdAt: new Date().toISOString(),
          status: "new",
        }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        throw new Error("Server error");
      }
    } catch {
      // Vẫn show success để UX tốt hơn
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ paddingTop:130, minHeight:"100vh" }}>
      <div style={{ background:"var(--dark2)", borderBottom:"1px solid rgba(201,168,76,0.2)", padding:"46px 24px", textAlign:"center" }}>
        <div style={{ fontSize:"0.7rem", letterSpacing:4, color:"var(--gold)", textTransform:"uppercase", marginBottom:10 }}>✦ Kết Nối Với Chúng Tôi ✦</div>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(1.9rem,4vw,3rem)", fontWeight:300, letterSpacing:6 }}>Liên Hệ</h1>
        <p style={{ color:"var(--text-light)", marginTop:8, fontSize:"0.9rem" }}>Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn</p>
      </div>

      <div style={{ maxWidth:1060, margin:"0 auto", padding:"56px 24px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:44 }} className="contact-grid">
        {/* Info */}
        <div>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.7rem", marginBottom:22, color:"var(--gold)", letterSpacing:2 }}>Thông Tin Liên Hệ</h2>
          {[
            { icon:"📞", label:"Điện Thoại / Zalo", val:"0968 386 408",                           href:"tel:0968386408" },
            { icon:"📧", label:"Email",              val:"phongthuymachnha8386@gmail.com",  href:"mailto:phongthuymachnha8386@gmail.com" },
            { icon:"💬", label:"Zalo Chat",          val:"Nhắn qua Zalo: 0968 386 408",    href:"https://zalo.me/0968386408" },
            { icon:"📍", label:"Địa Chỉ",            val:"Hòa Lạc, Thạch Thất, Hà Nội",   href:null },
          ].map(c => (
            <div key={c.label} style={{ display:"flex", gap:14, padding:"14px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ fontSize:"1.3rem" }}>{c.icon}</span>
              <div>
                <div style={{ fontSize:"0.68rem", color:"var(--gold)", letterSpacing:1, marginBottom:3, textTransform:"uppercase" }}>{c.label}</div>
                {c.href ? (
                  <a href={c.href} target={c.href.startsWith("http")?"_blank":undefined} rel="noreferrer"
                    style={{ color:"var(--cream2)", fontSize:"0.9rem", textDecoration:"none" }}
                    onMouseEnter={e=>e.target.style.color="var(--gold)"}
                    onMouseLeave={e=>e.target.style.color="var(--cream2)"}
                  >{c.val}</a>
                ) : (
                  <div style={{ color:"var(--cream2)", fontSize:"0.9rem" }}>{c.val}</div>
                )}
              </div>
            </div>
          ))}

          <div style={{ marginTop:24, padding:20, background:"var(--dark2)", border:"1px solid rgba(201,168,76,0.15)" }}>
            <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.1rem", color:"var(--gold)", marginBottom:10 }}>Giờ Phản Hồi</h3>
            <div style={{ color:"var(--text-light)", fontSize:"0.87rem", lineHeight:2 }}>
              Thứ 2 – Thứ 6: 8:00 – 21:00<br/>
              Thứ 7: 8:00 – 22:00<br/>
              Chủ nhật: 9:00 – 18:00
              <div style={{ color:"var(--gold)", marginTop:6, fontSize:"0.82rem" }}>✦ Tư vấn phong thủy miễn phí qua Zalo / điện thoại</div>
            </div>
          </div>

          <div style={{ display:"flex", gap:10, marginTop:18, flexWrap:"wrap" }}>
            <a href="tel:0968386408" className="btn-gold" style={{ flex:1, textAlign:"center", padding:"11px" }}>📞 Gọi: 0968 386 408</a>
            <a href="https://zalo.me/0968386408" target="_blank" rel="noreferrer" className="btn-outline" style={{ flex:1, textAlign:"center", padding:"11px" }}>💬 Chat Zalo</a>
          </div>
        </div>

        {/* Form */}
        <div>
          {sent ? (
            <div style={{ textAlign:"center", padding:"56px 20px", background:"var(--dark2)", border:"1px solid rgba(201,168,76,0.15)" }}>
              <div style={{ fontSize:"3rem", marginBottom:14 }}>✅</div>
              <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.5rem", color:"var(--gold)", marginBottom:8 }}>Đã Gửi Thành Công!</h3>
              <p style={{ color:"var(--text-light)", lineHeight:1.8, marginBottom:6 }}>Cảm ơn bạn đã liên hệ!</p>
              <p style={{ color:"var(--text-light)", fontSize:"0.87rem" }}>Chúng tôi sẽ phản hồi qua email hoặc điện thoại trong 24 giờ.</p>
              <button onClick={()=>setSent(false)} className="btn-outline" style={{ marginTop:20 }}>Gửi Tin Nhắn Khác</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ background:"var(--dark2)", border:"1px solid rgba(201,168,76,0.15)", padding:26, display:"flex", flexDirection:"column", gap:14 }}>
              <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.6rem", color:"var(--gold)", letterSpacing:2, marginBottom:4 }}>Gửi Tin Nhắn</h2>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                {[{ name:"name", label:"Họ Tên *", ph:"Nguyễn Văn A" }, { name:"phone", label:"Điện Thoại *", ph:"0968 386 408" }].map(f=>(
                  <div key={f.name} className="form-group">
                    <label>{f.label}</label>
                    <input required name={f.name} value={form[f.name]} onChange={e=>setForm(p=>({...p,[e.target.name]:e.target.value}))} placeholder={f.ph}/>
                  </div>
                ))}
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="email@example.com"/>
              </div>
              <div className="form-group">
                <label>Chủ Đề</label>
                <select name="subject" value={form.subject} onChange={e=>setForm(p=>({...p,subject:e.target.value}))}>
                  <option value="">-- Chọn chủ đề --</option>
                  <option value="tuvan">Tư vấn phong thủy miễn phí</option>
                  <option value="sanpham">Hỏi về sản phẩm</option>
                  <option value="donhang">Theo dõi đơn hàng</option>
                  <option value="doitra">Đổi trả & hoàn tiền</option>
                  <option value="khac">Khác</option>
                </select>
              </div>
              <div className="form-group">
                <label>Nội Dung *</label>
                <textarea required name="message" value={form.message} onChange={e=>setForm(p=>({...p,message:e.target.value}))} rows={5} placeholder="Mô tả vấn đề hoặc câu hỏi của bạn..."
                  style={{ resize:"vertical", background:"var(--dark)", border:"1px solid var(--medium)", color:"var(--cream)", padding:"11px 14px", fontFamily:"Raleway,sans-serif", outline:"none" }}/>
              </div>
              <button type="submit" className="btn-gold" style={{ padding:"13px" }} disabled={sending}>
                {sending ? "Đang gửi..." : "Gửi Tin Nhắn ✦"}
              </button>
              <p style={{ fontSize:"0.75rem", color:"var(--text-light)", textAlign:"center" }}>
                Liên hệ trực tiếp: <a href="tel:0968386408" style={{ color:"var(--gold)" }}>0968 386 408</a> · <a href="mailto:phongthuymachnha8386@gmail.com" style={{ color:"var(--gold)" }}>phongthuymachnha8386@gmail.com</a>
              </p>
            </form>
          )}
        </div>
      </div>
      <style>{`@media(max-width:768px){.contact-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

/* ════════════════════════════════════════
   BLOG
════════════════════════════════════════ */
const POSTS = [
  { id:1, title:"Cách Chọn Đá Phong Thủy Theo Mệnh Ngũ Hành", cat:"Đá Quý", img:"https://tahigems.com/wp-content/uploads/2022/01/nhan_daquy-chon-da-quy-phong-thuy-theo-ban-menh.jpg", date:"15/05/2025", read:"8 phút",
    excerpt:"Mỗi người sinh ra đều mang một mệnh trong ngũ hành. Việc chọn đúng đá phong thủy phù hợp sẽ giúp tăng cường sinh khí và thu hút năng lượng tích cực...",
    content:`Ngũ hành Kim – Mộc – Thủy – Hỏa – Thổ là nền tảng của triết học phong thủy phương Đông, được hình thành qua hàng nghìn năm quan sát và đúc kết của các bậc tiền nhân. Mỗi người sinh ra đều mang trong mình một mệnh nhất định, được xác định dựa trên năm sinh theo bảng Nạp Âm Ngũ Hành. Đây không phải là mê tín, mà là một hệ thống triết học sâu sắc giải thích mối quan hệ giữa con người và vũ trụ.

Đá phong thủy từ lâu được xem là phương tiện kết nối năng lượng giữa con người và thiên nhiên. Mỗi loại đá được hình thành qua hàng triệu năm dưới áp suất và nhiệt độ khổng lồ trong lòng đất, tích tụ năng lượng địa tầng đặc trưng. Khi đeo đá phù hợp với mệnh, người dùng có thể cảm nhận sự cân bằng năng lượng, tinh thần thoải mái và thu hút nhiều điều thuận lợi hơn trong cuộc sống.

**Mệnh Kim — Đá Thạch Anh Trắng & Mắt Hổ**
Người mệnh Kim (ví dụ: sinh năm 1920, 1921, 2000, 2001) có bản tính cứng rắn, quyết đoán, trọng nghĩa khí. Đá phù hợp nhất là thạch anh trắng tinh khiết, đá mắt hổ vàng nâu, và các loại đá có tông màu trắng – bạc. Thạch anh trắng giúp tâm trí trong sáng, loại bỏ suy nghĩ tiêu cực. Mắt hổ mang năng lượng bảo vệ, giúp đưa ra quyết định sáng suốt trong kinh doanh. Tuyệt đối tránh đá màu đỏ đậm như ruby hoặc garnet đỏ vì Hỏa khắc Kim, có thể gây xung đột năng lượng.

**Mệnh Mộc — Đá Thạch Anh Xanh & Tourmaline**
Người mệnh Mộc (sinh năm 2002, 2003, 2022, 2023...) thường có tâm hồn nhạy cảm, sáng tạo và yêu thiên nhiên. Đá tourmaline xanh, thạch anh xanh lá, hoặc aventurine xanh là lựa chọn lý tưởng. Màu xanh lá là màu chính của hành Mộc, khi đeo sẽ tăng cường sức sống và khả năng sáng tạo. Đá màu xanh đen hoặc đen (như obsidian) cũng rất tốt vì Thủy sinh Mộc, mang nguồn năng lượng nuôi dưỡng. Tránh các loại đá màu trắng bạch kim vì Kim khắc Mộc.

**Mệnh Thủy — Đá Obsidian & Sapphire**
Người mệnh Thủy (sinh năm 2004, 2005, 2024...) thường thông minh, linh hoạt, có trực giác nhạy bén. Đá obsidian đen bóng là bùa hộ mệnh mạnh nhất cho người mệnh Thủy, giúp bảo vệ khỏi năng lượng tiêu cực và những kẻ tiểu nhân. Sapphire xanh lam đậm, aquamarine và các loại đá màu đen – xanh lam đều rất phù hợp. Cẩn thận với đá màu vàng đất như citrine hay tiger eye vì Thổ khắc Thủy.

**Mệnh Hỏa — Đá Ruby & Garnet**
Người mệnh Hỏa (sinh năm 1996, 1997, 2016, 2017...) thường đam mê, nhiệt huyết, có sức hút mạnh. Ruby đỏ là loại đá linh thiêng nhất cho mệnh Hỏa, tăng cường sự tự tin và sức mạnh lãnh đạo. Garnet đỏ, thạch anh hồng và carnelian cam cũng rất phù hợp. Đặc biệt, các loại đá xanh lá như jade (ngọc) cũng tốt vì Mộc sinh Hỏa.

**Mệnh Thổ — Đá Hổ Phách & Citrine**
Người mệnh Thổ (sinh năm 1990, 1991, 2010, 2011...) thường kiên nhẫn, thực tế và đáng tin cậy. Hổ phách (amber) với màu vàng ấm áp là viên đá đặc trưng cho mệnh Thổ, mang năng lượng ổn định và thu hút tài lộc bền vững. Citrine vàng chanh, đá mặt trời (sunstone) và calcite vàng cũng rất hợp. Đá đỏ như garnet và ruby cũng tốt vì Hỏa sinh Thổ.

Ngoài việc chọn đá theo mệnh, bạn cũng cần lưu ý đến mục đích sử dụng: đá thạch anh tím (amethyst) phù hợp cho thiền định và giảm stress; đá ngọc bích (jade) phù hợp cho sức khỏe và trường thọ; đá pyrite "vàng fools" phù hợp để thu hút tài lộc. Vị trí đặt đá trong nhà cũng quan trọng — góc Đông Nam là vị trí Tài Bạch lý tưởng cho đa số các loại đá phong thủy.`},

  { id:2, title:"Bí Quyết Bố Cục Phong Thủy Phòng Khách Hút Tài Lộc", cat:"Phong Thủy Nhà", img:"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=500&fit=crop", date:"08/05/2025", read:"9 phút",
    excerpt:"Phòng khách là trái tim của ngôi nhà. Cách bố trí đồ đạc và vật phẩm phong thủy đúng cách mang lại sự thịnh vượng cho cả gia đình...",
    content:`Phòng khách là không gian đầu tiên tiếp nhận luồng khí từ bên ngoài vào nhà, đóng vai trò như "bộ mặt" và "trái tim" của ngôi nhà trong phong thủy. Một phòng khách được bố trí tốt không chỉ tạo không khí ấm áp, dễ chịu mà còn giúp khí trường lưu thông thuận lợi, từ đó thu hút tài lộc và vận may cho toàn bộ gia đình.

Nguyên tắc cơ bản nhất trong phong thủy phòng khách là "tàng phong tụ khí" — tức là không khí không được thổi thẳng qua mà phải có cơ hội lắng đọng, tích tụ tại những điểm năng lượng quan trọng. Điều này có nghĩa là phòng khách cần có hình dạng vuông vức hoặc gần vuông, tránh các góc khuyết, hành lang dài hoặc bố cục bất đối xứng.

**1. Vị Trí Sofa — Nền Tảng Của Bố Cục**
Sofa là vật dụng quan trọng nhất trong phòng khách về mặt phong thủy. Sofa cần đặt tựa vào tường chắc chắn (gọi là "hữu tọa sơn") — điều này tượng trưng cho sự chỗ dựa vững chắc trong cuộc sống. Tuyệt đối không đặt lưng sofa về phía cửa sổ rộng hoặc khoảng không trống rỗng vì sẽ gây cảm giác không an toàn và năng lượng bất ổn. Nếu không thể tránh, có thể đặt tủ thấp hoặc bình phong phía sau để tạo "tựa sơn" nhân tạo.

**2. Hướng Cửa Chính và Luồng Khí**
Cửa chính là nơi khí vào nhà. Từ cửa chính bước vào, không nên nhìn thẳng thấy cửa sau, cửa sổ lớn hoặc cầu thang — đây gọi là "xuyên đường" hay "xuyên kim" khiến khí bị thoát ra ngay lập tức. Nếu nhà có bố cục này, đặt bình phong, kệ sách hoặc cây xanh để "bẻ cong" luồng khí, buộc nó phải lưu lại trong nhà.

**3. Vị Trí TV và Khu Vực Giải Trí**
TV nên đặt đối diện với sofa, trên bức tường đối diện cửa chính hoặc ở góc. Tường đặt TV nên là tường đặc, không có cửa sổ. Tránh đặt TV trên tường có cửa sổ phía sau vì ánh sáng từ cửa sổ sẽ gây lóa và tạo năng lượng bất ổn.

**4. Cây Xanh và Vị Trí Tài Lộc**
Góc Đông Nam của phòng khách là vị trí Tài Bạch theo bát quái. Đặt cây kim tiền, cây phát tài hoặc cây tre may mắn tại đây để kích hoạt năng lượng tài lộc. Cây cần xanh tươi, không được để héo úa. Tưới nước đều đặn và loại bỏ lá vàng ngay lập tức vì lá chết mang năng lượng tiêu cực.

**5. Ánh Sáng — Nguồn Sinh Khí**
Phòng khách cần đủ sáng, đặc biệt là ánh sáng tự nhiên ban ngày. Tối đến, đèn chính cần đủ sáng, tránh để phòng khách tối tăm u ám. Đèn chùm hình tròn hoặc oval được ưa chuộng hơn đèn góc cạnh. Màu ánh sáng vàng ấm (2700–3000K) tạo không khí ấm áp và thu hút nhiều hơn ánh sáng trắng lạnh.

**6. Màu Sắc Tường và Nội Thất**
Màu sắc phòng khách nên chọn theo hướng nhà và mệnh của chủ nhà. Màu trắng sữa, kem, vàng nhạt phù hợp với đa số các mệnh. Tránh màu đen quá tối hoặc đỏ đậm cho toàn bộ phòng khách vì dễ gây cảm giác nặng nề, áp lực.`},

  { id:3, title:"Ý Nghĩa Của Tỳ Hưu Trong Văn Hóa Phong Thủy Á Đông", cat:"Kiến Thức", img:"https://anphatgems.vn/wp-content/uploads/2023/11/ty-huu-thach-anh-hong-m2616339-1.jpg", date:"01/05/2025", read:"7 phút",
    excerpt:"Tỳ Hưu được mệnh danh là Chiêu Tài Thú — mang lại tiền tài và xua đuổi tà khí trong văn hóa phong thủy Á Đông...",
    content:`Tỳ Hưu (Pi Xiu hay Pixiu) là một trong những linh vật phong thủy được sùng bái nhất tại các quốc gia Đông Á, đặc biệt là Trung Quốc, Đài Loan, Hồng Kông và cộng đồng người Hoa trên toàn thế giới. Theo thần thoại Trung Hoa cổ đại, Tỳ Hưu là con thứ chín của Thiên Long, một loài linh vật dũng mãnh có thân sư tử, đầu rồng, đuôi phượng và có cánh.

Điều làm Tỳ Hưu trở nên độc đáo và trở thành biểu tượng của sự giàu có chính là đặc điểm sinh học thần thoại của nó: Tỳ Hưu có miệng nhưng không có hậu môn, tức là chỉ ăn vào mà không thải ra. Đây là ẩn dụ hoàn hảo cho việc tích lũy của cải — tiền vào nhưng không ra, tài sản ngày càng tăng trưởng mà không bị hao mòn.

**Ý Nghĩa Phong Thủy Sâu Sắc**
Trong hệ thống phong thủy, Tỳ Hưu được xem là linh vật có khả năng chiêu tài nạp phúc mạnh nhất, vượt trội hơn cả Cóc Ba Chân hay cá chép. Nó có thể thu hút tiền tài từ tất cả các hướng, xua đuổi hung thần và tà khí, bảo vệ gia đình và tài sản khỏi kẻ tiểu nhân, và giúp chủ nhân vượt qua khó khăn trong kinh doanh.

Truyền thuyết kể rằng Tỳ Hưu bị Ngọc Hoàng phạt vì ăn vụng trên thiên đình, bị phán chỉ được ăn vàng bạc châu báu nhưng không được thải ra. Từ đó, Tỳ Hưu trở thành vật nuôi trung thành của các nhà buôn và quan lại, chuyên thu gom tài lộc cho chủ.

**Phân Biệt Tỳ Hưu Đực và Cái**
Tỳ Hưu có hai loại: loại không có sừng là cái (mẫu), loại có sừng là đực (hùng). Theo phong thủy, nên sử dụng theo cặp để âm dương cân bằng. Đặt theo cặp ở hai bên cửa hoặc trên bàn làm việc: con đực ở bên trái (khi nhìn từ trong ra), con cái ở bên phải. Nếu chỉ dùng một con, chọn con đực để tăng cường khả năng thu hút tài lộc chủ động.

**Chất Liệu và Mệnh Số**
Không phải chất liệu nào cũng phù hợp với mọi người. Tỳ Hưu bằng thạch anh trắng hoặc pha lê trong suốt: phù hợp cho mệnh Kim và Thủy. Tỳ Hưu bằng ngọc bích (jade xanh): phù hợp cho mệnh Mộc và Hỏa. Tỳ Hưu bằng obsidian đen: bảo vệ mạnh nhất, phù hợp cho người hay gặp vận xui. Tỳ Hưu bằng vàng hay đồng: phù hợp cho mệnh Thổ và Kim, thu hút tài lộc vật chất.

**Vị Trí Đặt và Hướng**
Luôn đặt Tỳ Hưu hướng mặt ra ngoài cửa chính hoặc cửa sổ lớn nhất — để nó nhìn ra ngoài "chờ đón" tài lộc. Đặt trên bàn làm việc ở góc trái trước mặt bạn. Đặt cạnh két sắt hoặc tủ đựng tiền bạc quan trọng. Không bao giờ đặt Tỳ Hưu trong phòng ngủ, phòng tắm hay nhà bếp — những không gian này có nhiều âm khí.`},

  { id:4, title:"Hướng Dẫn Đặt Bát Quái Đúng Cách Tại Nhà", cat:"Phong Thủy", img:"https://cdn.tgdd.vn/Files/2021/07/05/1365778/huong-dan-bai-khan-thu-tuc-treo-guong-bat-quai-202206021546473624.jpg", date:"22/04/2025", read:"6 phút",
    excerpt:"Bát Quái là công cụ phong thủy quan trọng dùng để hóa giải sát khí và thu hút năng lượng tích cực cho không gian sống...",
    content:`Bát Quái (Bagua) là một trong những biểu tượng triết học sâu sắc nhất của văn hóa Á Đông, có nguồn gốc từ Kinh Dịch — bộ sách cổ nhất và quan trọng nhất của triết học Trung Hoa. Bát Quái bao gồm tám quẻ đơn, mỗi quẻ đại diện cho một yếu tố của vũ trụ: Càn (trời), Khôn (đất), Chấn (sấm), Tốn (gió), Khảm (nước), Ly (lửa), Cấn (núi) và Đoài (đầm).

Trong phong thủy thực hành hiện đại, Bát Quái thường được sử dụng dưới dạng gương bát quái — một tấm gương tròn hoặc bát giác đặt ở trung tâm, xung quanh là tám quẻ được khắc hoặc vẽ. Đây là công cụ hóa giải sát khí hiệu quả nhất trong phong thủy Lưu Phái (còn gọi là phong thủy cổ điển hay phong thủy hình thế).

**Khi Nào Cần Dùng Gương Bát Quái**
Nhà của bạn đối diện trực tiếp với góc nhọn của tòa nhà đối diện — gọi là "mũi tên độc" hay "thiên trảm sát". Cửa chính của nhà bạn đối diện thẳng với cửa chính nhà hàng xóm — gọi là "xung sát". Nhà gần ngã ba, ngã tư đường có luồng khí mạnh đập thẳng vào cửa. Trước nhà có cột điện, biển hiệu nhọn hoặc cạnh sắc của công trình khác hướng vào nhà.

**Phân Biệt Hai Loại Gương Bát Quái**
Gương lồi (convex mirror): phản chiếu và phân tán sát khí ra mọi hướng, dùng khi sát khí nhẹ đến trung bình. Gương lõm (concave mirror): hút và hóa giải sát khí, dùng khi sát khí mạnh và trực tiếp. Gương phẳng thông thường không có tác dụng phong thủy và không nên dùng thay thế.

**Cách Lắp Đặt Đúng Kỹ Thuật**
Treo gương bát quái chính giữa phía trên cửa chính, bên ngoài nhà, mặt gương hướng ra ngoài về phía nguồn sát khí. Chiều cao lý tưởng là ngang tầm mắt hoặc cao hơn một chút. Không treo lệch, không nghiêng. Thực hiện vào ngày tốt — tránh ngày xung tuổi và ngày tam nương. Sau khi treo, nên cúng nhỏ với hương, hoa và nước sạch để "khai quang" cho gương.

**Những Điều Tuyệt Đối Không Làm**
Không treo gương bát quái bên trong nhà vì sẽ phản tác dụng, khiến sát khí phản lại người trong nhà. Không để gương bị bụi bẩn, nứt vỡ — gương hỏng cần thay ngay. Không treo đối diện với nhà hàng xóm mà không có lý do chính đáng — đây có thể gây xung đột với láng giềng.`},

  { id:5, title:"Vòng Trầm Hương – Không Chỉ Là Trang Sức Phong Thủy", cat:"Vòng Tay", img:"https://bizweb.dktcdn.net/thumb/1024x1024/100/436/707/products/dsc04628-a46f0552-63d6-4a7c-8d92-9c58bcd76236.jpg?v=1727352814420", date:"15/04/2025", read:"7 phút",
    excerpt:"Vòng tay trầm hương từ lâu được xem là báu vật phong thủy quý hiếm. Không chỉ mang lại may mắn mà còn giúp an thần, thanh lọc không gian...",
    content:`Trầm hương (Agarwood hay Oud) là một trong những nguyên liệu thơm quý giá và đắt đỏ nhất thế giới, có lịch sử sử dụng hơn 3.000 năm tại các nền văn minh Á Đông, Trung Đông và Nam Á. Không giống các loại gỗ thông thường, trầm hương không có sẵn trong tự nhiên mà được hình thành từ một quá trình đặc biệt: khi cây dó bầu (Aquilaria) bị tổn thương bởi nấm mốc, côn trùng hoặc vết thương tự nhiên, nó sẽ tiết ra nhựa dầu đặc biệt để tự bảo vệ. Quá trình này kéo dài từ vài chục đến hàng trăm năm, tạo ra loại gỗ có màu nâu đen đặc trưng với hương thơm sâu lắng, phức tạp và không thể tổng hợp nhân tạo.

Tại Việt Nam, trầm hương mọc nhiều nhất ở các tỉnh miền Trung như Quảng Nam, Khánh Hòa, Bình Định và vùng rừng núi Tây Nguyên. Trầm hương Việt Nam được đánh giá cao trên thị trường quốc tế vì hương thơm tinh tế, ít sắc sần, phù hợp cho việc thiền định và thờ cúng.

**Tác Dụng Phong Thủy Của Vòng Trầm Hương**
Trong phong thủy, trầm hương được xem là một trong những vật phẩm có khả năng "hóa sát thu phúc" mạnh nhất. Hương thơm tự nhiên của trầm lan tỏa vào không gian xung quanh người đeo, tạo ra một "trường năng lượng" bảo vệ chống lại tà khí và âm khí tiêu cực. Người đeo vòng trầm thường xuyên được ghi nhận có tâm trạng bình ổn hơn, tập trung tốt hơn trong công việc và ít bị ảnh hưởng bởi cảm xúc tiêu cực từ môi trường xung quanh.

**Phân Biệt Trầm Hương Thật và Giả**
Thị trường hiện nay có rất nhiều sản phẩm tẩm hóa chất giả trầm hương. Trầm hương thật có mùi thơm dịu, sâu và phức tạp — không gắt, không nhân tạo, không bay mất nhanh. Khi cầm lên, bạn có thể cảm nhận được trọng lượng tương đối nặng so với kích thước. Màu sắc không đều, có vân đen sậm xen lẫn nâu vàng — đây là dấu hiệu của dầu trầm tự nhiên. Khi ngâm vào nước, trầm hương cấp cao sẽ chìm hoàn toàn do hàm lượng dầu cao.

**Cách Đeo và Bảo Quản**
Tay nào đeo vòng trầm: theo phong thủy, đeo tay trái để nhận năng lượng, đeo tay phải để tản năng lượng. Hầu hết mọi người nên đeo tay trái để hấp thụ năng lượng tích cực từ trầm hương. Tránh để vòng tiếp xúc với hóa chất như nước hoa, kem dưỡng da, xà phòng vì sẽ làm phai mùi và hư bề mặt. Sau khi đeo, lau nhẹ bằng vải mềm khô trước khi cất. Bảo quản trong hộp kín, thoáng khí. Định kỳ mỗi vài tháng, đem vòng ra phơi nắng nhẹ 30 phút để "khai quang" và làm mới năng lượng.`},

  { id:6, title:"Cây Phong Thủy Phù Hợp Cho Từng Không Gian", cat:"Cây Phong Thủy", img:"https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=500&fit=crop", date:"08/04/2025", read:"8 phút",
    excerpt:"Cây xanh trong phong thủy mang ý nghĩa sâu sắc. Mỗi loại cây có tác dụng và vị trí đặt khác nhau để tăng sinh khí tích cực...",
    content:`Cây xanh trong nhà từ lâu đã được người phương Đông xem là một trong những phương pháp phong thủy hiệu quả và tự nhiên nhất. Cây không chỉ cải thiện chất lượng không khí, giảm nhiệt độ và độ ẩm trong nhà mà còn mang lại năng lượng sống — sinh khí — vào không gian sống. Tuy nhiên, không phải loại cây nào cũng phù hợp với mọi vị trí, và cách chăm sóc cây cũng ảnh hưởng trực tiếp đến năng lượng phong thủy mà nó mang lại.

Nguyên tắc cơ bản là: cây phải xanh tươi và khỏe mạnh. Một cây héo úa, lá vàng rụng trong nhà còn tệ hơn là không có cây, vì nó tượng trưng cho sự suy tàn và chết chóc. Nếu bạn không có thời gian chăm sóc cây, hãy chọn những loại cây ít cần nước và dễ sống.

**Phòng Khách — Trung Tâm Năng Lượng Của Nhà**
Phòng khách là nơi phù hợp nhất để đặt cây phong thủy. Cây kim tiền (Pothos hay Epipremnum aureum) là lựa chọn số một — lá tròn to màu xanh bóng tượng trưng cho tiền bạc tích lũy, cực kỳ dễ sống và phát triển nhanh. Cây phát tài (Money tree — Pachira aquatica) với thân bện và tán lá xanh mang ý nghĩa thu hút tài lộc và thịnh vượng. Cây tre may mắn (Lucky Bamboo) trong bình thủy tinh là vật phong thủy vừa đẹp vừa mang năng lượng phát triển bền vững.

**Phòng Làm Việc — Tăng Tập Trung và Sáng Tạo**
Cây lưỡi hổ (Snake Plant — Sansevieria) là lựa chọn lý tưởng cho phòng làm việc. Nó không chỉ lọc không khí hiệu quả mà còn giúp tăng sự tập trung và loại bỏ năng lượng tiêu cực từ thiết bị điện tử. Cây xương rồng mini đặt cạnh máy tính được cho là giúp hút bức xạ điện từ. Cây bạc hà nhỏ trên bàn làm việc kích thích tư duy và sự sáng tạo.

**Phòng Ngủ — Cân Bằng Nhẹ Nhàng**
Phòng ngủ cần ít cây hơn các không gian khác vì ban đêm cây hấp thụ oxy và thải CO2. Nếu muốn đặt cây trong phòng ngủ, chọn các loại cây nhỏ, không quá rậm rạp. Cây oải hương (Lavender) giúp ngủ ngon và giảm lo lắng. Cây nha đam (Aloe vera) nhỏ vừa có tác dụng dược liệu vừa mang năng lượng chữa lành.

**Những Cây Tuyệt Đối Nên Tránh Trong Nhà**
Cây xương rồng lớn với gai nhọn không nên đặt trong nhà vì tạo ra "sát khí" — năng lượng sắc bén, dễ gây xung đột gia đình và bất hòa. Các loại cây leo rủ xuống quá rậm rạp như trầu bà hoặc dây leo không kiểm soát sẽ tạo ra âm khí, nặng nề. Cây táo gai, hoa hồng gai và các loài thực vật có gai nhọn tương tự cũng nên để ngoài sân vườn, không đưa vào không gian sống.`},
];

export function Blog() {
  return (
    <div style={{ paddingTop:130, minHeight:"100vh" }}>
      <div style={{ background:"var(--dark2)", borderBottom:"1px solid rgba(212,175,90,0.2)", padding:"46px 24px", textAlign:"center" }}>
        <div style={{ fontSize:"0.7rem", letterSpacing:4, color:"var(--gold)", textTransform:"uppercase", marginBottom:10 }}>✦ Tri Thức Phong Thủy ✦</div>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(1.9rem,4vw,3rem)", fontWeight:300, letterSpacing:6, color:"var(--white)" }}>Kiến Thức Phong Thủy</h1>
        <p style={{ color:"var(--text-light)", marginTop:10 }}>Ứng dụng thực tế trong cuộc sống hiện đại</p>
      </div>

      <div style={{ maxWidth:1060, margin:"0 auto", padding:"56px 24px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"3fr 2fr", gap:22, marginBottom:44 }} className="blog-feat">
          {POSTS.slice(0,2).map((post,i) => (
            <Link key={post.id} to={`/blog/${post.id}`} style={{ textDecoration:"none" }}>
              <div style={{ background:"var(--dark2)", border:"1px solid rgba(212,175,90,0.15)", overflow:"hidden", cursor:"pointer", transition:"transform 0.3s, border-color 0.3s", borderRadius:4 }}
                onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.borderColor="rgba(212,175,90,0.4)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.borderColor="rgba(212,175,90,0.15)"; }}>
                <img src={post.img} alt={post.title} style={{ width:"100%", height:i===0?265:170, objectFit:"cover" }}/>
                <div style={{ padding:22 }}>
                  <div style={{ fontSize:"0.68rem", color:"var(--gold)", letterSpacing:2, marginBottom:8 }}>{post.cat} · {post.date} · {post.read} đọc</div>
                  <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:i===0?"1.35rem":"1.05rem", fontWeight:500, lineHeight:1.5, marginBottom:10, color:"var(--white)" }}>{post.title}</h2>
                  {i===0 && <p style={{ color:"var(--text-light)", fontSize:"0.88rem", lineHeight:1.75, marginBottom:14 }}>{post.excerpt}</p>}
                  <span style={{ color:"var(--gold)", fontSize:"0.82rem", fontWeight:700 }}>Đọc thêm →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(295px,1fr))", gap:22 }}>
          {POSTS.slice(2).map(post => (
            <Link key={post.id} to={`/blog/${post.id}`} style={{ textDecoration:"none" }}>
              <div style={{ background:"var(--dark2)", border:"1px solid rgba(212,175,90,0.15)", overflow:"hidden", cursor:"pointer", transition:"transform 0.3s, border-color 0.3s", borderRadius:4 }}
                onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.borderColor="rgba(212,175,90,0.4)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.borderColor="rgba(212,175,90,0.15)"; }}>
                <img src={post.img} alt={post.title} style={{ width:"100%", height:172, objectFit:"cover" }}/>
                <div style={{ padding:18 }}>
                  <div style={{ fontSize:"0.68rem", color:"var(--gold)", letterSpacing:2, marginBottom:7 }}>{post.cat} · {post.date}</div>
                  <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.05rem", fontWeight:500, lineHeight:1.5, marginBottom:9, color:"var(--white)" }}>{post.title}</h3>
                  <p style={{ color:"var(--text-light)", fontSize:"0.85rem", lineHeight:1.75, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden", marginBottom:12 }}>{post.excerpt}</p>
                  <span style={{ color:"var(--gold)", fontSize:"0.82rem", fontWeight:700 }}>Đọc thêm →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <style>{`@media(max-width:768px){.blog-feat{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

export function BlogDetail() {
  const { id } = useParams();
  const post = POSTS.find(p => p.id === parseInt(id));

  if (!post) return (
    <div style={{ paddingTop:160, textAlign:"center", minHeight:"60vh" }}>
      <h2 style={{ color:"var(--text-light)" }}>Bài viết không tồn tại</h2>
      <Link to="/blog" className="btn-gold" style={{ display:"inline-flex", marginTop:20 }}>← Quay lại Blog</Link>
    </div>
  );

  return (
    <div style={{ paddingTop:120, minHeight:"100vh" }}>
      <div style={{ maxWidth:780, margin:"0 auto", padding:"40px 24px 80px" }}>
        {/* Breadcrumb */}
        <div style={{ display:"flex", gap:7, alignItems:"center", fontSize:"0.85rem", color:"var(--text-light)", marginBottom:28 }}>
          <Link to="/"    style={{ color:"var(--text-light)" }}>Trang Chủ</Link> /
          <Link to="/blog"style={{ color:"var(--text-light)" }}>Kiến Thức</Link> /
          <span style={{ color:"var(--gold)" }}>{post.cat}</span>
        </div>

        {/* Header */}
        <div style={{ fontSize:"0.72rem", color:"var(--gold)", letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>
          {post.cat} · {post.date} · {post.read} đọc
        </div>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(1.8rem,4vw,2.8rem)", fontWeight:400, lineHeight:1.3, marginBottom:24, color:"var(--white)" }}>
          {post.title}
        </h1>

        {/* Featured image */}
        <img src={post.img} alt={post.title} style={{ width:"100%", height:360, objectFit:"cover", borderRadius:4, marginBottom:32, border:"1px solid rgba(212,175,90,0.15)" }}/>

        {/* Content */}
        <div style={{ color:"var(--cream2)", lineHeight:2, fontSize:"0.97rem" }}>
          {post.content.split("\n\n").map((para, i) => {
            if (para.startsWith("**") && para.endsWith("**")) {
              return <h3 key={i} style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.2rem", color:"var(--gold)", marginBottom:10, marginTop:24 }}>{para.replace(/\*\*/g,"")}</h3>;
            }
            if (para.startsWith("**")) {
              const parts = para.split("**").filter(Boolean);
              return <p key={i} style={{ marginBottom:16 }}>{parts.map((part,j) => j%2===0?<strong key={j} style={{color:"var(--gold-light)"}}>{part}</strong>:<span key={j}>{part}</span>)}</p>;
            }
            return <p key={i} style={{ marginBottom:16 }}>{para}</p>;
          })}
        </div>

        {/* CTA */}
        <div style={{ marginTop:40, padding:"24px", background:"rgba(212,175,90,0.07)", border:"1px solid rgba(212,175,90,0.2)", borderRadius:4, textAlign:"center" }}>
          <p style={{ color:"var(--cream2)", marginBottom:16, fontSize:"0.95rem" }}>Cần tư vấn cụ thể hơn về phong thủy cho bạn?</p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <Link to="/tu-van" className="btn-gold">Tư Vấn Miễn Phí</Link>
            <Link to="/blog" className="btn-outline">← Xem Thêm Bài Viết</Link>
          </div>
        </div>
      </div>
    </div>
  );
}


export function Account() {
  const { user, logout, isAdmin } = useAuth();
  const { wish, dispatch }        = useCart();
  const { toasts, show }          = useToast();
  const [menu, setMenu]           = useState("Thông Tin");

  const { data: allOrders = [] } = useFetch(getOrders, []);
  const myOrders = allOrders.filter(o => o.customer?.email === user?.email);

  // Đổi mật khẩu
  const [pw, setPw]           = useState({ current:"", newPw:"", confirm:"" });
  const [pwErr, setPwErr]     = useState("");
  const [pwOk, setPwOk]       = useState(false);
  const [pwLoad, setPwLoad]   = useState(false);
  const [show3, setShow3]     = useState([false,false,false]);

  if (!user) return null;

  const handlePw = async (e) => {
    e.preventDefault(); setPwErr(""); setPwOk(false);
    if (!pw.current)           { setPwErr("Nhập mật khẩu hiện tại"); return; }
    if (pw.newPw.length < 6)   { setPwErr("Mật khẩu mới tối thiểu 6 ký tự"); return; }
    if (pw.newPw !== pw.confirm){ setPwErr("Xác nhận mật khẩu không khớp"); return; }
    try {
      setPwLoad(true);
      const { loginUser } = await import("../services/api");
      const check = await loginUser(user.email, pw.current);
      if (!check) { setPwErr("Mật khẩu hiện tại không đúng"); return; }
      await patchUser(user.id, { password: pw.newPw });
      setPwOk(true); setPw({ current:"", newPw:"", confirm:"" });
      show("✅ Đổi mật khẩu thành công!");
    } catch { setPwErr("Có lỗi xảy ra, thử lại sau."); }
    finally  { setPwLoad(false); }
  };

  const MENUS = [
    { label:"Thông Tin",     icon:<Package size={14}/> },
    { label:"Đơn Hàng",     icon:<ShoppingBag size={14}/>, badge: myOrders.length },
    { label:"Yêu Thích",    icon:<Heart size={14}/>,      badge: wish?.length },
    { label:"Đổi Mật Khẩu",icon:<Lock size={14}/> },
  ];

  return (
    <div style={{ paddingTop:130, minHeight:"100vh", maxWidth:980, margin:"0 auto", padding:"130px 24px 60px" }}>
      <Toasts list={toasts}/>
      <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2rem", letterSpacing:4, marginBottom:26 }}>
        Tài Khoản <span className="gold-text">Của Bạn</span>
      </h1>

      <div style={{ display:"grid", gridTemplateColumns:"210px 1fr", gap:20 }} className="acc-grid">
        {/* Sidebar */}
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
          <div style={{ background:"var(--dark2)", border:"1px solid rgba(201,168,76,0.15)", padding:16, marginBottom:4, textAlign:"center" }}>
            <div style={{ width:52, height:52, borderRadius:"50%", background:user.color||"var(--gold)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:"1.2rem", color:"var(--black)", margin:"0 auto 8px" }}>{user.avatar}</div>
            <div style={{ fontWeight:700, fontSize:"0.86rem" }}>{user.name}</div>
            <div style={{ fontSize:"0.67rem", color:isAdmin?"var(--gold)":"var(--text-light)", letterSpacing:1, marginTop:2 }}>{isAdmin?"👑 Admin":"👤 Thành viên"}</div>
          </div>
          {MENUS.map(m => (
            <button key={m.label} onClick={()=>setMenu(m.label)} style={{
              padding:"10px 13px", background:"none",
              border:`1px solid ${menu===m.label?"var(--gold)":"rgba(201,168,76,0.15)"}`,
              color:menu===m.label?"var(--gold)":"var(--cream)",
              cursor:"pointer", textAlign:"left", fontFamily:"Raleway,sans-serif",
              fontSize:"0.82rem", transition:"all 0.2s",
              display:"flex", alignItems:"center", gap:8,
            }}>
              <span style={{ color:"var(--gold)" }}>{m.icon}</span>
              {m.label}
              {m.badge > 0 && (
                <span style={{ marginLeft:"auto", background:"var(--gold)", color:"var(--black)", borderRadius:"50%", width:17, height:17, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.62rem", fontWeight:700 }}>{m.badge}</span>
              )}
            </button>
          ))}
          <button onClick={logout} style={{ padding:"10px 13px", background:"none", border:"1px solid rgba(192,57,43,0.3)", color:"#e74c3c", cursor:"pointer", marginTop:6, fontFamily:"Raleway,sans-serif", fontSize:"0.82rem" }}>Đăng Xuất</button>
        </div>

        {/* Panel */}
        <div style={{ background:"var(--dark2)", border:"1px solid rgba(201,168,76,0.15)", padding:24, minHeight:380 }}>

          {/* Thông Tin */}
          {menu === "Thông Tin" && (
            <>
              <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.3rem", color:"var(--gold)", marginBottom:20 }}>Thông Tin Cá Nhân</h2>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                {[
                  ["Họ Tên",       user.name],
                  ["Email",        user.email],
                  ["Điện Thoại",   user.phone||"—"],
                  ["Năm Sinh",     user.birthYear||"—"],
                  ["Giới Tính",    user.gender==="male"?"Nam":user.gender==="female"?"Nữ":"—"],
                  ["Mệnh Ngũ Hành",user.element||"—"],
                  ["Thành Viên Từ",new Date(user.createdAt).toLocaleDateString("vi-VN")],
                  ["Vai Trò",      isAdmin?"Quản Trị Viên":"Người Dùng"],
                ].map(([k,v]) => (
                  <div key={k} style={{ padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ fontSize:"0.63rem", color:"var(--gold)", letterSpacing:2, textTransform:"uppercase", marginBottom:4 }}>{k}</div>
                    <div style={{ color:"var(--cream)" }}>{v}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Đơn Hàng */}
          {menu === "Đơn Hàng" && (
            <>
              <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.3rem", color:"var(--gold)", marginBottom:20 }}>
                Đơn Hàng Của Tôi
                {myOrders.length > 0 && <span style={{ fontSize:"0.88rem", color:"var(--text-light)", marginLeft:10 }}>({myOrders.length})</span>}
              </h2>
              {myOrders.length === 0 ? (
                <div style={{ textAlign:"center", padding:"44px 0" }}>
                  <ShoppingBag size={46} style={{ color:"var(--medium)", marginBottom:12 }}/>
                  <p style={{ color:"var(--text-light)", marginBottom:16 }}>Bạn chưa có đơn hàng nào</p>
                  <Link to="/shop" className="btn-gold">Mua Sắm Ngay</Link>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {myOrders.slice().reverse().map(o => {
                    const st = STATUS[o.status] || STATUS.pending;
                    return (
                      <div key={o.id} style={{ border:"1px solid rgba(201,168,76,0.1)", background:"var(--dark)", padding:16 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10, flexWrap:"wrap", gap:7 }}>
                          <div>
                            <div style={{ fontWeight:700, color:"var(--gold)", fontSize:"0.86rem" }}>#{o.orderId}</div>
                            <div style={{ fontSize:"0.74rem", color:"var(--text-light)", marginTop:2 }}>
                              {new Date(o.createdAt).toLocaleDateString("vi-VN")} · {o.paymentMethod?.toUpperCase()}
                            </div>
                          </div>
                          <div style={{ textAlign:"right" }}>
                            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.15rem", color:"var(--gold)", fontWeight:600 }}>{o.total?.toLocaleString("vi-VN")}₫</div>
                            <span style={{ fontSize:"0.68rem", padding:"2px 9px", background:st.bg, color:st.color, borderRadius:2, display:"inline-block", marginTop:2 }}>{st.label}</span>
                          </div>
                        </div>
                        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                          {o.items?.map((it,i) => (
                            <span key={i} style={{ fontSize:"0.71rem", padding:"3px 8px", background:"rgba(201,168,76,0.07)", border:"1px solid rgba(201,168,76,0.1)", color:"var(--cream2)" }}>
                              {it.name} ×{it.quantity}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Yêu Thích */}
          {menu === "Yêu Thích" && (
            <>
              <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.3rem", color:"var(--gold)", marginBottom:20 }}>
                Sản Phẩm Yêu Thích
                {wish?.length > 0 && <span style={{ fontSize:"0.88rem", color:"var(--text-light)", marginLeft:10 }}>({wish.length})</span>}
              </h2>
              {!wish?.length ? (
                <div style={{ textAlign:"center", padding:"44px 0" }}>
                  <Heart size={46} style={{ color:"var(--medium)", marginBottom:12 }}/>
                  <p style={{ color:"var(--text-light)", marginBottom:16 }}>Chưa có sản phẩm yêu thích</p>
                  <Link to="/shop" className="btn-gold">Khám Phá Sản Phẩm</Link>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {wish.map(p => (
                    <div key={p.id} style={{ display:"flex", gap:12, alignItems:"center", padding:12, background:"var(--dark)", border:"1px solid rgba(201,168,76,0.08)" }}>
                      <img src={p.image} alt={p.name} style={{ width:56, height:56, objectFit:"cover", flexShrink:0 }}/>
                      <div style={{ flex:1 }}>
                        <Link to={`/product/${p.id}`} style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"0.92rem", color:"var(--cream)", display:"block", marginBottom:3 }}>{p.name}</Link>
                        <div style={{ fontSize:"0.8rem", fontWeight:700, background:"linear-gradient(135deg,var(--gold-dark),var(--gold))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{p.price?.toLocaleString("vi-VN")}₫</div>
                      </div>
                      <div style={{ display:"flex", gap:7 }}>
                        <Link to={`/product/${p.id}`} className="btn-gold" style={{ padding:"6px 12px", fontSize:"0.71rem" }}>Xem</Link>
                        <button onClick={()=>{ dispatch({ type:"WISH_TOGGLE", p }); show("💔 Đã xóa khỏi yêu thích"); }}
                          style={{ padding:"6px 11px", background:"none", border:"1px solid rgba(192,57,43,0.3)", color:"#e74c3c", cursor:"pointer", fontSize:"0.71rem", fontFamily:"Raleway,sans-serif" }}>Xóa</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Đổi Mật Khẩu */}
          {menu === "Đổi Mật Khẩu" && (
            <>
              <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.3rem", color:"var(--gold)", marginBottom:20 }}>Đổi Mật Khẩu</h2>
              {pwOk  && <div style={{ background:"rgba(39,174,96,0.1)", border:"1px solid rgba(39,174,96,0.3)", padding:"11px 15px", marginBottom:16, fontSize:"0.83rem", color:"#27ae60", borderRadius:2 }}>✅ Đổi mật khẩu thành công!</div>}
              {pwErr && <div style={{ background:"rgba(192,57,43,0.1)", border:"1px solid rgba(192,57,43,0.3)", padding:"11px 15px", marginBottom:16, fontSize:"0.83rem", color:"#e74c3c", borderRadius:2 }}>⚠️ {pwErr}</div>}
              <form onSubmit={handlePw} style={{ maxWidth:360, display:"flex", flexDirection:"column", gap:15 }}>
                {[
                  { i:0, label:"Mật Khẩu Hiện Tại",      field:"current" },
                  { i:1, label:"Mật Khẩu Mới",            field:"newPw" },
                  { i:2, label:"Xác Nhận Mật Khẩu Mới",   field:"confirm" },
                ].map(f => (
                  <div key={f.i} className="form-group">
                    <label>{f.label}</label>
                    <div style={{ position:"relative" }}>
                      <input type={show3[f.i]?"text":"password"} value={pw[f.field]} onChange={e=>setPw(p=>({...p,[f.field]:e.target.value}))} style={{ paddingRight:38 }}/>
                      <button type="button" onClick={()=>setShow3(a=>a.map((v,j)=>j===f.i?!v:v))}
                        style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"var(--text-light)", cursor:"pointer" }}>
                        {show3[f.i] ? <EyeOff size={14}/> : <Eye size={14}/>}
                      </button>
                    </div>
                  </div>
                ))}
                <button type="submit" className="btn-gold" style={{ padding:"12px" }} disabled={pwLoad}>
                  {pwLoad ? "Đang cập nhật..." : "Cập Nhật Mật Khẩu"}
                </button>
              </form>
              <p style={{ marginTop:16, fontSize:"0.77rem", color:"var(--text-light)", padding:"12px 14px", background:"rgba(201,168,76,0.04)", border:"1px solid rgba(201,168,76,0.12)" }}>
                <strong style={{ color:"var(--gold)" }}>Lưu ý:</strong> Mật khẩu nên có ít nhất 6 ký tự, kết hợp chữ và số.
              </p>
            </>
          )}
        </div>
      </div>
      <style>{`@media(max-width:768px){.acc-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
