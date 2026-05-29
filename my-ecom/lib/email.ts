// Email delivery via nodemailer (Gmail SMTP).
//
// Real email is sent ONLY when EMAIL_USER and EMAIL_PASS are both set in the
// environment. If they are missing, we fall back to DEMO MODE: the email is
// skipped, the OTP is logged to the server console, and the register/resend
// APIs return the OTP as `devOtp` so the flow stays usable without SMTP.
import nodemailer, { type Transporter } from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// When true, emails are actually sent and `devOtp` must NOT be exposed by APIs.
export const isEmailConfigured = Boolean(EMAIL_USER && EMAIL_PASS);

const BRAND = "Custom Keyboard System";
const ACCENT = "#4f46e5"; // indigo
const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans Thai','Sukhumvit Set',sans-serif";

let transporter: Transporter | null = null;
function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });
  }
  return transporter;
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Shared branded wrapper: gradient header + white card + footer.
// `inner` is the card body content (already padded by the caller's needs).
function emailShell(inner: string): string {
  const year = new Date().getFullYear();
  return `
  <div style="background:#eef0f5;margin:0;padding:40px 12px;font-family:${FONT};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;margin:0 auto;">
      <tr><td style="padding:0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 12px 32px rgba(15,23,42,0.10);">
          <tr>
            <td style="background-color:${ACCENT};background-image:linear-gradient(135deg,#818cf8 0%,#4f46e5 55%,#4338ca 100%);padding:30px 32px;text-align:center;">
              <div style="font-size:34px;line-height:1;">⌨️</div>
              <div style="margin-top:8px;color:#ffffff;font-size:17px;font-weight:700;letter-spacing:0.3px;">${BRAND}</div>
            </td>
          </tr>
          <tr><td style="padding:34px 30px 30px;">${inner}</td></tr>
        </table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="padding:18px 16px 0;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.6;">© ${year} ${BRAND} · อีเมลฉบับนี้ส่งโดยอัตโนมัติ กรุณาอย่าตอบกลับ</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </div>`;
}

type OTPPurpose = "verify" | "reset";

const OTP_COPY: Record<
  OTPPurpose,
  { subject: string; icon: string; heading: string; body: string; footer: string }
> = {
  verify: {
    subject: "รหัสยืนยัน OTP ของคุณคือ",
    icon: "✉️",
    heading: "ยืนยันอีเมลของคุณ",
    body: "ใช้รหัส OTP ด้านล่างเพื่อยืนยันอีเมลและเปิดใช้งานบัญชีของคุณ",
    footer: "หากคุณไม่ได้เป็นผู้ดำเนินการสมัครสมาชิก สามารถเพิกเฉยต่ออีเมลฉบับนี้ได้",
  },
  reset: {
    subject: "รหัสรีเซ็ตรหัสผ่านของคุณคือ",
    icon: "🔐",
    heading: "รีเซ็ตรหัสผ่านของคุณ",
    body: "เราได้รับคำขอรีเซ็ตรหัสผ่าน ใช้รหัส OTP ด้านล่างเพื่อตั้งรหัสผ่านใหม่",
    footer: "หากคุณไม่ได้ร้องขอการรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลฉบับนี้ รหัสผ่านของคุณจะไม่ถูกเปลี่ยน",
  },
};

function otpEmailHtml(otp: string, copy: (typeof OTP_COPY)[OTPPurpose]): string {
  const digitCells = otp
    .split("")
    .map(
      (d) =>
        `<td style="padding:0 4px;"><div style="width:40px;height:50px;line-height:50px;background:#eef2ff;border:1px solid #c7d2fe;border-radius:10px;color:${ACCENT};font-size:22px;font-weight:700;text-align:center;">${d}</div></td>`
    )
    .join("");

  const inner = `
    <h1 style="margin:0 0 10px;color:#0f172a;font-size:21px;font-weight:700;text-align:center;">${copy.icon} ${copy.heading}</h1>
    <p style="margin:0 auto 26px;color:#64748b;font-size:14px;line-height:1.7;text-align:center;max-width:360px;">${copy.body}</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;"><tr>${digitCells}</tr></table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding-top:20px;">
      <span style="display:inline-block;background:#fef3c7;color:#92400e;font-size:12px;font-weight:600;padding:7px 16px;border-radius:999px;">⏱ หมดอายุภายใน 5 นาที</span>
    </td></tr></table>
    <div style="border-top:1px solid #eef0f5;margin:28px 0 0;"></div>
    <p style="margin:18px 0 0;color:#94a3b8;font-size:12px;line-height:1.6;text-align:center;">${copy.footer}</p>`;

  return emailShell(inner);
}

