const fs = require("fs");
const path = require("path");

const inputFile = path.join(__dirname, "..", "database.json");
const outputFile = path.join(__dirname, "..", "machnha_mysql.sql");

function sql(value) {
  if (value === undefined || value === null) return "NULL";
  return `'${String(value).replace(/\\/g, "\\\\").replace(/'/g, "''")}'`;
}

function num(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? String(parsed) : String(fallback);
}

function bool(value) {
  return value === false ? "0" : "1";
}

function date(value) {
  if (!value) return "NULL";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "NULL";
  return sql(d.toISOString().slice(0, 19).replace("T", " "));
}

function json(value) {
  if (value === undefined || value === null) return "NULL";
  return sql(JSON.stringify(value));
}

function insert(table, columns, values, updateColumns = columns) {
  const updates = updateColumns
    .filter((col) => col !== "id")
    .map((col) => `${col} = VALUES(${col})`)
    .join(", ");
  return `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${values.join(", ")}) ON DUPLICATE KEY UPDATE ${updates};`;
}

const schema = `CREATE DATABASE IF NOT EXISTS machnha
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE machnha;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS analysis_payments;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS product_destinies;
DROP TABLE IF EXISTS product_features;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS contacts;
DROP TABLE IF EXISTS subscribers;
DROP TABLE IF EXISTS testimonials;
DROP TABLE IF EXISTS coupons;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS categories;

CREATE TABLE categories (
  id VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE products (
  id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  category_id VARCHAR(50) NULL,
  price DECIMAL(15,2) NOT NULL DEFAULT 0,
  original_price DECIMAL(15,2) NOT NULL DEFAULT 0,
  rating DECIMAL(3,2) NOT NULL DEFAULT 0,
  reviews INT NOT NULL DEFAULT 0,
  sold INT NOT NULL DEFAULT 0,
  image TEXT NULL,
  badge VARCHAR(100) NULL,
  badge_color VARCHAR(30) NULL,
  description TEXT NULL,
  stock INT NOT NULL DEFAULT 0,
  element VARCHAR(50) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_products_category (category_id),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE product_features (
  id BIGINT NOT NULL AUTO_INCREMENT,
  product_id BIGINT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  feature_text VARCHAR(500) NOT NULL,
  PRIMARY KEY (id),
  INDEX idx_features_product (product_id),
  CONSTRAINT fk_features_product FOREIGN KEY (product_id) REFERENCES products(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE product_destinies (
  id BIGINT NOT NULL AUTO_INCREMENT,
  product_id BIGINT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  destiny VARCHAR(100) NOT NULL,
  PRIMARY KEY (id),
  INDEX idx_destinies_product (product_id),
  CONSTRAINT fk_destinies_product FOREIGN KEY (product_id) REFERENCES products(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE product_images (
  id BIGINT NOT NULL AUTO_INCREMENT,
  product_id BIGINT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  image_url TEXT NOT NULL,
  PRIMARY KEY (id),
  INDEX idx_images_product (product_id),
  CONSTRAINT fk_images_product FOREIGN KEY (product_id) REFERENCES products(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users (
  id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','user') NOT NULL DEFAULT 'user',
  phone VARCHAR(30) NULL,
  avatar VARCHAR(20) NULL,
  color VARCHAR(30) NULL,
  created_at DATETIME NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  birth_year INT NULL,
  gender VARCHAR(30) NULL,
  element VARCHAR(50) NULL,
  analysis_slots INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE coupons (
  id BIGINT NOT NULL,
  code VARCHAR(50) NOT NULL,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0,
  type ENUM('percent','fixed') NOT NULL DEFAULT 'percent',
  active TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uq_coupons_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE orders (
  id BIGINT NOT NULL,
  order_id VARCHAR(50) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(30) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_address TEXT NOT NULL,
  customer_city VARCHAR(120) NULL,
  customer_district VARCHAR(120) NULL,
  customer_note TEXT NULL,
  coupon_code VARCHAR(50) NULL,
  discount DECIMAL(15,2) NOT NULL DEFAULT 0,
  shipping DECIMAL(15,2) NOT NULL DEFAULT 0,
  total DECIMAL(15,2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(50) NULL,
  payment_content VARCHAR(255) NULL,
  status ENUM('pending','confirmed','shipping','completed','cancelled') NOT NULL DEFAULT 'pending',
  created_at DATETIME NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_orders_order_id (order_id),
  INDEX idx_orders_customer_email (customer_email),
  INDEX idx_orders_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE order_items (
  id BIGINT NOT NULL AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  product_id BIGINT NULL,
  product_name VARCHAR(255) NOT NULL,
  price DECIMAL(15,2) NOT NULL DEFAULT 0,
  quantity INT NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  INDEX idx_order_items_order (order_id),
  INDEX idx_order_items_product (product_id),
  CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES orders(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE analysis_payments (
  id BIGINT NOT NULL,
  package_id VARCHAR(50) NULL,
  package_name VARCHAR(255) NULL,
  amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  slots INT NOT NULL DEFAULT 0,
  transfer_desc VARCHAR(255) NOT NULL,
  bank VARCHAR(100) NULL,
  account_name VARCHAR(255) NULL,
  account_number VARCHAR(80) NULL,
  user_id BIGINT NULL,
  user_name VARCHAR(255) NULL,
  user_email VARCHAR(255) NULL,
  status ENUM('pending','paid','cancelled') NOT NULL DEFAULT 'pending',
  created_at DATETIME NULL,
  paid_at DATETIME NULL,
  confirmed_at DATETIME NULL,
  confirmed_by VARCHAR(100) NULL,
  confirm_source VARCHAR(100) NULL,
  credited_at DATETIME NULL,
  credited_slots INT NULL,
  cancelled_at DATETIME NULL,
  bank_transaction_id VARCHAR(255) NULL,
  bank_payload JSON NULL,
  PRIMARY KEY (id),
  INDEX idx_payments_status (status),
  INDEX idx_payments_user (user_id),
  CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE testimonials (
  id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar VARCHAR(20) NULL,
  color VARCHAR(30) NULL,
  rating INT NOT NULL DEFAULT 5,
  text TEXT NOT NULL,
  product VARCHAR(255) NULL,
  display_date VARCHAR(50) NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE subscribers (
  id BIGINT NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_subscribers_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE contacts (
  id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NULL,
  email VARCHAR(255) NULL,
  subject VARCHAR(255) NULL,
  message TEXT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'new',
  created_at DATETIME NULL,
  PRIMARY KEY (id),
  INDEX idx_contacts_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;`;

