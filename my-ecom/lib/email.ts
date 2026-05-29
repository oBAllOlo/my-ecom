// DEMO MODE: email sending is mocked. No SMTP server required.
// The OTP is logged to the server console (and returned by the register API
// as `devOtp`) so the verification flow stays fully usable without email.

export async function sendOTPEmail(to: string, otp: string): Promise<boolean> {
  console.log(`📧 [DEMO] OTP email skipped. To: ${to} | OTP: ${otp}`);
  return true;
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
  const { to, orderId, trackingNumber, carrier } = params;
  console.log(
    `📧 [DEMO] Shipping email skipped. To: ${to} | Order: #${orderId
      .slice(-8)
      .toUpperCase()} | ${getCarrierInfo(carrier).name} | Tracking: ${trackingNumber}`
  );
  return true;
}
