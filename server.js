const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const jsonServer = require("json-server");

const envPath = path.join(__dirname, ".env.local");
if (fs.existsSync(envPath)) {
  const envText = fs.readFileSync(envPath, "utf8");
  envText.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eq = trimmed.indexOf("=");
    if (eq === -1) return;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  });
}

const app = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "database.json"));
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 3001;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || "gemini-2.5-flash";
const COMFYUI_URL = process.env.COMFYUI_URL || "http://127.0.0.1:8188";
const COMFYUI_WORKFLOW_PATH = process.env.COMFYUI_WORKFLOW_PATH;
const HF_TOKEN = process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN;
const HF_IMAGE_MODEL = process.env.HF_IMAGE_MODEL || "black-forest-labs/FLUX.1-schnell";
const HF_IMAGE_TO_IMAGE_MODEL = process.env.HF_IMAGE_TO_IMAGE_MODEL || "Qwen/Qwen-Image-Edit";
const HF_PROVIDER = process.env.HF_PROVIDER || "hf-inference";
const HF_PROVIDERS = (process.env.HF_PROVIDERS || HF_PROVIDER || "fal-ai,replicate,hf-inference")
  .split(",")
  .map((provider) => provider.trim())
  .filter(Boolean);
const HF_API_BASE = process.env.HF_API_BASE || "https://router.huggingface.co";
const FAL_KEY = process.env.FAL_KEY;
const FAL_IMAGE_TO_IMAGE_MODEL = process.env.FAL_IMAGE_TO_IMAGE_MODEL || "fal-ai/flux/srpo/image-to-image";

