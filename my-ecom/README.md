# 🎹 Custom Keyboard System | ระบบเว็บแอปพลิเคชันสำหรับการปรับแต่งและสั่งซื้อคีย์บอร์ดคอมพิวเตอร์

<p align="center">
  <strong>ระบบ E-commerce สำหรับการปรับแต่งและสั่งซื้อคีย์บอร์ดคอมพิวเตอร์ พร้อมฟีเจอร์ Custom Keyboard Builder</strong>
</p>

---

## 📋 สารบัญ

- [เทคโนโลยีที่ใช้](#-เทคโนโลยีที่ใช้)
- [โครงสร้างโปรเจกต์](#-โครงสร้างโปรเจกต์)
- [ฟีเจอร์](#-ฟีเจอร์)
- [เริ่มต้นใช้งาน](#-เริ่มต้นใช้งาน)
- [คำสั่งที่ใช้ได้](#-คำสั่งที่ใช้ได้)
- [Build & Deployment](#-build--deployment)
- [การตั้งค่า](#-การตั้งค่า)
- [เรียนรู้เพิ่มเติม](#-เรียนรู้เพิ่มเติม)

---

## 🚀 เทคโนโลยีที่ใช้

### 📦 Frontend Framework & Core

| เทคโนโลยี     | เวอร์ชัน  | คำอธิบาย                              |
| ------------- | --------- | ------------------------------------- |
| **Next.js**   | `16.0.10` | React Framework สำหรับ Production     |
| **React**     | `19.2.1`  | UI Library สำหรับสร้าง User Interface |
| **React DOM** | `19.2.1`  | React Renderer สำหรับ DOM             |

**คุณสมบัติ Next.js ที่ใช้:**

- ✅ **App Router** (App Directory) - ระบบ routing ใหม่แบบ nested layouts
- ✅ **Server Components & Client Components** - แยก logic ฝั่ง server และ client
- ✅ **API Routes** - สร้าง API endpoints ภายในโปรเจกต์
- ✅ **Image Optimization** - optimize รูปภาพอัตโนมัติ
- ✅ **Standalone Output Mode** - สร้าง production build ที่มีขนาดเล็ก

---

### 🔷 Language & Type Safety

| เทคโนโลยี              | เวอร์ชัน  | คำอธิบาย                          |
| ---------------------- | --------- | --------------------------------- |
| **TypeScript**         | `^5`      | ภาษา JavaScript ที่มี Type Safety |
| **ESLint**             | `^9`      | เครื่องมือตรวจสอบคุณภาพโค้ด       |
| **eslint-config-next** | `16.0.10` | การตั้งค่า ESLint สำหรับ Next.js  |

**ประโยชน์ของ TypeScript:**

- 🛡️ ตรวจจับ error ตั้งแต่ตอน compile
- 📝 IntelliSense และ autocomplete ที่ดีขึ้น
- 📚 เป็น documentation ในตัว
- 🔄 refactor โค้ดได้ง่ายขึ้น

---

### 🎨 Styling & UI

| เทคโนโลยี                | เวอร์ชัน   | คำอธิบาย                            |
| ------------------------ | ---------- | ----------------------------------- |
| **Tailwind CSS**         | `^3.4.19`  | Utility-first CSS Framework         |
| **@tailwindcss/postcss** | `^4`       | PostCSS Plugin สำหรับ Tailwind      |
| **PostCSS**              | `^8.5.6`   | เครื่องมือแปลง CSS                  |
| **Autoprefixer**         | `^10.4.23` | เพิ่ม CSS Vendor Prefixes อัตโนมัติ |
| **Bootstrap**            | `^5.3.8`   | UI Components เพิ่มเติม             |

**คุณสมบัติการ Styling:**

- 🎯 Utility classes สำหรับ rapid development
- 📱 Responsive design ในตัว
- 🌙 รองรับ Dark mode
- ⚡ PurgeCSS สำหรับ production build ที่เล็ก

---

### 🗄️ Database & ORM

| เทคโนโลยี    | เวอร์ชัน | คำอธิบาย                             |
| ------------ | -------- | ------------------------------------ |
| **MongoDB**  | -        | NoSQL Database แบบ Document-based    |
| **Mongoose** | `^9.0.2` | MongoDB Object Document Mapper (ODM) |

**โครงสร้างฐานข้อมูล:**

```
📁 Models
├── 👤 User          - ข้อมูลผู้ใช้งาน (ชื่อ, อีเมล, password, ที่อยู่, role)
├── 📦 Product       - ข้อมูลสินค้า (ชื่อ, ราคา, รูปภาพ, หมวดหมู่, stock)
├── 📁 Category      - หมวดหมู่สินค้า
├── 🛒 Order         - คำสั่งซื้อ (สินค้า, สถานะ, การชำระเงิน, การจัดส่ง)
├── 🔧 CustomPart    - ชิ้นส่วนสำหรับ Custom Keyboard
├── ⭐ Review        - รีวิวสินค้า
├── 🔑 OTP           - รหัส OTP สำหรับยืนยันตัวตน
└── ⚙️ Settings      - การตั้งค่าระบบ
```

---

### 🔐 Authentication & Security

| เทคโนโลยี           | เวอร์ชัน | คำอธิบาย                              |
| ------------------- | -------- | ------------------------------------- |
| **bcryptjs**        | `^3.0.3` | การเข้ารหัส Password แบบ one-way hash |
| **@types/bcryptjs** | `^2.4.6` | TypeScript Types                      |

**ระบบ Authentication:**

- 🔒 Password hashing ด้วย bcrypt (salt rounds = 10)
- 📧 Email verification ด้วย OTP
- 🍪 Session management ด้วย cookies
- 🛡️ Role-based access control (User/Admin)

---

### 💳 Payment Gateway

| เทคโนโลยี | เวอร์ชัน | คำอธิบาย                        |
| --------- | -------- | ------------------------------- |
| **Omise** | `^1.1.0` | Payment Gateway สำหรับประเทศไทย |

**ช่องทางการชำระเงินที่รองรับ:**

- 💳 **Credit Card** - Visa, Mastercard, JCB
- 🏦 **Internet Banking** - ธนาคารต่างๆ ในประเทศไทย
- ✅ **Real-time** payment status updates

---

### ☁️ File Upload & Media

| เทคโนโลยี      | เวอร์ชัน | คำอธิบาย                       |
| -------------- | -------- | ------------------------------ |
| **Cloudinary** | `^2.8.0` | Cloud Image & Video Management |

**คุณสมบัติ:**

- 📤 อัปโหลดรูปภาพสินค้า
- 🖼️ Automatic image optimization (`f_auto`, `q_auto`)
- 🌐 CDN Delivery ทั่วโลก
- 📐 Dynamic resize และ crop

---

### 📧 Email Service

| เทคโนโลยี             | เวอร์ชัน  | คำอธิบาย              |
| --------------------- | --------- | --------------------- |
| **Nodemailer**        | `^7.0.11` | Email Sending Library |
| **@types/nodemailer** | `^7.0.4`  | TypeScript Types      |

**ประเภทอีเมลที่ส่ง:**

- ✉️ OTP สำหรับยืนยันอีเมล
- 📦 แจ้งเตือนคำสั่งซื้อใหม่
- 🚚 แจ้งเตือนสถานะการจัดส่ง
- 📋 หมายเลขพัสดุ

---

### 🔔 UI Components & Notifications

| เทคโนโลยี    | เวอร์ชัน | คำอธิบาย                             |
| ------------ | -------- | ------------------------------------ |
| **Sonner**   | `^2.0.7` | Toast Notification Library           |
| **Recharts** | `^3.6.0` | Chart Library สำหรับ Admin Dashboard |

---

### 🛠️ Development Tools

| เทคโนโลยี            | เวอร์ชัน    | คำอธิบาย                          |
| -------------------- | ----------- | --------------------------------- |
| **dotenv**           | `^17.2.3`   | จัดการ Environment Variables      |
| **ts-node**          | `^10.9.2`   | รัน TypeScript บน Node.js โดยตรง  |
| **@types/node**      | `^20.19.27` | TypeScript Types สำหรับ Node.js   |
| **@types/react**     | `^19`       | TypeScript Types สำหรับ React     |
| **@types/react-dom** | `^19`       | TypeScript Types สำหรับ React DOM |

---

## 📁 โครงสร้างโปรเจกต์

```
my-ecom/
├── 📂 app/                      # Next.js App Router
│   ├── 📂 admin/                # หน้า Admin Dashboard
│   │   ├── categories/          # จัดการหมวดหมู่
│   │   ├── custom-parts/        # จัดการชิ้นส่วนคีย์บอร์ด
│   │   ├── orders/              # จัดการคำสั่งซื้อ
│   │   ├── products/            # จัดการสินค้า
│   │   └── users/               # จัดการผู้ใช้
│   │
│   ├── 📂 api/                  # API Routes
│   │   ├── auth/                # API Authentication (login, register, logout, verify)
│   │   ├── categories/          # CRUD หมวดหมู่
│   │   ├── cron/                # Scheduled Tasks (auto cleanup)
│   │   ├── custom-parts/        # CRUD ชิ้นส่วนคีย์บอร์ด + seed
│   │   ├── orders/              # CRUD คำสั่งซื้อ + tracking
│   │   ├── payment/             # Omise Payment Integration + webhooks
│   │   ├── products/            # CRUD สินค้า
│   │   ├── reviews/             # CRUD รีวิว
│   │   ├── seed/                # Database Seeding
│   │   ├── settings/            # ตั้งค่าระบบ (shipping, etc.)
│   │   ├── upload/              # อัปโหลดรูปภาพ (Cloudinary)
│   │   └── users/               # CRUD ผู้ใช้ + profile
│   │
│   ├── 📂 cart/                 # หน้าตะกร้าสินค้า
│   ├── 📂 checkout/             # หน้าชำระเงิน
│   ├── 📂 custom/               # หน้าสร้างคีย์บอร์ด Custom
│   ├── 📂 login/                # หน้าเข้าสู่ระบบ
│   ├── 📂 orders/               # หน้าประวัติคำสั่งซื้อ
│   ├── 📂 products/             # หน้ารายการสินค้าและรายละเอียด
│   ├── 📂 profile/              # หน้าโปรไฟล์ผู้ใช้
│   ├── 📂 register/             # หน้าสมัครสมาชิก
│   ├── 📂 tracking/             # หน้าติดตามคำสั่งซื้อ
│   ├── 📂 verify/               # หน้ายืนยันอีเมล OTP
│   │
│   ├── globals.css              # Global CSS Styles
│   ├── layout.tsx               # Root Layout
│   ├── page.tsx                 # หน้าแรก (Home Page)
│   └── favicon.ico              # ไอคอนเว็บไซต์
│
├── 📂 components/               # React Components ที่ใช้ซ้ำ
│   ├── CartItem.tsx             # Component แสดงสินค้าในตะกร้า
│   ├── ConfirmModal.tsx         # Modal ยืนยันการกระทำ
│   ├── Header.tsx               # Navbar และเมนูหลัก
│   └── ProductCard.tsx          # Card แสดงสินค้า
│
├── 📂 context/                  # React Context Providers
│   ├── AuthContext.tsx          # จัดการ state การ login/logout
│   └── CartContext.tsx          # จัดการ state ตะกร้าสินค้า
│
├── 📂 lib/                      # Utility Libraries
│   ├── cloudinary.ts            # การตั้งค่าและ helpers Cloudinary
│   ├── email.ts                 # บริการส่งอีเมล (OTP, แจ้งเตือน)
│   ├── mockData.ts              # ข้อมูลตัวอย่างสำหรับ development
│   ├── mongodb.ts               # การเชื่อมต่อ MongoDB
│   ├── omise.ts                 # การตั้งค่า Omise Payment
│   ├── shippingConfig.ts        # การตั้งค่าค่าจัดส่ง
│   └── types.ts                 # TypeScript Type Definitions
│
├── 📂 models/                   # Mongoose Models
│   ├── Category.ts              # Schema หมวดหมู่
│   ├── CustomPart.ts            # Schema ชิ้นส่วนคีย์บอร์ด
│   ├── Order.ts                 # Schema คำสั่งซื้อ
│   ├── OTP.ts                   # Schema รหัส OTP
│   ├── Product.ts               # Schema สินค้า
│   ├── Review.ts                # Schema รีวิว
│   ├── Settings.ts              # Schema การตั้งค่า
│   ├── User.ts                  # Schema ผู้ใช้
│   └── index.ts                 # Export รวม Models
│
├── 📂 public/                   # Static Assets
│   ├── audio/                   # เสียง Switch สำหรับ Custom Builder
│   └── ...                      # รูปภาพและไฟล์อื่นๆ
│
├── 📄 .env.local                # Environment Variables (ไม่อยู่ใน git)
├── 📄 .gitignore                # ไฟล์ที่ไม่ต้อง track ใน git
├── 📄 cloudinary-urls.json      # รายการ URL รูปภาพบน Cloudinary
├── 📄 data_dictionary.md        # คำอธิบายโครงสร้างข้อมูล
├── 📄 eslint.config.mjs         # การตั้งค่า ESLint
├── 📄 next.config.ts            # การตั้งค่า Next.js
├── 📄 package.json              # Dependencies และ scripts
├── 📄 postcss.config.mjs        # การตั้งค่า PostCSS
├── 📄 seed-urls.json            # URL รูปภาพสำหรับ Database Seeding
├── 📄 tailwind.config.js        # การตั้งค่า Tailwind CSS
└── 📄 tsconfig.json             # การตั้งค่า TypeScript
```

---

## ✨ ฟีเจอร์

### 👤 ฟีเจอร์สำหรับผู้ใช้

#### 🔐 ระบบ Authentication

| ฟีเจอร์         | คำอธิบาย                                 |
| --------------- | ---------------------------------------- |
| สมัครสมาชิก     | ลงทะเบียนพร้อมยืนยันอีเมลด้วย OTP 6 หลัก |
| เข้าสู่ระบบ     | Login ด้วยอีเมลและรหัสผ่าน               |
| ออกจากระบบ      | Logout และล้าง session                   |
| เปลี่ยนรหัสผ่าน | Reset password                           |
| จัดการ Session  | Cookie-based session management          |

#### 🛍️ ฟีเจอร์ E-commerce

| ฟีเจอร์           | คำอธิบาย                           |
| ----------------- | ---------------------------------- |
| ดูสินค้า          | แสดงรายการสินค้าพร้อมรูปภาพและราคา |
| ค้นหาสินค้า       | ค้นหาด้วยชื่อหรือคำอธิบาย          |
| กรองตามหมวดหมู่   | เลือกดูสินค้าตามประเภท             |
| รายละเอียดสินค้า  | ดูข้อมูลครบถ้วนพร้อมรีวิว          |
| ตะกร้าสินค้า      | เพิ่ม/ลบ/แก้ไขจำนวนสินค้า          |
| Checkout          | กระบวนการชำระเงินครบวงจร           |
| ประวัติคำสั่งซื้อ | ดูคำสั่งซื้อทั้งหมด                |
| ติดตามคำสั่งซื้อ  | ติดตามสถานะและหมายเลขพัสดุ         |

#### 🛠️ Custom Keyboard Builder

| ฟีเจอร์             | คำอธิบาย                      |
| ------------------- | ----------------------------- |
| เลือกชิ้นส่วน       | Base, Switch, Keycaps, Wire   |
| ฟังเสียง Switch     | ทดสอบเสียงก่อนตัดสินใจ        |
| ดูตัวอย่างภาพ       | แสดงภาพชิ้นส่วนที่เลือก       |
| คำนวณราคา Real-time | แสดงราคารวมทันที              |
| เพิ่มใส่ตะกร้า      | บันทึก Custom Build ใส่ตะกร้า |

#### 💳 การชำระเงิน

| ช่องทาง          | คำอธิบาย               |
| ---------------- | ---------------------- |
| Credit Card      | Visa, Mastercard, JCB  |
| Internet Banking | ธนาคารในประเทศไทย      |
| Payment Status   | ติดตามสถานะการชำระเงิน |

#### 👤 โปรไฟล์ผู้ใช้

| ฟีเจอร์           | คำอธิบาย                   |
| ----------------- | -------------------------- |
| จัดการโปรไฟล์     | แก้ไขชื่อ, อีเมล, เบอร์โทร |
| จัดการที่อยู่     | เพิ่ม/แก้ไขที่อยู่จัดส่ง   |
| ประวัติคำสั่งซื้อ | ดูคำสั่งซื้อทั้งหมด        |
| เปลี่ยนรหัสผ่าน   | เปลี่ยน password ใหม่      |

---

### 🔧 ฟีเจอร์สำหรับ Admin

#### 📊 Dashboard

| ฟีเจอร์        | คำอธิบาย                             |
| -------------- | ------------------------------------ |
| สถิติการขาย    | กราฟแสดงยอดขาย (Recharts)            |
| สรุปคำสั่งซื้อ | จำนวน pending, processing, completed |
| จัดการสินค้า   | CRUD สินค้าพร้อมอัปโหลดรูป           |
| จัดการหมวดหมู่ | CRUD หมวดหมู่สินค้า                  |
| จัดการผู้ใช้   | ดูและจัดการบัญชีผู้ใช้               |
| จัดการชิ้นส่วน | CRUD ชิ้นส่วน Custom Keyboard        |

#### 📦 การจัดการคำสั่งซื้อ

| ฟีเจอร์           | คำอธิบาย                                   |
| ----------------- | ------------------------------------------ |
| อัปเดตสถานะ       | Pending → Processing → Shipped → Delivered |
| หมายเลขพัสดุ      | ใส่ tracking number                        |
| ส่งอีเมลแจ้งเตือน | แจ้งลูกค้าอัตโนมัติ                        |
| ดูรายละเอียด      | ข้อมูลครบถ้วนของออเดอร์                    |

---

## 🛠️ เริ่มต้นใช้งาน

### 📋 สิ่งที่ต้องมี

| รายการ         | รายละเอียด                  |
| -------------- | --------------------------- |
| **Node.js**    | เวอร์ชัน 20.x หรือสูงกว่า   |
| **MongoDB**    | Local หรือ MongoDB Atlas    |
| **Cloudinary** | สำหรับจัดเก็บรูปภาพ         |
| **Omise**      | สำหรับระบบชำระเงิน          |
| **SMTP Email** | สำหรับส่ง OTP (Gmail, etc.) |

### 📥 การติดตั้ง

#### 1. Clone repository

```bash
git clone <repository-url>
cd my-ecom/my-ecom
```

#### 2. ติดตั้ง dependencies

```bash
npm install
# หรือ
yarn install
# หรือ
pnpm install
```

#### 3. ตั้งค่า environment variables

สร้างไฟล์ `.env.local` ในโฟลเดอร์ root:

```env
# ==========================================
# Database
# ==========================================
MONGODB_URI=mongodb://localhost:27017/keyboardth
# หรือใช้ MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/keyboardth

# ==========================================
# Cloudinary (Image Upload)
# ==========================================
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ==========================================
# Omise Payment Gateway
# ==========================================
OMISE_PUBLIC_KEY=pkey_test_xxxxxxxxxxxxx
OMISE_SECRET_KEY=skey_test_xxxxxxxxxxxxx

# ==========================================
# Email Service (Nodemailer)
# ==========================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@keyboardth.com

# ==========================================
# App Configuration
# ==========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 4. รัน development server

```bash
npm run dev
```

#### 5. เปิดเบราว์เซอร์

ไปที่ [http://localhost:3000](http://localhost:3000)

---

### 🌱 Seed Database (ไม่บังคับ)

เพื่อเพิ่มข้อมูลตัวอย่างในฐานข้อมูล:

```bash
# Seed ชิ้นส่วน Custom Parts
curl -X POST http://localhost:3000/api/custom-parts/seed

# Seed ข้อมูลทั้งหมด
curl -X POST http://localhost:3000/api/seed
```

**ข้อมูลที่จะถูก seed:**

- ✅ สินค้าตัวอย่าง
- ✅ หมวดหมู่ตัวอย่าง
- ✅ ชิ้นส่วน Custom Keyboard
- ✅ ผู้ใช้ Admin: `admin@keyboardth.com` / `admin123`
- ✅ ผู้ใช้ทดสอบ: `user@keyboardth.com` / `user123`

---

## 📜 คำสั่งที่ใช้ได้

| คำสั่ง          | คำอธิบาย                                  |
| --------------- | ----------------------------------------- |
| `npm run dev`   | เริ่ม development server พร้อม hot reload |
| `npm run build` | Build สำหรับ production                   |
| `npm run start` | เริ่ม production server                   |
| `npm run lint`  | รัน ESLint ตรวจสอบโค้ด                    |

---

## 🏗️ Build & Deployment

### 🔨 Build สำหรับ Production

```bash
npm run build
```

ผลลัพธ์การ build จะอยู่ในโฟลเดอร์ `.next` พร้อม **standalone mode** เพื่อการ deploy ที่มีประสิทธิภาพ

### 🚀 Deploy บน Vercel

1. Push โค้ดไปที่ GitHub/GitLab
2. Import repository ใน [Vercel](https://vercel.com/new)
3. เพิ่ม environment variables ใน Vercel Dashboard
4. Deploy! ✨

> 💡 **แนะนำ:** Vercel เป็น platform ที่สร้างมาสำหรับ Next.js โดยเฉพาะ

### 🐳 Deploy ด้วย Docker (ตัวเลือก)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 🔧 การตั้งค่า

### Next.js Configuration

```typescript
// next.config.ts
const nextConfig = {
  output: "standalone", // ลดขนาด bundle, ใช้ memory น้อยลง
  images: {
    remotePatterns: [
      { hostname: "images.unsplash.com" },
      { hostname: "res.cloudinary.com" },
    ],
  },
};
```

### Tailwind CSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // Custom colors, fonts, etc.
    },
  },
};
```

---

## 📚 เรียนรู้เพิ่มเติม

| Resource                      | ลิงก์                                                                |
| ----------------------------- | -------------------------------------------------------------------- |
| 📖 Next.js Documentation      | [nextjs.org/docs](https://nextjs.org/docs)                           |
| ⚛️ React Documentation        | [react.dev](https://react.dev)                                       |
| 🍃 Mongoose Documentation     | [mongoosejs.com](https://mongoosejs.com)                             |
| 🎨 Tailwind CSS Documentation | [tailwindcss.com](https://tailwindcss.com)                           |
| 💳 Omise Documentation        | [omise.co/docs](https://www.omise.co/docs)                           |
| ☁️ Cloudinary Documentation   | [cloudinary.com/documentation](https://cloudinary.com/documentation) |
| 📧 Nodemailer Documentation   | [nodemailer.com](https://nodemailer.com)                             |

---

## 📝 สิทธิ์การใช้งาน

โปรเจกต์นี้เป็นโปรเจกต์ส่วนตัวและเป็นกรรมสิทธิ์

---

## 👥 ผู้พัฒนา

- 🧑‍💻 Development Team

---

<p align="center">
  <strong>⌨️ Custom Keyboard System</strong><br>
  <em>ระบบเว็บแอปพลิเคชันสำหรับการปรับแต่งและสั่งซื้อคีย์บอร์ดคอมพิวเตอร์</em>
</p>

<p align="center">
  <sub>อัปเดตล่าสุด: 26 ธันวาคม 2568</sub>
</p>
