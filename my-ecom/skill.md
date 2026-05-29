# Custom Keyboard System — AI Development Guide

> เอกสารนี้อธิบายสถาปัตยกรรม กฎการเขียนโค้ด และ pattern ที่ใช้ในโปรเจกต์ เพื่อให้ AI ช่วยพัฒนาต่อได้อย่างถูกต้องและสอดคล้องกับระบบปัจจุบัน

---

## 1. Overview

- **ชื่อระบบ:** Custom Keyboard System — E-commerce + Custom Keyboard Builder
- **Stack:** Next.js 16 (App Router) + React 19 + TypeScript + MongoDB/Mongoose + Tailwind CSS + Bootstrap CSS
- **Pattern:** Server Components เป็นหลัก ฝั่ง Client ใช้ React Context สำหรับ Auth/Cart โดย **Auth ใช้ server session ผ่าน `httpOnly` cookie** และ Cart ใช้ `localStorage`
- **Path alias:** `@/*` ชี้ไปที่ root ของโปรเจกต์ (ดู `tsconfig.json`)

---

## 2. Tech Stack & Versions

| Layer | Tech | Version / Note |
|-------|------|--------------|
| Framework | Next.js | 16.0.10 — App Router, standalone output |
| UI Library | React | 19.2.1 |
| Language | TypeScript | ^5 — `strict: true` |
| Styling | Tailwind CSS | ^3.4.19 |
| Styling | Bootstrap | ^5.3.8 |
| DB | MongoDB | — |
| ODM | Mongoose | ^9.0.2 |
| Auth | bcryptjs | ^3.0.3 — salt rounds = 10 |
| Payment | (mocked) | demo mode — ไม่ต่อ gateway จริง |
| Email | (mocked) | demo mode — log แทนการส่งจริง |
| Upload | Cloudinary | ^2.8.0 — ใช้งานจริง |
| Toast | Sonner | ^2.0.7 |
| Charts | Recharts | ^3.6.0 |

---

## 3. Architecture Rules

### 3.1 App Router
- ใช้ `app/` directory ทั้งหมด
- แต่ละหน้าอยู่ใน `app/[route]/page.tsx`
- API Routes อยู่ใน `app/api/[route]/route.ts`
- `app/layout.tsx` เป็น Server Component
- `AuthProvider` และ `CartProvider` ถูก wrap ใน `layout.tsx`

### 3.2 Server vs Client Components
- ค่าเริ่มต้นทุก component คือ Server Component
- ใส่ `'use client'` เมื่อจำเป็นจริง เช่น ใช้ React hooks, Context, event handlers, browser APIs
- ถ้าหน้าเป็น data fetching เป็นหลัก ให้คงเป็น Server Component และแยก interactive logic ออกเป็น component ย่อย

### 3.3 API Response Pattern
- ทุก API ควรตอบรูปแบบหลักนี้:
  ```ts
  { success: boolean, data?: any, error?: string, message?: string }
  ```
- Success:
  ```ts
  return NextResponse.json({ success: true, data: result });
  ```
- Error:
  ```ts
  return NextResponse.json({ success: false, error: "ข้อความ" }, { status: 400 });
  ```
- ถ้า endpoint มี payload พิเศษ ให้ใส่ไว้ใต้ `data`
  ```ts
  return NextResponse.json({ success: true, data: { url } });
  ```

### 3.4 State Management
- **ไม่ใช้ Redux / Zustand**
- ใช้ React Context 2 ตัว:
  - `AuthContext` — login/register/verify/logout และโหลด current user จาก `/api/auth/me`
  - `CartContext` — จัดการ cart และเก็บใน `localStorage`

---

## 4. Database & Models

### 4.1 Connection Pattern
- ทุก API route ต้องเรียก `await dbConnect()`
- `dbConnect` อยู่ที่ `@/lib/mongodb.ts`
- ใช้ connection caching สำหรับ development

### 4.2 Models หลัก

| Model | File | Key Fields |
|-------|------|------------|
| User | `models/User.ts` | name, email, password, role, isVerified, phoneNumber, address |
| Product | `models/Product.ts` | name, description, price, image, images[], category, brand, stock, rating |
| Order | `models/Order.ts` | userId, items, total, shippingAddress, status, paymentMethod, paymentStatus, chargeId, trackingNumber, carrier, stockReserved |
| Category | `models/Category.ts` | name, slug, icon, productCount |
| CustomPart | `models/CustomPart.ts` | category, name, price, image, stock, isActive |
| OTP | `models/OTP.ts` | email, otp, expiresAt |
| Review | `models/Review.ts` | productId, userId, rating, comment |
| Settings | `models/Settings.ts` | key, value |

### 4.3 Model Rules
- ใช้ pattern กัน hot-reload เช่น `mongoose.models.X || mongoose.model(...)`
- ใช้ `timestamps: true`
- ใช้ `.lean()` ใน list/query ที่ไม่ต้องแก้ document ต่อ

---

## 5. Authentication & Authorization