app.use(middlewares);
app.use(bodyParser.json({ limit: "30mb" }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(jsonServer.bodyParser);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

function requireGemini(res) {
  if (GEMINI_API_KEY) return true;
  res.status(503).json({
    error: "GEMINI_API_KEY is missing",
    message: "Chưa cấu hình GEMINI_API_KEY trên server nên AI thật chưa thể chạy.",
  });
  return false;
}

function extractGeminiText(data) {
  return (data.candidates || [])
    .flatMap((candidate) => candidate.content?.parts || [])
    .map((part) => part.text || "")
    .filter(Boolean)
    .join("\n")
    .trim();
}

async function callGemini(model, body) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: {
      "x-goog-api-key": GEMINI_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) {
    const message = data?.error?.message || `Gemini API ${response.status}`;
    throw new Error(message);
  }
  return data;
}

app.post("/ai/consult", async (req, res) => {
  if (!requireGemini(res)) return;

  try {
    const { form = {}, analysis = {}, products = [], question = "" } = req.body || {};
    const productLines = products.slice(0, 8).map((p) =>
      `- ${p.name}: mệnh ${p.element || "không rõ"}, giá ${p.price || 0}, công dụng ${p.meaning || p.category || ""}`
    ).join("\n");

    const prompt = `
Bạn là chuyên gia tư vấn phong thủy cho website Phong Thủy Mạch Nhà.
Hãy trả lời bằng tiếng Việt, giọng dễ hiểu, thực tế, không mê tín cực đoan.
Phân tích cá nhân hóa dựa trên thông tin khách đưa vào, ưu tiên vật phẩm có trong danh sách.
Không tự bịa sản phẩm ngoài danh sách. Không hứa chắc chắn về tiền bạc, sức khỏe hoặc vận mệnh.

Thông tin khách:
- Họ tên: ${form.name || "Khách hàng"}
- Năm sinh/ngày sinh: ${analysis.dob || form.year || ""}
- Giới tính: ${form.gender || ""}
- Mục tiêu: ${form.goalLabel || form.goal || ""}
- Hướng nhà: ${form.huongLabel || form.huongNha || ""}

Kết quả nền:
- Mệnh: ${analysis.element || ""}
- Can chi: ${analysis.canChi || ""}
- Cung: ${analysis.cung?.name || ""} ${analysis.cung?.num || ""}
- Tương sinh: ${analysis.rel?.sinh || ""}; tương khắc: ${analysis.rel?.khac || ""}

Sản phẩm hiện có:
${productLines || "Chưa có danh sách sản phẩm."}

Câu hỏi thêm của khách: ${question || "Hãy tư vấn tổng quan và gợi ý vật phẩm phù hợp."}

Trả về 5-7 đoạn ngắn, có các phần: Tổng quan, cách chọn vật phẩm, vị trí đặt, màu/chất liệu nên ưu tiên, sản phẩm gợi ý, lưu ý khi áp dụng.
`;

    const data = await callGemini(TEXT_MODEL, {
      system_instruction: {
        parts: [{ text: "Bạn là trợ lý AI tư vấn phong thủy chuyên nghiệp, trả lời bằng tiếng Việt." }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    res.json({ text: extractGeminiText(data) });
  } catch (error) {
    res.status(500).json({ error: "AI consultation failed", message: error.message });
  }
});

app.get("/image-data-url", async (req, res) => {
  try {
    const source = String(req.query.url || "");
    if (!source) return res.status(400).json({ error: "Missing image url" });
    if (source.startsWith("data:image/")) return res.json({ dataUrl: source });
    if (!/^https?:\/\//i.test(source)) return res.status(400).json({ error: "Only http, https or data image URLs are supported" });

    const response = await fetch(source);
    if (!response.ok) return res.status(502).json({ error: `Cannot load image: ${response.status}` });

    const mimeType = response.headers.get("content-type")?.split(";")[0] || "image/jpeg";
    const buffer = Buffer.from(await response.arrayBuffer());
    res.json({ dataUrl: `data:${mimeType};base64,${buffer.toString("base64")}` });
  } catch (error) {
    res.status(500).json({ error: "Cannot prepare image", message: error.message });
  }
});

function confirmAnalysisPayment(payment, meta = {}) {
  const now = new Date().toISOString();
  const slots = Number(payment.slots || 0);
  const patch = {
    status: "paid",
    paidAt: meta.paidAt || payment.paidAt || now,
    confirmedAt: now,
    confirmedBy: meta.confirmedBy || null,
    confirmSource: meta.confirmSource || "admin",
  };

  if (meta.bankTransactionId) patch.bankTransactionId = meta.bankTransactionId;
  if (meta.bankPayload) patch.bankPayload = meta.bankPayload;

  if (payment.userId && !payment.creditedAt) {
    const user = router.db.get("users").find({ id: Number(payment.userId) }).value();
    if (user) {
      const currentSlots = Number(user.analysisSlots || 0);
      router.db.get("users")
        .find({ id: Number(payment.userId) })
        .assign({ analysisSlots: currentSlots + slots })
        .write();
      patch.creditedAt = now;
      patch.creditedSlots = slots;
    }
  }

  return router.db.get("analysisPayments").find({ id: Number(payment.id) }).assign(patch).write();
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

app.patch("/analysis-payments/:id/confirm", (req, res) => {
  const id = Number(req.params.id);
  const payment = router.db.get("analysisPayments").find({ id }).value();
  if (!payment) return res.status(404).json({ error: "Payment not found" });

  const updated = confirmAnalysisPayment(payment, {
    confirmedBy: req.body?.adminId || null,
    confirmSource: "admin",
  });
  res.json(updated);
});

app.post("/analysis-payments/bank-webhook", (req, res) => {
  const expectedSecret = process.env.PAYMENT_WEBHOOK_SECRET;
  const receivedSecret = req.headers["x-webhook-secret"] || req.body?.secret;
  if (expectedSecret && receivedSecret !== expectedSecret) {
    return res.status(401).json({ error: "Invalid webhook secret" });
  }

  const payload = req.body || {};
  const content = normalizeText(payload.content || payload.description || payload.addInfo || payload.transferContent);
  const amount = Number(payload.amount || payload.transferAmount || payload.creditAmount || 0);
  const transactionId = payload.transactionId || payload.reference || payload.refNo || payload.id || null;

  if (!content || !amount) {
    return res.status(400).json({ error: "Webhook must include transfer content and amount" });
  }

  const payments = router.db.get("analysisPayments").value() || [];
  const payment = payments.find((item) => {
    if (item.status !== "pending") return false;
    if (Number(item.amount || 0) !== amount) return false;
    const desc = normalizeText(item.desc);
    return desc && content.includes(desc);
  });

  if (!payment) {
    return res.status(404).json({ error: "No matching pending payment" });
  }

  const updated = confirmAnalysisPayment(payment, {
    paidAt: payload.paidAt || payload.transactionDate || new Date().toISOString(),
    confirmedBy: "bank-webhook",
    confirmSource: "bank-webhook",
    bankTransactionId: transactionId,
    bankPayload: payload,
  });

  res.json({ ok: true, payment: updated });
});

app.patch("/analysis-payments/:id/cancel", (req, res) => {
  const id = Number(req.params.id);
  const payment = router.db.get("analysisPayments").find({ id }).value();
  if (!payment) return res.status(404).json({ error: "Payment not found" });
  if (payment.status === "paid") {
    return res.status(409).json({ error: "Paid payment cannot be cancelled" });
  }

  const updated = router.db.get("analysisPayments")
    .find({ id })
    .assign({ status: "cancelled", cancelledAt: new Date().toISOString() })
    .write();
  res.json(updated);
});

app.post("/ai/try-on-comfy", async (req, res) => {
  try {
    if (!COMFYUI_WORKFLOW_PATH || !fs.existsSync(COMFYUI_WORKFLOW_PATH)) {
      return res.status(503).json({
        error: "COMFYUI_WORKFLOW_PATH is missing",
        message: "Chưa cấu hình workflow FLUX/ComfyUI local. App sẽ dùng chế độ ghép local bằng canvas.",
      });
    }

    const workflow = JSON.parse(fs.readFileSync(COMFYUI_WORKFLOW_PATH, "utf8"));
    const { prompt, productName, roomType, note } = req.body || {};
    const finalPrompt = prompt || [
      "photorealistic interior product placement, realistic shadows, matched perspective and lighting",
      productName ? `product: ${productName}` : "",
      roomType ? `room: ${roomType}` : "",
      note ? `user note: ${note}` : "",
      "Flux schnell/dev style, natural scale, no distorted object, no text",
    ].filter(Boolean).join(", ");

    Object.values(workflow).forEach((node) => {
      if (!node?.inputs) return;
      if (typeof node.inputs.text === "string" && /prompt|positive/i.test(node._meta?.title || "")) {
        node.inputs.text = finalPrompt;
      }
      if (typeof node.inputs.prompt === "string") node.inputs.prompt = finalPrompt;
    });

    const response = await fetch(`${COMFYUI_URL}/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: workflow }),
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: "ComfyUI queue failed", message: data?.error || response.statusText });
    }
    res.json({ ...data, mode: "comfyui", message: "Đã gửi job sang ComfyUI local. Mở ComfyUI để xem ảnh output." });
  } catch (error) {
    res.status(500).json({ error: "ComfyUI try-on failed", message: error.message });
  }
});

app.post("/ai/try-on-hf", async (req, res) => {
  try {
    if (!HF_TOKEN) {
      return res.status(503).json({
        error: "HF_TOKEN is missing",
        message: "Chưa cấu hình HF_TOKEN trong .env.local nên đang dùng ảnh preview local.",
      });
    }

    const {
      productName = "feng shui decor object",
      roomType = "interior room",
      note = "",
      element = "",
      previewImage = "",
    } = req.body || {};

    const prompt = [
      "Improve this product try-on preview into a photorealistic image.",
      `Keep the same room/table photo composition and keep the ${productName} at the same placement.`,
      element ? `The decor has feng shui ${element} energy.` : "",
      note ? `User placement note: ${note}.` : "",
      `Room type: ${roomType}.`,
      "Remove cutout edges and rectangular artifacts, blend lighting and perspective, add realistic contact shadows, keep the original background natural, high detail, no text, no watermark",
    ].filter(Boolean).join(" ");

    const hasPreview = /^data:image\/[^;]+;base64,/.test(previewImage);
    let model = hasPreview ? HF_IMAGE_TO_IMAGE_MODEL : HF_IMAGE_MODEL;
    let mode = hasPreview ? "hf-image-to-image" : "hf-text-to-image";

    if (hasPreview && FAL_KEY && process.env.USE_FAL_DIRECT === "true") {
      const falPrompt = [
        "Photorealistic cleanup of this product try-on photo.",
        `Keep the exact table/background composition and keep the ${productName} in the same position.`,
        "Remove square cutout edges, remove dark/black product-card background, blend the object into the table, natural contact shadow, realistic lighting, preserve the uploaded room/table photo.",
        note ? `User note: ${note}.` : "",
        "No new room, no new furniture, no text, no watermark.",
      ].filter(Boolean).join(" ");

      const falResponse = await fetch(`https://fal.run/${FAL_IMAGE_TO_IMAGE_MODEL}`, {
        method: "POST",
        headers: {
          Authorization: `Key ${FAL_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_url: previewImage,
          prompt: falPrompt,
          strength: 0.45,
          guidance_scale: 4.5,
          num_inference_steps: 28,
          num_images: 1,
          enable_safety_checker: true,
          output_format: "png",
          sync_mode: true,
        }),
      });

      let falData = null;
      try {
        falData = await falResponse.json();
      } catch {}

      if (!falResponse.ok) {
        return res.status(falResponse.status).json({
          error: "fal.ai try-on failed",
          message: falData?.detail || falData?.message || falData?.error || `fal.ai API ${falResponse.status}`,
        });
      }

      const image = falData?.images?.[0]?.url;
      if (!image) {
        return res.status(502).json({
          error: "fal.ai did not return an image",
          message: "fal.ai đã chạy nhưng không trả về images[0].url.",
        });
      }

      return res.json({
        image,
        model: FAL_IMAGE_TO_IMAGE_MODEL,
        provider: "fal.ai",
        mode: "fal-image-to-image",
        prompt: falPrompt,
      });
    }

    let body = hasPreview
      ? {
          inputs: previewImage.split(",")[1],
          parameters: {
            prompt,
            negative_prompt: "cartoon, illustration, floating object, square patch, transparent box, watermark, text, distorted product",
            num_inference_steps: 20,
            guidance_scale: 3.5,
            target_size: { width: 1024, height: 1024 },
          },
          options: { wait_for_model: true, use_cache: false },
        }
      : {
          inputs: [
            "Photorealistic interior product placement render.",
            `Place a ${productName} naturally inside a ${roomType}.`,
            "realistic scale, matched perspective, natural contact shadows, soft ambient light, no text, no watermark",
          ].join(" "),
          parameters: {
            width: 1024,
            height: 768,
            num_inference_steps: 8,
            guidance_scale: 1.5,
          },
          options: { wait_for_model: true, use_cache: false },
        };

    let response;
    let usedProvider = "";
    const providerErrors = [];

    for (const provider of HF_PROVIDERS) {
      const endpoint = `${HF_API_BASE}/${provider}/models/${model}`;
      try {
        response = await fetch(endpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
            "Content-Type": "application/json",
            Accept: "image/png",
          },
          body: JSON.stringify(body),
        });
      } catch (networkError) {
        providerErrors.push(`${provider}: network ${networkError.message}`);
        continue;
      }

      if (response.ok) {
        usedProvider = provider;
        break;
      }

      let message = `HTTP ${response.status}`;
      try {
        const data = await response.clone().json();
        message = data?.error || data?.message || message;
      } catch {}

      providerErrors.push(`${provider}: ${message}`);
      const unsupported = /not supported by provider|model .* not supported|provider/i.test(message);
      if (!unsupported && response.status !== 404) {
        usedProvider = provider;
        break;
      }
    }

    if (!response) {
      return res.status(502).json({
        error: "Cannot connect to Hugging Face",
        message: `Không kết nối được Hugging Face (${HF_API_BASE}). Chi tiết: ${providerErrors.join(" | ")}`,
      });
    }

    const contentType = response.headers.get("content-type") || "";
    if (!response.ok) {
      let message = `Hugging Face API ${response.status}`;
      try {
        const data = await response.json();
        message = data?.error || data?.message || message;
      } catch {}
      return res.status(response.status).json({
        error: "Hugging Face try-on failed",
        message: `${message}. Đã thử provider: ${providerErrors.join(" | ")}`,
      });
    }

    if (!contentType.startsWith("image/")) {
      const data = await response.json().catch(() => null);
      return res.status(502).json({
        error: "Hugging Face did not return an image",
        message: data?.error || "Model không trả về ảnh. Hãy thử model text-to-image khác.",
      });
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    res.json({
      image: `data:${contentType.split(";")[0]};base64,${buffer.toString("base64")}`,
      model,
      provider: usedProvider,
      mode,
      prompt,
    });
  } catch (error) {
    res.status(500).json({ error: "Hugging Face try-on failed", message: error.message });
  }
});

app.get("/ai/hf-health", async (req, res) => {
  if (!HF_TOKEN) {
    return res.status(503).json({ ok: false, message: "Server chưa đọc được HF_TOKEN từ .env.local." });
  }

  try {
    const response = await fetch("https://huggingface.co/api/whoami-v2", {
      headers: { Authorization: `Bearer ${HF_TOKEN}` },
    });
    const text = await response.text();
    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        message: `Token/API Hugging Face trả lỗi ${response.status}.`,
        detail: text.slice(0, 500),
      });
    }
    const data = JSON.parse(text);
    res.json({
      ok: true,
      user: data.name || data.auth?.accessToken?.displayName || "unknown",
      provider: HF_PROVIDER,
      providers: HF_PROVIDERS,
      imageModel: HF_IMAGE_MODEL,
      imageToImageModel: HF_IMAGE_TO_IMAGE_MODEL,
      apiBase: HF_API_BASE,
    });
  } catch (error) {
    res.status(502).json({
      ok: false,
      message: `Backend không gọi được Hugging Face. Lỗi mạng/DNS/proxy: ${error.message}`,
    });
  }
});

app.use(router);

app.listen(port, () => {
  console.log(`Mach Nha API running at http://localhost:${port}`);
});
