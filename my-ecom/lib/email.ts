import nodemailer from "nodemailer";

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOTPEmail(to: string, otp: string): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"My E-com" <${process.env.EMAIL_USER}>`,
      to,
      subject: "🔐 รหัส OTP ยืนยันตัวตน - My E-com",
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px;">
          <div style="background: white; border-radius: 12px; padding: 32px; text-align: center;">
            <h1 style="color: #333; margin: 0 0 16px;">🔐 ยืนยันอีเมลของคุณ</h1>
            <p style="color: #666; margin: 0 0 24px;">กรุณาใช้รหัส OTP ด้านล่างเพื่อยืนยันตัวตน</p>
            <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 0 0 24px;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea;">${otp}</span>
            </div>
            <p style="color: #999; font-size: 14px; margin: 0;">รหัสนี้จะหมดอายุใน 5 นาที</p>
          </div>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return false;
  }
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Carrier info for display
const carrierInfo: Record<string, { name: string; trackingUrl: string }> = {
  kerry: { name: "Kerry Express", trackingUrl: "https://th.kerryexpress.com/th/track/?track=" },
  flash: { name: "Flash Express", trackingUrl: "https://flashexpress.com/tracking?se=" },
  jt: { name: "J&T Express", trackingUrl: "https://www.jtexpress.co.th/tracking?billcode=" },
  thaipost: { name: "ไปรษณีย์ไทย", trackingUrl: "https://track.thailandpost.co.th/?trackNumber=" },
  scg: { name: "SCG Express", trackingUrl: "https://www.scgexpress.co.th/tracking?tracking_no=" },
  other: { name: "ขนส่งอื่นๆ", trackingUrl: "" },
};

export function getCarrierInfo(carrier: string) {
  return carrierInfo[carrier] || carrierInfo.other;
}

interface ShippingEmailParams {
  to: string;
  customerName: string;
  orderId: string;
  trackingNumber: string;
  carrier: string;
  items: Array<{ name: string; quantity: number }>;
}

export async function sendShippingEmail(params: ShippingEmailParams): Promise<boolean> {
  const { to, customerName, orderId, trackingNumber, carrier, items } = params;
  const carrierData = getCarrierInfo(carrier);
  const trackingUrl = carrierData.trackingUrl ? `${carrierData.trackingUrl}${trackingNumber}` : "";

  const itemsList = items.map(item =>
    `<li style="margin-bottom: 4px;">${item.name} x${item.quantity}</li>`
  ).join("");

  try {
    await transporter.sendMail({
      from: `"KeyboardTH" <${process.env.EMAIL_USER}>`,
      to,
      subject: `🚚 พัสดุของคุณถูกจัดส่งแล้ว! - คำสั่งซื้อ #${orderId.slice(-8).toUpperCase()}`,
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); border-radius: 16px;">
          <div style="background: white; border-radius: 12px; padding: 32px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="font-size: 48px;">🚚</span>
              <h1 style="color: #333; margin: 16px 0 8px;">พัสดุของคุณถูกจัดส่งแล้ว!</h1>
              <p style="color: #666; margin: 0;">สวัสดีคุณ ${customerName}</p>
            </div>
            
            <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
              <p style="margin: 0 0 8px; color: #666; font-size: 14px;">หมายเลขพัสดุ</p>
              <p style="margin: 0; font-size: 24px; font-weight: bold; color: #8b5cf6; letter-spacing: 2px;">${trackingNumber}</p>
            </div>
            
            <div style="background: #f0f9ff; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
              <p style="margin: 0 0 4px; color: #666; font-size: 14px;">🏢 บริษัทขนส่ง</p>
              <p style="margin: 0; font-weight: 600; color: #0369a1;">${carrierData.name}</p>
            </div>
            
            ${trackingUrl ? `
            <a href="${trackingUrl}" target="_blank" style="display: block; text-align: center; background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: white; padding: 14px 24px; border-radius: 10px; text-decoration: none; font-weight: 600; margin-bottom: 20px;">
              📍 ติดตามพัสดุ
            </a>
            ` : ""}
            
            <div style="border-top: 1px solid #eee; padding-top: 20px;">
              <p style="margin: 0 0 8px; color: #666; font-size: 14px;">📦 รายการสินค้า</p>
              <ul style="margin: 0; padding-left: 20px; color: #333;">
                ${itemsList}
              </ul>
            </div>
            
            <p style="color: #999; font-size: 12px; margin-top: 24px; text-align: center;">
              คำสั่งซื้อ #${orderId.slice(-8).toUpperCase()}<br>
              ขอบคุณที่ใช้บริการ KeyboardTH 💜
            </p>
          </div>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("Error sending shipping email:", error);
    return false;
  }
}
