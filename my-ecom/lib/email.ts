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