### 5.1 Session Model
- ระบบใช้ **signed session cookie** ชื่อ `session`
- เก็บผ่าน `httpOnly`, `sameSite=lax`, `secure` เฉพาะ production
- helper หลักอยู่ที่ `@/lib/auth.ts`
  - `getAuthenticatedUser()`
  - `requireAuth()`
  - `requireAdmin()`
  - `setSessionCookie()`
  - `clearSessionCookie()`
- low-level session helpers อยู่ที่ `@/lib/auth-session.ts`
  - `createSessionToken()`
  - `verifySessionToken()`

### 5.2 Auth Flow
1. `POST /api/auth/register` → สร้าง user ด้วย `role: "user"` และ `isVerified: false`
2. ส่ง OTP ทาง email
3. `POST /api/auth/verify` → mark verified + set session cookie + return user
4. `POST /api/auth/login` → ตรวจ password + ต้อง `isVerified === true` + set session cookie
5. `GET /api/auth/me` → คืน current authenticated user หรือ `null`
6. `POST /api/auth/logout` → clear session cookie

### 5.3 AuthContext
```ts
const { user, isLoading, login, register, verifyOTP, logout, isAuthenticated } = useAuth();
```
- `user` ถูกโหลดจาก `/api/auth/me`
- **ไม่เก็บ auth user ใน `localStorage`**
- ฝั่ง client ใช้ `user?.role === "admin"` เพื่อ render UI ได้ แต่ **สิทธิ์จริงต้อง enforce ที่ API เท่านั้น**

### 5.4 Authorization Rules
- Endpoint ที่เป็นข้อมูลของ user เอง ต้องผูกกับ session user ไม่เชื่อ `userId` จาก client ตรงๆ
- Endpoint admin เช่น create/update/delete product, category, custom part, user management, shipping config, upload ต้องใช้ `requireAdmin()`
- ห้ามให้ client กำหนด role ตอนสมัครสมาชิก

---

## 6. API Security Rules

### 6.1 General
- ห้ามเชื่อ `role`, `userId`, หรือ owner identity จาก request body โดยไม่มีการตรวจจาก session
- ใช้ `requireAuth()` สำหรับ endpoint ที่ต้อง login
- ใช้ `requireAdmin()` สำหรับ endpoint หลังบ้าน
- ถ้า endpoint อ่านข้อมูลเฉพาะเจ้าของ order/profile ต้องเช็ก ownership เพิ่มเสมอ
- ownership logic ที่ใช้ซ้ำได้ควรแยกไว้ใน helper เช่น `@/lib/order-access.ts`

### 6.2 Sensitive Routes
- `/api/seed` และ `/api/custom-parts/seed`
  - ใช้ได้เฉพาะ non-production
- `/api/upload`
  - admin only

---

## 7. Cart System

### 7.1 CartContext API
```ts
const { items, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount } = useCart();
```

### 7.2 Behavior
- Cart เก็บใน `localStorage` key = `"cart"`
- Product ใน cart เก็บทั้ง `Product` + `quantity`
- `addToCart` ถ้าซ้ำจะเพิ่ม quantity
- `updateQuantity(productId, 0)` จะ remove item
- Custom keyboard build ถูกแปลงเป็น `Product` object โดย `_id` รูปแบบ `custom-{timestamp}`

---

## 8. Orders & Payment

### 8.1 Order Creation
- `POST /api/orders` ต้อง login ก่อน
- `userId` ของ order ใช้จาก session ฝั่ง server
- ระบบตัด stock ตอนสร้าง order (สินค้า `custom-*` ไม่ตัด stock)

### 8.2 Payment (Demo Mode)
- การชำระเงินถูก mock ไว้ ไม่ต่อ Omise และไม่ต้องใช้ key ใดๆ
- `create-charge` จำลองว่าจ่ายสำเร็จทันที แล้วตั้ง order เป็น `paid` / `processing`
- รองรับเฉพาะ flow บัตร (UI ตัด Internet Banking / PromptPay ออกในโหมดสาธิต)

### 8.3 Payment Security
- `/api/payment/create-charge`, `/api/payment/check-status`
  - ต้องผูกกับ owner ของ order หรือ admin (เช็คไว้แม้ใน demo)

### 8.4 Order Lifecycle
1. Checkout → สร้าง order (`pending`)
2. Payment success (จำลอง) → `paymentStatus = paid`, `status = processing`
3. Admin ship order → `status = shipped` + tracking
4. Customer confirm → `status = delivered`

---

## 9. Image Upload

### 9.1 Upload Flow
- Client admin upload file → `POST /api/upload`
- Server แปลงเป็น base64 แล้วอัปโหลดขึ้น Cloudinary คืน `secure_url` กลับมาเก็บใน MongoDB
- Response:
  ```ts
  { success: true, data: { url: string } }
  ```

### 9.2 Rules
- รับเฉพาะไฟล์ภาพ
- จำกัดขนาดไฟล์ไม่เกิน 5MB
- Route นี้เป็น admin only

---

## 10. Styling Guide

