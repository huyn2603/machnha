-- Mach Nha relational MySQL database
-- Import this file into MySQL Workbench or mysql CLI.

CREATE DATABASE IF NOT EXISTS machnha
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

SET FOREIGN_KEY_CHECKS = 1;

-- Seed data
INSERT INTO categories (id, name) VALUES ('all', 'Tất Cả') ON DUPLICATE KEY UPDATE name = VALUES(name);
INSERT INTO categories (id, name) VALUES ('da-quy', 'Đá Quý & Tinh Thể') ON DUPLICATE KEY UPDATE name = VALUES(name);
INSERT INTO categories (id, name) VALUES ('tuong-phat', 'Tượng Phật & Thần') ON DUPLICATE KEY UPDATE name = VALUES(name);
INSERT INTO categories (id, name) VALUES ('vong-tay', 'Vòng Tay Phong Thủy') ON DUPLICATE KEY UPDATE name = VALUES(name);
INSERT INTO categories (id, name) VALUES ('tranh-phong-thuy', 'Tranh Phong Thủy') ON DUPLICATE KEY UPDATE name = VALUES(name);
INSERT INTO categories (id, name) VALUES ('la-kinh', 'La Kinh & Bát Quái') ON DUPLICATE KEY UPDATE name = VALUES(name);
INSERT INTO categories (id, name) VALUES ('cay-phong-thuy', 'Cây Phong Thủy') ON DUPLICATE KEY UPDATE name = VALUES(name);
INSERT INTO categories (id, name) VALUES ('huong-thom', 'Hương & Trầm') ON DUPLICATE KEY UPDATE name = VALUES(name);
INSERT INTO products (id, name, category_id, price, original_price, rating, reviews, sold, image, badge, badge_color, description, stock, element) VALUES (1, 'Tỳ Hưu Thạch Anh Hồng', 'da-quy', 1850000, 2200000, 4.9, 12, 28, 'https://anphatgems.vn/wp-content/uploads/2023/11/ty-huu-thach-anh-hong-m2616339-1.jpg', 'Bán Chạy', '#c0392b', 'Tỳ Hưu làm từ thạch anh hồng tự nhiên, tượng trưng cho may mắn và tài lộc. Kích thước 8cm×5cm, phù hợp đặt bàn làm việc hoặc két sắt.', 50, 'Kim') ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), original_price = VALUES(original_price), rating = VALUES(rating), reviews = VALUES(reviews), sold = VALUES(sold), image = VALUES(image), badge = VALUES(badge), badge_color = VALUES(badge_color), description = VALUES(description), stock = VALUES(stock), element = VALUES(element);
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (1, 0, '100% đá tự nhiên');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (1, 1, 'Kèm chứng nhận');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (1, 2, 'Hộp quà sang trọng');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (1, 3, 'Kích hoạt phong thủy');
INSERT INTO product_destinies (product_id, sort_order, destiny) VALUES (1, 0, 'Thổ');
INSERT INTO product_destinies (product_id, sort_order, destiny) VALUES (1, 1, 'Kim');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (1, 0, 'https://anphatgems.vn/wp-content/uploads/2023/11/ty-huu-thach-anh-hong-m2616339-1.jpg');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (1, 1, 'https://anphatgems.vn/wp-content/uploads/2023/11/ty-huu-thach-anh-hong-m2616339-3.jpg');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (1, 2, 'https://anphatgems.vn/wp-content/uploads/2023/12/combo-ty-huu-thiem-thu-thach-anh-hong-m070136-2.jpg');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (1, 3, 'https://anphatgems.vn/wp-content/uploads/2023/12/combo-ty-huu-thiem-thu-thach-anh-hong-m070136-1.jpg');
INSERT INTO products (id, name, category_id, price, original_price, rating, reviews, sold, image, badge, badge_color, description, stock, element) VALUES (2, 'Vòng Đá Thạch Anh Trắng', 'da-quy', 680000, 850000, 4.8, 23, 47, 'https://cdn0817.cdn4s.com/media/s%E1%BA%A3n%20ph%E1%BA%A9m/vong%20da%20phong%20thuy%20theo%20menh/menh%20kim/v%C3%B2ng-th%E1%BA%A1ch-anh-tr%E1%BA%AFng-s%E1%BB%AFa-d%E1%BB%ABa1-mykimgems-com-vn.jpg', 'Hot', '#8e44ad', 'Vòng tay thạch anh tím Amethyst Brazil cao cấp, hạt 8mm, giúp an thần, giảm stress và tăng trí tuệ.', 120, 'Thủy') ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), original_price = VALUES(original_price), rating = VALUES(rating), reviews = VALUES(reviews), sold = VALUES(sold), image = VALUES(image), badge = VALUES(badge), badge_color = VALUES(badge_color), description = VALUES(description), stock = VALUES(stock), element = VALUES(element);
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (2, 0, 'Amethyst Brazil A+');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (2, 1, 'Hạt đường kính 8mm');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (2, 2, 'Dây đàn hồi cao cấp');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (2, 3, 'Chứng nhận tự nhiên');
INSERT INTO product_destinies (product_id, sort_order, destiny) VALUES (2, 0, 'Kim');
INSERT INTO product_destinies (product_id, sort_order, destiny) VALUES (2, 1, 'Thủy');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (2, 0, 'https://joca.vn/wp-content/uploads/2020/04/94263020_554529182165370_7636031430824296448_o.jpg');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (2, 1, 'https://khodathachanh.com/wp-content/uploads/2024/01/vong-da-thach-anh-trang-tu-nhien.jpg');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (2, 2, 'https://roxi.vn/images/detailed/33/vong-tay-phong-thuy-thach-anh-trang.jpg');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (2, 3, 'https://kimtuthap.vn/wp-content/uploads/2019/12/vong-thach-anh-trang-duc.jpg');
INSERT INTO products (id, name, category_id, price, original_price, rating, reviews, sold, image, badge, badge_color, description, stock, element) VALUES (3, 'Cầu Pha Lê Trắng 10cm', 'da-quy', 1200000, 1500000, 5, 8, 19, 'https://aiva.com.vn/wp-content/uploads/2023/05/qua-cau-thach-anh-trang-10cm.jpg', 'Mới', '#27ae60', 'Cầu pha lê trắng trong suốt 100%, đường kính 10cm, thu hút năng lượng dương, cân bằng ngũ hành.', 30, 'Kim') ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), original_price = VALUES(original_price), rating = VALUES(rating), reviews = VALUES(reviews), sold = VALUES(sold), image = VALUES(image), badge = VALUES(badge), badge_color = VALUES(badge_color), description = VALUES(description), stock = VALUES(stock), element = VALUES(element);
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (3, 0, 'Pha lê tự nhiên 100%');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (3, 1, 'Đường kính 10cm');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (3, 2, 'Kèm đế gỗ rosewood');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (3, 3, 'Chứng nhận AAA');
INSERT INTO product_destinies (product_id, sort_order, destiny) VALUES (3, 0, 'Mọi mệnh');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (3, 0, 'https://aiva.com.vn/wp-content/uploads/2023/05/qua-cau-thach-anh-trang-10cm.jpg');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (3, 1, 'https://aiva.com.vn/wp-content/uploads/2023/05/qua-cau-thach-anh-trang-10cm-1.jpg');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (3, 2, 'https://aiva.com.vn/wp-content/uploads/2023/05/qua-cau-thach-anh-trang-10cm-3.jpg');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (3, 3, 'https://static-images.vnncdn.net/vps_images_publish/000001/000003/2026/1/30/nhieu-gia-dinh-dat-qua-cau-pha-le-trong-nha-vi-ly-do-nay-2448.png?width=0&s=6xEk4e_CwtIet5wbwmWQ4Q');
INSERT INTO products (id, name, category_id, price, original_price, rating, reviews, sold, image, badge, badge_color, description, stock, element) VALUES (4, 'Đá Mắt Hổ Vàng', 'da-quy', 450000, 580000, 4.6, 16, 34, 'https://anphatgems.vn/wp-content/uploads/2025/07/da-mat-ho-vang-nau-vun-tho-1a-003-0411a-12-2.jpg', NULL, NULL, 'Đá mắt hổ vàng tự nhiên dạng thô, tăng cường ý chí, bảo vệ năng lượng tiêu cực.', 80, 'Thổ') ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), original_price = VALUES(original_price), rating = VALUES(rating), reviews = VALUES(reviews), sold = VALUES(sold), image = VALUES(image), badge = VALUES(badge), badge_color = VALUES(badge_color), description = VALUES(description), stock = VALUES(stock), element = VALUES(element);
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (4, 0, 'Đá tự nhiên');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (4, 1, 'Dạng thô nguyên bản');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (4, 2, 'Năng lượng mạnh');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (4, 3, 'Kèm túi nhung');
INSERT INTO product_destinies (product_id, sort_order, destiny) VALUES (4, 0, 'Mộc');
INSERT INTO product_destinies (product_id, sort_order, destiny) VALUES (4, 1, 'Hỏa');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (4, 0, 'https://anphatgems.vn/wp-content/uploads/2025/07/da-mat-ho-vang-nau-vun-tho-1a-003-0411a-12.jpg');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (4, 1, 'https://anphatgems.vn/wp-content/uploads/2025/07/da-mat-ho-vang-nau-vun-tho-1a-003-0411a-12-2.jpg');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (4, 2, 'https://anphatgems.vn/wp-content/uploads/2025/07/da-mat-ho-vang-nau-vun-tho-1a-003-0411a-12-1.jpg');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (4, 3, 'https://anphatgems.vn/wp-content/uploads/2023/12/soi-thach-anh-mat-ho.jpg');
INSERT INTO products (id, name, category_id, price, original_price, rating, reviews, sold, image, badge, badge_color, description, stock, element) VALUES (5, 'Tượng Di Lặc Gỗ Trầm Hương', 'tuong-phat', 3200000, 3800000, 4.7, 4, 8, 'https://tuonggothinhvuong.com/wp-content/uploads/2024/02/tuong-phat-di-lac-go-tram-huong-indo-1.jpg', 'Cao Cấp', '#d4a017', 'Tượng Di Lặc điêu khắc thủ công từ gỗ trầm hương Khánh Hòa, cao 25cm, mang lại hạnh phúc và bình an.', 15, 'Mộc') ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), original_price = VALUES(original_price), rating = VALUES(rating), reviews = VALUES(reviews), sold = VALUES(sold), image = VALUES(image), badge = VALUES(badge), badge_color = VALUES(badge_color), description = VALUES(description), stock = VALUES(stock), element = VALUES(element);
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (5, 0, 'Gỗ trầm hương Khánh Hòa');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (5, 1, 'Điêu khắc thủ công');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (5, 2, 'Cao 25cm');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (5, 3, 'Kèm đế đồng');
INSERT INTO product_destinies (product_id, sort_order, destiny) VALUES (5, 0, 'Mọi mệnh');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (5, 0, 'https://tuonggothinhvuong.com/wp-content/uploads/2024/02/tuong-phat-di-lac-go-tram-huong-indo-1.jpg');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (5, 1, 'https://bizweb.dktcdn.net/100/293/753/products/tuong-go-tram-huong-phat-di-lac-de-xe-hoi-7.jpg?v=1747899646930');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (5, 2, 'https://tuonggothinhvuong.com/wp-content/uploads/2024/02/tuong-phat-di-lac-go-tram-huong-indo-2.jpg');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (5, 3, 'https://annhientramhuong.com/wp-content/uploads/2021/05/z2512603729784_fc440cdb6ed1761115fe097fa807928b.jpg');
INSERT INTO products (id, name, category_id, price, original_price, rating, reviews, sold, image, badge, badge_color, description, stock, element) VALUES (6, 'Tượng Quan Âm Bạch Ngọc', 'tuong-phat', 5500000, 6500000, 4.6, 3, 5, 'https://phapduyen.com/wp-content/uploads/2024/06/00-11-1.jpg', 'Độc Quyền', '#2980b9', 'Tượng Quan Thế Âm Bồ Tát từ bạch ngọc Myanmar cao cấp, cao 30cm, phù hộ bình an.', 8, 'Thủy') ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), original_price = VALUES(original_price), rating = VALUES(rating), reviews = VALUES(reviews), sold = VALUES(sold), image = VALUES(image), badge = VALUES(badge), badge_color = VALUES(badge_color), description = VALUES(description), stock = VALUES(stock), element = VALUES(element);
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (6, 0, 'Bạch ngọc Myanmar A+');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (6, 1, 'Cao 30cm');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (6, 2, 'Điêu khắc tinh xảo');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (6, 3, 'Hộp gỗ đặc biệt');
INSERT INTO product_destinies (product_id, sort_order, destiny) VALUES (6, 0, 'Mọi mệnh');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (6, 0, 'https://phapduyen.com/wp-content/uploads/2024/06/00-11-1.jpg');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (6, 1, 'https://dieutuongam.com/pictures/catalog/products/dieutuongtrangnghiem/tuongquanam/tuong-quan-am-han-bach-ngoc-trang-144tqa040-01.jpg');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (6, 2, 'https://dieutuongam.com/pictures/catalog/products/dieutuongtrangnghiem/tuongquanam/tuong-quan-am-y-ru-han-bach-ngoc-144tqa060-02.jpg');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (6, 3, 'https://dieutuongam.com/pictures/catalog/products/dieutuongtrangnghiem/tuongquanam/tuong-quan-am-han-bach-ngoc-trang-144tqa038-01.jpg');
INSERT INTO products (id, name, category_id, price, original_price, rating, reviews, sold, image, badge, badge_color, description, stock, element) VALUES (7, 'Vòng Tay Trầm Hương 108 Hạt', 'vong-tay', 2800000, 3500000, 5, 14, 31, 'https://cdn.shopify.com/s/files/1/0644/2958/8701/files/108_h_t_480x480.jpg?v=1731472044', 'Bán Chạy', '#c0392b', 'Vòng tay trầm hương Khánh Hòa 108 hạt 6mm, hương thơm tự nhiên lâu dài, giúp tĩnh tâm thiền định.', 45, 'Mộc') ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), original_price = VALUES(original_price), rating = VALUES(rating), reviews = VALUES(reviews), sold = VALUES(sold), image = VALUES(image), badge = VALUES(badge), badge_color = VALUES(badge_color), description = VALUES(description), stock = VALUES(stock), element = VALUES(element);
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (7, 0, 'Trầm hương Khánh Hòa');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (7, 1, '108 hạt 6mm');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (7, 2, 'Hương thơm tự nhiên');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (7, 3, 'Chứng nhận chính hãng');
INSERT INTO product_destinies (product_id, sort_order, destiny) VALUES (7, 0, 'Mộc');
INSERT INTO product_destinies (product_id, sort_order, destiny) VALUES (7, 1, 'Hỏa');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (7, 0, 'https://cdn.shopify.com/s/files/1/0644/2958/8701/files/108_h_t_480x480.jpg?v=1731472044');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (7, 1, 'https://tramhuonghudo.com/uploads/12-2021/6li25t.jpg');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (7, 2, 'https://tramhuongviet.com/wp-content/uploads/2023/05/vong-tram-huong-108-hat-ch17.jpg');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (7, 3, 'https://tramhuongviet.com/wp-content/uploads/2023/05/vong-tram-huong-108-hat-ch11.jpg');
INSERT INTO products (id, name, category_id, price, original_price, rating, reviews, sold, image, badge, badge_color, description, stock, element) VALUES (8, 'Vòng tay đá phong thuỷ mắt hổ vàng nâu', 'vong-tay', 1650000, 2000000, 4.6, 9, 22, 'https://vongda5a.com/wp-content/uploads/2019/04/V%C3%B2ng-%C4%91%C3%A1-m%E1%BA%AFt-h%E1%BB%95-v%C3%A0ng-n%C3%A2u-8-ly-10-ly-12-ly-14-ly-16-ly-5A-t%E1%BB%B1-nhi%C3%AAn.jpg', 'Nhập Khẩu', '#e67e22', 'Vòng tay hổ phách Baltic tự nhiên, màu vàng mật đặc trưng, chứa nhựa cây 40 triệu năm tuổi.', 35, 'Hỏa') ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), original_price = VALUES(original_price), rating = VALUES(rating), reviews = VALUES(reviews), sold = VALUES(sold), image = VALUES(image), badge = VALUES(badge), badge_color = VALUES(badge_color), description = VALUES(description), stock = VALUES(stock), element = VALUES(element);
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (8, 0, 'Hổ phách Baltic tự nhiên');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (8, 1, 'Chứng nhận UV test');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (8, 2, 'Hạt 10-12mm');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (8, 3, 'Kèm sợi bạc 925');
INSERT INTO product_destinies (product_id, sort_order, destiny) VALUES (8, 0, 'Thổ');
INSERT INTO product_destinies (product_id, sort_order, destiny) VALUES (8, 1, 'Kim');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (8, 0, 'https://vongda5a.com/wp-content/uploads/2019/04/V%C3%B2ng-%C4%91%C3%A1-m%E1%BA%AFt-h%E1%BB%95-v%C3%A0ng-n%C3%A2u-8-ly-10-ly-12-ly-14-ly-16-ly-5A-t%E1%BB%B1-nhi%C3%AAn.jpg');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (8, 1, 'https://daquyvietnam.com.vn/wp-content/uploads/2023/11/vong-da-mat-ho-deo-tay-nao-la-tot-nhat-1.jpg');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (8, 2, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcwLgIzvL0JI5JumxiZSQsUJUD6zWG4tAujQ&s');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (8, 3, 'https://ngemsvn.com/wp-content/uploads/2024/05/260525c26a08cb5692196.jpg');
INSERT INTO products (id, name, category_id, price, original_price, rating, reviews, sold, image, badge, badge_color, description, stock, element) VALUES (9, 'Tranh Tùng Hạc Trường Thọ', 'tranh-phong-thuy', 2100000, 2600000, 4.9, 7, 17, 'https://artnam.vn/wp-content/uploads/2025/09/tranh-tung-hac-dien-nien-1-1.webp', 'Phổ Biến', '#16a085', 'Tranh thêu tay Tùng Hạc trên nền lụa cao cấp, kích thước 60×90cm, phù hợp treo phòng khách.', 25, 'Mộc') ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), original_price = VALUES(original_price), rating = VALUES(rating), reviews = VALUES(reviews), sold = VALUES(sold), image = VALUES(image), badge = VALUES(badge), badge_color = VALUES(badge_color), description = VALUES(description), stock = VALUES(stock), element = VALUES(element);
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (9, 0, 'Thêu tay 100%');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (9, 1, 'Lụa Trung Hoa cao cấp');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (9, 2, 'Khung gỗ đỏ');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (9, 3, '60×90cm');
INSERT INTO product_destinies (product_id, sort_order, destiny) VALUES (9, 0, 'Mọi mệnh');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (9, 0, 'https://artnam.vn/wp-content/uploads/2025/09/tranh-tung-hac-dien-nien-1-1.webp');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (9, 1, 'https://xqvietnam.com/upload/images/3404%20bach%20lao%20truong%20tho%2012%20s.png');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (9, 2, 'https://xqvietnam.com/upload/images/2475%20tung%20hac%201%20s.png');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (9, 3, 'https://theuviet.com/sites/default/files/minify/tung-hac-iii-1472114057.jpg');
INSERT INTO products (id, name, category_id, price, original_price, rating, reviews, sold, image, badge, badge_color, description, stock, element) VALUES (10, 'Tranh Cửu Ngư Phát Tài', 'tranh-phong-thuy', 1800000, 2200000, 4.7, 11, 26, 'https://tranhphongthuyvietnam.com/wp-content/uploads/2018/06/tranh-cuu-ngu-quan-hoi-treo-tuong-dep-y-ngha-phong-thuy.jpg', 'Mới', '#27ae60', 'Tranh 9 con cá vàng tượng trưng cửu phúc, in canvas cao cấp kèm khung composite, 80×60cm.', 60, 'Thủy') ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), original_price = VALUES(original_price), rating = VALUES(rating), reviews = VALUES(reviews), sold = VALUES(sold), image = VALUES(image), badge = VALUES(badge), badge_color = VALUES(badge_color), description = VALUES(description), stock = VALUES(stock), element = VALUES(element);
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (10, 0, 'In canvas cao cấp');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (10, 1, 'Khung composite');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (10, 2, '80×60cm');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (10, 3, 'Màu sắc bền 50 năm');
INSERT INTO product_destinies (product_id, sort_order, destiny) VALUES (10, 0, 'Thủy');
INSERT INTO product_destinies (product_id, sort_order, destiny) VALUES (10, 1, 'Mộc');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (10, 0, 'https://tranhphongthuyvietnam.com/wp-content/uploads/2018/06/tranh-cuu-ngu-quan-hoi-treo-tuong-dep-y-ngha-phong-thuy.jpg');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (10, 1, 'https://static1.cafeland.vn/cafelandData/upload/tintuc/xuhuongcamnang/2020/04/tuan-04/10-tranh-theu-chu-thap-1588166322.jpg');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (10, 2, 'https://theuviet.com/wp-content/uploads/2019/12/ca-chep-va-hoa-sen-cuu-ngu-do-1481280877.jpg');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (10, 3, 'https://theutay.vn/data/Product/-222555.jpg');
INSERT INTO products (id, name, category_id, price, original_price, rating, reviews, sold, image, badge, badge_color, description, stock, element) VALUES (11, 'La Kinh Phong Thủy Đồng Cổ', 'la-kinh', 3600000, 4200000, 4.8, 3, 6, 'https://vifengshui.vn/data/products/lsl1587165306.jpg', 'Chuyên Gia', '#c0392b', 'La kinh đồng đúc thủ công, 36 vòng chi tiết, dành cho phong thủy sư chuyên nghiệp.', 12, 'Kim') ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), original_price = VALUES(original_price), rating = VALUES(rating), reviews = VALUES(reviews), sold = VALUES(sold), image = VALUES(image), badge = VALUES(badge), badge_color = VALUES(badge_color), description = VALUES(description), stock = VALUES(stock), element = VALUES(element);
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (11, 0, 'Đồng đúc thủ công');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (11, 1, '36 vòng chi tiết');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (11, 2, 'Kim la kinh chính xác');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (11, 3, 'Hộp gỗ gụ');
INSERT INTO product_destinies (product_id, sort_order, destiny) VALUES (11, 0, 'Kim');
INSERT INTO product_destinies (product_id, sort_order, destiny) VALUES (11, 1, 'Thủy');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (11, 0, 'https://vifengshui.vn/data/products/lsl1587165306.jpg');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (11, 1, 'https://bizweb.dktcdn.net/100/268/764/files/la-kinh-phong-thuy-maxi-4.jpg?v=1621068685576');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (11, 2, 'https://phongthuyhoanggia.com/wp-content/uploads/2023/12/z4980582295156_87fda54bfad856bb7d6d226fedd4b977-compressed-769x1024.jpg');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (11, 3, 'https://phongthuyhocvungtau.com/wp-content/uploads/2021/11/La-kinh-bang-dong.jpg');
INSERT INTO products (id, name, category_id, price, original_price, rating, reviews, sold, image, badge, badge_color, description, stock, element) VALUES (12, 'Bát Quái Đồng Treo Cửa', 'la-kinh', 850000, 1100000, 5, 18, 38, 'https://down-vn.img.susercontent.com/file/sg-11134201-23010-1p6zt9knsxlvb9', 'Bán Chạy', '#c0392b', 'Bát quái đồng nguyên chất treo cửa, đường kính 20cm, hóa giải sát khí, bảo vệ gia đình.', 90, 'Kim') ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), original_price = VALUES(original_price), rating = VALUES(rating), reviews = VALUES(reviews), sold = VALUES(sold), image = VALUES(image), badge = VALUES(badge), badge_color = VALUES(badge_color), description = VALUES(description), stock = VALUES(stock), element = VALUES(element);
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (12, 0, 'Đồng nguyên chất');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (12, 1, 'Đường kính 20cm');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (12, 2, 'Gương lồi chống sát');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (12, 3, 'Kèm dây đỏ may mắn');
INSERT INTO product_destinies (product_id, sort_order, destiny) VALUES (12, 0, 'Mọi mệnh');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (12, 0, 'https://down-vn.img.susercontent.com/file/sg-11134201-23010-1p6zt9knsxlvb9');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (12, 1, 'https://bizweb.dktcdn.net/100/244/861/files/guong-bat-quai-dong-lom-2-jpg.jpg?v=1527147980269');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (12, 2, 'https://nguoiduatin.mediacdn.vn/zoom/700_438/media/bui-thi-lan-anh/2020/06/25/cach-treo-guong-bat-quai.png');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (12, 3, 'https://spacet-release.s3.ap-southeast-1.amazonaws.com/img/blog/2024-03-11/guong-bat-quai-loi-65ee72e457c6bf68954341e0.webp');
INSERT INTO products (id, name, category_id, price, original_price, rating, reviews, sold, image, badge, badge_color, description, stock, element) VALUES (13, 'Cây Kim Tiền Bonsai Đồng', 'cay-phong-thuy', 4500000, 5200000, 4.8, 4, 9, 'https://congcutot.vn/uploads/store/page/howto/2021/nhung-mau-bonsai-bang-dong-dep-4.jpg', 'Sang Trọng', '#d4a017', 'Cây kim tiền bonsai lá đồng tự nhiên, chậu đá granite, cao 45cm, tượng trưng tiền tài phú quý.', 20, 'Mộc') ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), original_price = VALUES(original_price), rating = VALUES(rating), reviews = VALUES(reviews), sold = VALUES(sold), image = VALUES(image), badge = VALUES(badge), badge_color = VALUES(badge_color), description = VALUES(description), stock = VALUES(stock), element = VALUES(element);
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (13, 0, 'Lá đồng tự nhiên');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (13, 1, 'Chậu đá granite');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (13, 2, 'Cao 45cm');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (13, 3, 'Phù hợp văn phòng');
INSERT INTO product_destinies (product_id, sort_order, destiny) VALUES (13, 0, 'Thổ');
INSERT INTO product_destinies (product_id, sort_order, destiny) VALUES (13, 1, 'Kim');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (13, 0, 'https://congcutot.vn/uploads/store/page/howto/2021/nhung-mau-bonsai-bang-dong-dep-4.jpg');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (13, 1, 'https://www.indoorgarden.vn/wp-content/uploads/2021/05/kim-tien-dong-1.jpg');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (13, 2, 'https://quatangsep.vn/wp-content/uploads/2025/08/Cay-kim-tien-ma-vang-2.jpeg');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (13, 3, 'https://www.indoorgarden.vn/wp-content/uploads/2021/05/kim-tien-dong-5.jpg');
INSERT INTO products (id, name, category_id, price, original_price, rating, reviews, sold, image, badge, badge_color, description, stock, element) VALUES (14, 'Cây May Mắn Tre Phong Thủy', 'cay-phong-thuy', 380000, 480000, 4.9, 24, 52, 'https://cdn.eva.vn//upload/4-2016/images/2016-12-02/what-exactly-does-lucky-bamboo-mean-1480635095-width470height470.jpg', NULL, NULL, 'Cây tre may mắn Lucky Bamboo 3 thân, chậu thủy tinh với đá cuội màu, dễ chăm sóc.', 200, 'Mộc') ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), original_price = VALUES(original_price), rating = VALUES(rating), reviews = VALUES(reviews), sold = VALUES(sold), image = VALUES(image), badge = VALUES(badge), badge_color = VALUES(badge_color), description = VALUES(description), stock = VALUES(stock), element = VALUES(element);
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (14, 0, '3 thân tre may mắn');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (14, 1, 'Chậu thủy tinh');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (14, 2, 'Đá cuội màu sắc');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (14, 3, 'Không cần đất');
INSERT INTO product_destinies (product_id, sort_order, destiny) VALUES (14, 0, 'Mộc');
INSERT INTO product_destinies (product_id, sort_order, destiny) VALUES (14, 1, 'Hỏa');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (14, 0, 'https://cdn.eva.vn//upload/4-2016/images/2016-12-02/what-exactly-does-lucky-bamboo-mean-1480635095-width470height470.jpg');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (14, 1, 'https://danviet.ex-cdn.com/files/f1/296231569849192448/2021/5/15/imgsemdepvn2fshare2fimage2f20212f042f152f1-lucky-bamboo-use-for-good-feng-shui-134919129-1621069623118-1621069624876783402486.png');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (14, 2, 'https://www.way.com.vn/vnt_upload/news/phong_thuy_tuong_so/y-nghia-cua-cay-tre-may-man-trong-phong-thuy.png');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (14, 3, 'https://images.baoangiang.com.vn/image/fckeditor/upload/2022/20221021/images/phatdu-06361455.jpg');
INSERT INTO products (id, name, category_id, price, original_price, rating, reviews, sold, image, badge, badge_color, description, stock, element) VALUES (15, 'Trầm Hương Khánh Hòa 100g', 'huong-thom', 1200000, 1500000, 4.8, 10, 24, 'https://chamkhanhhoa.com/wp-content/uploads/2020/10/su-dung-bot-tram-huong-de-xong-nha-291.png', 'Đặc Sản', '#8B4513', 'Trầm hương Khánh Hòa tự nhiên 100g, loại A, hương thơm đặc trưng, dùng đốt hoặc trưng bày.', 75, 'Mộc') ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), original_price = VALUES(original_price), rating = VALUES(rating), reviews = VALUES(reviews), sold = VALUES(sold), image = VALUES(image), badge = VALUES(badge), badge_color = VALUES(badge_color), description = VALUES(description), stock = VALUES(stock), element = VALUES(element);
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (15, 0, 'Khánh Hòa 100% tự nhiên');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (15, 1, 'Loại A chất lượng cao');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (15, 2, '100g');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (15, 3, 'Hộp gỗ bảo quản');
INSERT INTO product_destinies (product_id, sort_order, destiny) VALUES (15, 0, 'Mọi mệnh');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (15, 0, 'https://chamkhanhhoa.com/wp-content/uploads/2020/10/su-dung-bot-tram-huong-de-xong-nha-291.png');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (15, 1, 'https://tramhuongsinhhocttt.com/public/upload/files/t%E1%BA%A1i%20sao%20kh%C3%A1nh%20h%C3%B2a%20%C4%91%C6%B0%E1%BB%A3c%20xem%20l%C3%A0%20th%C3%B9%20ph%E1%BB%A7%20c%E1%BB%A7a%20tr%E1%BA%A7m%20h%C6%B0%C6%A1ng%20vi%E1%BB%87t%20nam/4.jpg');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (15, 2, 'https://mia.vn/media/uploads/blog-du-lich/khanh_hoa_la_xu_tram_huong_non_cao_bien_rong_nguoi_thuong_di_ve_9-1623228967.jpg');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (15, 3, 'https://mia.vn/media/uploads/blog-du-lich/khanh_hoa_la_xu_tram_huong_non_cao_bien_rong_nguoi_thuong_di_ve_9-1623228967.jpg');
INSERT INTO products (id, name, category_id, price, original_price, rating, reviews, sold, image, badge, badge_color, description, stock, element) VALUES (16, 'Nhang Trầm Thiên Nhiên 100 Cây', 'huong-thom', 250000, 320000, 4.9, 29, 63, 'https://tramhuonghongphuc.vn/wp-content/uploads/2022/11/z3850853717325_9890e6b251d551d3ffc09e066404e774.jpg', 'Bán Chạy', '#c0392b', 'Nhang trầm thiên nhiên không hóa chất, 100 cây/hộp, thời gian cháy 45 phút/cây.', 500, 'Hỏa') ON DUPLICATE KEY UPDATE name = VALUES(name), category_id = VALUES(category_id), price = VALUES(price), original_price = VALUES(original_price), rating = VALUES(rating), reviews = VALUES(reviews), sold = VALUES(sold), image = VALUES(image), badge = VALUES(badge), badge_color = VALUES(badge_color), description = VALUES(description), stock = VALUES(stock), element = VALUES(element);
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (16, 0, '100% thiên nhiên');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (16, 1, 'Không hóa chất');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (16, 2, '100 cây/hộp');
INSERT INTO product_features (product_id, sort_order, feature_text) VALUES (16, 3, 'Cháy 45 phút/cây');
INSERT INTO product_destinies (product_id, sort_order, destiny) VALUES (16, 0, 'Mọi mệnh');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (16, 0, 'https://tramhuonghongphuc.vn/wp-content/uploads/2022/11/z3850853717325_9890e6b251d551d3ffc09e066404e774.jpg');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (16, 1, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdIqcmj8w7ojt1UJvqI9e_Pt_OkILqizDuLQ&s');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (16, 2, 'https://xuongtramaulac.com/shoop_vn/uploads/2023/06/Dddnf.jpg');
INSERT INTO product_images (product_id, sort_order, image_url) VALUES (16, 3, 'https://tramhuonghongphuc.vn/wp-content/uploads/2022/11/z3850853693565_634d10d62e9cf7d2aa156d52a9ee7359.jpg');
INSERT INTO users (id, name, email, password, role, phone, avatar, color, created_at, active, birth_year, gender, element, analysis_slots) VALUES (1, 'Quản Trị Viên', 'admin@machnha.vn', 'Admin@123', 'admin', '0909000001', 'A', '#C9A84C', '2024-01-01 00:00:00', 1, NULL, NULL, NULL, 0) ON DUPLICATE KEY UPDATE name = VALUES(name), email = VALUES(email), password = VALUES(password), role = VALUES(role), phone = VALUES(phone), avatar = VALUES(avatar), color = VALUES(color), created_at = VALUES(created_at), active = VALUES(active), birth_year = VALUES(birth_year), gender = VALUES(gender), element = VALUES(element), analysis_slots = VALUES(analysis_slots);
INSERT INTO users (id, name, email, password, role, phone, avatar, color, created_at, active, birth_year, gender, element, analysis_slots) VALUES (2, 'Nguyễn Thị Demo', 'demo@gmail.com', 'Demo@123', 'user', '0909123456', 'N', '#2980b9', '2024-03-01 00:00:00', 1, 1990, 'female', 'Kim', 0) ON DUPLICATE KEY UPDATE name = VALUES(name), email = VALUES(email), password = VALUES(password), role = VALUES(role), phone = VALUES(phone), avatar = VALUES(avatar), color = VALUES(color), created_at = VALUES(created_at), active = VALUES(active), birth_year = VALUES(birth_year), gender = VALUES(gender), element = VALUES(element), analysis_slots = VALUES(analysis_slots);
INSERT INTO coupons (id, code, discount, type) VALUES (1, 'MACHNHA10', 10, 'percent') ON DUPLICATE KEY UPDATE code = VALUES(code), discount = VALUES(discount), type = VALUES(type);
INSERT INTO coupons (id, code, discount, type) VALUES (2, 'MACHNHA20', 20, 'percent') ON DUPLICATE KEY UPDATE code = VALUES(code), discount = VALUES(discount), type = VALUES(type);
INSERT INTO coupons (id, code, discount, type) VALUES (3, 'NEWUSER15', 15, 'percent') ON DUPLICATE KEY UPDATE code = VALUES(code), discount = VALUES(discount), type = VALUES(type);
INSERT INTO testimonials (id, name, avatar, color, rating, text, product, display_date) VALUES (1, 'Nguyễn Thị Lan', 'N', '#c0392b', 5, 'Mua vòng thạch anh tím cho chồng, anh ấy đeo 3 tháng thì được thăng chức. Không biết có phải nhờ phong thủy không nhưng rất vui!', 'Vòng Thạch Anh Tím Amethyst', '15/03/2024') ON DUPLICATE KEY UPDATE name = VALUES(name), avatar = VALUES(avatar), color = VALUES(color), rating = VALUES(rating), text = VALUES(text), product = VALUES(product), display_date = VALUES(display_date);
INSERT INTO testimonials (id, name, avatar, color, rating, text, product, display_date) VALUES (2, 'Trần Văn Minh', 'T', '#2980b9', 5, 'Shop rất chuyên nghiệp, sản phẩm đúng như mô tả. Tỳ Hưu thạch anh hồng rất đẹp, đặt bàn làm việc thấy tâm trạng thoải mái hơn.', 'Tỳ Hưu Thạch Anh Hồng', '02/04/2024') ON DUPLICATE KEY UPDATE name = VALUES(name), avatar = VALUES(avatar), color = VALUES(color), rating = VALUES(rating), text = VALUES(text), product = VALUES(product), display_date = VALUES(display_date);
INSERT INTO testimonials (id, name, avatar, color, rating, text, product, display_date) VALUES (3, 'Phạm Thu Hương', 'P', '#27ae60', 5, 'La kinh phong thủy chất lượng tuyệt vời, đúng hàng cổ, kim xoay rất nhạy. Shop đóng gói cẩn thận, giao hàng nhanh.', 'La Kinh Phong Thủy Đồng Cổ', '18/04/2024') ON DUPLICATE KEY UPDATE name = VALUES(name), avatar = VALUES(avatar), color = VALUES(color), rating = VALUES(rating), text = VALUES(text), product = VALUES(product), display_date = VALUES(display_date);
INSERT INTO testimonials (id, name, avatar, color, rating, text, product, display_date) VALUES (4, 'Lê Quốc Bảo', 'L', '#e67e22', 5, 'Trầm hương Khánh Hòa hương thơm tuyệt vời, đúng mùi trầm rừng tự nhiên. Sẽ mua thêm lần sau!', 'Trầm Hương Khánh Hòa 100g', '05/05/2024') ON DUPLICATE KEY UPDATE name = VALUES(name), avatar = VALUES(avatar), color = VALUES(color), rating = VALUES(rating), text = VALUES(text), product = VALUES(product), display_date = VALUES(display_date);
INSERT INTO analysis_payments (id, package_id, package_name, amount, slots, transfer_desc, bank, account_name, account_number, user_id, user_name, user_email, status, created_at, paid_at, confirmed_at, confirmed_by, confirm_source, credited_at, credited_slots, cancelled_at, bank_transaction_id, bank_payload) VALUES (1780839843895, 'ai-1', 'Gói 1 Lượt', 50000, 1, 'Goi 1 Luot - Phong Thuy Mach Nha 843887', 'MoMo', 'Nguyễn Ngọc Huy', '0968386408', 2, 'Nguyễn Thị Demo', 'demo@gmail.com', 'paid', '2026-06-07 13:44:03', '2026-06-07 13:45:32', '2026-06-07 13:45:32', '1', 'admin', '2026-06-07 13:45:32', 1, NULL, NULL, NULL) ON DUPLICATE KEY UPDATE package_id = VALUES(package_id), package_name = VALUES(package_name), amount = VALUES(amount), slots = VALUES(slots), transfer_desc = VALUES(transfer_desc), bank = VALUES(bank), account_name = VALUES(account_name), account_number = VALUES(account_number), user_id = VALUES(user_id), user_name = VALUES(user_name), user_email = VALUES(user_email), status = VALUES(status), created_at = VALUES(created_at), paid_at = VALUES(paid_at), confirmed_at = VALUES(confirmed_at), confirmed_by = VALUES(confirmed_by), confirm_source = VALUES(confirm_source), credited_at = VALUES(credited_at), credited_slots = VALUES(credited_slots), cancelled_at = VALUES(cancelled_at), bank_transaction_id = VALUES(bank_transaction_id), bank_payload = VALUES(bank_payload);
INSERT INTO analysis_payments (id, package_id, package_name, amount, slots, transfer_desc, bank, account_name, account_number, user_id, user_name, user_email, status, created_at, paid_at, confirmed_at, confirmed_by, confirm_source, credited_at, credited_slots, cancelled_at, bank_transaction_id, bank_payload) VALUES (1780839940403, 'ai-1', 'Gói 1 Lượt', 50000, 1, 'Goi 1 Luot - Phong Thuy Mach Nha 940400', 'MoMo', 'Nguyễn Ngọc Huy', '0968386408', 2, 'Nguyễn Thị Demo', 'demo@gmail.com', 'pending', '2026-06-07 13:45:40', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL) ON DUPLICATE KEY UPDATE package_id = VALUES(package_id), package_name = VALUES(package_name), amount = VALUES(amount), slots = VALUES(slots), transfer_desc = VALUES(transfer_desc), bank = VALUES(bank), account_name = VALUES(account_name), account_number = VALUES(account_number), user_id = VALUES(user_id), user_name = VALUES(user_name), user_email = VALUES(user_email), status = VALUES(status), created_at = VALUES(created_at), paid_at = VALUES(paid_at), confirmed_at = VALUES(confirmed_at), confirmed_by = VALUES(confirmed_by), confirm_source = VALUES(confirm_source), credited_at = VALUES(credited_at), credited_slots = VALUES(credited_slots), cancelled_at = VALUES(cancelled_at), bank_transaction_id = VALUES(bank_transaction_id), bank_payload = VALUES(bank_payload);
INSERT INTO analysis_payments (id, package_id, package_name, amount, slots, transfer_desc, bank, account_name, account_number, user_id, user_name, user_email, status, created_at, paid_at, confirmed_at, confirmed_by, confirm_source, credited_at, credited_slots, cancelled_at, bank_transaction_id, bank_payload) VALUES (1781148712737, 'ai-2', 'Gói 2 Lượt', 149000, 2, 'Goi 2 Luot - Phong Thuy Mach Nha 712733', 'MoMo', 'Nguyễn Ngọc Huy', '0968386408', 2, 'Nguyễn Thị Demo', 'demo@gmail.com', 'pending', '2026-06-11 03:31:52', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL) ON DUPLICATE KEY UPDATE package_id = VALUES(package_id), package_name = VALUES(package_name), amount = VALUES(amount), slots = VALUES(slots), transfer_desc = VALUES(transfer_desc), bank = VALUES(bank), account_name = VALUES(account_name), account_number = VALUES(account_number), user_id = VALUES(user_id), user_name = VALUES(user_name), user_email = VALUES(user_email), status = VALUES(status), created_at = VALUES(created_at), paid_at = VALUES(paid_at), confirmed_at = VALUES(confirmed_at), confirmed_by = VALUES(confirmed_by), confirm_source = VALUES(confirm_source), credited_at = VALUES(credited_at), credited_slots = VALUES(credited_slots), cancelled_at = VALUES(cancelled_at), bank_transaction_id = VALUES(bank_transaction_id), bank_payload = VALUES(bank_payload);
INSERT INTO analysis_payments (id, package_id, package_name, amount, slots, transfer_desc, bank, account_name, account_number, user_id, user_name, user_email, status, created_at, paid_at, confirmed_at, confirmed_by, confirm_source, credited_at, credited_slots, cancelled_at, bank_transaction_id, bank_payload) VALUES (1781149395045, 'ai-1', 'Gói 1 Lượt', 50000, 1, 'Goi 1 Luot - Phong Thuy Mach Nha 395040', 'MoMo', 'Nguyễn Ngọc Huy', '0968386408', 2, 'Nguyễn Thị Demo', 'demo@gmail.com', 'pending', '2026-06-11 03:43:15', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL) ON DUPLICATE KEY UPDATE package_id = VALUES(package_id), package_name = VALUES(package_name), amount = VALUES(amount), slots = VALUES(slots), transfer_desc = VALUES(transfer_desc), bank = VALUES(bank), account_name = VALUES(account_name), account_number = VALUES(account_number), user_id = VALUES(user_id), user_name = VALUES(user_name), user_email = VALUES(user_email), status = VALUES(status), created_at = VALUES(created_at), paid_at = VALUES(paid_at), confirmed_at = VALUES(confirmed_at), confirmed_by = VALUES(confirmed_by), confirm_source = VALUES(confirm_source), credited_at = VALUES(credited_at), credited_slots = VALUES(credited_slots), cancelled_at = VALUES(cancelled_at), bank_transaction_id = VALUES(bank_transaction_id), bank_payload = VALUES(bank_payload);
