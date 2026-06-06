import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, RotateCcw, ChevronRight, Star, Calendar } from "lucide-react";
import { requestAIConsultation } from "../services/api";

/* ══════════════════════════════════════════════════════
   Bảng Nạp Âm 60 Can Chi — CHUẨN XÁC
   2003 (Quý Mùi) = index 19 → Mộc ✅
══════════════════════════════════════════════════════ */
const NAP_AM_60 = [
  "Kim","Kim","Hỏa","Hỏa","Mộc","Mộc","Thổ","Thổ","Kim","Kim",
  "Hỏa","Hỏa","Thủy","Thủy","Thổ","Thổ","Kim","Kim","Mộc","Mộc",
  "Thủy","Thủy","Thổ","Thổ","Hỏa","Hỏa","Mộc","Mộc","Thủy","Thủy",
  "Kim","Kim","Hỏa","Hỏa","Mộc","Mộc","Thổ","Thổ","Kim","Kim",
  "Hỏa","Hỏa","Thủy","Thủy","Thổ","Thổ","Kim","Kim","Mộc","Mộc",
  "Thủy","Thủy","Thổ","Thổ","Hỏa","Hỏa","Mộc","Mộc","Thủy","Thủy",
];

const CANS = ["Giáp","Ất","Bính","Đinh","Mậu","Kỷ","Canh","Tân","Nhâm","Quý"];
const CHIS = ["Tý","Sửu","Dần","Mão","Thìn","Tỵ","Ngọ","Mùi","Thân","Dậu","Tuất","Hợi"];

export function calcElement(year) {
  const idx = (parseInt(year) - 1924 + 6000) % 60;
  return NAP_AM_60[idx] || "Thổ";
}
export function getCanChi(year) {
  const y = parseInt(year);
  return CANS[(y - 4 + 6000) % 10] + " " + CHIS[(y - 4 + 6000) % 12];
}

const EL_INFO = {
  Kim:  { color:"#D4AF5A", emoji:"⚙️",  desc:"Cứng rắn, quyết đoán, tài chính vững chắc." },
  Mộc:  { color:"#4CAF50", emoji:"🌿",  desc:"Phát triển, sáng tạo, nhân từ, học vấn cao." },
  Thủy: { color:"#4A90D9", emoji:"💧",  desc:"Trí tuệ, linh hoạt, giao tiếp khéo léo." },
  Hỏa:  { color:"#E74C3C", emoji:"🔥",  desc:"Nhiệt huyết, lãnh đạo, danh vọng, đam mê." },
  Thổ:  { color:"#8B6914", emoji:"🌍",  desc:"Ổn định, trung thực, kiên nhẫn, bền bỉ." },
};
const REL = {
  Kim:  { sinh:"Thủy", khac:"Mộc",  bySinh:"Thổ",  byKhac:"Hỏa"  },
  Mộc:  { sinh:"Hỏa",  khac:"Thổ",  bySinh:"Thủy", byKhac:"Kim"  },
  Thủy: { sinh:"Mộc",  khac:"Hỏa",  bySinh:"Kim",  byKhac:"Thổ"  },
  Hỏa:  { sinh:"Thổ",  khac:"Kim",  bySinh:"Mộc",  byKhac:"Thủy" },
  Thổ:  { sinh:"Kim",  khac:"Thủy", bySinh:"Hỏa",  byKhac:"Mộc"  },
};
function getCung(year, gender) {
  const y = parseInt(year);
  let s = String(y).split("").reduce((a, b) => a + parseInt(b), 0);
  while (s >= 10) s = String(s).split("").reduce((a, b) => a + parseInt(b), 0);
  const n = gender === "male" ? (10 - s) % 9 || 9 : (5 + s) % 9 || 9;
  const nm = { 1:"Khảm",2:"Khôn",3:"Chấn",4:"Tốn",5:gender==="male"?"Khôn":"Cấn",6:"Càn",7:"Đoài",8:"Cấn",9:"Ly" };
  return { num: n, name: nm[n] || "Khôn" };
}

const GOALS = [
  { id:"taiLoc",    label:"Tài Lộc & Sự Nghiệp" },
  { id:"sucKhoe",   label:"Sức Khỏe & Bình An" },
  { id:"tinhDuyen", label:"Tình Duyên & Gia Đình" },
  { id:"hocVan",    label:"Học Vấn & Trí Tuệ" },
  { id:"huongNha",  label:"Phân Tích Hướng Nhà" },
];

const HOUSE_DIRECTIONS = [
  { id:"bac",    label:"Bắc"     }, { id:"namBac",  label:"Nam–Bắc" },
  { id:"nam",    label:"Nam"     }, { id:"dongTay", label:"Đông–Tây" },
  { id:"dong",   label:"Đông"   }, { id:"tayBac",  label:"Tây Bắc"  },
  { id:"tay",    label:"Tây"    }, { id:"dongNam", label:"Đông Nam" },
  { id:"dongBac",label:"Đông Bắc"},{ id:"tayNam",  label:"Tây Nam"  },
];

const GIO_CHI_MAP = {
  ty:"Tý (23–01h)", suu:"Sửu (01–03h)", dan:"Dần (03–05h)", mao:"Mão (05–07h)",
  thin:"Thìn (07–09h)", ti:"Tỵ (09–11h)", ngo:"Ngọ (11–13h)", mui:"Mùi (13–15h)",
  than:"Thân (15–17h)", dau:"Dậu (17–19h)", tuat:"Tuất (19–21h)", hoi:"Hợi (21–23h)",
};
const GIO_LABELS_MAP = {
  ty:"Giáp/Kỷ Tý", suu:"Ất/Canh Sửu", dan:"Bính/Tân Dần", mao:"Đinh/Nhâm Mão",
  thin:"Mậu/Quý Thìn", ti:"Giáp/Kỷ Tỵ", ngo:"Ất/Canh Ngọ", mui:"Bính/Tân Mùi",
  than:"Đinh/Nhâm Thân", dau:"Mậu/Quý Dậu", tuat:"Giáp/Kỷ Tuất", hoi:"Ất/Canh Hợi",
};