### 10.1 CSS Strategy
- Primary: Tailwind CSS
- Secondary: Bootstrap CSS
- Global styles: `app/globals.css`

### 10.2 Tailwind Config
- มี custom color `primary`
- มี custom animations เช่น `fadeIn`, `fadeInUp`, `scaleIn`, `shimmer`

### 10.3 Image Usage
- หน้า storefront ควร prefer `<Image />`
- หน้า admin/editor อนุโลม `<img>` ได้ถ้าจำเป็น แต่ถ้าปรับได้ควร migrate ไป `<Image />`
- lint ของ `@next/next/no-img-element` ถูกปิดเฉพาะบางหน้าที่แสดง stacked/custom images หรือ admin previews เท่านั้น ไม่ควรปิดทั้งโปรเจกต์

---

## 11. Testing

### 11.1 Test Stack
- ใช้ Node built-in test runner (`node:test`)
- รันผ่าน script:
  ```bash
  npm test
  ```
- ปัจจุบันใช้ `node --import ts-node/register --test tests/**/*.test.ts`

### 11.2 Current Test Coverage
- `tests/auth-session.test.ts` — session token signing/verification
- `tests/order-access.test.ts` — owner/admin authorization logic

### 11.3 Testing Rules
- logic ที่ pure และสำคัญด้าน security/business rule ควรถูกแยกออกจาก route เพื่อให้ทดสอบได้ง่าย
- ถ้าต้องเพิ่ม auth/order/payment behavior ใหม่ ให้พิจารณาเพิ่ม test ใน `tests/` พร้อมกัน
- ถ้า test ใหม่ import ไฟล์ TypeScript ตรง ให้ใช้ path พร้อม `.ts` ใน test file

---

## 12. Custom Keyboard Builder

### 11.1 Parts Category
- `base`
- `switch`
- `keycapBase`
- `keycapAdd1`
- `keycapAdd2`
- `wire`

### 11.2 Data Flow
1. `GET /api/custom-parts`
2. เลือก parts แต่ละ category
3. คำนวณราคาแบบ real-time
4. แปลงเป็น custom product แล้วใส่ cart

---

## 13. Environment Variables

โหมดสาธิต mock payment + email ไว้ แต่ image upload ใช้ Cloudinary จริง — ต้องตั้งใน `.env.local`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/keyboardth

# Session
SESSION_SECRET=replace-with-a-long-random-secret

# Cloudinary (image upload จริง)
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

- `SESSION_SECRET` ควรเป็นค่า random ที่ยาวและเดายาก
- หากจะนำ payment/email ไปใช้งานจริง ให้คืน integration จริงใน `lib/email.ts` และ payment route แล้วเพิ่ม env ที่เกี่ยวข้องกลับมา

---

## 14. Do's and Don'ts

### ✅ Do
- ใช้ `await dbConnect()` ทุกครั้งใน API route
- ใช้ `requireAuth()` / `requireAdmin()` กับ endpoint ที่เหมาะสม
- ใช้ path alias `@/...`
- ใช้ `Sonner` สำหรับ toast
- ใช้ `useRouter` จาก `next/navigation`
- ใช้ `Link` จาก `next/link`
- เก็บ data พิเศษใต้ `data` ใน API response

### ❌ Don't
- อย่าใช้ `any` โดยไม่จำเป็น
- อย่า import model ตรงใน UI page แทน API
- อย่าเก็บ password หรือ secret ใน client
- อย่าเก็บ auth state ใน `localStorage`
- อย่าเชื่อ `userId` หรือ `role` จาก client โดยไม่ verify จาก session
- อย่าเปิด seed endpoint แบบ public ใน production

---

## 15. Common File Locations

| ใช้สำหรับ | โฟลเดอร์ |
|-----------|----------|
| หน้าเว็บ | `app/` |
| API Routes | `app/api/` |
| Reusable UI | `components/` |
| React Context | `context/` |
| Models | `models/` |
| Type Definitions | `lib/types.ts` |
| DB Connection | `lib/mongodb.ts` |
| Auth Helpers | `lib/auth.ts` |
| Session Helpers | `lib/auth-session.ts` |
| Order Access Rules | `lib/order-access.ts` |
| Email Service (mocked) | `lib/email.ts` |
| Cloudinary Config | `lib/cloudinary.ts` |
| Tests | `tests/` |
| Static Assets | `public/` |

---

## 16. Quick Snippets

### Require Auth in API Route
```ts
import { requireAuth } from "@/lib/auth";

const auth = await requireAuth();
if (auth.response || !auth.user) {
  return auth.response!;
}
```

### Require Admin in API Route
```ts
import { requireAdmin } from "@/lib/auth";

const auth = await requireAdmin();
if (auth.response) {
  return auth.response;
}
```

### Standard Success Response
```ts
return NextResponse.json({ success: true, data: result });
```

### Upload Response
```ts
return NextResponse.json({
  success: true,
  data: { url: imageUrl },
});
```

---

*Last updated: May 9, 2026*
