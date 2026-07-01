const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const crypto = require("crypto");
const express = require("express");
const nodemailer = require("nodemailer");

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

const resetRequests = new Map();
const OTP_TTL_MS = 10 * 60 * 1000;
const RESET_TOKEN_TTL_MS = 10 * 60 * 1000;
const OTP_RESEND_MS = 60 * 1000;
const PASSWORD_ROUNDS = 10;

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

function safeUser(user) {
  if (!user) return user;
  const { password: _password, ...safe } = user;
  return safe;
}

function hashSecret(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

function isBcryptHash(value) {
  return /^\$2[aby]\$\d{2}\$/.test(String(value || ""));
}

async function passwordMatches(password, storedPassword) {
  if (isBcryptHash(storedPassword)) return bcrypt.compare(password, storedPassword);
  return String(password) === String(storedPassword || "");
}

function getMailer() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error("Chưa cấu hình SMTP để gửi email OTP");
  }
  const port = Number(SMTP_PORT || 465);
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: String(process.env.SMTP_SECURE || port === 465).toLowerCase() === "true",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

function validatePassword(password) {
  return typeof password === "string" && password.length >= 8;
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

app.post("/auth/login", async (req, res) => {
  try {
    const email = normalizeText(req.body?.email);
    const password = String(req.body?.password || "");
    const user = (await store.list("users", { email }))[0];
    if (!user || !(await passwordMatches(password, user.password))) {
      return res.status(401).json({ error: "Email hoặc mật khẩu không đúng" });
    }
    if (!user.active) return res.status(403).json({ error: "Tài khoản đã bị khóa" });

    if (!isBcryptHash(user.password)) {
      user.password = await bcrypt.hash(password, PASSWORD_ROUNDS);
      await store.patch("users", user.id, { password: user.password });
    }
    res.json(safeUser(user));
  } catch (error) {
    sendError(res, error);
  }
});

app.post("/auth/register", async (req, res) => {
  try {
    const email = normalizeText(req.body?.email);
    const password = String(req.body?.password || "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Email không hợp lệ" });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({ error: "Mật khẩu phải có ít nhất 8 ký tự" });
    }
    if ((await store.list("users", { email })).length) {
      return res.status(409).json({ error: "Email này đã được đăng ký" });
    }
    const name = String(req.body?.name || "").trim();
    if (!name) return res.status(400).json({ error: "Vui lòng nhập họ tên" });
    const colors = ["#c0392b", "#2980b9", "#27ae60", "#e67e22", "#8e44ad"];
    const user = await store.save("users", {
      ...req.body,
      id: Date.now(),
      name,
      email,
      password: await bcrypt.hash(password, PASSWORD_ROUNDS),
      role: "user",
      active: true,
      avatar: name.charAt(0).toUpperCase(),
      color: colors[crypto.randomInt(colors.length)],
      createdAt: new Date().toISOString(),
    });
    res.status(201).json(safeUser(user));
  } catch (error) {
    sendError(res, error);
  }
});

app.post("/auth/forgot-password", async (req, res) => {
  try {
    const email = normalizeText(req.body?.email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Email không hợp lệ" });
    }
    const previous = resetRequests.get(email);
    if (previous && Date.now() - previous.sentAt < OTP_RESEND_MS) {
      return res.status(429).json({ error: "Vui lòng chờ 60 giây trước khi gửi lại mã" });
    }

    const user = (await store.list("users", { email }))[0];
    if (user) {
      const otp = String(crypto.randomInt(100000, 1000000));
      await getMailer().sendMail({
        from: process.env.MAIL_FROM || `Mạch Nhà <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Mã OTP đặt lại mật khẩu Mạch Nhà",
        text: `Mã OTP của bạn là ${otp}. Mã có hiệu lực trong 10 phút. Không cung cấp mã này cho người khác.`,
        html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #d4af5a"><h2 style="color:#8a6a1f">Mạch Nhà</h2><p>Bạn vừa yêu cầu đặt lại mật khẩu.</p><p style="font-size:30px;font-weight:700;letter-spacing:8px;color:#8a6a1f">${otp}</p><p>Mã có hiệu lực trong <strong>10 phút</strong>. Không cung cấp mã này cho người khác.</p></div>`,
      });
      resetRequests.set(email, {
        otpHash: hashSecret(otp),
        expiresAt: Date.now() + OTP_TTL_MS,
        sentAt: Date.now(),
        attempts: 0,
      });
    }
    res.json({ message: "Nếu email đã đăng ký, mã OTP đã được gửi đến hộp thư của bạn" });
  } catch (error) {
    sendError(res, error, error.message.includes("SMTP") ? 503 : 500);
  }
});

