import React, { useEffect, useRef, useState } from "react";
import {
  Sparkles, CheckCircle, Star, Clock,
  MessageCircle, Video, Calendar,
  Lock, Crown, Users, X, Copy, Check,
} from "lucide-react";
import FengShuiAnalyzer from "../components/FengShuiAnalyzer";
import AIVisualConsultant from "../components/AIVisualConsultant";
import { useFetch } from "../hooks/useFetch";
import { createAnalysisPayment, getAnalysisPayment, getProducts, getUserById, patchUser } from "../services/api";
import { useAuth } from "../context/AuthContext";

/* ═══════════════════════════════════════════
   QR builder
═══════════════════════════════════════════ */
function buildQR(amount, desc) {
  return `https://img.vietqr.io/image/MOMO-0968386408-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(desc)}&accountName=NGUYEN+NGOC+HUY`;
}

/* ═══════════════════════════════════════════
   LocalStorage helpers
   Lưu số "lượt mở khoá" còn lại
   mach_nha_slots = số ô khoá còn có thể mở
═══════════════════════════════════════════ */
function getSlots() {
  try { return parseInt(localStorage.getItem("mach_nha_slots") || "0"); }
  catch { return 0; }
}
function addSlots(n) {
  try { localStorage.setItem("mach_nha_slots", String(getSlots() + n)); } catch {}
}
function consumeLocalSlot() {
  // Tiêu thụ 1 lượt — gọi khi người dùng bấm mở 1 ô khóa
  const cur = getSlots();
  if (cur <= 0) return false;
  try { localStorage.setItem("mach_nha_slots", String(cur - 1)); return true; } catch { return false; }
}

/* ═══════════════════════════════════════════
   Gói dịch vụ
   slots = số ô khoá mở được khi mua gói này
═══════════════════════════════════════════ */
const AI_PACKAGES = [
  {
    id:"ai-1", name:"Gói 1 Lượt", price:"50.000₫", amount:50000,
    unit:"/ lần", slots:1, badge:null, highlight:false,
    icon:<Sparkles size={26}/>, color:"rgba(212,175,90,0.08)", border:"rgba(212,175,90,0.3)",
    desc:"Goi 1 Luot - Phong Thuy Mach Nha",
    note:"Mở được 1 ô nội dung khóa sau khi phân tích",
    features:[
      "Phân tích mệnh ngũ hành đầy đủ",
      "Gợi ý vật phẩm hợp mệnh cá nhân",
      "✦ Mở 1 nội dung chi tiết theo chọn lựa",
      { dim:"Luận giải đầy đủ 12 cung Tử Vi" },
      { dim:"Phân tích vận hạn 5 năm" },
      { dim:"Tư vấn tình duyên & hôn nhân" },
      { dim:"Màu sắc, số & hướng hợp mệnh" },
    ],
    cta:"Mua Gói 1 Lượt — 50k",
  },
  {
    id:"ai-2", name:"Gói 2 Lượt", price:"149.000₫", amount:149000,
    unit:"/ 2 người", slots:2, badge:"TIẾT KIỆM", highlight:true,
    icon:<Users size={26}/>, color:"linear-gradient(135deg,rgba(212,175,90,0.14),rgba(212,175,90,0.06))", border:"var(--gold)",
    desc:"Goi 2 Luot - Phong Thuy Mach Nha",
    note:"Mở được 2 ô nội dung khóa (dùng cho 1 hoặc 2 người)",
    features:[
      "Phân tích mệnh ngũ hành đầy đủ",
      "Gợi ý vật phẩm hợp mệnh cá nhân",
      "✦ Mở 2 nội dung chi tiết theo chọn lựa",
      "✦ Luận giải đầy đủ 12 cung Tử Vi",
      "✦ Phân tích vận hạn 5 năm",
      { dim:"Tư vấn tình duyên & hôn nhân" },
      { dim:"Màu sắc, số & hướng hợp mệnh" },
    ],
    cta:"Mua Gói 2 Lượt — 149k",
  },
  {
    id:"ai-4", name:"Gói 4 Lượt", price:"499.000₫", amount:499000,
    unit:"/ 4 người", slots:4, badge:"ĐẦY ĐỦ NHẤT", highlight:false,
    icon:<Crown size={26}/>, color:"rgba(74,144,217,0.07)", border:"rgba(74,144,217,0.4)",
    accentColor:"#4A90D9",
    desc:"Goi 4 Luot - Phong Thuy Mach Nha",
    note:"Mở toàn bộ 4 nội dung chi tiết (dùng cho tối đa 4 người)",
    features:[
      "Phân tích mệnh ngũ hành đầy đủ",
      "Gợi ý vật phẩm hợp mệnh cá nhân",
      "✦ Mở tất cả 4 nội dung chi tiết",
      "✦ Luận giải đầy đủ 12 cung Tử Vi",
      "✦ Phân tích vận hạn 5 năm",
      "✦ Tư vấn tình duyên & hôn nhân",
      "✦ Màu sắc, số & hướng hợp mệnh",
    ],
    cta:"Mua Gói 4 Lượt — 499k",
  },
];

