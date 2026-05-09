import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import OTP from "@/models/OTP";
import { setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();
    const otpRecord = await OTP.findOne({ email: normalizedEmail, otp });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, error: "รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว" },
        { status: 400 }
      );
    }

    const user = await User.findOneAndUpdate(
      { email: normalizedEmail },
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: "ไม่พบผู้ใช้" },
        { status: 404 }
      );
    }

    await OTP.deleteMany({ email: normalizedEmail });

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };

    const response = NextResponse.json(
      {
        success: true,
        message: "ยืนยันอีเมลสำเร็จ",
        data: userResponse,
      },
      { status: 200 }
    );

    setSessionCookie(response, user);
    return response;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการยืนยัน OTP" },
      { status: 500 }
    );
  }
}