/* ── AI tư vấn nội bộ: không cần API key, không gọi dịch vụ bên ngoài ── */
function generateMachNhaAI({ form, element, elInfo, cung, rel, canChi, goalLabel, huongLabel, matched }) {
  const productNames = matched.length ? matched.map(p => p.name).join(", ") : "các vật phẩm có hành tương sinh";
  const colorMap = {
    Mộc: "xanh lá, xanh lam, chất liệu gỗ và cây xanh",
    Hỏa: "đỏ, cam, hồng, ánh sáng ấm và vật phẩm có năng lượng dương",
    Thổ: "vàng đất, nâu, gốm sứ, đá tự nhiên và chất liệu chắc nặng",
    Kim: "trắng, bạc, vàng kim, đồ kim loại sáng và bố cục gọn gàng",
    Thủy: "đen, xanh lam đậm, chất liệu kính, nước và đường nét mềm",
  };
  const placeMap = {
    taiLoc: "khu vực tài lộc, bàn làm việc hoặc nơi giữ tiền bạc nên sạch, sáng và ít bị che khuất",
    sucKhoe: "phòng ngủ, góc nghỉ ngơi hoặc khu vực sinh hoạt chung nên giữ thoáng, cân bằng ánh sáng và tránh đồ sắc nhọn",
    tinhDuyen: "góc Tây Nam, phòng ngủ hoặc khu vực sinh hoạt ấm cúng nên dùng bố cục mềm và các vật phẩm theo cặp",
    hocVan: "bàn học, kệ sách hoặc góc làm việc nên gọn, đủ sáng và có điểm nhấn giúp tăng tập trung",
    huongNha: `nhà hướng ${huongLabel || "đã chọn"} nên ưu tiên cân bằng luồng đi, ánh sáng và vị trí đặt vật phẩm tại nơi dễ nhìn nhưng không chắn lối`,
  };

  return `Chào ${form.name}! AI Mạch Nhà đã phân tích năm sinh ${form.year} (${canChi}) và xác định bạn mang mệnh ${element}. ${elInfo.desc} Cung mệnh của bạn là cung ${cung.name} số ${cung.num}, vì vậy khi chọn vật phẩm nên ưu tiên sự hài hòa giữa bản mệnh, mục tiêu hiện tại và vị trí đặt trong nhà.

Về ngũ hành, ${rel.bySinh} là hành sinh cho ${element}, còn ${rel.sinh} là hành được ${element} nuôi dưỡng. Điều này có nghĩa là bạn nên chọn vật phẩm có màu sắc, chất liệu hoặc biểu tượng thuộc nhóm tương sinh trước, sau đó mới xét đến sở thích cá nhân. Những yếu tố thuộc hành ${rel.byKhac} nên dùng tiết chế để tránh làm không gian bị lệch năng lượng.

Với mục tiêu ${goalLabel}, khu vực nên chú ý là ${placeMap[form.goal] || "khu vực sinh hoạt chính trong nhà"}. Nếu đặt vật phẩm ở nơi quá tối, quá thấp hoặc bị đồ đạc che khuất, tác dụng thẩm mỹ và cảm giác phong thủy sẽ giảm rõ rệt. Hãy để vật phẩm có khoảng thở, có ánh sáng vừa đủ và không bị lẫn trong quá nhiều đồ trang trí khác.

Bảng màu AI gợi ý cho mệnh ${element} là ${colorMap[element] || "màu trung tính và chất liệu tự nhiên"}. Bạn không cần thay toàn bộ không gian, chỉ cần thêm vài điểm nhấn đúng mệnh như khăn trải, đế gỗ, đèn, khay đá hoặc tranh nền. Cách làm nhỏ nhưng đều sẽ dễ áp dụng và bền hơn so với thay đổi quá mạnh trong một lần.

Các sản phẩm phù hợp nhất trong dữ liệu hiện tại là: ${productNames}. Khi chọn mua, hãy ưu tiên sản phẩm có kích thước vừa với vị trí đặt, màu không xung với nền tường và ý nghĩa đúng nhu cầu. Một vật phẩm hợp mệnh nhưng đặt sai chỗ vẫn có thể làm không gian nặng hoặc rối mắt.

Lời khuyên cuối cùng: phong thủy nên hỗ trợ quyết định sống tốt hơn, không thay thế nỗ lực cá nhân. Bạn hãy bắt đầu bằng việc dọn sạch khu vực định đặt vật phẩm, chọn một sản phẩm chủ đạo, quan sát cảm giác không gian trong vài ngày rồi mới bổ sung thêm. Nếu cần phân tích sâu theo nhà, hướng cửa, phòng ngủ và bàn làm việc, hãy dùng phần tư vấn chi tiết bên dưới.`;
}

