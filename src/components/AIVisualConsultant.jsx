import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bot, CheckCircle, Download, Image, ImagePlus, Loader2, Maximize2, Move, Send, SlidersHorizontal, Sparkles } from "lucide-react";
import { removeBackground } from "@imgly/background-removal";
import { getImageDataUrl, requestAIConsultation } from "../services/api";

const formatPrice = (n) => (n || 0).toLocaleString("vi-VN") + "đ";

const ROOM_LABELS = {
  living: "Phòng khách",
  work: "Góc làm việc",
  bedroom: "Phòng ngủ",
  entrance: "Cửa vào",
};

const GOAL_LABELS = {
  wealth: "Tài lộc",
  peace: "Bình an",
  love: "Tình duyên",
  focus: "Sự nghiệp/học tập",
};

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Không tải được ảnh để tạo bản ướm thử."));
    img.src = src;
  });
}

async function prepareProductImage(src) {
  if (!src) throw new Error("Sản phẩm chưa có ảnh.");
  if (src.startsWith("data:image/")) return src;
  const result = await getImageDataUrl(src);
  return result.dataUrl;
}

function cropRectForProduct(img) {
  const width = img.naturalWidth;
  const height = img.naturalHeight;
  const cropX = Math.round(width * 0.08);
  const cropY = Math.round(height * 0.08);
  return {
    sx: cropX,
    sy: cropY,
    sw: Math.round(width * 0.84),
    sh: Math.round(height * 0.84),
  };
}

function getSurfaceAverage(ctx, x, y, width, height) {
  const sx = Math.max(0, Math.floor(x));
  const sy = Math.max(0, Math.floor(y));
  const sw = Math.max(1, Math.min(Math.floor(width), ctx.canvas.width - sx));
  const sh = Math.max(1, Math.min(Math.floor(height), ctx.canvas.height - sy));
  const data = ctx.getImageData(sx, sy, sw, sh).data;
  let r = 0, g = 0, b = 0, count = 0;
  const step = Math.max(4, Math.floor(data.length / 1200));
  for (let i = 0; i < data.length; i += step * 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    count += 1;
  }
  return {
    r: Math.round(r / count),
    g: Math.round(g / count),
    b: Math.round(b / count),
  };
}

function makeSoftProductCanvas(product, crop) {
  const canvas = document.createElement("canvas");
  canvas.width = crop.sw;
  canvas.height = crop.sh;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(product, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, crop.sw, crop.sh);

  const feather = Math.max(8, Math.round(Math.min(crop.sw, crop.sh) * 0.035));
  const mask = document.createElement("canvas");
  mask.width = crop.sw;
  mask.height = crop.sh;
  const m = mask.getContext("2d");
  m.fillStyle = "#000";
  m.fillRect(0, 0, crop.sw, crop.sh);
  const edges = [
    [0, 0, feather, crop.sh, 0, 0, feather, 0],
    [crop.sw - feather, 0, feather, crop.sh, crop.sw, 0, crop.sw - feather, 0],
    [0, 0, crop.sw, feather, 0, 0, 0, feather],
    [0, crop.sh - feather, crop.sw, feather, 0, crop.sh, 0, crop.sh - feather],
  ];
  edges.forEach(([x, y, w, h, x0, y0, x1, y1]) => {
    const g = m.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,1)");
    m.fillStyle = g;
    m.fillRect(x, y, w, h);
  });

  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(mask, 0, 0);
  return canvas;
}

function trimTransparentImage(img) {
  const source = document.createElement("canvas");
  source.width = img.naturalWidth || img.width;
  source.height = img.naturalHeight || img.height;
  const sourceCtx = source.getContext("2d");
  sourceCtx.drawImage(img, 0, 0);

  const { width, height } = source;
  const pixels = sourceCtx.getImageData(0, 0, width, height).data;
  let minX = width, minY = height, maxX = 0, maxY = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = pixels[(y * width + x) * 4 + 3];
      if (alpha > 12) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (minX > maxX || minY > maxY) return source;

  const pad = Math.round(Math.max(width, height) * 0.015);
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);

  const trimmed = document.createElement("canvas");
  trimmed.width = maxX - minX + 1;
  trimmed.height = maxY - minY + 1;
  trimmed.getContext("2d").drawImage(source, minX, minY, trimmed.width, trimmed.height, 0, 0, trimmed.width, trimmed.height);
  return trimmed;
}

