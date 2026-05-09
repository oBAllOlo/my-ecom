# Custom Keyboard System

ระบบ E-commerce สำหรับขายคีย์บอร์ดและชิ้นส่วน พร้อมฟีเจอร์ Custom Keyboard Builder, ระบบสมาชิก, คำสั่งซื้อ, การชำระเงินผ่าน Omise และหน้าแอดมินสำหรับจัดการสินค้า

## Overview

- Stack หลัก: Next.js 16, React 19, TypeScript, MongoDB/Mongoose
- Auth ใช้ signed session cookie แบบ `httpOnly`
- Cart เก็บใน `localStorage`
- Payment รองรับบัตรเครดิต, Internet Banking และ PromptPay ผ่าน Omise
- มี admin dashboard สำหรับสินค้า หมวดหมู่ คำสั่งซื้อ ผู้ใช้ และ custom parts

## Features

- สมัครสมาชิก, login, logout, OTP verification
- โปรไฟล์ผู้ใช้และที่อยู่จัดส่ง
- รายการสินค้า, รายละเอียดสินค้า, รีวิวสินค้า
- ตะกร้าสินค้าและ checkout
- ระบบสร้างคีย์บอร์ดแบบ custom
- สร้างคำสั่งซื้อ, reserve stock, tracking, confirm received
- Omise payment flow พร้อม webhook และ payment status check
- Cron endpoint สำหรับ auto-complete คำสั่งซื้อที่จัดส่งนานเกินกำหนด
- ระบบอัปโหลดรูปผ่าน Cloudinary

## Tech Stack

| Layer | Tech |
| --- | --- |
| Framework | Next.js 16 |
| UI | React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS, Bootstrap |
| Database | MongoDB, Mongoose |
| Auth | bcryptjs + signed session cookie |
| Payment | Omise |
| Email | Nodemailer |
| Upload | Cloudinary |
| Notifications | Sonner |
| Charts | Recharts |

## Project Structure

```text
app/                  Next.js App Router pages and API routes
components/           Reusable UI components
context/              AuthContext, CartContext
lib/                  Shared helpers and utilities
models/               Mongoose models
public/               Static assets
tests/                Node test runner test files
skill.md              Internal AI/dev guide for this repo
```

ไฟล์สำคัญ:

- `lib/auth.ts` auth/session helpers ระดับ route
- `lib/auth-session.ts` low-level session token helpers
- `lib/order-access.ts` owner/admin access rules
- `lib/orders.ts` order stock helpers
- `lib/payment.ts` Omise amount/signature helpers

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env.local`

```env
# Database
MONGODB_URI=mongodb://localhost:27017/keyboardth

# Session
SESSION_SECRET=replace-with-a-long-random-secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Omise
OMISE_PUBLIC_KEY=pkey_test_xxxxx
NEXT_PUBLIC_OMISE_PUBLIC_KEY=pkey_test_xxxxx
OMISE_SECRET_KEY=skey_test_xxxxx

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@keyboardth.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Cron
CRON_SECRET=replace-with-a-long-random-secret
```

ข้อสำคัญ:

- `SESSION_SECRET` และ `CRON_SECRET` ต้องเป็นค่า random ที่ยาวและเดายากก่อนใช้งานจริง
- ใน production ควรตั้งค่า env ทั้งหมดผ่าน platform ที่ deploy

### 3. Run development server

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

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
- `tests/payment.test.ts` ทดสอบ Omise amount conversion และ webhook signature verification

## Authentication

flow หลัก:

1. `POST /api/auth/register`
2. ส่ง OTP ทางอีเมล
3. `POST /api/auth/verify`
4. `POST /api/auth/login`
5. `GET /api/auth/me`
6. `POST /api/auth/logout`

หมายเหตุ:

- user identity และ role ต้องอ้างอิงจาก session ฝั่ง server
- ห้ามเชื่อ `userId` หรือ `role` จาก request body ตรง ๆ

## Orders and Payment

- `POST /api/orders` ใช้ user จาก session และ reserve stock ตอนสร้างคำสั่งซื้อ
- ถ้า flow จ่ายเงินล้มเหลว ระบบต้องคืน stock ที่ reserve ไว้
- `/api/payment/create-charge`, `/api/payment/create-source`, `/api/payment/check-status`
  ตรวจ owner/admin ก่อนทำงาน
- `/api/payment/webhook` ตรวจ `x-omise-signature` ก่อนอัปเดตสถานะ
- `/api/cron/auto-complete` ใช้ `x-cron-secret` ใน production

## Seed Data

ใช้เฉพาะ local/non-production:

```bash
curl -X POST http://localhost:3000/api/custom-parts/seed
curl -X POST http://localhost:3000/api/seed
```

## Deployment Notes

- `next.config.ts` ใช้ `output: "standalone"`
- ต้องตั้ง env ให้ครบ โดยเฉพาะ `MONGODB_URI`, `SESSION_SECRET`, `OMISE_SECRET_KEY`, `CRON_SECRET`
- ถ้า deploy บน Vercel ให้เพิ่ม env ผ่าน dashboard

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

Updated: May 9, 2026