/* ── Tạo text phân tích fallback chi tiết ── */
function buildFallback(form, element, elInfo, cung, rel, canChi, goalLabel, huongLabel) {
  const isMale = form.gender === "male";
  const tinhCach = {
    Mộc: "có tâm hồn phong phú, giàu cảm xúc và thiên về sáng tạo. Bạn dễ đồng cảm, có năng khiếu trong nghệ thuật và giáo dục, xây dựng mối quan hệ bền chặt từ sự chân thành",
    Hỏa: "tràn đầy nhiệt huyết, quyết đoán và có sức hút lãnh đạo tự nhiên. Bạn hành động nhanh, truyền cảm hứng mạnh cho người xung quanh, cần học cách kiểm soát cảm xúc khi áp lực cao",
    Thổ: "kiên định, thực tế và trung thực trong mọi hoàn cảnh. Bạn xây dựng nền tảng bền vững, đáng tin cậy và luôn hoàn thành trách nhiệm. Đôi khi cần linh hoạt hơn để nắm bắt cơ hội mới",
    Kim:  "nguyên tắc, chính trực và có khả năng tổ chức vượt trội. Bạn làm việc có phương pháp, giữ tiêu chuẩn cao trong mọi việc. Cần học cách linh hoạt để không bỏ lỡ những cơ hội quan trọng",
    Thủy: "thông minh, linh hoạt và có trực giác nhạy bén hiếm có. Bạn tiếp thu nhanh, thích chiều sâu của vấn đề và dễ thích nghi. Điểm cần cải thiện là tránh phân tán sức lực vào quá nhiều hướng",
  }[element];

  const sucKhoe = {
    Mộc:  "gan, mắt và hệ thần kinh. Rau xanh, trà xanh và đi bộ trong thiên nhiên rất có lợi",
    Hỏa:  "tim, huyết mạch và huyết áp. Tránh căng thẳng kéo dài, ăn thực phẩm mát, tập cardio vừa phải",
    Thổ:  "dạ dày và hệ tiêu hóa. Ăn đúng giờ, tránh lo lắng quá mức, bổ sung bí đỏ, cà rốt, nghệ",
    Kim:   "phổi và hệ hô hấp. Không khí trong lành là thiết yếu, trồng cây lọc không khí trong phòng",
    Thủy: "thận và hệ bài tiết. Uống đủ nước, tránh lạnh quá mức, bơi lội và bài tập nhẹ nhàng",
  }[element];

  const mauSac = {
    Mộc:  "Xanh lá, xanh lam và đen là bảng màu chủ đạo. Đồ gỗ tự nhiên, cây xanh và vải lanh tăng sinh khí. Tránh để màu trắng và kim loại chiếm ưu thế",
    Hỏa:  "Đỏ, cam, hồng ấm và tím nhạt là lựa chọn tối ưu. Ánh sáng tự nhiên dồi dào và đèn vàng ấm tạo vượng khí. Tránh không gian tối tăm u ám",
    Thổ:  "Vàng đất, nâu và cam là bảng màu lý tưởng. Đồ gốm sứ, đá tự nhiên và vật liệu thô phù hợp. Tránh để màu xanh lá chiếm quá nhiều diện tích",
    Kim:   "Trắng, bạc, xám nhạt và vàng kim là màu vượng khí nhất. Không gian tối giản, gọn gàng với ánh sáng trắng mang năng lượng tốt nhất",
    Thủy: "Đen, xanh lam đậm và tím phù hợp nhất. Thêm yếu tố nước như tranh thủy mặc hoặc tiểu cảnh nước. Tránh màu vàng nâu chiếm ưu thế",
  }[element];

  const tinhDuyen = {
    Mộc:  "chân thành, giàu tình cảm, trọng sự đồng điệu tâm hồn. Người bạn đời mệnh Thủy (tương sinh) sẽ nuôi dưỡng cảm xúc cho bạn tốt nhất",
    Hỏa:  "đam mê, nồng nhiệt nhưng đôi khi thiếu kiên nhẫn. Người bạn đời mệnh Mộc sẽ tiếp thêm năng lượng và giúp bạn ổn định",
    Thổ:  "trung thành, bao dung và trọng sự ổn định. Người bạn đời mệnh Hỏa mang lại sinh khí và niềm vui cho gia đình",
    Kim:   "nghiêm túc, chọn lọc và đặt nặng giá trị đạo đức. Người bạn đời mệnh Thổ mang lại sự ổn định bền vững",
    Thủy: "nhạy cảm, lãng mạn và cần được thấu hiểu sâu sắc. Người bạn đời mệnh Kim bổ trợ và định hướng cảm xúc rất tốt",
  }[element];

  const vanTrinh = cung.num % 2 === 0
    ? "thuận chiều — cơ hội đến khá tự nhiên, đặc biệt giai đoạn 30–45 tuổi khi các cung Phúc và Quan Lộc được kích hoạt mạnh"
    : "chủ động — bạn cần tự tạo ra cơ hội, bù lại khi đã thành công thì rất bền vững và khó bị lung lay";

  if (form.goal === "huongNha") {
    const hopHuong = ["bac","dongBac","tay","tayNam"].includes(form.huongNha);
    return `Chào ${form.name}! Với mệnh ${element} (${canChi}) và nhà hướng ${huongLabel}, trợ lý tư vấn đã phân tích kỹ mức độ tương hợp giữa mệnh số và hướng nhà của bạn.

Đánh giá hướng nhà: Hướng ${huongLabel} ${hopHuong ? "có thể chưa hoàn toàn phù hợp với mệnh " + element + ". Điều này không có nghĩa là bất lợi hoàn toàn — bạn cần bổ sung vật phẩm hóa giải và tăng cường sinh khí ở những khu vực quan trọng trong nhà" : "khá phù hợp với mệnh " + element + ". Đây là lợi thế tự nhiên giúp năng lượng lưu thông thuận chiều, hỗ trợ sức khỏe và tài lộc của gia chủ"}.

Về cung mệnh ${cung.name} (số ${cung.num}): Hướng vượng khí tốt nhất là ${rel.sinh}, nên ưu tiên khi đặt bàn làm việc, đầu giường và bàn thờ gia tiên. Tránh để vật dụng quan trọng hướng về phía ${rel.byKhac} vì đây là hướng xung khắc với mệnh ${element}.

Về khu vực trong nhà: Khu vực bếp và phòng ngủ cần đặc biệt chú ý vì ảnh hưởng trực tiếp đến sức khỏe và tình cảm gia đình. Phòng làm việc hoặc bàn thờ nên bố trí về hướng ${rel.sinh} để hấp thu sinh khí liên tục.

Giải pháp phong thủy đề xuất: Đặt vật phẩm thuộc hành ${rel.bySinh} tại cửa chính để lọc và chuyển hóa năng lượng ngay từ điểm tiếp nhận đầu tiên. Các sản phẩm dưới đây được chọn lọc đặc biệt cho gia chủ mệnh ${element} với nhà hướng ${huongLabel}.`;
  }

  return `Chào ${form.name}! Năm ${form.year} (${canChi}), bạn mang mệnh ${element} theo bảng Nạp Âm Ngũ Hành chuẩn. ${elInfo.desc} Đây là nền tảng năng lượng cốt lõi định hình toàn bộ cuộc đời bạn — từ tính cách, sức khỏe cho đến các mối quan hệ và vận trình tài lộc.

Về tính cách và bản mệnh: Người mang mệnh ${element} thường ${tinhCach}. Hiểu rõ điểm mạnh và điểm cần cải thiện này sẽ giúp bạn đưa ra những quyết định sáng suốt hơn trong cuộc sống.

Về cung mệnh Tử Vi: Cung ${cung.name} (số ${cung.num}) là trung tâm lá số, phản ánh vận mệnh tổng thể và định hướng cuộc đời. ${isMale ? "Nam giới" : "Nữ giới"} cung ${cung.name} thường có vận trình ${vanTrinh}. Hướng vượng khí tốt nhất cho cung này là hướng ${rel.sinh}.

Về sự nghiệp và tài lộc: Để đạt được ${goalLabel}, người mệnh ${element} cần chiến lược dựa trên nguyên lý ngũ hành. Sử dụng vật phẩm thuộc hành ${rel.bySinh} vì ${rel.bySinh} sinh ${element} — đây là nguồn năng lượng bổ trợ mạnh mẽ nhất. Bố trí bàn làm việc hướng ${rel.sinh} và tránh xa hành ${rel.byKhac} vì ${rel.byKhac} khắc ${element} tạo trở lực vô hình. Thời điểm tốt để khởi động dự án lớn là các tháng mang Can Chi tương sinh với mệnh bạn.

Về tình duyên và gia đình: Người mệnh ${element} trong tình cảm thường ${tinhDuyen}. Hướng tốt cho phòng ngủ là hướng ${rel.sinh} — giúp tăng cường năng lượng tình cảm và gắn kết hai người. Thời điểm thuận lợi cho các quyết định lớn trong gia đình là giai đoạn 2026–2027.

Về sức khỏe và thể chất: Mệnh ${element} liên hệ mật thiết với ${sucKhoe}. Thực hành thiền định buổi sáng và ngủ đủ giấc là nền tảng sức khỏe quan trọng nhất, đặc biệt với người mệnh ${element}.

Về màu sắc và không gian sống: ${mauSac}. Việc điều chỉnh màu sắc không gian sống theo mệnh có tác động tích cực đến tâm lý và năng lượng hàng ngày của bạn.

Lời khuyên tổng thể: Phong thủy hiệu quả nhất khi được áp dụng đồng bộ từ vật phẩm, màu sắc, bố trí không gian đến thói quen sống. Hãy bắt đầu từ những thay đổi nhỏ, quan sát sự chuyển biến và điều chỉnh dần. Phong thủy là công cụ hỗ trợ — nền tảng vẫn là nỗ lực và tư duy tích cực của chính bạn. Các sản phẩm gợi ý dưới đây được chọn lọc kỹ lưỡng, đặc biệt phù hợp với mệnh ${element} và mục tiêu ${goalLabel} của bạn.`;
}

