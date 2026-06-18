import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Check, CheckCircle, Copy, CreditCard, Landmark, Truck, Wallet } from "lucide-react";
import { useCart } from "../context/CartContext";
import { createOrder, validateCoupon } from "../services/api";

const fmt = n => n.toLocaleString("vi-VN") + "₫";
const CITIES = ["Hà Nội","TP. Hồ Chí Minh","Đà Nẵng","Hải Phòng","Cần Thơ","An Giang","Bình Dương","Đồng Nai","Khánh Hòa","Nghệ An","Thanh Hóa","Huế","Bắc Ninh","Thái Nguyên"];

export default function Checkout() {
  const { items, totalPrice, dispatch } = useCart();
  const [step,    setStep]    = useState(1);
  const [pay,     setPay]     = useState("momo");
  const [placing, setPlacing] = useState(false);
  const [orderRes,setOrderRes]= useState(null);
  const [errs,    setErrs]    = useState({});
  const [couponInput, setCouponInput] = useState("");
  const [couponData,  setCouponData]  = useState(null);
  const [couponErr,   setCouponErr]   = useState("");
  const [copied,      setCopied]      = useState("");

  const [form, setForm] = useState({ name:"", phone:"", email:"", address:"", city:"", district:"", note:"" });
  const set = (k,v) => { setForm(p=>({...p,[k]:v})); if(errs[k]) setErrs(p=>({...p,[k]:""})); };

  const disc     = couponData ? couponData.type==="percent" ? Math.round(totalPrice*couponData.discount/100) : couponData.discount : 0;
  const shipping = totalPrice >= 500000 ? 0 : 35000;
  const total    = totalPrice - disc + shipping;
  const transferInfo = {
    accountName: "Nguyễn Ngọc Huy",
    accountNumber: "0968386408",
    bank: "MoMo / VietQR",
    amount: `${total.toLocaleString("vi-VN")}đ`,
    content: `MACHNHA ${form.phone || "SDT"}`,
  };
  const paymentMethods = [
    { id:"cod", icon:<Truck size={22}/>, label:"Thanh toán khi nhận hàng (COD)", desc:"Trả tiền mặt khi nhận hàng tại nhà" },
    { id:"momo", icon:<Wallet size={22}/>, label:"MoMo / VietQR", desc:"Quét QR bằng MoMo hoặc app ngân hàng bất kỳ" },
    { id:"bank", icon:<Landmark size={22}/>, label:"Chuyển khoản ngân hàng", desc:"Chuyển khoản theo nội dung đơn hàng" },
    { id:"vnpay", icon:<CreditCard size={22}/>, label:"VNPay", desc:"Demo cổng thanh toán, đơn sẽ được ghi nhận chờ xác nhận" },
    { id:"card", icon:<CreditCard size={22}/>, label:"Thẻ nội địa / quốc tế", desc:"Demo thanh toán thẻ, chưa thu tiền thật" },
  ];

  const copyPayment = (value, key) => {
    navigator.clipboard?.writeText(value).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(""), 1600);
    });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())                                   e.name    = "Vui lòng nhập họ tên";
    if (!form.phone.match(/^[0-9]{10,11}$/))                 e.phone   = "Số điện thoại không hợp lệ";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))    e.email   = "Email không hợp lệ";
    if (!form.address.trim())                                e.address = "Vui lòng nhập địa chỉ";
    if (!form.city)                                          e.city    = "Vui lòng chọn tỉnh/thành";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const applyCoupon = async () => {
    setCouponErr("");
    try {
      const d = await validateCoupon(couponInput);
      if (d) setCouponData(d); else { setCouponErr("Mã giảm giá không hợp lệ"); setCouponData(null); }
    } catch { setCouponErr("Không thể kiểm tra mã. Thử lại."); }
  };

  const placeOrder = async () => {
    setPlacing(true);
    try {
      const res = await createOrder({
        customer: form,
        items: items.map(i=>({ id:i.id, name:i.name, price:i.price, quantity:i.qty })),
        coupon: couponData?.code || null,
        discount: disc, shipping, total,
        paymentMethod: pay,
        paymentContent: transferInfo.content,
      });
      dispatch({ type:"CLEAR" });
      setOrderRes(res);
      setStep(3);
    } catch (e) {
      alert("Đặt hàng thất bại: " + e.message);
    } finally {
      setPlacing(false);
    }
  };

  /* ── Success ── */
  if (step === 3) return (
    <div style={{ paddingTop:155, minHeight:"80vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"155px 24px 60px" }}>
      <CheckCircle size={76} color="var(--gold)" style={{ marginBottom:22 }}/>
      <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2.4rem", fontWeight:300, letterSpacing:4, marginBottom:10 }}>Đặt Hàng <span className="gold-text">Thành Công!</span></h1>
      <p style={{ color:"var(--text-light)", marginBottom:7 }}>Cảm ơn bạn đã tin tưởng mua sắm tại Phong Thủy Mạch Nhà</p>
      {orderRes && <p style={{ color:"var(--text-light)", marginBottom:7 }}>Mã đơn hàng: <strong style={{ color:"var(--gold)" }}>{orderRes.orderId}</strong></p>}
      <p style={{ color:"var(--text-light)", marginBottom:30, fontSize:"0.88rem" }}>Đơn hàng đã được lưu vào hệ thống.<br/>Chúng tôi sẽ liên hệ xác nhận trong 30 phút.</p>
      <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
        <Link to="/" className="btn-gold">Về Trang Chủ</Link>
        <Link to="/shop" className="btn-outline">Tiếp Tục Mua Sắm</Link>
      </div>
    </div>
  );

  return (
    <div style={{ paddingTop:130, minHeight:"100vh" }}>
      {/* Header */}
      <div style={{ background:"var(--dark2)", borderBottom:"1px solid rgba(201,168,76,0.2)", padding:"30px 24px", textAlign:"center" }}>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.9rem", fontWeight:300, letterSpacing:4 }}>Thanh Toán</h1>
        {/* Step indicator */}
        <div style={{ display:"flex", justifyContent:"center", alignItems:"center", marginTop:18 }}>
          {[{ n:1,label:"Thông Tin" },{ n:2,label:"Thanh Toán" }].map((s,i) => (
            <React.Fragment key={s.n}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                <div style={{ width:34, height:34, borderRadius:"50%", background: step>=s.n?"linear-gradient(135deg,var(--gold-dark),var(--gold))":"var(--dark3)", border:`2px solid ${step>=s.n?"var(--gold)":"var(--medium)"}`, display:"flex", alignItems:"center", justifyContent:"center", color: step>=s.n?"var(--black)":"var(--text-light)", fontWeight:700, fontSize:"0.87rem" }}>{s.n}</div>
                <span style={{ fontSize:"0.68rem", letterSpacing:1, color: step>=s.n?"var(--gold)":"var(--text-light)" }}>{s.label}</span>
              </div>
              {i<1 && <div style={{ width:70, height:2, background: step>1?"var(--gold)":"var(--medium)", margin:"0 8px", marginBottom:18 }}/>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:1080, margin:"0 auto", padding:"36px 24px", display:"grid", gridTemplateColumns:"1fr 340px", gap:28 }} className="checkout-grid">
        <div>
          {/* ── Step 1: Info ── */}
          {step === 1 && (
            <div style={{ background:"var(--dark2)", border:"1px solid rgba(201,168,76,0.15)", padding:30 }}>
              <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.45rem", letterSpacing:3, color:"var(--gold)", marginBottom:26 }}>Thông Tin Giao Hàng</h2>

              {/* Coupon */}
              <div style={{ marginBottom:22 }}>
                <div style={{ fontSize:"0.68rem", letterSpacing:2, color:"var(--text-light)", marginBottom:8, textTransform:"uppercase" }}>Mã Giảm Giá</div>
                <div style={{ display:"flex", gap:8 }}>
                  <input value={couponInput} onChange={e=>setCouponInput(e.target.value)} placeholder="Nhập mã... (VD: MACHNHA10)"
                    style={{ flex:1, padding:"10px 13px", background:"var(--dark)", border:`1px solid ${couponErr?"#e74c3c":"var(--medium)"}`, color:"var(--cream)", fontFamily:"Raleway,sans-serif", fontSize:"0.87rem", outline:"none" }}/>
                  <button onClick={applyCoupon} className="btn-gold" style={{ padding:"10px 13px", whiteSpace:"nowrap", fontSize:"0.76rem" }}>Áp Dụng</button>
                </div>
                {couponErr  && <div style={{ color:"#e74c3c", fontSize:"0.74rem", marginTop:5 }}>{couponErr}</div>}
                {couponData && <div style={{ color:"#27ae60", fontSize:"0.74rem", marginTop:5 }}>✓ Mã <strong>{couponData.code}</strong> – giảm {couponData.discount}{couponData.type==="percent"?"%":"đ"}</div>}
                <div style={{ fontSize:"0.68rem", color:"var(--text-light)", marginTop:5 }}>Thử: MACHNHA10, MACHNHA20, NEWUSER15</div>
              </div>

              {/* Form fields */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                {[{ k:"name", label:"Họ và Tên *", full:true, ph:"Nguyễn Văn A" },{ k:"phone", label:"Điện Thoại *", ph:"0909 123 456" },{ k:"email", label:"Email *", type:"email", ph:"email@example.com" }].map(f => (
                  <div key={f.k} className="form-group" style={{ gridColumn:f.full?"1/-1":"auto" }}>
                    <label>{f.label}</label>
                    <input type={f.type||"text"} value={form[f.k]} onChange={e=>set(f.k,e.target.value)} placeholder={f.ph} style={{ borderColor:errs[f.k]?"#e74c3c":undefined }}/>
                    {errs[f.k] && <span style={{ color:"#e74c3c", fontSize:"0.72rem" }}>{errs[f.k]}</span>}
                  </div>
                ))}
                <div className="form-group" style={{ gridColumn:"1/-1" }}>
                  <label>Địa Chỉ *</label>
                  <input value={form.address} onChange={e=>set("address",e.target.value)} placeholder="Số nhà, tên đường, phường/xã" style={{ borderColor:errs.address?"#e74c3c":undefined }}/>
                  {errs.address && <span style={{ color:"#e74c3c", fontSize:"0.72rem" }}>{errs.address}</span>}
                </div>
                <div className="form-group">
                  <label>Tỉnh/Thành Phố *</label>
                  <select value={form.city} onChange={e=>set("city",e.target.value)} style={{ borderColor:errs.city?"#e74c3c":undefined }}>
                    <option value="">-- Chọn tỉnh/thành --</option>
                    {CITIES.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                  {errs.city && <span style={{ color:"#e74c3c", fontSize:"0.72rem" }}>{errs.city}</span>}
                </div>
                <div className="form-group">
                  <label>Quận/Huyện</label>
                  <input value={form.district} onChange={e=>set("district",e.target.value)} placeholder="Quận/Huyện"/>
                </div>
                <div className="form-group" style={{ gridColumn:"1/-1" }}>
                  <label>Ghi Chú</label>
                  <textarea value={form.note} onChange={e=>set("note",e.target.value)} rows={3} placeholder="Ghi chú về giờ giao hàng..."
                    style={{ resize:"vertical", background:"var(--dark2)", border:"1px solid var(--medium)", color:"var(--cream)", padding:"10px 13px", fontFamily:"Raleway,sans-serif", outline:"none" }}/>
                </div>
              </div>
              <button onClick={()=>{ if(validate()) setStep(2); }} className="btn-gold" style={{ marginTop:22, padding:"13px 28px" }}>Tiếp Theo →</button>
            </div>
          )}

          {/* ── Step 2: Payment ── */}
          {step === 2 && (
            <div style={{ background:"var(--dark2)", border:"1px solid rgba(201,168,76,0.15)", padding:30 }}>
              <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.45rem", letterSpacing:3, color:"var(--gold)", marginBottom:26 }}>Phương Thức Thanh Toán</h2>
              {paymentMethods.map(m => (
                <label key={m.id} style={{ display:"flex", gap:14, padding:"14px 18px", marginBottom:10, border:`1px solid ${pay===m.id?"var(--gold)":"var(--medium)"}`, background: pay===m.id?"rgba(201,168,76,0.05)":"var(--dark)", cursor:"pointer", transition:"all 0.3s", borderRadius:6 }}>
                  <input type="radio" name="pay" value={m.id} checked={pay===m.id} onChange={()=>setPay(m.id)} style={{ accentColor:"var(--gold)" }}/>
                  <span style={{ color:pay===m.id?"var(--gold)":"var(--text-light)", display:"flex", alignItems:"center" }}>{m.icon}</span>
                  <div><div style={{ fontWeight:600, marginBottom:3 }}>{m.label}</div><div style={{ fontSize:"0.8rem", color:"var(--text-light)" }}>{m.desc}</div></div>
                </label>
              ))}
              {(pay === "momo" || pay === "bank") && (
                <div style={{ background:"var(--dark)", border:"1px solid rgba(212,175,90,0.2)", padding:20, marginTop:6, borderRadius:4 }}>
                  {/* QR Code tự động theo tổng tiền */}
                  {pay === "momo" && <div style={{ textAlign:"center", marginBottom:16 }}>
                    <div style={{ fontSize:"0.72rem", color:"var(--gold)", letterSpacing:2, textTransform:"uppercase", marginBottom:10, fontWeight:700 }}>Quét QR Thanh Toán</div>
                    <div style={{ display:"inline-block", background:"white", padding:12, borderRadius:10, boxShadow:"0 4px 20px rgba(0,0,0,0.4)" }}>
                      <img
                        src={`https://img.vietqr.io/image/MOMO-0968386408-compact2.png?amount=${total}&addInfo=${encodeURIComponent("Mach Nha don hang")}&accountName=NGUYEN+NGOC+HUY`}
                        alt="QR thanh toán MoMo"
                        style={{ width:180, height:180, display:"block" }}
                      />
                    </div>
                    <p style={{ fontSize:"0.76rem", color:"var(--text-light)", marginTop:8 }}>Quét bằng app MoMo, VietQR hoặc ngân hàng bất kỳ</p>
                  </div>}
                  {/* Bank details */}
                  <div style={{ fontSize:"0.72rem", color:"var(--gold)", letterSpacing:1.5, textTransform:"uppercase", marginBottom:10, fontWeight:700 }}>Thông Tin Chuyển Khoản</div>
                  {[["Ngân hàng",transferInfo.bank,"bank"],["Tên tài khoản",transferInfo.accountName,"name"],["Số tài khoản",transferInfo.accountNumber,"number"],["Số tiền",transferInfo.amount,"amount"],["Nội dung",transferInfo.content,"content"]].map(([k,v,key],i) => (
                    <div key={k} style={{ display:"flex", justifyContent:"space-between", gap:12, alignItems:"center", padding:"8px 0", borderBottom: i<4?"1px solid rgba(255,255,255,0.05)":"none", fontSize:"0.87rem" }}>
                      <span style={{ color:"var(--text-light)" }}>{k}</span>
                      <span style={{ fontWeight:700, color: i>=3?"var(--gold)":"var(--cream)", display:"inline-flex", alignItems:"center", gap:7, textAlign:"right" }}>
                        {v}
                        <button type="button" onClick={()=>copyPayment(v, key)} style={{ width:28, height:28, borderRadius:4, border:"1px solid rgba(212,175,90,0.28)", background:"rgba(212,175,90,0.06)", color:"var(--gold)", cursor:"pointer", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
                          {copied===key ? <Check size={13}/> : <Copy size={13}/>}
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {(pay === "vnpay" || pay === "card") && (
                <div style={{ background:"rgba(74,144,217,0.08)", border:"1px solid rgba(74,144,217,0.28)", padding:18, marginTop:6, borderRadius:6 }}>
                  <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                    <CreditCard size={18} color="#4A90D9" style={{ marginTop:3 }}/>
                    <div>
                      <div style={{ color:"var(--white)", fontWeight:700, marginBottom:4 }}>{pay === "vnpay" ? "Thanh toán VNPay demo" : "Thanh toán thẻ demo"}</div>
                      <p style={{ color:"var(--text-light)", fontSize:"0.85rem", lineHeight:1.7 }}>
                        Phiên bản này ghi nhận đơn hàng và trạng thái chờ xác nhận. Khi triển khai thật, phần này cần nối máy chủ thanh toán/webhook với VNPay/Stripe/OnePay để tạo giao dịch bảo mật.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div style={{ display:"flex", gap:10, marginTop:22 }}>
                <button onClick={()=>setStep(1)} className="btn-outline">← Quay Lại</button>
                <button onClick={placeOrder} disabled={placing} className="btn-gold" style={{ flex:1, padding:13, fontSize:"0.87rem" }}>
                  {placing ? "Đang xử lý..." : "✦ Xác Nhận Đặt Hàng ✦"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary */}
        <div>
          <div style={{ background:"var(--dark2)", border:"1px solid rgba(201,168,76,0.2)", padding:22, position:"sticky", top:100 }}>
            <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.25rem", letterSpacing:2, color:"var(--gold)", marginBottom:18 }}>Đơn Hàng</h3>
            <div style={{ maxHeight:280, overflowY:"auto", marginBottom:18 }}>
              {items.map(item => (
                <div key={item.id} style={{ display:"flex", gap:10, padding:"11px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                  <img src={item.image} alt={item.name} style={{ width:52, height:52, objectFit:"cover", border:"1px solid rgba(201,168,76,0.15)", flexShrink:0 }}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:"0.82rem", marginBottom:3, lineHeight:1.4 }}>{item.name}</div>
                    <div style={{ fontSize:"0.74rem", color:"var(--text-light)" }}>×{item.qty}</div>
                  </div>
                  <div style={{ fontSize:"0.87rem", color:"var(--gold)", fontWeight:600, whiteSpace:"nowrap" }}>{fmt(item.price*item.qty)}</div>
                </div>
              ))}
            </div>
            {[["Tạm tính",fmt(totalPrice)],...(disc>0?[["Giảm giá",`−${fmt(disc)}`]]:[]),["Vận chuyển",shipping===0?"Miễn phí":fmt(shipping)]].map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", fontSize:"0.85rem" }}>
                <span style={{ color:"var(--text-light)" }}>{k}</span>
                <span style={{ color: v==="Miễn phí"||v.startsWith("−")?"#27ae60":"var(--cream)" }}>{v}</span>
              </div>
            ))}
            <div style={{ display:"flex", justifyContent:"space-between", padding:"13px 0 0", borderTop:"1px solid rgba(201,168,76,0.2)", marginTop:7 }}>
              <span style={{ fontWeight:700, textTransform:"uppercase", fontSize:"0.8rem", letterSpacing:1 }}>Tổng Cộng</span>
              <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.35rem", fontWeight:600, background:"linear-gradient(135deg,var(--gold-dark),var(--gold))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{fmt(total)}</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`@media(max-width:900px){.checkout-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
