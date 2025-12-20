import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import OTP from "@/models/OTP";

export async function POST(request: Request) {
    try {
        await dbConnect();

        const { email, otp } = await request.json();

        // Validate input
        if (!email || !otp) {
            return NextResponse.json(
                { success: false, error: "กรุณากรอกข้อมูลให้ครบถ้วน" },
                { status: 400 }
            );
        }

        const normalizedEmail = email.toLowerCase();

        // Find OTP record
        const otpRecord = await OTP.findOne({ email: normalizedEmail, otp });

        if (!otpRecord) {
            return NextResponse.json(
                { success: false, error: "รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว" },
                { status: 400 }
            );
        }

        // Find and update user
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

        // Delete used OTP
        await OTP.deleteMany({ email: normalizedEmail });

        // Return user data for auto-login
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phoneNumber: user.phoneNumber,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
        };

        return NextResponse.json(
            {
                success: true,
                message: "ยืนยันอีเมลสำเร็จ",
                data: userResponse
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return NextResponse.json(
            { success: false, error: "เกิดข้อผิดพลาดในการยืนยัน OTP" },
            { status: 500 }
        );
    }
}