/* ═══════════════════════════════════════════
   4 nội dung có thể mở khoá
═══════════════════════════════════════════ */
function buildSections(result) {
  if (!result) return [];
  const { element, elInfo, cung, rel } = result;
  return [
    {
      id:"12cung",
      title:"Luận Giải 12 Cung Tử Vi",
      icon:"🔮",
      content: `Cung Mệnh (${cung.name}): ${elInfo.desc} Cung Mệnh chủ về bản thân, dung mạo, tính cách và vận mệnh tổng quát của bạn. Người có cung mệnh ${cung.name} thường có khả năng lãnh đạo tự nhiên và tầm nhìn xa.

Cung Quan Lộc: Phản ánh sự nghiệp, công danh và thành tựu. Người mệnh ${element} phù hợp với nghề nghiệp đòi hỏi tính sáng tạo, độc lập và tư duy chiến lược dài hạn. Thời điểm tốt nhất để thăng tiến: giai đoạn 2026–2027.

Cung Tài Bạch: Liên quan đến khả năng kiếm tiền và tích lũy. Mệnh ${element} tích lũy tài sản qua năng lực bản thân hơn may mắn. Hướng tài lộc tốt: ${rel.sinh}. Nên đặt bàn làm việc hướng ${rel.sinh} để kích hoạt vượng khí tài lộc.

Cung Phu Thê: Chỉ về tình duyên và hôn nhân. Mệnh ${element} hợp với người mệnh ${rel.bySinh} (tương sinh) hoặc cùng mệnh. Thời điểm thuận lợi cho tình duyên: 2026–2027.

Cung Tử Tức: Liên quan đến con cái và người kế thừa. Bố trí phòng con theo hướng ${rel.sinh} sẽ hỗ trợ phúc con cái lâu dài.

Cung Điền Trạch: Nhà cửa và bất động sản. Người mệnh ${element} nên chọn nhà hướng ${rel.sinh} hoặc bài trí các vật phẩm tương sinh tại vị trí chủ đạo trong nhà.`,
    },
    {
      id:"vanhan",
      title:"Vận Hạn 5 Năm Tới (2025–2030)",
      icon:"📅",
      content: `2025 (Ất Tỵ): Năm trung bình với mệnh ${element}. Nên ổn định công việc, tránh đầu tư lớn hoặc thay đổi đột ngột. Sức khỏe cần chú ý. Vật phẩm hỗ trợ: đặt ${elInfo.desc?.split(".")[0]}.

2026 (Bính Ngọ): Vận trình tích cực — cơ hội thăng tiến và mở rộng mạng lưới quan hệ. Người mệnh ${element} nên chủ động đón nhận cơ hội mới trong nửa đầu năm. Hướng tốt trong năm: ${rel.sinh}.

2027 (Đinh Mùi): Năm của tình duyên và gia đình. Thích hợp tiến tới hôn nhân hoặc củng cố quan hệ gia đình. Tài chính ổn định, không có đột biến lớn.

2028 (Mậu Thân): Vận tài lộc rõ ràng. Các kế hoạch kinh doanh từ 2026–2027 bắt đầu cho quả ngọt. Thời điểm tốt để đầu tư có chọn lọc. Hướng kinh doanh: ${rel.sinh}.

2029 (Kỷ Dậu): Năm tích lũy và củng cố. Tránh phiêu lưu mạo hiểm, tập trung sức khỏe và gia đình để tạo nền tảng bền vững cho giai đoạn tiếp theo.`,
    },
    {
      id:"tinduyen",
      title:"Tư Vấn Tình Duyên & Hôn Nhân",
      icon:"❤️",
      content: `Mệnh ${element} trong tình cảm: ${elInfo.desc} Điều này ảnh hưởng trực tiếp đến cách bạn yêu và cách chọn người bạn đời.

Người hợp nhất: Mệnh ${rel.bySinh} là lý tưởng vì ${rel.bySinh} sinh ${element} — bổ trợ nhau hoàn hảo. Cùng mệnh ${element} cũng hòa hợp vì cùng chí hướng và hiểu nhau.

Người nên tránh: Mệnh ${rel.byKhac} có xu hướng xung khắc với mệnh ${element}. Nếu đã có mối quan hệ, cần thêm vật phẩm hóa giải phù hợp.

Thời điểm thuận lợi nhất: 2026–2027. Nên chủ động giao lưu, tham gia các hoạt động xã hội trong giai đoạn này.

Màu sắc tăng duyên khi hẹn hò: Ưu tiên trang phục màu ${element === "Mộc" ? "xanh lá hoặc xanh lam" : element === "Hỏa" ? "đỏ, hồng hoặc cam" : element === "Thổ" ? "vàng đất hoặc nâu" : element === "Kim" ? "trắng hoặc bạc" : "đen hoặc xanh đậm"} để tăng sức hút tự nhiên.

Vật phẩm hỗ trợ: Thạch anh hồng đặt ở góc Tây Nam phòng ngủ. Cặp Thiềm Thừ bằng ngọc đặt cạnh giường giúp thu hút năng lượng tình yêu.`,
    },
    {
      id:"mausac",
      title:"Màu Sắc, Số & Hướng Hợp Mệnh",
      icon:"🎨",
      content: `Màu sắc hợp mệnh ${element}:
— Chủ đạo (dùng nhiều): ${element === "Mộc" ? "Xanh lá, xanh ngọc" : element === "Hỏa" ? "Đỏ, cam, hồng" : element === "Thổ" ? "Vàng đất, nâu, cam" : element === "Kim" ? "Trắng, bạc, xám" : "Đen, xanh lam đậm"}
— Tương sinh (rất tốt): ${element === "Mộc" ? "Đen, xanh lam (Thủy sinh Mộc)" : element === "Hỏa" ? "Xanh lá (Mộc sinh Hỏa)" : element === "Thổ" ? "Đỏ, cam (Hỏa sinh Thổ)" : element === "Kim" ? "Vàng đất, nâu (Thổ sinh Kim)" : "Trắng, bạc (Kim sinh Thủy)"}
— Nên tránh: ${element === "Mộc" ? "Trắng, bạc (Kim khắc Mộc)" : element === "Hỏa" ? "Đen, tím (Thủy khắc Hỏa)" : element === "Thổ" ? "Xanh lá (Mộc khắc Thổ)" : element === "Kim" ? "Đỏ, cam (Hỏa khắc Kim)" : "Vàng, nâu (Thổ khắc Thủy)"}

Số may mắn: ${element === "Mộc" ? "3, 4, 8" : element === "Hỏa" ? "2, 7, 3" : element === "Thổ" ? "0, 5, 2" : element === "Kim" ? "4, 9, 0" : "1, 6, 4"}
Số nên tránh trong hợp đồng: ${element === "Mộc" ? "7, 9" : element === "Hỏa" ? "1, 6" : element === "Thổ" ? "3, 4" : element === "Kim" ? "2, 7" : "0, 5"}

Hướng tốt nhất: ${rel.sinh} (tương sinh — thu hút sinh khí mạnh nhất)
Hướng thứ 2: ${element === "Mộc" ? "Đông, Đông Nam" : element === "Hỏa" ? "Nam, Đông Nam" : element === "Thổ" ? "Tây Nam, Đông Bắc" : element === "Kim" ? "Tây, Tây Bắc" : "Bắc, Đông Bắc"}

Bố trí vật phẩm:
— Góc Đông Nam: đặt vật phẩm Tài Bạch (cóc ba chân, đá citrine, cây kim tiền)
— Hướng ${rel.sinh}: đặt vật phẩm chính hợp mệnh ${element}
— Tránh để vật phẩm khắc mệnh tại khu trung tâm nhà`,
    },
  ];
}

