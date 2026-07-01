# Phong Thuy Mach Nha

Codebase da chia lai:

- `frontend/`: chi chua giao dien React UI, component, page, context, hook va client API.
- `backend/`: chi chua Express API, ket noi MySQL, repository va script database.
- `backend/machnha_mysql.sql`: file SQL duy nhat, day du schema va data mau de import vao MySQL.
- `backend/database.json`: data goc dung de sinh lai SQL khi can.

## Cau truc frontend

```text
frontend/
  public/
  src/
    components/
    context/
    hooks/
    pages/
    services/
    App.jsx
    index.css
    index.js
```

`frontend/src/services/api.js` chi la client goi API tu browser, khong phai backend.

## Cau truc backend

```text
backend/
  src/
    db.js
    store.js
  scripts/
    generate-sql.js
    seed.js
  server.js
  machnha_mysql.sql
```

## Database MySQL

Database moi la schema quan he that, khong con bang `records` JSON.

Cac bang chinh:

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

File SQL duy nhat can dung:

```powershell
mysql -u root -p < backend/machnha_mysql.sql
```

File nay tu tao database `machnha`, tao tat ca bang, khoa chinh, khoa ngoai, index va import data mau.

Neu dung MySQL Workbench: mo query moi, copy noi dung `backend/machnha_mysql.sql`, bam Run.

## Cai dat

```powershell
npm install
Copy-Item .env.example .env.local
```

Sua `.env.local`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=machnha
PORT=3001
CORS_ORIGIN=http://localhost:3000
REACT_APP_API_URL=http://localhost:3001
```

Neu dung AI:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_TEXT_MODEL=gemini-2.5-flash
GEMINI_API_VERSION=v1beta
```

De gui OTP quen mat khau qua Gmail:

1. Bat xac minh 2 buoc cho tai khoan Google.
2. Vao Google Account > Security > App passwords, tao mat khau ung dung cho website.
3. Dien cac bien sau vao `.env.local` (khong dung mat khau Gmail thong thuong):

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password
MAIL_FROM=Mach Nha <your_email@gmail.com>
```

OTP co hieu luc 10 phut, toi da 5 lan nhap sai va chi dung duoc mot lan. Sau khi OTP dung, nguoi dung moi duoc nhap mat khau moi.

## Chay app

```powershell
npm start
```

Hoac chay rieng:

```powershell
npm run backend
npm run frontend
```

Frontend: http://localhost:3000

Backend: http://localhost:3001

Kiem tra backend:

```powershell
Invoke-RestMethod http://localhost:3001/health
```

## Build production

Truoc khi deploy, kiem tra ban build frontend:

```powershell
npm run build
```

Thu muc production cua frontend se nam o:

```text
frontend/build
```

Backend production chay bang:

```powershell
node backend/server.js
```

## Deploy len internet

Du an nay nen deploy thanh 3 phan:

- MySQL online: luu database `machnha`.
- Backend Node/Express: public API, vi du `https://api.machnha.vn`.
- Frontend React static: website nguoi dung truy cap, vi du `https://machnha.vn`.

### 1. Dua code len GitHub

```powershell
git init
git add .
git commit -m "Deploy ready"
git branch -M main
git remote add origin https://github.com/your-user/machnha.git
git push -u origin main
```

Khong commit `.env.local` vi file nay chua mat khau database va API key.

### 2. Tao MySQL online

Co the dung Railway, Aiven, DigitalOcean, Clever Cloud hoac MySQL tren VPS.
Sau khi tao database, lay cac thong tin:

```env
DB_HOST=...
DB_PORT=3306
DB_USER=...
DB_PASSWORD=...
DB_NAME=machnha
DB_SSL=true
```

Import data mau:

```powershell
mysql -h DB_HOST -P DB_PORT -u DB_USER -p DB_NAME < backend/machnha_mysql.sql
```

Neu nha cung cap da tao san database khac ten `machnha`, sua `DB_NAME` theo ten database do.

