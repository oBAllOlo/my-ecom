# Custom Keyboard System

ระบบ E-commerce สำหรับขายคีย์บอร์ดและชิ้นส่วน พร้อมฟีเจอร์ Custom Keyboard Builder, ระบบสมาชิกพร้อมยืนยันอีเมล/รีเซ็ตรหัสผ่านด้วย OTP, คำสั่งซื้อ, การชำระเงินผ่าน Omise และหน้าแอดมินสำหรับจัดการสินค้า

## Overview

- Stack หลัก: Next.js 16, React 19, TypeScript, MongoDB/Mongoose
- Auth ใช้ signed session cookie แบบ `httpOnly`
- Cart เก็บใน `localStorage`
- OTP สำหรับยืนยันอีเมลและรีเซ็ตรหัสผ่าน — ส่งอีเมลจริงผ่าน **Nodemailer (Gmail SMTP)** หรือ fallback เป็นโหมดสาธิตอัตโนมัติเมื่อไม่ได้ตั้งค่า
- มีการป้องกัน brute-force (จำกัดจำนวนครั้งกรอก OTP) และ cooldown การขอ OTP
- Payment รองรับบัตรเครดิต, Internet Banking และ PromptPay ผ่าน Omise
- มี admin dashboard สำหรับสินค้า หมวดหมู่ คำสั่งซื้อ ผู้ใช้ และ custom parts

## Features

- สมัครสมาชิก, login, logout
- ยืนยันอีเมลด้วย OTP + ขอรหัสใหม่ (resend)
- **ลืมรหัสผ่าน / รีเซ็ตรหัสผ่านด้วย OTP** ทางอีเมล
- อีเมล HTML แบรนด์เดียวกัน: ยืนยันอีเมล, รีเซ็ตรหัสผ่าน และแจ้งเตือนการจัดส่ง
- ความปลอดภัย OTP: จำกัด 5 ครั้งที่กรอกผิดต่อรหัส + cooldown ขอรหัสใหม่ทุก 60 วินาที
- โปรไฟล์ผู้ใช้และที่อยู่จัดส่ง, เปลี่ยนรหัสผ่าน
- รายการสินค้า, รายละเอียดสินค้า, รีวิวสินค้า
- ตะกร้าสินค้าและ checkout
- ระบบสร้างคีย์บอร์ดแบบ custom
- สร้างคำสั่งซื้อ, reserve stock, tracking, confirm received
- Omise payment flow พร้อม payment status check
- Cron endpoint สำหรับ auto-complete คำสั่งซื้อที่จัดส่งนานเกินกำหนด
- ระบบอัปโหลดรูปผ่าน Cloudinary

## Tech Stack

| Layer | Tech |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS |
| Database | MongoDB, Mongoose |
| Auth | bcryptjs + signed session cookie |
| Email | Nodemailer (Gmail SMTP) |
| Payment | Omise |
| Upload | Cloudinary |
| Notifications | Sonner |
| Charts | Recharts |
| Icons | lucide-react |

## Project Structure

```text
app/                  Next.js App Router pages and API routes
  api/auth/           register, verify, resend-otp, login, logout, me,
                      change-password, forgot-password, reset-password
components/           Reusable UI components
context/              AuthContext, CartContext
lib/                  Shared helpers (auth, email, mongodb, order-access, ...)
models/               Mongoose models (User, OTP, Order, Product, ...)
public/               Static assets
tests/                Node test runner test files
skill.md              Internal AI/dev guide for this repo
```

ไฟล์สำคัญ:

- `lib/auth.ts` auth/session helpers ระดับ route
- `lib/auth-session.ts` low-level session token helpers
- `lib/email.ts` ส่งอีเมล OTP/แจ้งจัดส่ง (Nodemailer + demo fallback)
- `lib/order-access.ts` owner/admin access rules
- `models/OTP.ts` OTP schema (TTL 5 นาที, purpose, attempts)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env.local`

> 🧪 **โหมดสาธิต (Demo Mode):** payment (Omise) ถูก mock ไว้, **image upload ใช้ Cloudinary จริง**
> ส่วน **email/OTP จะส่งจริงก็ต่อเมื่อตั้ง `EMAIL_USER` + `EMAIL_PASS`** — ถ้าไม่ตั้ง จะ fallback เป็นโหมดสาธิต

```env
# Database (required)
MONGODB_URI=mongodb://localhost:27017/keyboardth

# Session (required)
SESSION_SECRET=replace-with-a-long-random-secret

# Cloudinary (required สำหรับอัปโหลดรูปสินค้า/parts)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email / OTP (optional) — ตั้งทั้งคู่เพื่อส่งอีเมล OTP & แจ้งจัดส่งจริงผ่าน Gmail SMTP
# ถ้าไม่ตั้ง ระบบจะรันโหมดสาธิต (log OTP ที่ console + คืนค่า devOtp)
# EMAIL_PASS ต้องเป็น Gmail App Password (ไม่ใช่รหัสผ่านปกติ)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password

