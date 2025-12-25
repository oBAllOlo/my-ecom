# KeyBoardTH - แพลตฟอร์ม E-commerce

แพลตฟอร์ม E-commerce สำหรับจำหน่ายคีย์บอร์ด Mechanical และ Gaming จากแบรนด์ชั้นนำทั่วโลก พร้อมฟีเจอร์ Custom Keyboard Builder

## 🚀 เทคโนโลยีที่ใช้

### Frontend Framework & Core

- **Next.js 16.0.10** - React Framework สำหรับ Production
  - App Router (App Directory)
  - Server Components และ Client Components
  - API Routes
  - Image Optimization
  - Standalone Output Mode
- **React 19.2.1** - UI Library
- **React DOM 19.2.1** - React Renderer

### Language & Type Safety

- **TypeScript 5** - Type-safe JavaScript
- **ESLint 9** - Code Linting
- **eslint-config-next 16.0.10** - การตั้งค่า ESLint สำหรับ Next.js

### Styling & UI

- **Tailwind CSS 3.4.19** - Utility-first CSS Framework
- **@tailwindcss/postcss 4** - PostCSS Plugin สำหรับ Tailwind
- **PostCSS 8.5.6** - เครื่องมือแปลง CSS
- **Autoprefixer 10.4.23** - เพิ่ม CSS Vendor Prefixes
- **Bootstrap 5.3.8** - UI Components เพิ่มเติม

### Database & ORM

- **MongoDB** - NoSQL Database
- **Mongoose 9.0.2** - MongoDB Object Modeling

### Authentication & Security

- **bcryptjs 3.0.3** - Password Hashing
- **@types/bcryptjs 2.4.6** - TypeScript Types

### Payment Gateway

- **Omise 1.1.0** - Payment Processing
  - ชำระด้วยบัตรเครดิต
  - Internet Banking

### File Upload & Media

- **Cloudinary 2.8.0** - Cloud Image & Video Management
  - อัปโหลดรูปภาพ
  - Image Optimization
  - CDN Delivery

### Email Service

- **Nodemailer 7.0.11** - Email Sending
- **@types/nodemailer 7.0.4** - TypeScript Types

### UI Components & Notifications

- **Sonner 2.0.7** - Toast Notification Library
- **Recharts 3.6.0** - Chart Library (สำหรับ Admin Dashboard)

### Development Tools

- **dotenv 17.2.3** - จัดการ Environment Variables
- **ts-node 10.9.2** - รัน TypeScript บน Node.js
- **@types/node 20.19.27** - TypeScript Types สำหรับ Node.js
- **@types/react 19** - TypeScript Types สำหรับ React
- **@types/react-dom 19** - TypeScript Types สำหรับ React DOM

## 📁 โครงสร้างโปรเจกต์