/* ═══════════════════════════════════════════
   Modal thanh toán
═══════════════════════════════════════════ */
function PaymentModal({ pkg, user, syncUser, onClose, onActivated }) {
  const [step, setStep]   = useState("qr");
  const [copied, setCopied] = useState(false);
  const [payment, setPayment] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [paymentDesc] = useState(() => `${pkg.desc} ${Date.now().toString().slice(-6)}`);
  const createdRef = useRef(false);
  const activatedRef = useRef(false);

  const copy = (text) => {
    navigator.clipboard.writeText(text).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2000); });
  };

  const activatePaidPayment = async (latest) => {
    if (activatedRef.current) return;
    activatedRef.current = true;
    if (latest.userId) {
      const fresh = await getUserById(latest.userId);
      syncUser?.(fresh);
    } else {
      addSlots(Number(latest.slots || pkg.slots));
    }
    setStep("done");
  };

  const createPendingPayment = async () => {
    if (createdRef.current) return;
    createdRef.current = true;
    setBusy(true);
    setStatusMsg("Đang tạo mã thanh toán tự động...");
    try {
      const created = await createAnalysisPayment({
        packageId: pkg.id,
        packageName: pkg.name,
        amount: pkg.amount,
        slots: pkg.slots,
        desc: paymentDesc,
        bank: "MoMo",
        accountName: "Nguyễn Ngọc Huy",
        accountNumber: "0968386408",
        userId: user?.id || null,
        userName: user?.name || "Khách chưa đăng nhập",
        userEmail: user?.email || null,
      });
      setPayment(created);
      setStatusMsg("Mã thanh toán đã sẵn sàng. Sau khi chuyển khoản thành công, hệ thống sẽ tự kích hoạt khi nhận được thông báo từ ngân hàng.");
    } catch (error) {
      createdRef.current = false;
      setStatusMsg(error.message || "Không tạo được mã thanh toán.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    createPendingPayment();
  }, []);

  useEffect(() => {
    if (!payment?.id || step === "done") return undefined;
    const timer = setInterval(async () => {
      try {
        const latest = await getAnalysisPayment(payment.id);
        setPayment(latest);
        if (latest.status === "paid") await activatePaidPayment(latest);
      } catch {}
    }, 5000);
    return () => clearInterval(timer);
  }, [payment?.id, step]);

  const checkPayment = async () => {
    if (!payment?.id) return;
    setBusy(true);
    setStatusMsg("");
    try {
      const latest = await getAnalysisPayment(payment.id);
      setPayment(latest);
      if (latest.status === "paid") {
        await activatePaidPayment(latest);
      } else {
        setStatusMsg("Chưa nhận được thông báo thanh toán thành công. Hệ thống vẫn đang tự kiểm tra, bạn có thể thử lại sau vài giây.");
      }
    } catch (error) {
      setStatusMsg(error.message || "Không kiểm tra được trạng thái thanh toán.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(0,0,0,0.88)", backdropFilter:"blur(7px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
      onClick={step==="done"?onClose:undefined}>
      <div style={{ background:"var(--dark2)", border:"1.5px solid rgba(212,175,90,0.4)", borderRadius:12, padding:"28px 24px", maxWidth:420, width:"100%", position:"relative", boxShadow:"0 28px 64px rgba(0,0,0,0.85)", maxHeight:"92vh", overflowY:"auto" }}
        onClick={e=>e.stopPropagation()}>
        <button onClick={onClose} style={{ position:"absolute", top:12, right:12, background:"rgba(255,255,255,0.06)", border:"none", color:"var(--text-light)", cursor:"pointer", width:30, height:30, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <X size={14}/>
        </button>

        {step==="done" ? (
          <div style={{ textAlign:"center", padding:"16px 0" }}>
            <div style={{ width:60, height:60, borderRadius:"50%", background:"rgba(39,174,96,0.15)", border:"2px solid #27ae60", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
              <CheckCircle size={28} color="#27ae60"/>
            </div>
            <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.65rem", color:"var(--white)", fontWeight:400, marginBottom:8 }}>Kích Hoạt Thành Công!</h3>
            <div style={{ padding:"12px 16px", background:"rgba(212,175,90,0.08)", border:"1px solid rgba(212,175,90,0.2)", borderRadius:6, marginBottom:16 }}>
              <div style={{ fontSize:"0.78rem", color:"var(--gold)", fontWeight:700, marginBottom:4 }}>Bạn vừa nhận được:</div>
              <div style={{ fontSize:"1rem", color:"var(--cream)", fontWeight:600 }}>{pkg.slots} lượt mở khoá nội dung</div>
              <div style={{ fontSize:"0.78rem", color:"var(--text-light)", marginTop:4 }}>{pkg.note}</div>
            </div>
            <p style={{ color:"var(--text-light)", fontSize:"0.85rem", lineHeight:1.7, marginBottom:18 }}>
              Bạn muốn dùng gói ngay cho kết quả hiện tại, hay nhập thông tin mới?
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <button onClick={()=>{ onActivated("use-now"); }} className="btn-gold" style={{ width:"100%", padding:"12px" }}>
                ✅ Dùng Ngay — Xem Kết Quả Hiện Tại
              </button>
              <button onClick={()=>{ onActivated("reset"); }} style={{ width:"100%", padding:"11px", background:"transparent", border:"1.5px solid rgba(212,175,90,0.35)", color:"var(--gold)", fontFamily:"'Be Vietnam Pro',Raleway,sans-serif", fontWeight:600, fontSize:"0.85rem", borderRadius:4, cursor:"pointer" }}>
                🔄 Phân Tích Lại — Nhập Thông Tin Mới
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ textAlign:"center", marginBottom:16 }}>
              <div style={{ fontSize:"0.68rem", color:"var(--gold)", letterSpacing:3, textTransform:"uppercase", marginBottom:5 }}>Thanh Toán Qua MoMo</div>
              <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.5rem", color:"var(--white)", fontWeight:400, marginBottom:3 }}>{pkg.name}</h3>
              <div style={{ fontFamily:"'Be Vietnam Pro','Raleway',sans-serif", fontVariantNumeric:"tabular-nums", letterSpacing:"-0.5px", fontSize:"1.7rem", fontWeight:800, color:"var(--gold)" }}>{pkg.price}</div>
              <div style={{ fontSize:"0.74rem", color:"var(--text-light)", marginTop:2 }}>Mở được <strong style={{ color:"var(--gold-light)" }}>{pkg.slots} ô</strong> nội dung sau mỗi lần phân tích</div>
            </div>
            <div style={{ textAlign:"center", marginBottom:14 }}>
              <div style={{ display:"inline-block", background:"white", padding:10, borderRadius:8, boxShadow:"0 4px 18px rgba(0,0,0,0.4)" }}>
                <img src={buildQR(pkg.amount, paymentDesc)} alt="QR" style={{ width:170, height:170, display:"block" }}/>
              </div>
              <p style={{ fontSize:"0.71rem", color:"var(--text-light)", marginTop:6 }}>Quét bằng MoMo, VietQR hoặc app ngân hàng bất kỳ</p>
            </div>
            <div style={{ background:"rgba(212,175,90,0.05)", border:"1px solid rgba(212,175,90,0.15)", borderRadius:6, padding:"12px 14px", marginBottom:12 }}>
              <div style={{ fontSize:"0.62rem", color:"var(--gold)", letterSpacing:2, textTransform:"uppercase", marginBottom:8, fontWeight:700 }}>Thông Tin Chuyển Khoản</div>
              {[
                { l:"Ngân hàng", v:"MoMo" },
                { l:"Tên TK",    v:"Nguyễn Ngọc Huy" },
                { l:"Số TK",     v:"0968 386 408" },
                { l:"Số tiền",   v:`${pkg.amount.toLocaleString("vi-VN")}đ`, gold:true },
                { l:"Nội dung",  v:paymentDesc, copy:true },
              ].map((r,i)=>(
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5px 0", borderBottom:i<4?"1px solid rgba(255,255,255,0.04)":"none" }}>
                  <span style={{ fontSize:"0.75rem", color:"var(--text-light)" }}>{r.l}</span>
                  <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <span style={{ fontSize:"0.8rem", fontWeight:700, color:r.gold?"var(--gold)":"var(--cream)" }}>{r.v}</span>
                    {r.copy && (
                      <button onClick={()=>copy(r.v)} style={{ background:"rgba(212,175,90,0.1)", border:"1px solid rgba(212,175,90,0.3)", color:"var(--gold)", cursor:"pointer", padding:"2px 5px", borderRadius:3, fontSize:"0.6rem", display:"flex", alignItems:"center", gap:2 }}>
                        {copied?<Check size={9}/>:<Copy size={9}/>}{copied?"Copied":"Copy"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding:"10px 12px", background:"rgba(212,175,90,0.04)", border:"1px solid rgba(212,175,90,0.1)", borderRadius:4, marginBottom:10 }}>
              <p style={{ fontSize:"0.78rem", color:"var(--cream2)", lineHeight:1.6 }}>
                Chuyển khoản đúng số tiền và nội dung bên dưới. Khi ngân hàng/cổng thanh toán báo thành công, lượt sẽ được cộng tự động.
              </p>
            </div>
            {statusMsg && (
              <div style={{ padding:"10px 12px", background:"rgba(74,144,217,0.08)", border:"1px solid rgba(74,144,217,0.25)", borderRadius:4, marginBottom:10, color:"var(--cream2)", fontSize:"0.78rem", lineHeight:1.6 }}>
                {statusMsg}
              </div>
            )}
            <button disabled={busy || !payment} onClick={checkPayment} style={{ display:"block", width:"100%", padding:"13px", background:"linear-gradient(135deg,var(--gold-dark),var(--gold))", border:"none", color:"var(--black)", fontFamily:"'Be Vietnam Pro',Raleway,sans-serif", fontWeight:800, fontSize:"0.85rem", borderRadius:4, cursor:busy?"wait":"pointer", opacity:(busy || !payment)?0.7:1 }}>
              {busy ? "Đang xử lý..." : "Tôi Đã Chuyển Khoản — Kiểm Tra Ngay"}
            </button>
            <p style={{ marginTop:8, color:"var(--text-light)", fontSize:"0.7rem", lineHeight:1.55, textAlign:"center" }}>
              Mã yêu cầu: {payment?.id || "đang tạo tự động"}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   InlinePurchase — hiện ngay trên trang kết quả
═══════════════════════════════════════════ */
function InlinePurchase({ onBuy, slotsNeeded }) {
  return (
    <div style={{ marginTop:16, border:"1px solid rgba(212,175,90,0.25)", borderRadius:8, overflow:"hidden" }}>
      <div style={{ padding:"14px 20px", background:"linear-gradient(135deg,rgba(212,175,90,0.1),rgba(212,175,90,0.04))", borderBottom:"1px solid rgba(212,175,90,0.15)", display:"flex", alignItems:"center", gap:8 }}>
        <Lock size={14} color="var(--gold)"/>
        <span style={{ fontSize:"0.82rem", color:"var(--gold)", fontWeight:700, letterSpacing:1 }}>
          Cần {slotsNeeded} lượt để mở {slotsNeeded} ô nội dung còn lại — chọn gói phù hợp:
        </span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:0 }}>
        {AI_PACKAGES.map((pkg,i)=>{
          const accent = pkg.accentColor || "var(--gold)";
          const isLast = i === AI_PACKAGES.length - 1;
          return (
            <div key={pkg.id} style={{ padding:"16px 18px", borderRight: isLast?"none":"1px solid rgba(212,175,90,0.1)", background:"var(--dark2)", cursor:"pointer", transition:"background 0.2s" }}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(212,175,90,0.06)"}
              onMouseLeave={e=>e.currentTarget.style.background="var(--dark2)"}
            >
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:"0.9rem", color:"var(--cream)", marginBottom:2 }}>{pkg.name}</div>
                  <div style={{ display:"flex", alignItems:"baseline", gap:3 }}>
                    <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.3rem", fontWeight:600, color:accent }}>{pkg.price}</span>
                    <span style={{ fontSize:"0.72rem", color:"var(--text-light)" }}>{pkg.unit}</span>
                  </div>
                </div>
                <div style={{ textAlign:"center", padding:"4px 10px", background:`rgba(${pkg.highlight?"212,175,90":"74,144,217"},0.15)`, borderRadius:12 }}>
                  <span style={{ fontSize:"1.1rem", fontWeight:800, color:accent }}>{pkg.slots}</span>
                  <div style={{ fontSize:"0.6rem", color:accent, lineHeight:1 }}>lượt</div>
                </div>
              </div>
              <button onClick={()=>onBuy(pkg)} style={{
                width:"100%", padding:"8px", textAlign:"center",
                background: pkg.highlight?"linear-gradient(135deg,var(--gold-dark),var(--gold))":"transparent",
                border: pkg.highlight?"none":`1px solid ${accent}50`,
                color: pkg.highlight?"var(--black)":accent,
                fontFamily:"'Be Vietnam Pro',Raleway,sans-serif", fontWeight:700, fontSize:"0.78rem",
                borderRadius:3, cursor:"pointer",
              }}>
                💳 Mua ngay
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Trang Tư Vấn
═══════════════════════════════════════════ */
export default function TuVanPage() {
  const { user, syncUser } = useAuth();
  const [tab,            setTab]          = useState("free");
  const [payPkg,         setPayPkg]       = useState(null);
  const [analyzed,           setAnalyzed]           = useState(false);
  const [analysisResult,     setAnalysisResult]     = useState(null);
  const [slots,              setSlots]              = useState(() => Number(user?.analysisSlots ?? getSlots()));
  const [openedIds,          setOpenedIds]          = useState([]);
  const [showInlinePurchase, setShowInlinePurchase] = useState(false);
  const { data: products = [] } = useFetch(getProducts, []);

  const refreshSlots = () => { setSlots(Number(user?.analysisSlots ?? getSlots())); };

  useEffect(() => {
    setSlots(Number(user?.analysisSlots ?? getSlots()));
  }, [user?.analysisSlots, user?.id]);

  // Callback khi FengShuiAnalyzer hoàn thành phân tích
  const handleAnalyzed = (result) => {
    setAnalyzed(true);
    setAnalysisResult(result);
    setOpenedIds([]); // reset ô đã mở khi phân tích lại
  };

  // Mở 1 ô khoá
  const openSection = (id) => {
    if (openedIds.includes(id)) return; // đã mở rồi
    if (!consumeSlot()) return; // hết lượt
    setOpenedIds(prev => [...prev, id]);
    refreshSlots();
  };

  const openSectionWithAccount = async (id) => {
    if (openedIds.includes(id)) return;
    if (user?.id) {
      const cur = Number(user.analysisSlots || 0);
      if (cur <= 0) return;
      const updated = await patchUser(user.id, { analysisSlots: cur - 1 });
      syncUser(updated);
    } else if (!consumeLocalSlot()) {
      return;
    }
    setOpenedIds(prev => [...prev, id]);
    setSlots((cur) => Math.max(0, Number(cur || 0) - 1));
  };

  const slotsAfterAnalysis = slots; // số lượt còn lại hiện tại

  return (
    <div style={{ paddingTop:120, minHeight:"100vh" }}>
      {payPkg && (
        <PaymentModal pkg={payPkg} user={user} syncUser={syncUser} onClose={()=>setPayPkg(null)} onActivated={(action)=>{
          refreshSlots();
          setPayPkg(null);
          if (action === "reset") {
            setAnalyzed(false);
            setAnalysisResult(null);
            setOpenedIds([]);
          }
          // "use-now" → stay on current result page, slots updated
        }}/>
      )}

      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,var(--dark2) 0%,var(--dark3) 60%,var(--dark2) 100%)", borderBottom:"1px solid rgba(212,175,90,0.25)", padding:"56px 24px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(212,175,90,0.07) 0%,transparent 70%)", top:"50%", left:"50%", transform:"translate(-50%,-50%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ fontSize:"0.75rem", letterSpacing:5, color:"var(--gold)", textTransform:"uppercase", marginBottom:12 }}>✦ Chuyên Gia Phong Thủy ✦</div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(2.4rem,5vw,4rem)", fontWeight:300, letterSpacing:5, marginBottom:16, color:"var(--white)" }}>
            Dịch Vụ <span className="gold-text">Tư Vấn Phong Thủy</span>
          </h1>
          <p style={{ color:"var(--text-light)", maxWidth:600, margin:"0 auto", lineHeight:1.9, fontSize:"1rem" }}>
            Từ phân tích mệnh nhanh đến tư vấn chuyên sâu — chọn gói phù hợp với nhu cầu.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ maxWidth:860, margin:"0 auto", padding:"40px 24px 0" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", background:"var(--dark2)", border:"1px solid rgba(212,175,90,0.2)", borderRadius:4, overflow:"hidden" }}>
          {[
            { id:"free",    icon:<Sparkles size={15}/>, label:"Phân Tích",        sub:"Nhập thông tin & phân tích" },
            { id:"ai-paid", icon:<Crown size={15}/>,    label:"Mua Lượt",         sub:"Mở khoá nội dung chi tiết" },
            { id:"expert",  icon:<Star size={15}/>,     label:"AI Tư Vấn", sub:"Tư vấn & ướm thử ảnh" },
          ].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              padding:"16px 10px", background:tab===t.id?"linear-gradient(135deg,rgba(212,175,90,0.15),rgba(212,175,90,0.08))":"transparent",
              border:"none", borderBottom:`3px solid ${tab===t.id?"var(--gold)":"transparent"}`,
              color:tab===t.id?"var(--gold)":"var(--text-light)", cursor:"pointer", transition:"all 0.3s", textAlign:"center",
            }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, marginBottom:3 }}>
                {t.icon}
                <span style={{ fontWeight:700, fontSize:"0.8rem", letterSpacing:0.5, textTransform:"uppercase" }}>{t.label}</span>
              </div>
              <div style={{ fontSize:"0.72rem", color:tab===t.id?"var(--cream2)":"var(--text-light)" }}>{t.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:920, margin:"0 auto", padding:"36px 24px 80px" }}>

        {/* ─── TAB: Phân Tích ─── */}
        {tab==="free" && (
          <div>
            <div style={{ textAlign:"center", marginBottom:28 }}>
              <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(1.6rem,3vw,2.3rem)", fontWeight:300, letterSpacing:4, marginBottom:8, color:"var(--white)" }}>
                Tra Cứu Mệnh & Gợi Ý Vật Phẩm
              </h2>
              <p style={{ color:"var(--text-light)", fontSize:"0.95rem", lineHeight:1.85 }}>
                Nhập đầy đủ thông tin rồi bấm <strong style={{ color:"var(--cream)" }}>Phân Tích Phong Thủy</strong>.
                {slots > 0 && <span style={{ color:"var(--gold)", fontWeight:600 }}> Bạn còn {slots} lượt mở khoá.</span>}
              </p>
            </div>

            {/* Form phân tích */}
            <FengShuiAnalyzer products={products} onAnalyzed={handleAnalyzed}/>

            {/* ── Chỉ hiện SAU KHI đã bấm phân tích ── */}
            {analyzed && analysisResult && (
              <div style={{ marginTop:32 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:10 }}>
                  <div style={{ fontSize:"0.72rem", color:"var(--gold)", letterSpacing:2, textTransform:"uppercase", fontWeight:700 }}>
                    Nội Dung Chi Tiết
                  </div>
                  {slots > 0 ? (
                    <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 14px", background:"rgba(39,174,96,0.08)", border:"1px solid rgba(39,174,96,0.25)", borderRadius:3 }}>
                      <CheckCircle size={13} color="#27ae60"/>
                      <span style={{ fontSize:"0.8rem", color:"#2ecc71" }}>
                        Còn <strong>{slots}</strong> lượt — nhấn ô khoá để mở
                      </span>
                    </div>
                  ) : (
                    <button onClick={()=>setShowInlinePurchase(true)} style={{ fontSize:"0.78rem", color:"var(--gold)", background:"rgba(212,175,90,0.1)", border:"1px solid rgba(212,175,90,0.3)", padding:"6px 14px", borderRadius:3, cursor:"pointer", fontWeight:600 }}>
                      + Mua thêm lượt
                    </button>
                  )}
                </div>

                {/* 4 ô nội dung */}
                {buildSections(analysisResult).map((sec,i) => {
                  const isOpen = openedIds.includes(sec.id);
                  const canOpen = slots > 0 && !isOpen;

                  return isOpen ? (
                    /* Ô đã mở */
                    <div key={sec.id} style={{ marginBottom:14, border:"1px solid rgba(39,174,96,0.22)", borderRadius:6 }}>
                      <div style={{ padding:"14px 20px", background:"rgba(39,174,96,0.04)" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                          <span style={{ fontSize:"1.1rem" }}>{sec.icon}</span>
                          <span style={{ fontWeight:700, fontSize:"0.95rem", color:"var(--cream)" }}>{sec.title}</span>
                          <CheckCircle size={14} color="#27ae60" style={{ marginLeft:"auto" }}/>
                        </div>
                        <div style={{ fontSize:"0.9rem", color:"var(--cream2)", lineHeight:1.9, whiteSpace:"pre-line" }}>
                          {sec.content}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Ô chưa mở — blur + overlay */
                    <div key={sec.id} style={{ position:"relative", marginBottom:14, borderRadius:6, overflow:"hidden" }}>
                      {/* Nội dung mờ */}
                      <div style={{ filter:"blur(5px)", userSelect:"none", pointerEvents:"none", padding:"14px 20px", background:"rgba(212,175,90,0.04)", border:"1px solid rgba(212,175,90,0.12)" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                          <span style={{ fontSize:"1.1rem" }}>{sec.icon}</span>
                          <span style={{ fontWeight:700, fontSize:"0.88rem", color:"var(--cream2)" }}>{sec.title}</span>
                        </div>
                        <div style={{ fontSize:"0.85rem", color:"var(--text-light)", lineHeight:1.7 }}>
                          {sec.content.substring(0, 150)}...
                        </div>
                      </div>
                      {/* Overlay */}
                      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"rgba(13,11,8,0.62)", backdropFilter:"blur(1px)", gap:8 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <span style={{ fontSize:"1.1rem" }}>{sec.icon}</span>
                          <span style={{ fontWeight:700, fontSize:"0.9rem", color:"var(--cream)" }}>{sec.title}</span>
                        </div>
                        {canOpen ? (
                          <button onClick={()=>openSectionWithAccount(sec.id)} style={{
                            padding:"8px 22px", background:"linear-gradient(135deg,var(--gold-dark),var(--gold))", border:"none", color:"var(--black)",
                            fontFamily:"'Be Vietnam Pro',Raleway,sans-serif", fontWeight:800, fontSize:"0.8rem", borderRadius:4, cursor:"pointer",
                            display:"flex", alignItems:"center", gap:6,
                          }}>
                            <Lock size={12}/> Dùng 1 lượt để mở
                          </button>
                        ) : (
                          <button onClick={()=>setShowInlinePurchase(true)} style={{
                            padding:"8px 22px", background:"transparent", border:"1.5px solid rgba(212,175,90,0.45)", color:"var(--gold)",
                            fontFamily:"'Be Vietnam Pro',Raleway,sans-serif", fontWeight:700, fontSize:"0.78rem", borderRadius:4, cursor:"pointer",
                          }}>
                            Mua lượt để mở — từ 50k
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Hết lượt HOẶC bấm mua từ ô khóa → hiện inline */}
                {(slots === 0 && openedIds.length < 4) || showInlinePurchase ? (
                  <div>
                    {showInlinePurchase && slots > 0 && (
                      <div style={{ marginBottom:8, display:"flex", justifyContent:"flex-end" }}>
                        <button onClick={()=>setShowInlinePurchase(false)} style={{ background:"none", border:"none", color:"var(--text-light)", cursor:"pointer", fontSize:"0.78rem" }}>
                          ✕ Đóng
                        </button>
                      </div>
                    )}
                    <InlinePurchase onBuy={(pkg)=>{ setPayPkg(pkg); setShowInlinePurchase(false); }} slotsNeeded={4 - openedIds.length}/>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: Mua Lượt ─── */}
        {tab==="ai-paid" && (
          <div>
            <div style={{ textAlign:"center", marginBottom:32 }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:10, padding:"7px 18px", background:"rgba(212,175,90,0.1)", border:"1px solid rgba(212,175,90,0.3)", borderRadius:3, marginBottom:12 }}>
                <Crown size={15} color="var(--gold)"/>
                <span style={{ fontSize:"0.76rem", color:"var(--gold)", letterSpacing:2, textTransform:"uppercase", fontWeight:700 }}>Mở Khoá Nội Dung</span>
              </div>
              <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(1.6rem,3vw,2.3rem)", fontWeight:300, letterSpacing:4, marginBottom:8, color:"var(--white)" }}>
                Chọn Số Lượt Phù Hợp
              </h2>
              <p style={{ color:"var(--text-light)", fontSize:"0.95rem", lineHeight:1.85 }}>
                Mỗi lượt mở được <strong style={{ color:"var(--cream)" }}>1 ô nội dung</strong> sau khi phân tích. Lượt không hết hạn và dùng được cho mọi lần phân tích tiếp theo.
              </p>
            </div>

            {slots > 0 && (
              <div style={{ marginBottom:20, padding:"12px 18px", background:"rgba(39,174,96,0.08)", border:"1px solid rgba(39,174,96,0.25)", borderRadius:4, display:"flex", alignItems:"center", gap:10 }}>
                <CheckCircle size={15} color="#27ae60"/>
                <span style={{ fontSize:"0.87rem", color:"#2ecc71" }}>
                  Bạn đang có <strong>{slots}</strong> lượt.{" "}
                  <button onClick={()=>setTab("free")} style={{ background:"none", border:"none", color:"var(--gold)", cursor:"pointer", fontSize:"0.87rem", fontWeight:700 }}>Dùng ngay →</button>
                </span>
              </div>
            )}

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))", gap:20, marginBottom:28 }}>
              {AI_PACKAGES.map((pkg,i)=>{
                const accent = pkg.accentColor || "var(--gold)";
                return (
                  <div key={i} style={{
                    background:typeof pkg.color==="string"&&pkg.color.startsWith("linear")?pkg.color:pkg.color,
                    border:`1.5px solid ${pkg.border}`, borderRadius:8, padding:"26px 22px",
                    position:"relative", transition:"transform 0.3s, box-shadow 0.3s",
                  }}
                    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-5px)";e.currentTarget.style.boxShadow="0 14px 36px rgba(0,0,0,0.5)";}}
                    onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}
                  >
                    {pkg.badge && (
                      <div style={{ position:"absolute", top:-1, left:"50%", transform:"translateX(-50%)", background:pkg.highlight?"linear-gradient(135deg,var(--gold-dark),var(--gold))":"linear-gradient(135deg,#1a5fa8,#4A90D9)", color:"white", padding:"3px 14px", fontSize:"0.63rem", fontWeight:800, letterSpacing:2, borderRadius:"0 0 6px 6px", whiteSpace:"nowrap" }}>
                        {pkg.badge}
                      </div>
                    )}
                    <div style={{ color:accent, marginBottom:12, marginTop:pkg.badge?14:0 }}>{pkg.icon}</div>
                    <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.3rem", color:"var(--white)", marginBottom:4, fontWeight:500 }}>{pkg.name}</h3>
                    {/* Highlight số lượt */}
                    <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"5px 12px", background:`rgba(${pkg.highlight?"212,175,90":"74,144,217"},0.15)`, border:`1px solid ${pkg.border}`, borderRadius:20, marginBottom:14 }}>
                      <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.5rem", fontWeight:700, color:accent }}>{pkg.slots}</span>
                      <span style={{ fontSize:"0.8rem", color:accent, fontWeight:600 }}>lượt mở khoá</span>
                    </div>
                    <div style={{ fontFamily:"'Be Vietnam Pro','Raleway',sans-serif", fontVariantNumeric:"tabular-nums", letterSpacing:"-0.5px", fontSize:"1.65rem", fontWeight:800, color:accent, marginBottom:4 }}>{pkg.price}</div>
                    <div style={{ fontSize:"0.78rem", color:"var(--text-light)", marginBottom:18 }}>{pkg.unit}</div>
                    <div style={{ padding:"8px 12px", background:"rgba(255,255,255,0.04)", borderRadius:3, marginBottom:18 }}>
                      <div style={{ fontSize:"0.76rem", color:"var(--cream2)", lineHeight:1.5 }}>{pkg.note}</div>
                    </div>
                    <ul style={{ listStyle:"none", marginBottom:22 }}>
                      {pkg.features.map((f,j)=>{
                        const isDim = typeof f==="object" && f.dim;
                        const text  = isDim ? f.dim : f;
                        return (
                          <li key={j} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:7, fontSize:"0.85rem", color:isDim?"rgba(255,255,255,0.25)":"var(--cream2)", lineHeight:1.5 }}>
                            {isDim ? <Lock size={11} color="rgba(255,255,255,0.2)" style={{ marginTop:2, flexShrink:0 }}/> : <CheckCircle size={11} color={accent} style={{ marginTop:2, flexShrink:0 }}/>}
                            {text}
                          </li>
                        );
                      })}
                    </ul>
                    <button onClick={()=>setPayPkg(pkg)} style={{
                      display:"block", width:"100%", textAlign:"center", padding:"12px",
                      background:pkg.highlight?"linear-gradient(135deg,var(--gold-dark),var(--gold))":pkg.accentColor?`linear-gradient(135deg,#1a5fa8,${pkg.accentColor})`:"transparent",
                      border:pkg.highlight||pkg.accentColor?"none":"1.5px solid rgba(212,175,90,0.45)",
                      color:pkg.highlight?"var(--black)":pkg.accentColor?"white":"var(--gold)",
                      fontFamily:"'Be Vietnam Pro',Raleway,sans-serif", fontWeight:800, fontSize:"0.83rem", borderRadius:4, cursor:"pointer", transition:"opacity 0.2s",
                    }}
                      onMouseEnter={e=>e.currentTarget.style.opacity="0.85"}
                      onMouseLeave={e=>e.currentTarget.style.opacity="1"}
                    >
                      💳 {pkg.cta}
                    </button>
                  </div>
                );
              })}
            </div>

            <div style={{ padding:"16px 20px", background:"rgba(212,175,90,0.04)", border:"1px solid rgba(212,175,90,0.12)", borderRadius:6 }}>
              <div style={{ fontSize:"0.68rem", color:"var(--gold)", letterSpacing:2, textTransform:"uppercase", marginBottom:10, fontWeight:700 }}>Cách Hoạt Động</div>
              {["Mua gói → nhận số lượt tương ứng (1, 2 hoặc 4 lượt).","Vào tab Phân Tích, nhập thông tin, bấm Phân Tích Phong Thủy.","Kết quả hiện ra — nhấn nút mở từng ô nội dung bạn muốn xem.","Mỗi ô tốn 1 lượt. Lượt thừa giữ nguyên cho lần phân tích tiếp theo."].map((s,i)=>(
                <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:i<3?9:0 }}>
                  <div style={{ width:22, height:22, borderRadius:"50%", background:"rgba(212,175,90,0.18)", border:"1px solid rgba(212,175,90,0.35)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.68rem", fontWeight:800, color:"var(--gold)", flexShrink:0 }}>{i+1}</div>
                  <p style={{ color:"var(--cream2)", fontSize:"0.88rem", lineHeight:1.65 }}>{s}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TAB: Tư Vấn Chuyên Gia ─── */}
        {tab==="expert" && (
          <div>
            <AIVisualConsultant products={products}/>

            <div style={{ textAlign:"center", marginBottom:32 }}>
              <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(1.6rem,3vw,2.3rem)", fontWeight:300, letterSpacing:4, marginBottom:8, color:"var(--white)" }}>
                Tư Vấn 1–1 Với Thầy Phong Thủy
              </h2>
              <p style={{ color:"var(--text-light)", fontSize:"0.95rem", lineHeight:1.85 }}>Phân tích chuyên sâu, cá nhân hóa toàn diện cho nhà ở, văn phòng và cuộc sống.</p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:20, marginBottom:28 }}>
              {[
                { icon:<MessageCircle size={28}/>, name:"Tư Vấn Cơ Bản", duration:"30–45 phút", method:"Zalo / Điện thoại", highlight:false,
                  features:["Phân tích mệnh ngũ hành chi tiết","Gợi ý vật phẩm phong thủy phù hợp","Hướng đặt bàn làm việc / giường ngủ","Tư vấn màu sắc hợp mệnh"] },
                { icon:<Video size={28}/>, name:"Tư Vấn Nâng Cao", duration:"60–90 phút", method:"Video call / Gặp trực tiếp", highlight:true,
                  features:["Toàn bộ gói Cơ Bản","Phân tích phong thủy nhà / văn phòng","Đề xuất bố cục không gian","Chọn ngày giờ tốt theo yêu cầu","Báo cáo tư vấn bằng văn bản"] },
                { icon:<Calendar size={28}/>, name:"Tư Vấn Toàn Diện", duration:"Trọn gói", method:"Gặp trực tiếp + hỗ trợ sau", highlight:false,
                  features:["Toàn bộ gói Nâng Cao","Khảo sát thực địa tại nhà / công ty","Kế hoạch phong thủy 12 tháng","Hỗ trợ tư vấn 3 tháng sau buổi chính","Chứng chỉ phong thủy"] },
              ].map((pkg,i)=>(
                <div key={i} style={{ background:pkg.highlight?"linear-gradient(135deg,rgba(212,175,90,0.12),rgba(212,175,90,0.06))":"var(--dark2)", border:`1.5px solid ${pkg.highlight?"var(--gold)":"rgba(212,175,90,0.18)"}`, padding:"24px 20px", borderRadius:6, position:"relative", transition:"transform 0.3s" }}
                  onMouseEnter={e=>e.currentTarget.style.transform="translateY(-4px)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="none"}
                >
                  {pkg.highlight && <div style={{ position:"absolute", top:-1, left:"50%", transform:"translateX(-50%)", background:"linear-gradient(135deg,var(--gold-dark),var(--gold))", color:"var(--black)", padding:"3px 16px", fontSize:"0.66rem", fontWeight:800, letterSpacing:2, borderRadius:"0 0 6px 6px", whiteSpace:"nowrap" }}>PHỔ BIẾN NHẤT</div>}
                  <div style={{ color:"var(--gold)", marginBottom:14, marginTop:pkg.highlight?12:0 }}>{pkg.icon}</div>
                  <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.2rem", color:"var(--white)", marginBottom:6 }}>{pkg.name}</h3>
                  <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
                    <span style={{ fontSize:"0.72rem", padding:"3px 10px", background:"rgba(212,175,90,0.1)", color:"var(--gold)", borderRadius:2 }}><Clock size={10} style={{ display:"inline", marginRight:4 }}/>{pkg.duration}</span>
                    <span style={{ fontSize:"0.72rem", padding:"3px 10px", background:"rgba(212,175,90,0.06)", color:"var(--text-light)", borderRadius:2 }}>{pkg.method}</span>
                  </div>
                  <ul style={{ listStyle:"none", marginBottom:20 }}>
                    {pkg.features.map((f,j)=>(
                      <li key={j} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:7, fontSize:"0.86rem", color:"var(--cream2)", lineHeight:1.5 }}>
                        <CheckCircle size={12} color="var(--gold)" style={{ marginTop:2, flexShrink:0 }}/>{f}
                      </li>
                    ))}
                  </ul>
                  <a href="https://zalo.me/0968386408" target="_blank" rel="noreferrer" className={pkg.highlight?"btn-gold":"btn-outline"} style={{ width:"100%", textAlign:"center", padding:"11px", display:"block" }}>
                    💬 Đặt Lịch Qua Zalo
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
