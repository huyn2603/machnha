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
const GEMINI_API_VERSION = process.env.GEMINI_API_VERSION || "v1beta";
const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || "gemini-2.5-flash";

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
  const response = await fetch(`https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${model}:generateContent`, {
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

app.get("/ai/gemini-health", (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(503).json({ ok: false, message: "Server chua doc duoc GEMINI_API_KEY tu .env.local." });
  }
  res.json({
    ok: true,
    provider: "Google Gemini",
    apiVersion: GEMINI_API_VERSION,
    textModel: TEXT_MODEL,
  });
});

app.use(router);

app.listen(port, () => {
  console.log(`Mach Nha API running at http://localhost:${port}`);
});
