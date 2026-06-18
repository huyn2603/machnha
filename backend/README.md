# Mach Nha Backend

Backend la Express API ket noi MySQL quan he.

## File quan trong

- `server.js`: khai bao route API.
- `src/db.js`: doc `.env.local` va tao MySQL pool.
- `src/store.js`: repository doc/ghi cac bang MySQL.
- `machnha_mysql.sql`: file SQL duy nhat, tao database, bang va import data mau.
- `scripts/generate-sql.js`: sinh lai SQL tu `database.json`.
- `scripts/seed.js`: import SQL vao MySQL bang Node.

## Bang MySQL

- `categories`
- `products`
- `product_features`
- `product_destinies`
- `product_images`
- `users`
- `coupons`
- `orders`
- `order_items`
- `analysis_payments`
- `testimonials`
- `subscribers`
- `contacts`

## API

- `GET/POST/PUT/PATCH/DELETE /products`
- `GET/POST/PUT/PATCH/DELETE /categories`
- `GET/POST/PUT/PATCH/DELETE /users`
- `GET/POST/PUT/PATCH/DELETE /orders`
- `GET/POST/PUT/PATCH/DELETE /coupons`
- `GET/POST/PUT/PATCH/DELETE /analysisPayments`
- `GET/POST/PUT/PATCH/DELETE /subscribers`
- `GET/POST/PUT/PATCH/DELETE /contacts`
- `POST /ai/consult`
- `GET /ai/gemini-health`
- `PATCH /analysis-payments/:id/confirm`
- `PATCH /analysis-payments/:id/cancel`
- `POST /analysis-payments/bank-webhook`

## Import database

Chi can dung file nay:

```powershell
mysql -u root -p < backend/machnha_mysql.sql
```

Sinh lai SQL:

```powershell
npm run backend:sql
```

Lenh nay se cap nhat lai `backend/machnha_mysql.sql`.
