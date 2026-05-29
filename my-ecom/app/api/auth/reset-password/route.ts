import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User, { hashPassword } from "@/models/User";
import OTP, { MAX_OTP_ATTEMPTS } from "@/models/OTP";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, error: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();
    const otpRecord = await OTP.findOne({
      email: normalizedEmail,
      purpose: "reset",
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, error: "รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว" },
        { status: 400 }
      );
    }

    // Brute-force guard: block further guesses once the limit is reached.
    // The OTP is kept (not deleted) so the resend cooldown still applies — the
    // user must request a fresh code, which is rate-limited separately.
    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      return NextResponse.json(
        { success: false, error: "คุณกรอกรหัสผิดหลายครั้งเกินไป กรุณาขอรหัส OTP ใหม่" },
        { status: 429 }
      );
    }

    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      const remaining = MAX_OTP_ATTEMPTS - otpRecord.attempts;
      if (remaining <= 0) {
        return NextResponse.json(
          { success: false, error: "คุณกรอกรหัสผิดหลายครั้งเกินไป กรุณาขอรหัส OTP ใหม่" },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { success: false, error: `รหัส OTP ไม่ถูกต้อง (เหลืออีก ${remaining} ครั้ง)` },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "ไม่พบผู้ใช้" },
        { status: 404 }
      );
    }

    user.password = await hashPassword(newPassword);
    // Resetting via an emailed OTP also proves email ownership.
    user.isVerified = true;
    await user.save();

    await OTP.deleteMany({ email: normalizedEmail, purpose: "reset" });

    return NextResponse.json(
      {
        success: true,
        message: "รีเซ็ตรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in reset-password:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน" },
      { status: 500 }
    );
  }
}