export async function sendOTPEmail(
  to: string,
  otp: string,
  purpose: OTPPurpose = "verify"
): Promise<boolean> {
  if (!isEmailConfigured) {
    console.log(`📧 [DEMO] OTP email skipped (${purpose}). To: ${to} | OTP: ${otp}`);
    return true;
  }

  const copy = OTP_COPY[purpose];
  try {
    await getTransporter().sendMail({
      from: `"${BRAND}" <${EMAIL_USER}>`,
      to,
      subject: `${copy.subject} ${otp}`,
      text: `รหัส OTP ของคุณคือ ${otp} (หมดอายุภายใน 5 นาที)`,
      html: otpEmailHtml(otp, copy),
    });
    console.log(`📧 OTP email sent to ${to} (${purpose})`);
    return true;
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    return false;
  }
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

function shippingEmailHtml(params: ShippingEmailParams): string {
  const { customerName, orderId, trackingNumber, carrier, items } = params;
  const info = getCarrierInfo(carrier);
  const shortId = orderId.slice(-8).toUpperCase();
  const trackLink = info.trackingUrl ? `${info.trackingUrl}${trackingNumber}` : "";
  const itemRows = items
    .map(
      (i) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#334155;font-size:14px;">${i.name}</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#94a3b8;font-size:14px;text-align:right;white-space:nowrap;">x${i.quantity}</td></tr>`
    )
    .join("");

  const button = trackLink
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding-top:22px;">
        <a href="${trackLink}" style="display:inline-block;background-color:${ACCENT};background-image:linear-gradient(135deg,#6366f1,#4f46e5);color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:13px 32px;border-radius:12px;">ติดตามพัสดุ →</a>
      </td></tr></table>`
    : "";

  const inner = `
    <h1 style="margin:0 0 10px;color:#0f172a;font-size:21px;font-weight:700;text-align:center;">🚚 คำสั่งซื้อถูกจัดส่งแล้ว</h1>
    <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.7;text-align:center;">
      สวัสดีคุณ ${customerName}<br/>คำสั่งซื้อ <strong style="color:#0f172a;">#${shortId}</strong> ของคุณกำลังเดินทางไปหาคุณแล้ว
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;">
      <tr><td style="padding:18px 20px;">
        <p style="margin:0 0 4px;color:#94a3b8;font-size:12px;">ขนส่งโดย</p>
        <p style="margin:0 0 14px;color:#0f172a;font-size:15px;font-weight:700;">${info.name}</p>
        <p style="margin:0 0 4px;color:#94a3b8;font-size:12px;">หมายเลขพัสดุ</p>
        <p style="margin:0;color:${ACCENT};font-size:18px;font-weight:700;letter-spacing:1px;">${trackingNumber}</p>
      </td></tr>
    </table>
    ${button}
    <p style="margin:26px 0 6px;color:#0f172a;font-size:13px;font-weight:700;">รายการสินค้า</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border-top:1px solid #e2e8f0;">
      ${itemRows}
    </table>`;

  return emailShell(inner);
}

export async function sendShippingEmail(params: ShippingEmailParams): Promise<boolean> {
  const { to, orderId, trackingNumber, carrier } = params;

  if (!isEmailConfigured) {
    console.log(
      `📧 [DEMO] Shipping email skipped. To: ${to} | Order: #${orderId
        .slice(-8)
        .toUpperCase()} | ${getCarrierInfo(carrier).name} | Tracking: ${trackingNumber}`
    );
    return true;
  }

  try {
    await getTransporter().sendMail({
      from: `"${BRAND}" <${EMAIL_USER}>`,
      to,
      subject: `คำสั่งซื้อ #${orderId.slice(-8).toUpperCase()} ถูกจัดส่งแล้ว`,
      html: shippingEmailHtml(params),
    });
    console.log(`📧 Shipping email sent to ${to}`);
    return true;
  } catch (error) {
    console.error("Failed to send shipping email:", error);
    return false;
  }
}