### 3. Deploy backend Node/Express

De don gian, co the dung Render Web Service hoac mot VPS Node.js.

Thiet lap tren hosting:

```text
Root directory: EXE hoac thu muc goc repo neu repo chi chua du an nay
Build command: npm install
Start command: node backend/server.js
Health check path: /health
```

Bien moi truong backend production:

```env
NODE_ENV=production
PORT=10000
CORS_ORIGIN=https://machnha.vn,https://www.machnha.vn
DB_HOST=...
DB_PORT=3306
DB_USER=...
DB_PASSWORD=...
DB_NAME=machnha
DB_SSL=true
GEMINI_API_KEY=...
GEMINI_TEXT_MODEL=gemini-2.5-flash
GEMINI_API_VERSION=v1beta
  PAYMENT_WEBHOOK_SECRET=...
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=465
  SMTP_SECURE=true
  SMTP_USER=your_email@gmail.com
  SMTP_PASS=your_google_app_password
  MAIL_FROM=Mach Nha <your_email@gmail.com>
```

Sau khi deploy, test:

```powershell
Invoke-RestMethod https://api.machnha.vn/health
```

Ket qua dung se co `ok: true`.

### 4. Deploy frontend React

Co the dung Vercel, Netlify, Render Static Site hoac Cloudflare Pages.

Thiet lap:

```text
Root directory: EXE hoac thu muc goc repo neu repo chi chua du an nay
Build command: npm install && npm run build
Publish directory: frontend/build
```

Bien moi truong frontend production:

```env
REACT_APP_API_URL=https://api.machnha.vn
```

Sau khi doi `REACT_APP_API_URL`, can build/deploy lai frontend vi React doc bien nay luc build.

### 5. Gan ten mien

Mua ten mien tai nha dang ky nhu Cloudflare Registrar, Namecheap, GoDaddy, Mat Bao, PA Vietnam hoac Nhan Hoa.

Goi y cau truc ten mien:

```text
machnha.vn          -> frontend
www.machnha.vn      -> frontend
api.machnha.vn      -> backend
```

DNS thuong dung:

```text
Type   Name   Value
CNAME  www    domain-frontend-cua-hosting
CNAME  api    domain-backend-cua-hosting
A/CNAME @     theo huong dan cua hosting frontend
```

Moi hosting se hien record DNS chinh xac sau khi bam Add custom domain. Copy dung record do vao trang quan ly DNS cua ten mien, cho DNS propagate, roi bam Verify tren hosting.

### 6. De nguoi dung tim thay tren Google

Sau khi website da chay bang ten mien that:

- Doi title/description trong `frontend/public/index.html` neu can them tu khoa kinh doanh.
- Tao Google Search Console, them domain, xac minh DNS.
- Submit URL trang chu `https://machnha.vn`.
- Neu co sitemap, submit `https://machnha.vn/sitemap.xml`.
- Dat link website tren Facebook, TikTok, Google Business Profile va cac kenh ban hang de Google phat hien nhanh hon.
- Dung noi dung that, ten san pham ro rang, anh san pham chat luong va mo ta khong copy hang loat.

### 7. Checklist truoc khi cong khai

- `npm run build` thanh cong.
- Backend `/health` tra ve `ok: true`.
- Frontend goi API bang URL production, khong con `localhost`.
- `CORS_ORIGIN` co du ca domain chinh va `www`.
- Database da import `backend/machnha_mysql.sql`.
- `.env.local` khong nam tren GitHub.
- HTTPS hoat dong cho ca frontend va backend.
- Tai khoan admin/mac dinh neu co da doi mat khau.

## Sinh lai SQL

Neu sua `backend/database.json`, chay:

```powershell
npm run backend:sql
```

Lenh nay se sinh lai file duy nhat `backend/machnha_mysql.sql`.

Neu muon import database bang Node:

```powershell
npm run backend:seed
```