```
my-ecom/
├── app/                    # Next.js App Router
│   ├── admin/              # หน้า Admin Dashboard
│   │   ├── categories/     # จัดการหมวดหมู่
│   │   ├── custom-parts/   # จัดการชิ้นส่วนคีย์บอร์ด
│   │   ├── orders/         # จัดการคำสั่งซื้อ
│   │   ├── products/       # จัดการสินค้า
│   │   └── users/          # จัดการผู้ใช้
│   ├── api/                # API Routes
│   │   ├── auth/           # API สำหรับ Authentication
│   │   ├── categories/     # API สำหรับหมวดหมู่
│   │   ├── custom-parts/   # API สำหรับชิ้นส่วนคีย์บอร์ด
│   │   ├── orders/         # API สำหรับคำสั่งซื้อ
│   │   ├── payment/        # API สำหรับการชำระเงิน (Omise)
│   │   ├── products/       # API สำหรับสินค้า
│   │   ├── reviews/        # API สำหรับรีวิว
│   │   └── users/          # API สำหรับผู้ใช้
│   ├── cart/               # หน้าตะกร้าสินค้า
│   ├── checkout/           # หน้าชำระเงิน
│   ├── custom/             # หน้าสร้างคีย์บอร์ด Custom
│   ├── login/              # หน้าเข้าสู่ระบบ
│   ├── orders/             # หน้าคำสั่งซื้อของผู้ใช้
│   ├── products/           # หน้ารายการสินค้าและรายละเอียด
│   ├── profile/            # หน้าโปรไฟล์ผู้ใช้
│   ├── register/           # หน้าสมัครสมาชิก
│   ├── tracking/           # หน้าติดตามคำสั่งซื้อ
│   └── verify/             # หน้ายืนยันอีเมล
├── components/             # React Components
│   ├── CartItem.tsx
│   ├── ConfirmModal.tsx
│   ├── Footer.tsx
│   ├── Header.tsx
│   └── ProductCard.tsx
├── context/               # React Context Providers
│   ├── AuthContext.tsx    # Context สำหรับ Authentication
│   └── CartContext.tsx    # Context สำหรับตะกร้าสินค้า
├── lib/                   # Utility Libraries
│   ├── cloudinary.ts      # การตั้งค่า Cloudinary
│   ├── email.ts           # บริการส่งอีเมล
│   ├── mongodb.ts         # การเชื่อมต่อ MongoDB
│   ├── omise.ts           # การตั้งค่า Omise Payment
│   ├── shippingConfig.ts  # การตั้งค่าการจัดส่ง
│   └── types.ts           # TypeScript Types
├── models/                # Mongoose Models
│   ├── Category.ts
│   ├── CustomPart.ts
│   ├── Order.ts
│   ├── OTP.ts
│   ├── Product.ts
│   ├── Review.ts
│   ├── Settings.ts
│   └── User.ts
└── public/                # Static Assets
    └── audio/             # เสียง Switch
```

## ✨ ฟีเจอร์

### ฟีเจอร์สำหรับผู้ใช้

- 🔐 **ระบบ Authentication**

  - สมัครสมาชิกพร้อมยืนยันอีเมล (OTP)
  - เข้าสู่ระบบ/ออกจากระบบ
  - เปลี่ยนรหัสผ่าน
  - จัดการ Session

- 🛍️ **ฟีเจอร์ E-commerce**

  - ดูสินค้าและค้นหา
  - กรองตามหมวดหมู่
  - ดูรายละเอียดสินค้า
  - ตะกร้าสินค้า
  - กระบวนการชำระเงิน
  - จัดการคำสั่งซื้อ
  - ติดตามคำสั่งซื้อ

- 🛠️ **Custom Keyboard Builder**

  - สร้างคีย์บอร์ด Custom แบบ Interactive
  - เลือกชิ้นส่วน (Base, Switch, Keycaps, Wire)
  - คำนวณราคาแบบ Real-time
  - ฟังเสียง Switch
  - ดูตัวอย่างภาพ

- 💳 **การชำระเงิน**

  - ชำระด้วยบัตรเครดิต (Omise)
  - Internet Banking
  - ติดตามสถานะการชำระเงิน

- 👤 **โปรไฟล์ผู้ใช้**
  - จัดการโปรไฟล์
  - จัดการที่อยู่
  - ประวัติคำสั่งซื้อ
  - เปลี่ยนรหัสผ่าน

### ฟีเจอร์สำหรับ Admin

- 📊 **Dashboard**

  - สถิติการขาย
  - จัดการคำสั่งซื้อ
  - จัดการสินค้า
  - จัดการหมวดหมู่
  - จัดการผู้ใช้
  - จัดการชิ้นส่วนคีย์บอร์ด

- 📦 **การจัดการคำสั่งซื้อ**
  - อัปเดตสถานะคำสั่งซื้อ
  - จัดการการจัดส่ง
  - จัดการหมายเลขพัสดุ
  - ส่งอีเมลแจ้งเตือน

## 🛠️ เริ่มต้นใช้งาน

### สิ่งที่ต้องมี

