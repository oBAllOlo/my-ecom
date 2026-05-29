import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import OTP from "@/models/OTP";
import { generateOTP, sendOTPEmail } from "@/lib/email";

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

        // Check if user exists and is not verified
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return NextResponse.json(
                { success: false, error: "ไม่พบบัญชีผู้ใช้" },
                { status: 404 }
            );
        }

        if (user.isVerified) {
            return NextResponse.json(
                { success: false, error: "บัญชีนี้ยืนยันแล้ว" },
                { status: 400 }
            );
        }

        // Generate new OTP
        const otpCode = generateOTP();
        await OTP.deleteMany({ email: normalizedEmail }); // Clear old OTPs
        await OTP.create({ email: normalizedEmail, otp: otpCode });

        // Send OTP email
        const emailSent = await sendOTPEmail(normalizedEmail, otpCode);

        if (!emailSent) {
            return NextResponse.json(
                { success: false, error: "ไม่สามารถส่งอีเมลได้ กรุณาลองใหม่อีกครั้ง" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: "ส่งรหัส OTP ใหม่แล้ว กรุณาตรวจสอบอีเมล",
                // DEMO MODE: email is mocked, so the OTP is returned here.
                devOtp: otpCode,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error resending OTP:", error);
        return NextResponse.json(
            { success: false, error: "เกิดข้อผิดพลาดในการส่ง OTP" },
            { status: 500 }
        );
    }
}