const data = JSON.parse(fs.readFileSync(inputFile, "utf8"));
const lines = [
  "-- Mach Nha relational MySQL database",
  "-- Import this file into MySQL Workbench or mysql CLI.",
  "",
  schema,
  "",
  "-- Seed data",
];

for (const c of data.categories || []) {
  lines.push(insert("categories", ["id", "name"], [sql(c.id), sql(c.name)]));
}

for (const p of data.products || []) {
  lines.push(insert(
    "products",
    ["id", "name", "category_id", "price", "original_price", "rating", "reviews", "sold", "image", "badge", "badge_color", "description", "stock", "element"],
    [num(p.id), sql(p.name), sql(p.category), num(p.price), num(p.originalPrice), num(p.rating), num(p.reviews), num(p.sold), sql(p.image), sql(p.badge), sql(p.badgeColor), sql(p.description), num(p.stock), sql(p.element)],
  ));
  (p.features || []).forEach((feature, index) => {
    lines.push(`INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (${num(p.id)}, ${index}, ${sql(feature)});`);
  });
  (p.destiny || []).forEach((destiny, index) => {
    lines.push(`INSERT INTO product_destinies (product_id, sort_order, destiny) VALUES (${num(p.id)}, ${index}, ${sql(destiny)});`);
  });
  (p.images || []).forEach((image, index) => {
    lines.push(`INSERT INTO product_images (product_id, sort_order, image_url) VALUES (${num(p.id)}, ${index}, ${sql(image)});`);
  });
}