- Node.js 20.x หรือสูงกว่า
- MongoDB Database
- บัญชี Cloudinary (สำหรับอัปโหลดรูปภาพ)
- บัญชี Omise (สำหรับการชำระเงิน)
- บริการ Email (SMTP) สำหรับ OTP

### การติดตั้ง

1. **Clone repository**

```bash
git clone <repository-url>
cd my-ecom/my-ecom
```

2. **ติดตั้ง dependencies**

```bash
npm install
# หรือ
yarn install
# หรือ
pnpm install
```

3. **ตั้งค่า environment variables**

สร้างไฟล์ `.env.local` ในโฟลเดอร์ root:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/keyboardth
# หรือ
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/keyboardth

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Omise Payment
OMISE_PUBLIC_KEY=your_omise_public_key
OMISE_SECRET_KEY=your_omise_secret_key

# Email Service (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@keyboardth.com

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **รัน development server**

```bash
npm run dev
# หรือ
yarn dev
# หรือ
pnpm dev
```

5. **เปิดเบราว์เซอร์**
   ไปที่ [http://localhost:3000](http://localhost:3000)

### Seed Database (ไม่บังคับ)

เพื่อเพิ่มข้อมูลตัวอย่างในฐานข้อมูล:

```bash
# ส่ง POST request ไปที่ /api/seed
# สามารถใช้ curl, Postman, หรือ API client อื่นๆ
curl -X POST http://localhost:3000/api/seed
```

จะสร้างข้อมูล:

- สินค้าตัวอย่าง
- หมวดหมู่ตัวอย่าง
- ผู้ใช้ Admin (admin@keyboardth.com / admin123)
- ผู้ใช้ทดสอบ (user@keyboardth.com / user123)

## 📜 คำสั่งที่ใช้ได้

- `npm run dev` - เริ่ม development server
- `npm run build` - Build สำหรับ production
- `npm run start` - เริ่ม production server
- `npm run lint` - รัน ESLint

## 🏗️ Build & Deployment

### Build สำหรับ Production

```bash
npm run build
```

ผลลัพธ์การ build จะอยู่ในโฟลเดอร์ `.next` พร้อม standalone mode เพื่อการ deploy ที่ดีที่สุด

### Deploy บน Vercel

1. Push โค้ดไปที่ GitHub
2. Import repository ใน Vercel
3. เพิ่ม environment variables ใน Vercel dashboard
4. Deploy!

วิธีที่ง่ายที่สุดคือใช้ [Vercel Platform](https://vercel.com/new) จากผู้สร้าง Next.js

## 🔧 การตั้งค่า

### Next.js Configuration

โปรเจกต์ใช้ standalone output mode เพื่อลดขนาด bundle และใช้ memory น้อยลง:

```typescript
// next.config.ts
output: "standalone";
```

### Image Optimization

Remote image patterns ถูกตั้งค่าสำหรับ:

- Unsplash (images.unsplash.com)
- Cloudinary (res.cloudinary.com)

### Memory Optimization

Webpack memory optimizations ถูกเปิดใช้งานเพื่อประสิทธิภาพการ build ที่ดีขึ้น

## 📚 เรียนรู้เพิ่มเติม

- [Next.js Documentation](https://nextjs.org/docs) - เรียนรู้เกี่ยวกับ Next.js features และ API
- [React Documentation](https://react.dev) - เรียนรู้ React
- [Mongoose Documentation](https://mongoosejs.com) - เรียนรู้ Mongoose
- [Tailwind CSS Documentation](https://tailwindcss.com) - เรียนรู้ Tailwind CSS
- [Omise Documentation](https://www.omise.co/docs) - เรียนรู้ Omise Payment Integration

## 📝 สิทธิ์การใช้งาน

โปรเจกต์นี้เป็นโปรเจกต์ส่วนตัวและเป็นกรรมสิทธิ์

## 👥 ผู้พัฒนา

- Development Team

---

**KeyBoardTH** - คีย์บอร์ดคุณภาพ บริการคุณภาพ 🎹
