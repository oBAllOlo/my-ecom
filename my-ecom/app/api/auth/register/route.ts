import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User, { hashPassword } from "@/models/User";
import OTP from "@/models/OTP";
import { generateOTP, sendOTPEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const { name, email, password, phoneNumber } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      if (existingUser.isVerified) {
        return NextResponse.json(
          { success: false, error: "อีเมลนี้ถูกใช้งานแล้ว" },
          { status: 400 }
        );
      }

      await User.deleteOne({ _id: existingUser._id });
      await OTP.deleteMany({ email: normalizedEmail });
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      phoneNumber,
      role: "user",
      isVerified: false,
    });

    const otpCode = generateOTP();
    await OTP.deleteMany({ email: normalizedEmail });
    await OTP.create({ email: normalizedEmail, otp: otpCode });

    const emailSent = await sendOTPEmail(normalizedEmail, otpCode);
    if (!emailSent) {
      await User.deleteOne({ _id: user._id });
      return NextResponse.json(
        {
          success: false,
          error: "ไม่สามารถส่งอีเมลยืนยันได้ กรุณาลองใหม่อีกครั้ง",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยัน OTP",
        requireVerification: true,
        email: normalizedEmail,
        // DEMO MODE: email is mocked, so the OTP is returned here for convenience.
        devOtp: otpCode,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการสมัครสมาชิก" },
      { status: 500 }
    );
  }
}
