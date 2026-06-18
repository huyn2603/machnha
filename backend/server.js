const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");

const { db, loadEnv } = require("./src/db");
const store = require("./src/store");

loadEnv();

const app = express();
const port = process.env.PORT || 3001;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const GEMINI_API_VERSION = process.env.GEMINI_API_VERSION || "v1beta";
const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || "gemini-2.5-flash";
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS origin not allowed: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "x-webhook-secret"],
}));
app.use(bodyParser.json({ limit: "30mb" }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

function sendError(res, error, status = 500) {
  console.error(error);
  res.status(status).json({ error: error.message || String(error) });
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function requireGemini(res) {
  if (GEMINI_API_KEY) return true;
  res.status(503).json({
    error: "GEMINI_API_KEY is missing",
    message: "Chua cau hinh GEMINI_API_KEY tren server nen AI that chua the chay.",
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

async function confirmAnalysisPayment(payment, meta = {}) {
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
    const user = await store.get("users", payment.userId);
    if (user) {
      await store.patch("users", user.id, {
        analysisSlots: Number(user.analysisSlots || 0) + slots,
      });
      patch.creditedAt = now;
      patch.creditedSlots = slots;
    }
  }

  return store.patch("analysisPayments", payment.id, patch);
}

app.get("/health", async (_req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ ok: true, database: "mysql", schema: "relational" });
  } catch (error) {
    sendError(res, error, 503);
  }
});

app.post("/ai/consult", async (req, res) => {
  if (!requireGemini(res)) return;

  try {
    const { form = {}, analysis = {}, products = [], question = "" } = req.body || {};
    const productLines = products.slice(0, 8).map((p) =>
      `- ${p.name}: menh ${p.element || "khong ro"}, gia ${p.price || 0}, cong dung ${p.meaning || p.category || ""}`
    ).join("\n");

    const prompt = `
Ban la chuyen gia tu van phong thuy cho website Phong Thuy Mach Nha.
Hay tra loi bang tieng Viet, giong de hieu, thuc te, khong me tin cuc doan.
Phan tich ca nhan hoa dua tren thong tin khach dua vao, uu tien vat pham co trong danh sach.
Khong tu bia san pham ngoai danh sach. Khong hua chac chan ve tien bac, suc khoe hoac van menh.

Thong tin khach:
- Ho ten: ${form.name || "Khach hang"}
- Nam sinh/ngay sinh: ${analysis.dob || form.year || ""}
- Gioi tinh: ${form.gender || ""}
- Muc tieu: ${form.goalLabel || form.goal || ""}
- Huong nha: ${form.huongLabel || form.huongNha || ""}

Ket qua nen:
- Menh: ${analysis.element || ""}
- Can chi: ${analysis.canChi || ""}
- Cung: ${analysis.cung?.name || ""} ${analysis.cung?.num || ""}
- Tuong sinh: ${analysis.rel?.sinh || ""}; tuong khac: ${analysis.rel?.khac || ""}

San pham hien co:
${productLines || "Chua co danh sach san pham."}

Cau hoi them cua khach: ${question || "Hay tu van tong quan va goi y vat pham phu hop."}

Tra ve 5-7 doan ngan, co cac phan: Tong quan, cach chon vat pham, vi tri dat, mau/chat lieu nen uu tien, san pham goi y, luu y khi ap dung.
`;

    const data = await callGemini(TEXT_MODEL, {
      system_instruction: {
        parts: [{ text: "Ban la tro ly AI tu van phong thuy chuyen nghiep, tra loi bang tieng Viet." }],
      },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    res.json({ text: extractGeminiText(data) });
  } catch (error) {
    sendError(res, error);
  }
});

app.get("/ai/gemini-health", (_req, res) => {
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

app.patch("/analysis-payments/:id/confirm", async (req, res) => {
  try {
    const payment = await store.get("analysisPayments", req.params.id);
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    const updated = await confirmAnalysisPayment(payment, {
      confirmedBy: req.body?.adminId || null,
      confirmSource: "admin",
    });
    res.json(updated);
  } catch (error) {
    sendError(res, error);
  }
});

app.patch("/analysis-payments/:id/cancel", async (req, res) => {
  try {
    const payment = await store.get("analysisPayments", req.params.id);
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    if (payment.status === "paid") {
      return res.status(409).json({ error: "Paid payment cannot be cancelled" });
    }
    const updated = await store.patch("analysisPayments", req.params.id, {
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
    });
    res.json(updated);
  } catch (error) {
    sendError(res, error);
  }
});

app.post("/analysis-payments/bank-webhook", async (req, res) => {
  try {
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

    const payments = await store.list("analysisPayments");
    const payment = payments.find((item) => {
      if (item.status !== "pending") return false;
      if (Number(item.amount || 0) !== amount) return false;
      const desc = normalizeText(item.desc);
      return desc && content.includes(desc);
    });

    if (!payment) return res.status(404).json({ error: "No matching pending payment" });

    const updated = await confirmAnalysisPayment(payment, {
      paidAt: payload.paidAt || payload.transactionDate || new Date().toISOString(),
      confirmedBy: "bank-webhook",
      confirmSource: "bank-webhook",
      bankTransactionId: transactionId,
      bankPayload: payload,
    });

    res.json({ ok: true, payment: updated });
  } catch (error) {
    sendError(res, error);
  }
});

app.get("/:collection", async (req, res) => {
  try {
    if (!store.collections.has(req.params.collection)) return res.status(404).json({ error: "Collection not found" });
    res.json(await store.list(req.params.collection, req.query));
  } catch (error) {
    sendError(res, error);
  }
});

app.get("/:collection/:id", async (req, res) => {
  try {
    if (!store.collections.has(req.params.collection)) return res.status(404).json({ error: "Collection not found" });
    const item = await store.get(req.params.collection, req.params.id);
    if (!item) return res.status(404).json({ error: "Record not found" });
    res.json(item);
  } catch (error) {
    sendError(res, error);
  }
});

app.post("/:collection", async (req, res) => {
  try {
    if (!store.collections.has(req.params.collection)) return res.status(404).json({ error: "Collection not found" });
    const item = await store.save(req.params.collection, { ...req.body, id: req.body?.id ?? Date.now() });
    res.status(201).json(item);
  } catch (error) {
    sendError(res, error);
  }
});

app.put("/:collection/:id", async (req, res) => {
  try {
    if (!store.collections.has(req.params.collection)) return res.status(404).json({ error: "Collection not found" });
    const exists = await store.get(req.params.collection, req.params.id);
    if (!exists) return res.status(404).json({ error: "Record not found" });
    res.json(await store.save(req.params.collection, { ...req.body, id: exists.id }));
  } catch (error) {
    sendError(res, error);
  }
});

app.patch("/:collection/:id", async (req, res) => {
  try {
    if (!store.collections.has(req.params.collection)) return res.status(404).json({ error: "Collection not found" });
    const item = await store.patch(req.params.collection, req.params.id, req.body || {});
    if (!item) return res.status(404).json({ error: "Record not found" });
    res.json(item);
  } catch (error) {
    sendError(res, error);
  }
});

app.delete("/:collection/:id", async (req, res) => {
  try {
    if (!store.collections.has(req.params.collection)) return res.status(404).json({ error: "Collection not found" });
    const deleted = await store.remove(req.params.collection, req.params.id);
    if (!deleted) return res.status(404).json({ error: "Record not found" });
    res.json({});
  } catch (error) {
    sendError(res, error);
  }
});

app.listen(port, () => {
  console.log(`Mach Nha API running with relational MySQL at http://localhost:${port}`);
});
