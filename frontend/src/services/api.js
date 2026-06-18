export const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3001";

async function req(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
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

export const getProducts = () => req("/products");
export const getProductById = (id) => req(`/products/${id}`);
export const getProductsByCategory = (category) =>
  category === "all" ? req("/products") : req(`/products?category=${category}`);
export const createProduct = (data) =>
  req("/products", {
    method: "POST",
    body: JSON.stringify({ ...data, id: Date.now(), rating: 5.0, reviews: 0, sold: 0 }),
  });
export const updateProduct = (id, data) =>
  req(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteProduct = (id) => req(`/products/${id}`, { method: "DELETE" });

export const getCategories = () => req("/categories");
export const getTestimonials = () => req("/testimonials");

export const validateCoupon = async (code) => {
  const list = await req(`/coupons?code=${code.toUpperCase()}`);
  return list[0] || null;
};

export const getOrders = () => req("/orders");
export const getOrderById = (id) => req(`/orders/${id}`);
export const createOrder = (data) =>
  req("/orders", {
    method: "POST",
    body: JSON.stringify({
      ...data,
      id: Date.now(),
      orderId: `MN${Date.now().toString().slice(-8)}`,
      createdAt: new Date().toISOString(),
      status: "pending",
    }),
  });
export const updateOrderStatus = (id, status) =>
  req(`/orders/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });

export const createAnalysisPayment = (data) =>
  req("/analysisPayments", {
    method: "POST",
    body: JSON.stringify({
      ...data,
      id: Date.now(),
      status: "pending",
      createdAt: new Date().toISOString(),
    }),
  });
export const getAnalysisPayment = (id) => req(`/analysisPayments/${id}`);
export const getAnalysisPayments = () => req("/analysisPayments");
export const confirmAnalysisPayment = (id, adminId) =>
  req(`/analysis-payments/${id}/confirm`, {
    method: "PATCH",
    body: JSON.stringify({ adminId }),
  });
export const cancelAnalysisPayment = (id) =>
  req(`/analysis-payments/${id}/cancel`, { method: "PATCH" });

export const requestAIConsultation = (data) =>
  req("/ai/consult", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getUsers = () => req("/users");
export const getUserById = (id) => req(`/users/${id}`);
export const getUserByEmail = async (email) => {
  const result = await req(`/users?email=${encodeURIComponent(email)}`);
  return result[0] || null;
};
export const loginUser = async (email, password) => {
  const result = await req(`/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
  return result[0] || null;
};
export const registerUser = (data) =>
  req("/users", {
    method: "POST",
    body: JSON.stringify({ ...data, id: Date.now(), createdAt: new Date().toISOString() }),
  });
export const patchUser = (id, data) =>
  req(`/users/${id}`, { method: "PATCH", body: JSON.stringify(data) });
