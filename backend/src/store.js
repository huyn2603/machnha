const { db } = require("./db");

const collections = new Set([
  "products",
  "categories",
  "testimonials",
  "users",
  "orders",
  "coupons",
  "analysisPayments",
  "subscribers",
  "contacts",
]);

const toBool = (value) => Boolean(Number(value));
const toIso = (value) => value ? new Date(value).toISOString() : null;
const toDbDate = (value) => value ? new Date(value) : null;
const fromJson = (value, fallback = null) => {
  if (value == null) return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

function parseId(value) {
  const text = String(value);
  return /^-?\d+$/.test(text) ? Number(text) : value;
}

function matchesQuery(item, query = {}) {
  return Object.entries(query).every(([key, value]) => String(item[key] ?? "") === String(value));
}

async function rows(sql, params = []) {
  const [result] = await db.query(sql, params);
  return result;
}

async function transaction(work) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const result = await work(conn);
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

function productFromRow(row, features = [], destinies = [], images = []) {
  return {
    id: Number(row.id),
    name: row.name,
    category: row.category_id,
    price: Number(row.price || 0),
    originalPrice: Number(row.original_price || 0),
    rating: Number(row.rating || 0),
    reviews: Number(row.reviews || 0),
    sold: Number(row.sold || 0),
    image: row.image,
    badge: row.badge,
    badgeColor: row.badge_color,
    description: row.description,
    stock: Number(row.stock || 0),
    element: row.element,
    destiny: destinies,
    features,
    images,
  };
}

async function hydrateProducts(productRows) {
  if (!productRows.length) return [];
  const ids = productRows.map((p) => p.id);
  const [featureRows, destinyRows, imageRows] = await Promise.all([
    rows("SELECT product_id, feature_text FROM product_features WHERE product_id IN (?) ORDER BY sort_order", [ids]),
    rows("SELECT product_id, destiny FROM product_destinies WHERE product_id IN (?) ORDER BY sort_order", [ids]),
    rows("SELECT product_id, image_url FROM product_images WHERE product_id IN (?) ORDER BY sort_order", [ids]),
  ]);

  const group = (list, field) => list.reduce((acc, item) => {
    acc[item.product_id] ||= [];
    acc[item.product_id].push(item[field]);
    return acc;
  }, {});

  const features = group(featureRows, "feature_text");
  const destinies = group(destinyRows, "destiny");
  const images = group(imageRows, "image_url");
  return productRows.map((row) => productFromRow(row, features[row.id] || [], destinies[row.id] || [], images[row.id] || []));
}

async function listProducts(query) {
  const clauses = [];
  const params = [];
  if (query.category) {
    clauses.push("category_id = ?");
    params.push(query.category);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return hydrateProducts(await rows(`SELECT * FROM products ${where} ORDER BY id`, params));
}

async function getProduct(id) {
  const found = await hydrateProducts(await rows("SELECT * FROM products WHERE id = ? LIMIT 1", [id]));
  return found[0] || null;
}

async function saveProduct(item, mode = "upsert") {
  const id = Number(item.id ?? Date.now());
  await transaction(async (conn) => {
    const sql = mode === "insert"
      ? `INSERT INTO products (id, name, category_id, price, original_price, rating, reviews, sold, image, badge, badge_color, description, stock, element)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      : `INSERT INTO products (id, name, category_id, price, original_price, rating, reviews, sold, image, badge, badge_color, description, stock, element)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price),
         original_price = VALUES(original_price), rating = VALUES(rating), reviews = VALUES(reviews), sold = VALUES(sold),
         image = VALUES(image), badge = VALUES(badge), badge_color = VALUES(badge_color), description = VALUES(description),
         stock = VALUES(stock), element = VALUES(element)`;

    await conn.query(sql, [
      id,
      item.name || "",
      item.category || null,
      Number(item.price || 0),
      Number(item.originalPrice || item.original_price || 0),
      Number(item.rating || 0),
      Number(item.reviews || 0),
      Number(item.sold || 0),
      item.image || "",
      item.badge || null,
      item.badgeColor || item.badge_color || null,
      item.description || "",
      Number(item.stock || 0),
      item.element || null,
    ]);

    await conn.query("DELETE FROM product_features WHERE product_id = ?", [id]);
    await conn.query("DELETE FROM product_destinies WHERE product_id = ?", [id]);
    await conn.query("DELETE FROM product_images WHERE product_id = ?", [id]);

    for (const [index, feature] of (item.features || []).entries()) {
      await conn.query("INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (?, ?, ?)", [id, index, feature]);
    }
    for (const [index, destiny] of (item.destiny || []).entries()) {
      await conn.query("INSERT INTO product_destinies (product_id, sort_order, destiny) VALUES (?, ?, ?)", [id, index, destiny]);
    }
    const images = item.images?.length ? item.images : (item.image ? [item.image] : []);
    for (const [index, imageUrl] of images.entries()) {
      await conn.query("INSERT INTO product_images (product_id, sort_order, image_url) VALUES (?, ?, ?)", [id, index, imageUrl]);
    }
  });
  return getProduct(id);
}

async function deleteProduct(id) {
  const [result] = await db.query("DELETE FROM products WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

const simpleTables = {
  categories: {
    table: "categories",
    fromRow: (r) => ({ id: r.id, name: r.name }),
    values: (item) => [String(item.id), item.name || ""],
    insert: "INSERT INTO categories (id, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)",
  },
  testimonials: {
    table: "testimonials",
    fromRow: (r) => ({ id: Number(r.id), name: r.name, avatar: r.avatar, color: r.color, rating: Number(r.rating || 0), text: r.text, product: r.product, date: r.display_date }),
    values: (item) => [Number(item.id ?? Date.now()), item.name || "", item.avatar || "", item.color || "", Number(item.rating || 0), item.text || "", item.product || "", item.date || ""],
    insert: "INSERT INTO testimonials (id, name, avatar, color, rating, text, product, display_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), avatar = VALUES(avatar), color = VALUES(color), rating = VALUES(rating), text = VALUES(text), product = VALUES(product), display_date = VALUES(display_date)",
  },
  users: {
    table: "users",
    fromRow: (r) => ({ id: Number(r.id), name: r.name, email: r.email, password: r.password, role: r.role, phone: r.phone, avatar: r.avatar, color: r.color, createdAt: toIso(r.created_at), active: toBool(r.active), birthYear: r.birth_year, gender: r.gender, element: r.element, analysisSlots: Number(r.analysis_slots || 0) }),
    values: (item) => [Number(item.id ?? Date.now()), item.name || "", item.email || "", item.password || "", item.role || "user", item.phone || null, item.avatar || null, item.color || null, toDbDate(item.createdAt || new Date()), item.active !== false ? 1 : 0, item.birthYear || null, item.gender || null, item.element || null, Number(item.analysisSlots || 0)],
    insert: "INSERT INTO users (id, name, email, password, role, phone, avatar, color, created_at, active, birth_year, gender, element, analysis_slots) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), email = VALUES(email), password = VALUES(password), role = VALUES(role), phone = VALUES(phone), avatar = VALUES(avatar), color = VALUES(color), active = VALUES(active), birth_year = VALUES(birth_year), gender = VALUES(gender), element = VALUES(element), analysis_slots = VALUES(analysis_slots)",
  },
  coupons: {
    table: "coupons",
    fromRow: (r) => ({ id: Number(r.id), code: r.code, discount: Number(r.discount || 0), type: r.type }),
    values: (item) => [Number(item.id ?? Date.now()), String(item.code || "").toUpperCase(), Number(item.discount || 0), item.type || "percent"],
    insert: "INSERT INTO coupons (id, code, discount, type) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE code = VALUES(code), discount = VALUES(discount), type = VALUES(type)",
  },
  subscribers: {
    table: "subscribers",
    fromRow: (r) => ({ id: Number(r.id), email: r.email, createdAt: toIso(r.created_at) }),
    values: (item) => [Number(item.id ?? Date.now()), item.email || "", toDbDate(item.createdAt || new Date())],
    insert: "INSERT INTO subscribers (id, email, created_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE email = VALUES(email)",
  },
  contacts: {
    table: "contacts",
    fromRow: (r) => ({ id: Number(r.id), name: r.name, phone: r.phone, email: r.email, subject: r.subject, message: r.message, status: r.status, createdAt: toIso(r.created_at) }),
    values: (item) => [Number(item.id ?? Date.now()), item.name || "", item.phone || "", item.email || "", item.subject || "", item.message || "", item.status || "new", toDbDate(item.createdAt || new Date())],
    insert: "INSERT INTO contacts (id, name, phone, email, subject, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone), email = VALUES(email), subject = VALUES(subject), message = VALUES(message), status = VALUES(status)",
  },
};

async function listSimple(collection, query) {
  const config = simpleTables[collection];
  const items = (await rows(`SELECT * FROM ${config.table} ORDER BY id`)).map(config.fromRow);
  return items.filter((item) => matchesQuery(item, query));
}

async function getSimple(collection, id) {
  const config = simpleTables[collection];
  const result = await rows(`SELECT * FROM ${config.table} WHERE id = ? LIMIT 1`, [id]);
  return result[0] ? config.fromRow(result[0]) : null;
}

async function saveSimple(collection, item) {
  const config = simpleTables[collection];
  await db.query(config.insert, config.values(item));
  return getSimple(collection, item.id);
}

async function deleteSimple(collection, id) {
  const config = simpleTables[collection];
  const [result] = await db.query(`DELETE FROM ${config.table} WHERE id = ?`, [id]);
  return result.affectedRows > 0;
}

function orderFromRow(row, items = []) {
  return {
    id: Number(row.id),
    orderId: row.order_id,
    customer: {
      name: row.customer_name,
      phone: row.customer_phone,
      email: row.customer_email,
      address: row.customer_address,
      city: row.customer_city,
      district: row.customer_district,
      note: row.customer_note,
    },
    items,
    coupon: row.coupon_code,
    discount: Number(row.discount || 0),
    shipping: Number(row.shipping || 0),
    total: Number(row.total || 0),
    paymentMethod: row.payment_method,
    paymentContent: row.payment_content,
    status: row.status,
    createdAt: toIso(row.created_at),
  };
}

async function hydrateOrders(orderRows) {
  if (!orderRows.length) return [];
  const ids = orderRows.map((o) => o.id);
  const itemRows = await rows("SELECT * FROM order_items WHERE order_id IN (?) ORDER BY id", [ids]);
  const grouped = itemRows.reduce((acc, item) => {
    acc[item.order_id] ||= [];
    acc[item.order_id].push({ id: Number(item.product_id), name: item.product_name, price: Number(item.price || 0), quantity: Number(item.quantity || 0) });
    return acc;
  }, {});
  return orderRows.map((row) => orderFromRow(row, grouped[row.id] || []));
}

async function listOrders(query) {
  const items = await hydrateOrders(await rows("SELECT * FROM orders ORDER BY created_at ASC"));
  return items.filter((item) => matchesQuery(item, query));
}

async function getOrder(id) {
  const found = await hydrateOrders(await rows("SELECT * FROM orders WHERE id = ? LIMIT 1", [id]));
  return found[0] || null;
}

async function saveOrder(item) {
  const id = Number(item.id ?? Date.now());
  await transaction(async (conn) => {
    await conn.query(
      `INSERT INTO orders (id, order_id, customer_name, customer_phone, customer_email, customer_address, customer_city,
       customer_district, customer_note, coupon_code, discount, shipping, total, payment_method, payment_content, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE status = VALUES(status), customer_name = VALUES(customer_name), customer_phone = VALUES(customer_phone),
       customer_email = VALUES(customer_email), customer_address = VALUES(customer_address), customer_city = VALUES(customer_city),
       customer_district = VALUES(customer_district), customer_note = VALUES(customer_note), coupon_code = VALUES(coupon_code),
       discount = VALUES(discount), shipping = VALUES(shipping), total = VALUES(total), payment_method = VALUES(payment_method),
       payment_content = VALUES(payment_content)`,
      [
        id, item.orderId || `MN${String(id).slice(-8)}`,
        item.customer?.name || "", item.customer?.phone || "", item.customer?.email || "", item.customer?.address || "",
        item.customer?.city || "", item.customer?.district || "", item.customer?.note || "",
        item.coupon || null, Number(item.discount || 0), Number(item.shipping || 0), Number(item.total || 0),
        item.paymentMethod || null, item.paymentContent || null, item.status || "pending", toDbDate(item.createdAt || new Date()),
      ],
    );
    await conn.query("DELETE FROM order_items WHERE order_id = ?", [id]);
    for (const orderItem of item.items || []) {
      await conn.query(
        "INSERT INTO order_items (order_id, product_id, product_name, price, quantity) VALUES (?, ?, ?, ?, ?)",
        [id, orderItem.id || null, orderItem.name || "", Number(orderItem.price || 0), Number(orderItem.quantity || 0)],
      );
    }
  });
  return getOrder(id);
}

async function patchOrder(id, patch) {
  const current = await getOrder(id);
  if (!current) return null;
  return saveOrder({ ...current, ...patch, id: current.id });
}

async function deleteOrder(id) {
  const [result] = await db.query("DELETE FROM orders WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

function paymentFromRow(r) {
  return {
    id: Number(r.id),
    packageId: r.package_id,
    packageName: r.package_name,
    amount: Number(r.amount || 0),
    slots: Number(r.slots || 0),
    desc: r.transfer_desc,
    bank: r.bank,
    accountName: r.account_name,
    accountNumber: r.account_number,
    userId: r.user_id == null ? null : Number(r.user_id),
    userName: r.user_name,
    userEmail: r.user_email,
    status: r.status,
    createdAt: toIso(r.created_at),
    paidAt: toIso(r.paid_at),
    confirmedAt: toIso(r.confirmed_at),
    confirmedBy: r.confirmed_by,
    confirmSource: r.confirm_source,
    creditedAt: toIso(r.credited_at),
    creditedSlots: r.credited_slots == null ? null : Number(r.credited_slots),
    cancelledAt: toIso(r.cancelled_at),
    bankTransactionId: r.bank_transaction_id,
    bankPayload: fromJson(r.bank_payload),
  };
}

async function listPayments(query) {
  const items = (await rows("SELECT * FROM analysis_payments ORDER BY created_at ASC")).map(paymentFromRow);
  return items.filter((item) => matchesQuery(item, query));
}

async function getPayment(id) {
  const result = await rows("SELECT * FROM analysis_payments WHERE id = ? LIMIT 1", [id]);
  return result[0] ? paymentFromRow(result[0]) : null;
}

async function savePayment(item) {
  const id = Number(item.id ?? Date.now());
  await db.query(
    `INSERT INTO analysis_payments (id, package_id, package_name, amount, slots, transfer_desc, bank, account_name,
     account_number, user_id, user_name, user_email, status, created_at, paid_at, confirmed_at, confirmed_by,
     confirm_source, credited_at, credited_slots, cancelled_at, bank_transaction_id, bank_payload)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE package_id = VALUES(package_id), package_name = VALUES(package_name), amount = VALUES(amount),
     slots = VALUES(slots), transfer_desc = VALUES(transfer_desc), bank = VALUES(bank), account_name = VALUES(account_name),
     account_number = VALUES(account_number), user_id = VALUES(user_id), user_name = VALUES(user_name), user_email = VALUES(user_email),
     status = VALUES(status), paid_at = VALUES(paid_at), confirmed_at = VALUES(confirmed_at), confirmed_by = VALUES(confirmed_by),
     confirm_source = VALUES(confirm_source), credited_at = VALUES(credited_at), credited_slots = VALUES(credited_slots),
     cancelled_at = VALUES(cancelled_at), bank_transaction_id = VALUES(bank_transaction_id), bank_payload = VALUES(bank_payload)`,
    [
      id, item.packageId, item.packageName, Number(item.amount || 0), Number(item.slots || 0), item.desc,
      item.bank, item.accountName, item.accountNumber, item.userId || null, item.userName || null, item.userEmail || null,
      item.status || "pending", toDbDate(item.createdAt || new Date()), toDbDate(item.paidAt), toDbDate(item.confirmedAt),
      item.confirmedBy || null, item.confirmSource || null, toDbDate(item.creditedAt), item.creditedSlots || null,
      toDbDate(item.cancelledAt), item.bankTransactionId || null, item.bankPayload ? JSON.stringify(item.bankPayload) : null,
    ],
  );
  return getPayment(id);
}

async function patchPayment(id, patch) {
  const current = await getPayment(id);
  if (!current) return null;
  return savePayment({ ...current, ...patch, id: current.id });
}

async function deletePayment(id) {
  const [result] = await db.query("DELETE FROM analysis_payments WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

async function list(collection, query = {}) {
  if (collection === "products") return listProducts(query);
  if (collection === "orders") return listOrders(query);
  if (collection === "analysisPayments") return listPayments(query);
  return listSimple(collection, query);
}

async function get(collection, id) {
  if (collection === "products") return getProduct(id);
  if (collection === "orders") return getOrder(id);
  if (collection === "analysisPayments") return getPayment(id);
  return getSimple(collection, id);
}

async function save(collection, item) {
  if (collection === "products") return saveProduct(item);
  if (collection === "orders") return saveOrder(item);
  if (collection === "analysisPayments") return savePayment(item);
  return saveSimple(collection, item);
}

async function patch(collection, id, changes) {
  const current = await get(collection, id);
  if (!current) return null;
  if (collection === "orders") return patchOrder(id, changes);
  if (collection === "analysisPayments") return patchPayment(id, changes);
  return save(collection, { ...current, ...changes, id: current.id });
}

async function remove(collection, id) {
  if (collection === "products") return deleteProduct(id);
  if (collection === "orders") return deleteOrder(id);
  if (collection === "analysisPayments") return deletePayment(id);
  return deleteSimple(collection, id);
}

module.exports = {
  collections,
  get,
  list,
  patch,
  remove,
  save,
};