async function createAiCutout(productDataUrl, setStatus) {
  setStatus("Lần đầu sẽ tải model AI tách nền, vui lòng chờ...");
  const blob = await removeBackground(productDataUrl, {
    model: "isnet_quint8",
    output: {
      format: "image/png",
      quality: 0.92,
      type: "foreground",
    },
    progress: (key, current, total) => {
      if (total) setStatus(`Đang tải AI tách nền: ${Math.round((current / total) * 100)}%`);
      else if (key) setStatus("Đang chuẩn bị AI tách nền...");
    },
  });

  const objectUrl = URL.createObjectURL(blob);
  try {
    const cutout = await loadImage(objectUrl);
    return trimTransparentImage(cutout);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function AIVisualConsultant({ products = [] }) {
  const [selectedId, setSelectedId] = useState(products[0]?.id || "");
  const [roomImage, setRoomImage] = useState("");
  const [roomType, setRoomType] = useState("living");
  const [goal, setGoal] = useState("wealth");
  const [note, setNote] = useState("");
  const [pos, setPos] = useState({ x: 50, y: 68, size: 16 });
  const [smartCrop, setSmartCrop] = useState(true);
  const [generatedImage, setGeneratedImage] = useState("");
  const [visualLoading, setVisualLoading] = useState(false);
  const [visualError, setVisualError] = useState("");
  const [visualStatus, setVisualStatus] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", text: "Chào bạn, mình là trợ lý Mạch Nhà. Ảnh ướm thử sẽ dùng AI tách nền miễn phí chạy ngay trên trình duyệt rồi ghép vào không gian thật, không tốn tiền API tạo ảnh." },
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [question, setQuestion] = useState("");

  const featuredProducts = useMemo(() => products.slice(0, 8), [products]);
  const selected = useMemo(
    () => products.find((p) => String(p.id) === String(selectedId)) || featuredProducts[0],
    [products, featuredProducts, selectedId]
  );

  const onUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRoomImage(String(reader.result));
      setGeneratedImage("");
      setVisualError("");
    };
    reader.readAsDataURL(file);
  };

  const generateVisual = async () => {
    if (!roomImage || !selected?.image) {
      setVisualError("Bạn cần tải ảnh không gian và chọn sản phẩm trước.");
      return;
    }

    setVisualLoading(true);
    setVisualError("");
    setVisualStatus("");
    try {
      const productDataUrl = await prepareProductImage(selected.image);
      const room = await loadImage(roomImage);
      let productLayer;

      try {
        productLayer = await createAiCutout(productDataUrl, setVisualStatus);
      } catch (cutoutError) {
        setVisualStatus("AI tách nền chưa chạy được, dùng chế độ ghép thường.");
        const product = await loadImage(productDataUrl);
        const crop = smartCrop ? cropRectForProduct(product) : {
          sx: 0,
          sy: 0,
          sw: product.naturalWidth,
          sh: product.naturalHeight,
        };
        productLayer = makeSoftProductCanvas(product, crop);
      }

      const maxSide = 1400;
      const scale = Math.min(1, maxSide / Math.max(room.naturalWidth, room.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(room.naturalWidth * scale);
      canvas.height = Math.round(room.naturalHeight * scale);

      const ctx = canvas.getContext("2d");
      ctx.drawImage(room, 0, 0, canvas.width, canvas.height);

      const productWidth = canvas.width * (pos.size / 100);
      const productHeight = productWidth * (productLayer.height / productLayer.width);
      const x = canvas.width * (pos.x / 100) - productWidth / 2;
      const y = canvas.height * (pos.y / 100) - productHeight;
      const baseY = y + productHeight;
      const surface = getSurfaceAverage(ctx, x, Math.max(0, baseY - productHeight * 0.08), productWidth, productHeight * 0.12);

      ctx.save();
      ctx.globalAlpha = 0.34;
      ctx.filter = `blur(${Math.max(8, productWidth * 0.035)}px)`;
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.beginPath();
      ctx.ellipse(x + productWidth * 0.5, baseY + productHeight * 0.025, productWidth * 0.42, Math.max(7, productHeight * 0.07), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.35)";
      ctx.shadowBlur = Math.max(10, productWidth * 0.045);
      ctx.shadowOffsetY = Math.max(5, productWidth * 0.025);
      ctx.drawImage(productLayer, x, y, productWidth, productHeight);
      ctx.restore();

      ctx.save();
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = `rgba(${surface.r},${surface.g},${surface.b},0.08)`;
      ctx.fillRect(x, y, productWidth, productHeight);
      ctx.restore();

      const output = canvas.toDataURL("image/png", 0.96);
      setGeneratedImage(output);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: `Đã tạo ảnh ướm thử miễn phí cho ${selected.name}. Đây là ảnh ghép theo vị trí/kích thước bạn chọn, không phát sinh chi phí API.` },
      ]);
    } catch (error) {
      setVisualError(error.message || "Chưa tạo được ảnh ướm thử. Hãy thử đổi ảnh sản phẩm hoặc ảnh phòng.");
    } finally {
      setVisualLoading(false);
    }
  };

  const sendQuestion = async (event) => {
    event.preventDefault();
    const text = question.trim();
    if (!text || chatLoading) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setQuestion("");
    setChatLoading(true);
    try {
      const result = await requestAIConsultation({
        form: { goal: GOAL_LABELS[goal] },
        analysis: {},
        question: `${text}\n\nBối cảnh ướm thử: ${ROOM_LABELS[roomType]}, mục tiêu ${GOAL_LABELS[goal]}, sản phẩm ${selected?.name || "chưa chọn"}, ghi chú: ${note || "không có"}.`,
        products: selected ? [selected] : featuredProducts,
      });
      setMessages((prev) => [...prev, { role: "ai", text: result.text || "AI chưa trả về nội dung tư vấn." }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", text: error.message || "AI tư vấn chưa phản hồi được. Vui lòng kiểm tra GEMINI_API_KEY." }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="ai-consult-shell">
      <div className="ai-consult-head">
        <div>
          <div className="eyebrow"><Bot size={15}/> AI Tư Vấn & Ướm Thử</div>
          <h2>Trợ lý chọn vật phẩm theo không gian thật</h2>
          <p>Khách tải ảnh tường, góc nhà hoặc bàn làm việc; AI sẽ tách nền sản phẩm rồi tạo ảnh ướm thử miễn phí ngay trên trình duyệt.</p>
        </div>
        <div className="ai-status">
          <Sparkles size={16}/>
          <span>AI tách nền miễn phí</span>
        </div>
      </div>

      <div className="ai-consult-grid">
        <section className="ai-panel">
          <div className="panel-title"><Image size={16}/> Ảnh không gian</div>
          <label className="upload-zone">
            <input type="file" accept="image/*" onChange={onUpload}/>
            <ImagePlus size={24}/>
            <span>{roomImage ? "Đổi ảnh khác" : "Tải ảnh tường, góc nhà hoặc kệ trưng bày"}</span>
          </label>

          <div className="preview-stage">
            {generatedImage ? (
              <img className="room-img" src={generatedImage} alt="Ảnh ướm thử sản phẩm miễn phí"/>
            ) : roomImage ? (
              <img className="room-img" src={roomImage} alt="Không gian khách tải lên"/>
            ) : (
              <div className="room-placeholder">
                <Image size={34}/>
                <span>Ảnh không gian sẽ hiển thị ở đây</span>
              </div>
            )}
            {selected?.image && roomImage && !generatedImage && (
              <img
                className="product-overlay"
                src={selected.image}
                alt={selected.name}
                style={{ left: `${pos.x}%`, top: `${pos.y}%`, width: `${pos.size}%` }}
              />
            )}
          </div>

          <div className="control-grid">
            <label><Move size={14}/> Trái/phải <input type="range" min="8" max="92" value={pos.x} onChange={(e)=>setPos((p)=>({...p, x:Number(e.target.value)}))}/></label>
            <label><Move size={14}/> Điểm đặt <input type="range" min="28" max="92" value={pos.y} onChange={(e)=>setPos((p)=>({...p, y:Number(e.target.value)}))}/></label>
            <label><SlidersHorizontal size={14}/> Kích thước <input type="range" min="8" max="30" value={pos.size} onChange={(e)=>setPos((p)=>({...p, size:Number(e.target.value)}))}/></label>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:10 }}>
            <button type="button" onClick={()=>{ setPos({ x:50, y:68, size:16 }); setGeneratedImage(""); }} className="btn-outline" style={{ justifyContent:"center" }}>
              <Maximize2 size={14}/> Tự căn
            </button>
            <button type="button" onClick={()=>{ setSmartCrop((v)=>!v); setGeneratedImage(""); }} className={smartCrop ? "btn-gold" : "btn-outline"} style={{ justifyContent:"center" }}>
              Cắt gọn ảnh
            </button>
          </div>
          <button onClick={generateVisual} disabled={visualLoading} className="btn-gold" style={{ width:"100%", justifyContent:"center", marginTop:12 }}>
            {visualLoading ? <Loader2 size={15} className="spin"/> : <Sparkles size={15}/>}
            {visualLoading ? "Đang tách nền & tạo ảnh..." : "Tạo Ảnh AI Miễn Phí"}
          </button>
          {visualStatus && <p style={{ marginTop:8, color:"var(--text-light)", fontSize:"0.74rem", lineHeight:1.55 }}>{visualStatus}</p>}
          {generatedImage && (
            <>
              <a href={generatedImage} download={`uom-thu-${selected?.id || "san-pham"}.png`} className="btn-outline" style={{ width:"100%", justifyContent:"center", marginTop:8 }}>
                <Download size={15}/> Tải ảnh vừa tạo
              </a>
              <button onClick={()=>setGeneratedImage("")} className="btn-outline" style={{ width:"100%", justifyContent:"center", marginTop:8 }}>
                Chỉnh vị trí và tạo lại
              </button>
            </>
          )}
          {visualError && <p style={{ marginTop:10, color:"#ff8b7d", fontSize:"0.78rem", lineHeight:1.6 }}>{visualError}</p>}
        </section>

        <section className="ai-panel">
          <div className="panel-title"><Sparkles size={16}/> Chọn sản phẩm & mục tiêu</div>
          <div className="product-picker">
            {featuredProducts.map((p) => (
              <button key={p.id} onClick={()=>{ setSelectedId(p.id); setGeneratedImage(""); }} className={String(selected?.id) === String(p.id) ? "active" : ""}>
                <img src={p.image} alt={p.name}/>
                <span>{p.name}</span>
              </button>
            ))}
          </div>

          <div className="ai-form-row">
            <label>
              Loại không gian
              <select value={roomType} onChange={(e)=>setRoomType(e.target.value)}>
                <option value="living">Phòng khách</option>
                <option value="work">Góc làm việc</option>
                <option value="bedroom">Phòng ngủ</option>
                <option value="entrance">Cửa vào</option>
              </select>
            </label>
            <label>
              Mục tiêu
              <select value={goal} onChange={(e)=>setGoal(e.target.value)}>
                <option value="wealth">Tài lộc</option>
                <option value="peace">Bình an</option>
                <option value="love">Tình duyên</option>
                <option value="focus">Sự nghiệp/học tập</option>
              </select>
            </label>
          </div>

          <label className="note-field">
            Ghi chú thêm
            <textarea rows={3} value={note} onChange={(e)=>setNote(e.target.value)} placeholder="Ví dụ: tường màu trắng, muốn đặt ở góc trái kệ TV..."/>
          </label>

          {selected && (
            <div className="selected-product">
              <img src={selected.image} alt={selected.name}/>
              <div>
                <strong>{selected.name}</strong>
                <span>{formatPrice(selected.price)} · Mệnh {selected.element}</span>
                <Link to={`/product/${selected.id}`}>Xem chi tiết sản phẩm</Link>
              </div>
            </div>
          )}

          <div className="ai-advice">
            <CheckCircle size={17}/>
            <p>Ảnh ướm thử dùng AI tách nền local rồi ghép bằng canvas nên miễn phí và không cần billing. Lần đầu có thể chậm vì trình duyệt phải tải model tách nền.</p>
          </div>
        </section>
      </div>

      <section className="ai-chat">
        <div className="panel-title"><Bot size={16}/> Hỏi AI tư vấn</div>
        <div className="chat-log">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "ai" ? "msg ai" : "msg user"}>{m.text}</div>
          ))}
          {chatLoading && <div className="msg ai">AI đang phân tích...</div>}
        </div>
        <form onSubmit={sendQuestion} className="chat-input">
          <input value={question} onChange={(e)=>setQuestion(e.target.value)} placeholder="Hỏi: sản phẩm này có hợp tường màu xám không?"/>
          <button type="submit" disabled={chatLoading} className="btn-gold"><Send size={15}/> Gửi</button>
        </form>
      </section>
    </div>
  );
}