app.post("/auth/verify-reset-otp", (req, res) => {
  const email = normalizeText(req.body?.email);
  const otp = String(req.body?.otp || "").trim();
  const request = resetRequests.get(email);
  if (!request || request.expiresAt < Date.now()) {
    resetRequests.delete(email);
    return res.status(400).json({ error: "Mã OTP không tồn tại hoặc đã hết hạn" });
  }
  if (request.attempts >= 5) {
    resetRequests.delete(email);
    return res.status(429).json({ error: "Bạn đã nhập sai quá nhiều lần. Vui lòng gửi mã mới" });
  }
  request.attempts += 1;
  if (!/^\d{6}$/.test(otp) || hashSecret(otp) !== request.otpHash) {
    return res.status(400).json({ error: "Mã OTP không đúng" });
  }
  const resetToken = crypto.randomBytes(32).toString("hex");
  request.resetTokenHash = hashSecret(resetToken);
  request.resetTokenExpiresAt = Date.now() + RESET_TOKEN_TTL_MS;
  delete request.otpHash;
  res.json({ resetToken });
});

app.post("/auth/reset-password", async (req, res) => {
  try {
    const email = normalizeText(req.body?.email);
    const resetToken = String(req.body?.resetToken || "");
    const newPassword = String(req.body?.newPassword || "");
    const request = resetRequests.get(email);
    if (!request?.resetTokenHash || request.resetTokenExpiresAt < Date.now() || hashSecret(resetToken) !== request.resetTokenHash) {
      return res.status(400).json({ error: "Phiên đổi mật khẩu không hợp lệ hoặc đã hết hạn" });
    }
    if (!validatePassword(newPassword)) {
      return res.status(400).json({ error: "Mật khẩu mới phải có ít nhất 8 ký tự" });
    }
    const user = (await store.list("users", { email }))[0];
    if (!user) return res.status(400).json({ error: "Không thể đổi mật khẩu cho tài khoản này" });
    await store.patch("users", user.id, { password: await bcrypt.hash(newPassword, PASSWORD_ROUNDS) });
    resetRequests.delete(email);
    res.json({ message: "Đổi mật khẩu thành công. Bạn có thể đăng nhập ngay" });
  } catch (error) {
    sendError(res, error);
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
    if (req.params.collection === "users" && Object.prototype.hasOwnProperty.call(req.query, "password")) {
      return res.status(400).json({ error: "Không được tra cứu người dùng bằng mật khẩu" });
    }
    const items = await store.list(req.params.collection, req.query);
    res.json(req.params.collection === "users" ? items.map(safeUser) : items);
  } catch (error) {
    sendError(res, error);
  }
});

app.get("/:collection/:id", async (req, res) => {
  try {
    if (!store.collections.has(req.params.collection)) return res.status(404).json({ error: "Collection not found" });
    const item = await store.get(req.params.collection, req.params.id);
    if (!item) return res.status(404).json({ error: "Record not found" });
    res.json(req.params.collection === "users" ? safeUser(item) : item);
  } catch (error) {
    sendError(res, error);
  }
});

app.post("/:collection", async (req, res) => {
  try {
    if (!store.collections.has(req.params.collection)) return res.status(404).json({ error: "Collection not found" });
    if (req.params.collection === "users") {
      return res.status(405).json({ error: "Vui lòng dùng API đăng ký tài khoản" });
    }
    const item = await store.save(req.params.collection, { ...req.body, id: req.body?.id ?? Date.now() });
    res.status(201).json(req.params.collection === "users" ? safeUser(item) : item);
  } catch (error) {
    sendError(res, error);
  }
});

app.put("/:collection/:id", async (req, res) => {
  try {
    if (!store.collections.has(req.params.collection)) return res.status(404).json({ error: "Collection not found" });
    if (req.params.collection === "users" && Object.prototype.hasOwnProperty.call(req.body || {}, "password")) {
      return res.status(403).json({ error: "Mật khẩu chỉ có thể đổi qua quy trình OTP" });
    }
    const exists = await store.get(req.params.collection, req.params.id);
    if (!exists) return res.status(404).json({ error: "Record not found" });
    const item = await store.save(req.params.collection, { ...req.body, id: exists.id });
    res.json(req.params.collection === "users" ? safeUser(item) : item);
  } catch (error) {
    sendError(res, error);
  }
});

app.patch("/:collection/:id", async (req, res) => {
  try {
    if (!store.collections.has(req.params.collection)) return res.status(404).json({ error: "Collection not found" });
    if (req.params.collection === "users" && Object.prototype.hasOwnProperty.call(req.body || {}, "password")) {
      return res.status(403).json({ error: "Mật khẩu chỉ có thể đổi qua quy trình OTP" });
    }
    const item = await store.patch(req.params.collection, req.params.id, req.body || {});
    if (!item) return res.status(404).json({ error: "Record not found" });
    res.json(req.params.collection === "users" ? safeUser(item) : item);
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
