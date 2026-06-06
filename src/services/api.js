/* Tất cả API calls tới json-server :3001 */
const BASE = "http://localhost:3001";

async function req(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    let message = `API ${res.status}: ${path}`;
    try {
      const data = await res.json();
      message = data.message || data.error || message;
    } catch {}
    throw new Error(message);
  }
  return res.json();
}

/* Products */
export const getProducts          = ()   => req("/products");
export const getProductById       = (id) => req(`/products/${id}`);
export const getProductsByCategory= (c)  => c === "all" ? req("/products") : req(`/products?category=${c}`);
export const createProduct        = (d)  => req("/products", { method:"POST", body:JSON.stringify({ ...d, id:Date.now(), rating:5.0, reviews:0, sold:0 }) });
export const updateProduct        = (id,d)=> req(`/products/${id}`, { method:"PUT",   body:JSON.stringify(d) });
export const deleteProduct        = (id) => req(`/products/${id}`, { method:"DELETE" });

/* Categories / Testimonials */
export const getCategories   = () => req("/categories");
export const getTestimonials = () => req("/testimonials");

/* Coupons */
export const validateCoupon = async (code) => {
  const list = await req(`/coupons?code=${code.toUpperCase()}`);
  return list[0] || null;
};

/* Orders */
export const getOrders    = ()     => req("/orders");
export const getOrderById = (id)   => req(`/orders/${id}`);
export const createOrder  = (data) => req("/orders", {
  method: "POST",
  body: JSON.stringify({
    ...data,
    id: Date.now(),
    orderId: "MN" + Date.now().toString().slice(-8),
    createdAt: new Date().toISOString(),
    status: "pending",
  }),
});
export const updateOrderStatus = (id, status) =>
  req(`/orders/${id}`, { method:"PATCH", body:JSON.stringify({ status }) });

/* Analysis payments */
export const createAnalysisPayment = (data) => req("/analysisPayments", {
  method: "POST",
  body: JSON.stringify({
    ...data,
    id: Date.now(),
    status: "pending",
    createdAt: new Date().toISOString(),
  }),
});
export const getAnalysisPayment = (id) => req(`/analysisPayments/${id}`);

/* Real AI endpoints */
export const requestAIConsultation = (data) => req("/ai/consult", {
  method: "POST",
  body: JSON.stringify(data),
});
export const getImageDataUrl = (url) => req(`/image-data-url?url=${encodeURIComponent(url)}`);

/* Users */
export const getUsers       = ()             => req("/users");
export const getUserByEmail = async (email)  => { const r = await req(`/users?email=${encodeURIComponent(email)}`); return r[0]||null; };
export const loginUser      = async (e,p)    => { const r = await req(`/users?email=${encodeURIComponent(e)}&password=${encodeURIComponent(p)}`); return r[0]||null; };
export const registerUser   = (d)            => req("/users", { method:"POST", body:JSON.stringify({ ...d, id:Date.now(), createdAt:new Date().toISOString() }) });
export const patchUser      = (id,d)         => req(`/users/${id}`, { method:"PATCH", body:JSON.stringify(d) });