# Cron (optional) — secret สำหรับ endpoint auto-complete คำสั่งซื้อ
CRON_SECRET=replace-with-a-random-secret
```

พฤติกรรมในโหมดสาธิต:

- **Payment** — กดยืนยันแล้ว order ถูกตั้งเป็น `paid` ทันที ไม่มีการตัดเงินจริง (ไม่ต้องมีบัญชี Omise)
- **OTP / Email** — ถ้า **ไม่ได้** ตั้ง `EMAIL_USER`/`EMAIL_PASS`: ไม่ส่งอีเมลจริง รหัส OTP จะถูก log ที่ console, คืนค่ามาเป็น `devOtp` และเติมให้อัตโนมัติในหน้า verify/reset
- **Image upload** — อัปโหลดขึ้น Cloudinary จริง (เก็บเป็นลิงก์ใน MongoDB)

ข้อสำคัญ:

- `SESSION_SECRET` ควรเป็นค่า random ที่ยาวและเดายาก
- ต้องมี Cloudinary account จริง (ฟรีก็ได้) เพื่อให้การอัปโหลดรูปทำงาน
- ถ้าตั้ง `EMAIL_*` แล้ว ระบบจะ **ไม่คืน `devOtp`** อีก (กันรหัสรั่ว) — รหัสจะมาทางอีเมลเท่านั้น
- หากต้องการใช้ payment จริง ให้คืนค่า integration จริงใน payment route (Omise) พร้อมตั้ง env ที่เกี่ยวข้อง

### 3. Run development server

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

### 4. Seed ข้อมูลตัวอย่าง (จำเป็น — ไม่งั้นหน้าเว็บจะว่างเปล่า)

รันครั้งเดียวหลังเซิร์ฟเวอร์ขึ้น เพื่อสร้างสินค้า / หมวดหมู่ / ชิ้นส่วน custom + บัญชี demo:

```bash
curl -X POST http://localhost:3000/api/seed
curl -X POST http://localhost:3000/api/custom-parts/seed
```

> `POST /api/seed` ถูกปิดใช้งานเมื่อ `NODE_ENV=production` (ตอบ 403)

### 5. เข้าสู่ระบบด้วยบัญชี demo

`POST /api/seed` สร้างบัญชีพร้อมใช้ให้ (ยืนยันอีเมลแล้ว login ได้เลย) — ในหน้า `/login`
มีปุ่มกดกรอกอัตโนมัติให้ด้วย:

| บทบาท | อีเมล | รหัสผ่าน |
| --- | --- | --- |
| 🛡️ Admin | `admin@keyboardth.com` | `Admin123!` |
| 👤 User | `user@keyboardth.com` | `User1234!` |

> โหมดสาธิต (ไม่ได้ตั้ง `EMAIL_*`): สมัครสมาชิกใหม่ระบบไม่ส่งอีเมลจริง — รหัส OTP จะถูกกรอกให้อัตโนมัติในหน้ายืนยัน
> และการชำระเงินเป็นการจำลอง (ไม่ตัดเงินจริง)

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | รัน development server |
| `npm run build` | build สำหรับ production |
| `npm run start` | รัน production server |
| `npm run lint` | ตรวจ lint |
| `npm test` | รัน test ด้วย Node built-in test runner |

## Testing

โปรเจกต์นี้ใช้ Node built-in test runner (`node:test`) ร่วมกับ `ts-node/register`

คำสั่ง:

```bash
npm test
```

coverage ปัจจุบัน:

- `tests/auth-session.test.ts` ทดสอบ session token signing/verification
- `tests/order-access.test.ts` ทดสอบ owner/admin authorization rules

## Authentication

API endpoints:

| Method | Endpoint | หน้าที่ |
| --- | --- | --- |
| POST | `/api/auth/register` | สมัครสมาชิก + ส่ง OTP ยืนยันอีเมล |
| POST | `/api/auth/verify` | ยืนยันอีเมลด้วย OTP → สร้าง session |
| POST | `/api/auth/resend-otp` | ขอ OTP ยืนยันใหม่ (cooldown 60 วิ) |
| POST | `/api/auth/login` | เข้าสู่ระบบ |
| GET | `/api/auth/me` | ข้อมูลผู้ใช้ปัจจุบันจาก session |
| POST | `/api/auth/logout` | ออกจากระบบ |
| POST | `/api/auth/change-password` | เปลี่ยนรหัสผ่าน (ต้อง login) |
| POST | `/api/auth/forgot-password` | ส่ง OTP สำหรับรีเซ็ตรหัสผ่าน (cooldown 60 วิ) |
| POST | `/api/auth/reset-password` | ตั้งรหัสผ่านใหม่ด้วย OTP |

ความปลอดภัย OTP:

- รหัส 6 หลัก หมดอายุภายใน **5 นาที** (MongoDB TTL index)
- แยกตาม `purpose` — OTP ยืนยันอีเมล (`verify`) กับรีเซ็ตรหัสผ่าน (`reset`) ใช้ข้ามกันไม่ได้
- กรอกผิดได้สูงสุด **5 ครั้งต่อรหัส** เกินนั้นรหัสถูกล็อก ต้องขอใหม่ (ตอบ HTTP 429)
- ขอ OTP ใหม่ได้ทุก **60 วินาที** ป้องกัน email-bombing (ตอบ HTTP 429 พร้อม `retryAfter`)

หมายเหตุ:

- user identity และ role ต้องอ้างอิงจาก session ฝั่ง server
- ห้ามเชื่อ `userId` หรือ `role` จาก request body ตรง ๆ

## Email & OTP

ส่งอีเมลผ่าน `lib/email.ts` ด้วย Nodemailer (Gmail SMTP):

- ตั้ง `EMAIL_USER` + `EMAIL_PASS` (Gmail App Password) → ส่งอีเมลจริง และ **ไม่คืน `devOtp`**
- ไม่ตั้ง → โหมดสาธิต: log OTP ที่ console + คืน `devOtp` ใน response (สำหรับ dev/demo เท่านั้น)

อีเมลที่ระบบส่ง (HTML แบรนด์เดียวกัน — header ไล่เฉดสี indigo + footer):

- ยืนยันอีเมล (สมัครสมาชิก / resend)
- รีเซ็ตรหัสผ่าน
- แจ้งเตือนการจัดส่ง (เมื่อแอดมินกดจัดส่งคำสั่งซื้อ) พร้อมเลขพัสดุและลิงก์ติดตาม

## Orders and Payment

- `POST /api/orders` ใช้ user จาก session และตัด stock ตอนสร้างคำสั่งซื้อ
- `/api/payment/create-charge` และ `/api/payment/check-status` ตรวจ owner/admin ก่อนทำงาน
- โหมดสาธิต: `create-charge` จำลองการชำระเงินสำเร็จทันที (ไม่ต่อ Omise)
- เมื่อแอดมินกดจัดส่ง (`/api/orders/ship`) ระบบบันทึกเลขพัสดุและส่งอีเมลแจ้งลูกค้า

## Seed Data

ดูขั้นตอนที่ [Getting Started ข้อ 4–5](#4-seed-ข้อมูลตัวอย่าง-จำเป็น--ไม่งั้นหน้าเว็บจะว่างเปล่า) — endpoint seed
ใช้ได้เฉพาะ local/non-production และ `POST /api/seed` จะสร้างทั้งสินค้า หมวดหมู่ และบัญชี demo
(admin@keyboardth.com / user@keyboardth.com)

## Deployment Notes

- `next.config.ts` ใช้ `output: "standalone"` และอนุญาตรูปจาก `images.unsplash.com`, `res.cloudinary.com`
- หน้า `/custom` ตั้งเป็น `dynamic = "force-dynamic"` (render ตอน request) เพื่อไม่ให้ build พึ่งพาการต่อ DB ตอน build

### Environment variables (production)

| ตัวแปร | จำเป็น | หมายเหตุ |
| --- | --- | --- |
| `MONGODB_URI` | ✅ | connection string ของ MongoDB/Atlas |
| `SESSION_SECRET` | ✅ | ค่า random ยาว ๆ สำหรับ sign session |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | ✅ | อัปโหลดรูป |
| `EMAIL_USER` / `EMAIL_PASS` | ⚠️ แนะนำ | ถ้าไม่ตั้งบน production ระบบจะตกไปโหมดสาธิตและ **คืน `devOtp` ออกมา (รหัสรั่ว)** — ควรตั้งเสมอบน prod |
| `CRON_SECRET` | optional | authorize cron endpoint |

### MongoDB Atlas

- เพิ่ม `0.0.0.0/0` ใน **Network Access** — แพลตฟอร์มแบบ serverless (เช่น Vercel) ใช้ IP แบบ dynamic
  ถ้าไม่เปิด การต่อ DB จะล้มทั้งตอน build และ runtime

### Vercel

- ตั้ง env ทั้งหมดข้างต้นใน Project → Settings → Environment Variables แล้วจึง deploy

## Related Docs

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Mongoose Docs](https://mongoosejs.com)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [Omise Docs](https://www.omise.co/docs)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Nodemailer Docs](https://nodemailer.com)

## Developer Notes

- กติกาภายใน repo และแนวทางแก้โค้ดดูเพิ่มได้ที่ [skill.md](D:/my-ecom/my-ecom/my-ecom/skill.md)

---

Updated: May 30, 2026