/* ══════════════════════════════════════════════════════
   Main Component
══════════════════════════════════════════════════════ */
export default function FengShuiAnalyzer({ products = [], compact = false, onAnalyzed = null }) {
  const [step,   setStep]  = useState(0);
  const [form,   setForm]  = useState({
    name:"", day:"", month:"", year:"", hourNum:"", minute:"", hour:"", gender:"", goal:"", huongNha:""
  });
  const [result, setResult] = useState(null);
  const [err,    setErr]    = useState("");

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    if (!form.name.trim()) return "Vui lòng nhập họ tên";
    const y = parseInt(form.year);
    if (!y || y < 1920 || y > 2015) return "Năm sinh không hợp lệ (1920–2015)";
    if (!form.gender) return "Vui lòng chọn giới tính";
    if (!form.goal)   return "Vui lòng chọn mong muốn chính";
    if (form.goal === "huongNha" && !form.huongNha) return "Vui lòng chọn hướng nhà";
    return null;
  };

  const analyze = async () => {
    const e = validate();
    if (e) { setErr(e); return; }
    setErr(""); setStep(1);

    const element   = calcElement(form.year);
    const elInfo    = EL_INFO[element];
    const canChi    = getCanChi(form.year);
    const cung      = getCung(form.year, form.gender);
    const rel       = REL[element];
    const goalLabel = GOALS.find(g => g.id === form.goal)?.label || form.goal;
    const matched   = products
      .filter(p => p.destiny?.includes(element) || p.destiny?.includes("Mọi mệnh"))
      .slice(0, 3);
    const hourStr = form.hourNum ? form.hourNum + ":" + (form.minute || "00") : "";
    const dob = (form.day ? form.day + "/" : "") + (form.month ? form.month + "/" : "") + form.year + (hourStr ? " lúc " + hourStr : "");
    const huongLabel = form.goal === "huongNha" ? (HOUSE_DIRECTIONS.find(d => d.id === form.huongNha)?.label || "") : "";

    try {
      const ai = await requestAIConsultation({
        form: { ...form, goalLabel, huongLabel },
        analysis: { element, elInfo, canChi, cung, rel, dob },
        products: matched,
      });
      const analysisResult = { element, elInfo, canChi, cung, rel, matched, dob, aiText: ai.text };
      setResult(analysisResult);
      setStep(2);
      onAnalyzed && onAnalyzed(analysisResult);
    } catch (error) {
      setErr(error.message || "AI chưa phân tích được. Vui lòng kiểm tra cấu hình server.");
      setStep(0);
    }
  };

  const reset = () => {
    setStep(0); setResult(null);
    setForm({ name:"", day:"", month:"", year:"", hourNum:"", minute:"", hour:"", gender:"", goal:"", huongNha:"" });
    setErr("");
  };

  /* ── FORM ── */
  if (step === 0) return (
    <div style={{ background:"linear-gradient(135deg,var(--dark2),var(--dark3))", border:"1px solid rgba(212,175,90,0.3)", padding:compact?"24px":"36px", borderRadius:4 }}>
      {!compact && (
        <>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
            <Sparkles size={20} color="var(--gold)"/>
            <h2 style={{ fontFamily:"'Be Vietnam Pro','Raleway',sans-serif", fontSize:"1.55rem", fontWeight:700, letterSpacing:1.5, color:"var(--white)" }}>
              Tra Cứu <span className="gold-text">Vật Phẩm Hợp Mệnh</span>
            </h2>
          </div>
          <p style={{ color:"var(--text-light)", fontSize:"0.9rem", marginBottom:22, lineHeight:1.7 }}>
            Trợ lý tư vấn phân tích mệnh ngũ hành theo Nạp Âm chuẩn & gợi ý vật phẩm phong thủy — không cần đăng ký.
          </p>
        </>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>

        {/* Họ tên */}
        <div style={{ gridColumn:"1/-1" }}>
          <label style={{ display:"block", fontSize:"0.72rem", color:"var(--gold-light)", letterSpacing:2, textTransform:"uppercase", marginBottom:7, fontWeight:700 }}>Họ và Tên</label>
          <input
            value={form.name} onChange={e => set("name", e.target.value)}
            placeholder="Nhập họ tên đầy đủ..."
            style={{ width:"100%", padding:"11px 14px", background:"var(--dark)", border:"1px solid rgba(212,175,90,0.3)", color:"var(--cream)", fontFamily:"'Be Vietnam Pro',Raleway,sans-serif", fontSize:"0.95rem", outline:"none", borderRadius:3 }}
          />
        </div>

        {/* Ngày tháng năm */}
        <div style={{ gridColumn:"1/-1" }}>
          <label style={{ display:"block", fontSize:"0.72rem", color:"var(--gold-light)", letterSpacing:2, textTransform:"uppercase", marginBottom:7, fontWeight:700 }}>
            <Calendar size={12} style={{ display:"inline", marginRight:5 }}/>Ngày Tháng Năm Sinh
          </label>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1.5fr", gap:8 }}>
            {[
              { key:"day",   ph:"Ngày (1–31)",  min:1,    max:31   },
              { key:"month", ph:"Tháng (1–12)", min:1,    max:12   },
              { key:"year",  ph:"Năm sinh *",   min:1920, max:2015 },
            ].map(f => (
              <input key={f.key} type="number" value={form[f.key]}
                onChange={e => set(f.key, e.target.value)}
                placeholder={f.ph} min={f.min} max={f.max}
                style={{ padding:"11px 10px", background:"var(--dark)", border:"1.5px solid " + (f.key === "year" ? "rgba(212,175,90,0.55)" : "rgba(212,175,90,0.25)"), color:"var(--cream)", fontFamily:"'Be Vietnam Pro',Raleway,sans-serif", fontSize:"0.9rem", outline:"none", borderRadius:3, width:"100%" }}
              />
            ))}
          </div>
          <p style={{ fontSize:"0.72rem", color:"var(--text-light)", marginTop:5 }}>
            ★ <strong style={{ color:"var(--gold)" }}>Năm sinh bắt buộc.</strong> Ngày/tháng giúp tính Tứ Trụ & Tử Vi chi tiết hơn.
          </p>
        </div>

        {/* Giờ & phút sinh */}
        <div style={{ gridColumn:"1/-1" }}>
          <label style={{ display:"block", fontSize:"0.72rem", color:"var(--gold-light)", letterSpacing:2, textTransform:"uppercase", marginBottom:7, fontWeight:700 }}>
            Giờ &amp; Phút Sinh{" "}
            <span style={{ color:"var(--text-light)", fontWeight:400, textTransform:"none", letterSpacing:0 }}>(tùy chọn)</span>
          </label>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
            <div>
              <div style={{ fontSize:"0.68rem", color:"var(--text-light)", marginBottom:4, letterSpacing:1 }}>GIỜ SINH (0–23)</div>
              <input type="number" value={form.hourNum} onChange={e => set("hourNum", e.target.value)}
                placeholder="VD: 4" min={0} max={23}
                style={{ width:"100%", padding:"10px 12px", background:"var(--dark)", border:"1.5px solid rgba(212,175,90,0.3)", color:"var(--cream)", fontFamily:"'Be Vietnam Pro',Raleway,sans-serif", fontSize:"0.92rem", outline:"none", borderRadius:3 }}
              />
            </div>
            <div>
              <div style={{ fontSize:"0.68rem", color:"var(--text-light)", marginBottom:4, letterSpacing:1 }}>PHÚT SINH (0–59)</div>
              <input type="number" value={form.minute} onChange={e => set("minute", e.target.value)}
                placeholder="VD: 21" min={0} max={59}
                style={{ width:"100%", padding:"10px 12px", background:"var(--dark)", border:"1.5px solid rgba(212,175,90,0.3)", color:"var(--cream)", fontFamily:"'Be Vietnam Pro',Raleway,sans-serif", fontSize:"0.92rem", outline:"none", borderRadius:3 }}
              />
            </div>
          </div>
          <div style={{ fontSize:"0.7rem", color:"var(--text-light)", marginBottom:8 }}>
            Hoặc chọn theo <strong style={{ color:"var(--gold)" }}>giờ Can Chi</strong>:
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:6 }}>
            {[
              { id:"ty",   label:"Tý",   time:"23–01" }, { id:"suu",  label:"Sửu",  time:"01–03" },
              { id:"dan",  label:"Dần",  time:"03–05" }, { id:"mao",  label:"Mão",  time:"05–07" },
              { id:"thin", label:"Thìn", time:"07–09" }, { id:"ti",   label:"Tỵ",   time:"09–11" },
              { id:"ngo",  label:"Ngọ",  time:"11–13" }, { id:"mui",  label:"Mùi",  time:"13–15" },
              { id:"than", label:"Thân", time:"15–17" }, { id:"dau",  label:"Dậu",  time:"17–19" },
              { id:"tuat", label:"Tuất", time:"19–21" }, { id:"hoi",  label:"Hợi",  time:"21–23" },
            ].map(g => (
              <button key={g.id} onClick={() => set("hour", form.hour === g.id ? "" : g.id)}
                title={"Giờ " + g.label + ": " + g.time + "h"}
                style={{
                  padding:"7px 4px",
                  border:"1.5px solid " + (form.hour === g.id ? "var(--gold)" : "rgba(212,175,90,0.2)"),
                  background: form.hour === g.id ? "rgba(212,175,90,0.18)" : "var(--dark)",
                  color: form.hour === g.id ? "var(--gold)" : "var(--text-light)",
                  cursor:"pointer", fontFamily:"'Be Vietnam Pro',Raleway,sans-serif",
                  fontSize:"0.78rem", textAlign:"center", transition:"all 0.2s", borderRadius:3, lineHeight:1.3,
                }}>
                <div style={{ fontWeight:700 }}>{g.label}</div>
                <div style={{ fontSize:"0.65rem", opacity:0.75 }}>{g.time}</div>
              </button>
            ))}
          </div>
          <p style={{ fontSize:"0.72rem", color:"var(--text-light)", marginTop:5 }}>
            Nhấp chọn giờ sinh theo Can Chi — nhấp lại để bỏ chọn.
          </p>
        </div>

        {/* Giới tính */}
        <div>
          <label style={{ display:"block", fontSize:"0.72rem", color:"var(--gold-light)", letterSpacing:2, textTransform:"uppercase", marginBottom:7, fontWeight:700 }}>Giới Tính</label>
          <div style={{ display:"flex", gap:8 }}>
            {["male","female"].map(g => (
              <button key={g} onClick={() => set("gender", g)}
                style={{ flex:1, padding:"11px", border:"1.5px solid " + (form.gender === g ? "var(--gold)" : "rgba(212,175,90,0.25)"), background:form.gender === g ? "linear-gradient(135deg,var(--gold-dark),var(--gold))" : "var(--dark)", color:form.gender === g ? "#0D0B08" : "var(--text-light)", cursor:"pointer", fontFamily:"'Be Vietnam Pro',Raleway,sans-serif", fontWeight:800, fontSize:"0.85rem", transition:"all 0.2s", borderRadius:3 }}>
                {g === "male" ? "👨 Nam" : "👩 Nữ"}
              </button>
            ))}
          </div>
        </div>

        {/* Mong muốn */}
        <div>
          <label style={{ display:"block", fontSize:"0.72rem", color:"var(--gold-light)", letterSpacing:2, textTransform:"uppercase", marginBottom:7, fontWeight:700 }}>Mong Muốn Chính</label>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {GOALS.map(g => (
              <button key={g.id} onClick={() => set("goal", g.id)}
                style={{ padding:"8px 12px", border:"1.5px solid " + (form.goal === g.id ? "var(--gold)" : "rgba(212,175,90,0.2)"), background:form.goal === g.id ? "rgba(212,175,90,0.15)" : "var(--dark)", color:form.goal === g.id ? "var(--gold)" : "var(--text-light)", cursor:"pointer", fontFamily:"'Be Vietnam Pro',Raleway,sans-serif", fontSize:"0.83rem", textAlign:"left", transition:"all 0.2s", borderRadius:3 }}>
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hướng nhà */}
        {form.goal === "huongNha" && (
          <div style={{ gridColumn:"1/-1" }}>
            <label style={{ display:"block", fontSize:"0.72rem", color:"var(--gold-light)", letterSpacing:2, textTransform:"uppercase", marginBottom:7, fontWeight:700 }}>Hướng Nhà / Cửa Chính</label>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:7 }}>
              {HOUSE_DIRECTIONS.map(d => (
                <button key={d.id} onClick={() => set("huongNha", d.id)}
                  style={{ padding:"8px 6px", border:"1.5px solid " + (form.huongNha === d.id ? "var(--gold)" : "rgba(212,175,90,0.2)"), background:form.huongNha === d.id ? "rgba(212,175,90,0.16)" : "var(--dark)", color:form.huongNha === d.id ? "var(--gold)" : "var(--text-light)", cursor:"pointer", fontFamily:"'Be Vietnam Pro',Raleway,sans-serif", fontSize:"0.78rem", textAlign:"center", transition:"all 0.2s", borderRadius:3 }}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {err && (
        <div style={{ marginTop:12, padding:"10px 14px", background:"rgba(192,57,43,0.1)", border:"1px solid rgba(192,57,43,0.3)", borderRadius:3, color:"#e74c3c", fontSize:"0.85rem" }}>
          ⚠️ {err}
        </div>
      )}

      <button onClick={analyze} className="btn-gold" style={{ width:"100%", marginTop:18, padding:"14px", fontSize:"0.9rem", justifyContent:"center" }}>
        <Sparkles size={17}/> Phân Tích Phong Thủy
      </button>
      <p style={{ textAlign:"center", marginTop:8, fontSize:"0.72rem", color:"var(--text-light)" }}>
        ✦ Sử dụng bảng Nạp Âm Ngũ Hành 60 năm chuẩn — không cần đăng ký ✦
      </p>
    </div>
  );

  /* ── LOADING ── */
  if (step === 1) return (
    <div style={{ background:"linear-gradient(135deg,var(--dark2),var(--dark3))", border:"1px solid rgba(212,175,90,0.3)", padding:compact?"40px":"64px 36px", textAlign:"center", borderRadius:4 }}>
      <div style={{ width:50, height:50, border:"3px solid rgba(212,175,90,0.2)", borderTop:"3px solid var(--gold)", borderRadius:"50%", animation:"spin 0.9s linear infinite", margin:"0 auto 16px" }}/>
      <h3 style={{ fontFamily:"'Be Vietnam Pro','Raleway',sans-serif", fontSize:"1.2rem", fontWeight:600, letterSpacing:2, marginBottom:8, color:"var(--white)" }}>Đang Phân Tích...</h3>
      <p style={{ color:"var(--text-light)", fontSize:"0.88rem" }}>Trợ lý đang luận giải mệnh ngũ hành cho bạn</p>
    </div>
  );

  /* ── KẾT QUẢ ── */
  if (step === 2 && result) {
    const { element, elInfo, canChi, cung, rel, matched, aiText } = result;
    return (
      <div style={{ background:"linear-gradient(135deg,var(--dark2),var(--dark3))", border:"1.5px solid " + elInfo.color + "50", padding:compact?"20px":"32px", borderRadius:4 }}>
        {/* Mệnh badge */}
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:18, padding:"14px 18px", background:elInfo.color + "12", border:"1px solid " + elInfo.color + "30", borderRadius:3 }}>
          <span style={{ fontSize:"2.2rem" }}>{elInfo.emoji}</span>
          <div>
            <div style={{ fontSize:"0.65rem", color:elInfo.color, letterSpacing:3, textTransform:"uppercase", fontWeight:700 }}>Mệnh Của Bạn — {canChi}</div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.6rem", color:elInfo.color, fontWeight:600 }}>Ngũ Hành {element}</div>
            <div style={{ fontSize:"0.82rem", color:"var(--cream2)", marginTop:1 }}>{elInfo.desc}</div>
          </div>
        </div>

        {/* Cung mệnh */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:18 }}>
          <div style={{ padding:"12px 14px", background:"rgba(212,175,90,0.06)", border:"1px solid rgba(212,175,90,0.15)", borderRadius:3 }}>
            <div style={{ fontSize:"0.65rem", color:"var(--gold)", letterSpacing:2, textTransform:"uppercase", marginBottom:5 }}>Cung Mệnh</div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.1rem", color:"var(--white)", fontWeight:500 }}>Cung {cung.name} (số {cung.num})</div>
          </div>
          <div style={{ padding:"12px 14px", background:"rgba(212,175,90,0.06)", border:"1px solid rgba(212,175,90,0.15)", borderRadius:3 }}>
            <div style={{ fontSize:"0.65rem", color:"var(--gold)", letterSpacing:2, textTransform:"uppercase", marginBottom:5 }}>Tương Sinh / Khắc</div>
            <div style={{ fontSize:"0.83rem", color:"var(--cream2)", lineHeight:1.8 }}>
              Sinh: <strong style={{ color:"#27ae60" }}>{rel.sinh}</strong> · Khắc: <strong style={{ color:"#e74c3c" }}>{rel.khac}</strong>
            </div>
          </div>
        </div>

        {/* AI text */}
        <div style={{ marginBottom:18 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
            <Sparkles size={14} color="var(--gold)"/>
            <span style={{ fontSize:"0.68rem", color:"var(--gold)", letterSpacing:2, textTransform:"uppercase", fontWeight:700 }}>Phân Tích Từ Trợ Lý Tư Vấn</span>
          </div>
          <div style={{ color:"var(--cream2)", lineHeight:1.95, fontSize:"0.93rem", padding:"13px 15px", background:"rgba(212,175,90,0.04)", border:"1px solid rgba(212,175,90,0.1)", borderRadius:3, whiteSpace:"pre-line" }}>
            {aiText}
          </div>
        </div>

        {/* Sản phẩm gợi ý */}
        {matched.length > 0 && (
          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:"0.68rem", color:"var(--gold)", letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:9 }}>✦ Vật Phẩm Gợi Ý</div>
            {matched.map(p => (
              <Link key={p.id} to={"/product/" + p.id}
                style={{ display:"flex", gap:12, alignItems:"center", background:"var(--dark)", padding:"11px 13px", marginBottom:7, border:"1px solid rgba(212,175,90,0.12)", borderRadius:3, transition:"border-color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(212,175,90,0.45)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(212,175,90,0.12)"}
              >
                <img src={p.image} alt={p.name} style={{ width:48, height:48, objectFit:"cover", flexShrink:0, borderRadius:2 }}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"0.97rem", fontWeight:500, color:"var(--white)", marginBottom:2 }}>{p.name}</div>
                  <div style={{ fontFamily:"'Be Vietnam Pro','Raleway',sans-serif", fontVariantNumeric:"tabular-nums", fontSize:"0.78rem", fontWeight:700, background:"linear-gradient(135deg,var(--gold-dark),var(--gold))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{p.price?.toLocaleString("vi-VN")}₫</div>
                </div>
                <ChevronRight size={14} color="var(--gold)"/>
              </Link>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display:"flex", gap:9, flexWrap:"wrap" }}>
          <button onClick={() => setStep(3)} className="btn-gold" style={{ flex:1, justifyContent:"center", minWidth:140 }}>
            <Star size={15}/> Xem Lá Số Tử Vi
          </button>
          <button onClick={reset} className="btn-outline" style={{ display:"flex", alignItems:"center", gap:6, padding:"11px 16px" }}>
            <RotateCcw size={13}/> Phân Tích Lại
          </button>
        </div>
      </div>
    );
  }

  /* ── TỬ VI ── */
  if (step === 3 && result) return <TuViPage result={result} form={form} onBack={() => setStep(2)} onReset={reset}/>;
  return null;
}

/* ══════════════════════════════════════════════════════
   Trang Tử Vi
══════════════════════════════════════════════════════ */
function TuViPage({ result, form, onBack, onReset }) {
  const { element, elInfo, canChi, cung, rel } = result;
  const year = parseInt(form.year);
  const can  = (year - 4 + 6000) % 10;
  const chi  = (year - 4 + 6000) % 12;

  const SAOCHINH = {
    1:[{name:"Tử Vi",t:"tốt",d:"Sao chủ mệnh, quyền lực và uy tín cao"},{name:"Thiên Cơ",t:"tốt",d:"Trí tuệ, mưu lược và linh hoạt biến hóa"}],
    2:[{name:"Thái Dương",t:"tốt",d:"Ánh sáng, danh vọng và ảnh hưởng rộng"},{name:"Thiên Lương",t:"tốt",d:"Từ bi, nhân từ, hay giúp đỡ người khác"}],
    3:[{name:"Thiên Đồng",t:"tốt",d:"Phúc lộc, vui vẻ, hưởng thụ cuộc sống"},{name:"Thái Âm",t:"tốt",d:"Trực giác nhạy bén, tâm hồn tinh tế"}],
    4:[{name:"Tham Lang",t:"mixed",d:"Đa tài đa mưu nhưng cần cẩn thận lòng tham"},{name:"Cự Môn",t:"mixed",d:"Biện luận giỏi, cần tránh thị phi miệng lưỡi"}],
    5:[{name:"Thiên Tướng",t:"tốt",d:"Hỗ trợ người khác, tài năng quản lý tổ chức"},{name:"Thiên Phủ",t:"tốt",d:"Kho tàng dồi dào, tích lũy và sung túc vật chất"}],
    6:[{name:"Vũ Khúc",t:"mixed",d:"Tài chính vững chắc nhưng tính khí cứng rắn"},{name:"Phá Quân",t:"mixed",d:"Khai phá tiên phong nhưng dễ biến động"}],
    7:[{name:"Thái Dương",t:"tốt",d:"Danh vọng và sự nghiệp rạng rỡ về cuối đời"},{name:"Liêm Trinh",t:"mixed",d:"Chính trực nhưng hay gặp những chuyện bất ngờ"}],
    8:[{name:"Thiên Cơ",t:"tốt",d:"Trí tuệ xuất sắc, khả năng ứng biến linh hoạt"},{name:"Thiên Lương",t:"tốt",d:"Phúc đức dày, được người lớn che chở giúp đỡ"}],
    9:[{name:"Tử Vi",t:"tốt",d:"Vượng khí mạnh, may mắn nổi bật trong sự nghiệp"},{name:"Thất Sát",t:"mixed",d:"Dũng cảm quyết đoán nhưng dễ xảy ra xung đột"}],
  };
  const saos = SAOCHINH[cung.num] || SAOCHINH[1];

  const CUNGS_TV = [
    { name:"Mệnh",    icon:"⭐", d:"Bản thân, sức khỏe, tướng mạo, vận mệnh tổng thể" },
    { name:"Phụ Mẫu", icon:"👨‍👩‍👧", d:"Quan hệ cha mẹ, cấp trên và may mắn từ tổ tiên" },
    { name:"Phúc Đức",icon:"🙏", d:"Phúc lành tổ tiên, tín ngưỡng và tinh thần" },
    { name:"Điền Trạch",icon:"🏠",d:"Nhà cửa, bất động sản, tài sản cố định" },
    { name:"Quan Lộc",icon:"🎯", d:"Sự nghiệp, công danh, địa vị xã hội" },
    { name:"Nô Bộc",  icon:"🤝", d:"Bạn bè, nhân viên, quan hệ xã hội" },
    { name:"Thiên Di", icon:"✈️", d:"Du lịch, di chuyển, cơ hội từ xa" },
    { name:"Tật Ách",  icon:"💊", d:"Sức khỏe, bệnh tật và thách thức cần vượt" },
    { name:"Tài Bạch", icon:"💰", d:"Tài chính, thu nhập và khả năng kiếm tiền" },
    { name:"Tử Tức",   icon:"👶", d:"Con cái, học trò, sáng tạo, di sản để lại" },
    { name:"Phu Thê",  icon:"💑", d:"Hôn nhân, tình yêu và người bạn đời" },
    { name:"Huynh Đệ",icon:"👫", d:"Anh chị em, bạn thân cùng trang lứa" },
  ];

  return (
    <div style={{ background:"linear-gradient(135deg,var(--dark2),var(--dark3))", border:"1.5px solid " + elInfo.color + "40", padding:"28px", borderRadius:4 }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:10 }}>
        <div>
          <div style={{ fontSize:"0.68rem", color:"var(--gold)", letterSpacing:3, textTransform:"uppercase", marginBottom:5, fontWeight:700 }}>✦ Lá Số Tử Vi ✦</div>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.7rem", fontWeight:400, letterSpacing:3, color:"var(--white)" }}>
            {form.name} — {canChi}
          </h2>
          <div style={{ fontSize:"0.83rem", color:"var(--text-light)", marginTop:4 }}>
            Sinh: {form.day ? form.day + "/" : ""}{form.month ? form.month + "/" : ""}{form.year}
            {form.hour ? " · Giờ " + (GIO_CHI_MAP[form.hour] || form.hour) : ""} · {form.gender === "male" ? "Nam" : "Nữ"} · Mệnh {element} · Cung {cung.name}
          </div>
        </div>
        <span style={{ fontSize:"2rem" }}>{elInfo.emoji}</span>
      </div>

      {/* Tứ Trụ */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:"0.68rem", color:"var(--gold)", letterSpacing:2, textTransform:"uppercase", marginBottom:10, fontWeight:700 }}>TỨ TRỤ CAN CHI</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
          {[
            { lbl:"Năm",  val:CANS[can] + " " + CHIS[chi],                                                              hi:true,       note:calcElement(year) },
            { lbl:"Tháng",val:form.month ? CANS[(can*2+parseInt(form.month)+1)%10]+" "+CHIS[(parseInt(form.month)+1)%12] : "—", hi:false, note:null },
            { lbl:"Ngày", val:form.day ? "(cần tra lịch vạn niên)" : "—",                                               hi:false,      note:null },
            { lbl:"Giờ",  val:form.hour ? (GIO_LABELS_MAP[form.hour] || GIO_CHI_MAP[form.hour]) : "—",                  hi:!!form.hour,note:form.hour ? GIO_CHI_MAP[form.hour] : null },
          ].map(t => (
            <div key={t.lbl} style={{ textAlign:"center", padding:"10px 6px", background:t.hi ? elInfo.color + "15" : "rgba(212,175,90,0.05)", border:"1px solid " + (t.hi ? elInfo.color : "rgba(212,175,90,0.15)"), borderRadius:3 }}>
              <div style={{ fontSize:"0.62rem", color:"var(--text-light)", letterSpacing:2, textTransform:"uppercase", marginBottom:4 }}>{t.lbl}</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"0.85rem", color:t.hi ? elInfo.color : "var(--cream2)", fontWeight:600, lineHeight:1.3 }}>{t.val}</div>
              {t.note && <div style={{ fontSize:"0.62rem", color:"var(--gold)", marginTop:2, opacity:0.8 }}>{t.note}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Sao chính */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:"0.68rem", color:"var(--gold)", letterSpacing:2, textTransform:"uppercase", marginBottom:10, fontWeight:700 }}>SAO CHÍNH CUNG {cung.name.toUpperCase()}</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))", gap:9 }}>
          {saos.map((s, i) => (
            <div key={i} style={{ padding:"12px 14px", background:s.t === "tốt" ? "rgba(39,174,96,0.08)" : "rgba(230,126,34,0.08)", border:"1px solid " + (s.t === "tốt" ? "rgba(39,174,96,0.25)" : "rgba(230,126,34,0.25)"), borderRadius:3 }}>
              <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5 }}>
                <Star size={13} color={s.t === "tốt" ? "#27ae60" : "#e67e22"} fill={s.t === "tốt" ? "#27ae60" : "none"}/>
                <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1rem", color:"var(--white)", fontWeight:600 }}>{s.name}</span>
                <span style={{ fontSize:"0.62rem", padding:"1px 6px", background:s.t === "tốt" ? "rgba(39,174,96,0.2)" : "rgba(230,126,34,0.2)", color:s.t === "tốt" ? "#27ae60" : "#e67e22", borderRadius:2, marginLeft:"auto" }}>{s.t}</span>
              </div>
              <div style={{ fontSize:"0.8rem", color:"var(--text-light)", lineHeight:1.65 }}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 12 Cung */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:"0.68rem", color:"var(--gold)", letterSpacing:2, textTransform:"uppercase", marginBottom:10, fontWeight:700 }}>12 CUNG LÁ SỐ TỬ VI</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:7 }}>
          {CUNGS_TV.map((c, i) => (
            <div key={i} style={{ padding:"10px 11px", background:i === 0 ? elInfo.color + "12" : "rgba(212,175,90,0.04)", border:"1px solid " + (i === 0 ? elInfo.color : "rgba(212,175,90,0.12)"), borderRadius:3 }}>
              <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:4 }}>
                <span style={{ fontSize:"0.9rem" }}>{c.icon}</span>
                <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"0.88rem", color:i === 0 ? elInfo.color : "var(--white)", fontWeight:600 }}>{c.name}{i === 0 ? " ★" : ""}</span>
              </div>
              <div style={{ fontSize:"0.73rem", color:"var(--text-light)", lineHeight:1.55 }}>{c.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Luận giải tổng thể */}
      <div style={{ padding:"16px 18px", background:"rgba(212,175,90,0.06)", border:"1px solid rgba(212,175,90,0.18)", borderRadius:3, marginBottom:18 }}>
        <div style={{ fontSize:"0.68rem", color:"var(--gold)", letterSpacing:2, textTransform:"uppercase", marginBottom:8, fontWeight:700 }}>✦ Luận Giải Tổng Thể</div>
        <p style={{ color:"var(--cream2)", lineHeight:1.9, fontSize:"0.92rem" }}>
          Mệnh <strong style={{ color:elInfo.color }}>{element} ({canChi})</strong>, cung mệnh <strong style={{ color:"var(--gold)" }}>{cung.name}</strong>: {elInfo.desc} Ngũ hành {element} được <strong style={{ color:"#27ae60" }}>{rel.bySinh}</strong> tương sinh và sinh ra <strong style={{ color:"#27ae60" }}>{rel.sinh}</strong>. Nên tránh môi trường mang nhiều yếu tố <strong style={{ color:"#e74c3c" }}>{rel.byKhac}</strong> để giữ vận khí thuận lợi.
        </p>
      </div>

      <p style={{ fontSize:"0.73rem", color:"var(--text-light)", padding:"10px 13px", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:3, marginBottom:18, lineHeight:1.7 }}>
        ⚠️ Phân tích sơ bộ dựa trên Nạp Âm Ngũ Hành & Tử Vi Đẩu Số. Để có lá số đầy đủ và chính xác hơn, hãy đặt lịch tư vấn với thầy phong thủy.
      </p>

      <div style={{ display:"flex", gap:9, flexWrap:"wrap" }}>
        <button onClick={onBack} className="btn-outline" style={{ display:"flex", alignItems:"center", gap:6, padding:"11px 16px" }}>← Quay Lại</button>
        <Link to="/tu-van" className="btn-gold" style={{ flex:1, justifyContent:"center", minWidth:160 }}>📞 Tư Vấn Chuyên Sâu</Link>
        <button onClick={onReset} style={{ padding:"11px 13px", background:"none", border:"1px solid rgba(255,255,255,0.1)", color:"var(--text-light)", cursor:"pointer", fontSize:"0.78rem", fontFamily:"'Be Vietnam Pro',Raleway,sans-serif", borderRadius:3, display:"flex", alignItems:"center", gap:5 }}>
          <RotateCcw size={12}/>Làm Lại
        </button>
      </div>
    </div>
  );
}
