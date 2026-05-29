import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import OTP, { OTP_RESEND_COOLDOWN_SECONDS } from "@/models/OTP";
import { generateOTP, sendOTPEmail, isEmailConfigured } from "@/lib/email";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุอีเมล" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "ไม่พบบัญชีผู้ใช้ที่ใช้อีเมลนี้" },
        { status: 404 }
      );
    }

    // Cooldown: block requesting a new OTP within the cooldown window.
    const lastOtp = await OTP.findOne({
      email: normalizedEmail,
      purpose: "reset",
    }).sort({ createdAt: -1 });
    if (lastOtp) {
      const wait = Math.ceil(
        OTP_RESEND_COOLDOWN_SECONDS - (Date.now() - lastOtp.createdAt.getTime()) / 1000
      );
      if (wait > 0) {
        return NextResponse.json(
          { success: false, error: `กรุณารอ ${wait} วินาทีก่อนขอรหัสใหม่`, retryAfter: wait },
          { status: 429 }
        );
      }
    }

    const otpCode = generateOTP();
    await OTP.deleteMany({ email: normalizedEmail, purpose: "reset" });
    await OTP.create({ email: normalizedEmail, otp: otpCode, purpose: "reset" });

    const emailSent = await sendOTPEmail(normalizedEmail, otpCode, "reset");
    if (!emailSent) {
      return NextResponse.json(
        { success: false, error: "ไม่สามารถส่งอีเมลได้ กรุณาลองใหม่อีกครั้ง" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "ส่งรหัส OTP สำหรับรีเซ็ตรหัสผ่านแล้ว กรุณาตรวจสอบอีเมล",
        // Only expose the OTP in DEMO MODE (no SMTP configured).
        ...(isEmailConfigured ? {} : { devOtp: otpCode }),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in forgot-password:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการขอรีเซ็ตรหัสผ่าน" },
      { status: 500 }
    );
  }
}