for (const u of data.users || []) {
  lines.push(insert(
    "users",
    ["id", "name", "email", "password", "role", "phone", "avatar", "color", "created_at", "active", "birth_year", "gender", "element", "analysis_slots"],
    [num(u.id), sql(u.name), sql(u.email), sql(u.password), sql(u.role), sql(u.phone), sql(u.avatar), sql(u.color), date(u.createdAt), bool(u.active), u.birthYear == null ? "NULL" : num(u.birthYear), sql(u.gender), sql(u.element), num(u.analysisSlots)],
  ));
}

for (const c of data.coupons || []) {
  lines.push(insert("coupons", ["id", "code", "discount", "type"], [num(c.id), sql(String(c.code || "").toUpperCase()), num(c.discount), sql(c.type)]));
}

for (const t of data.testimonials || []) {
  lines.push(insert(
    "testimonials",
    ["id", "name", "avatar", "color", "rating", "text", "product", "display_date"],
    [num(t.id), sql(t.name), sql(t.avatar), sql(t.color), num(t.rating), sql(t.text), sql(t.product), sql(t.date)],
  ));
}

for (const o of data.orders || []) {
  lines.push(insert(
    "orders",
    ["id", "order_id", "customer_name", "customer_phone", "customer_email", "customer_address", "customer_city", "customer_district", "customer_note", "coupon_code", "discount", "shipping", "total", "payment_method", "payment_content", "status", "created_at"],
    [num(o.id), sql(o.orderId), sql(o.customer?.name), sql(o.customer?.phone), sql(o.customer?.email), sql(o.customer?.address), sql(o.customer?.city), sql(o.customer?.district), sql(o.customer?.note), sql(o.coupon), num(o.discount), num(o.shipping), num(o.total), sql(o.paymentMethod), sql(o.paymentContent), sql(o.status), date(o.createdAt)],
  ));
  (o.items || []).forEach((item) => {
    lines.push(`INSERT INTO order_items (order_id, product_id, product_name, price, quantity) VALUES (${num(o.id)}, ${item.id == null ? "NULL" : num(item.id)}, ${sql(item.name)}, ${num(item.price)}, ${num(item.quantity, 1)});`);
  });
}

for (const p of data.analysisPayments || []) {
  lines.push(insert(
    "analysis_payments",
    ["id", "package_id", "package_name", "amount", "slots", "transfer_desc", "bank", "account_name", "account_number", "user_id", "user_name", "user_email", "status", "created_at", "paid_at", "confirmed_at", "confirmed_by", "confirm_source", "credited_at", "credited_slots", "cancelled_at", "bank_transaction_id", "bank_payload"],
    [num(p.id), sql(p.packageId), sql(p.packageName), num(p.amount), num(p.slots), sql(p.desc), sql(p.bank), sql(p.accountName), sql(p.accountNumber), p.userId == null ? "NULL" : num(p.userId), sql(p.userName), sql(p.userEmail), sql(p.status), date(p.createdAt), date(p.paidAt), date(p.confirmedAt), sql(p.confirmedBy), sql(p.confirmSource), date(p.creditedAt), p.creditedSlots == null ? "NULL" : num(p.creditedSlots), date(p.cancelledAt), sql(p.bankTransactionId), json(p.bankPayload)],
  ));
}

for (const s of data.subscribers || []) {
  lines.push(insert("subscribers", ["id", "email", "created_at"], [num(s.id ?? Date.now()), sql(s.email), date(s.createdAt)]));
}

for (const c of data.contacts || []) {
  lines.push(insert(
    "contacts",
    ["id", "name", "phone", "email", "subject", "message", "status", "created_at"],
    [num(c.id ?? Date.now()), sql(c.name), sql(c.phone), sql(c.email), sql(c.subject), sql(c.message), sql(c.status || "new"), date(c.createdAt)],
  ));
}

fs.writeFileSync(outputFile, `${lines.join("\n")}\n`, "utf8");
console.log(`Generated relational SQL: ${outputFile}`);
