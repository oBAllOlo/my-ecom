import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { hashPassword } from "@/models/User";

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const { userId, currentPassword, newPassword } = await request.json();

        // Validate input
        if (!userId || !currentPassword || !newPassword) {
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

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json(
                { success: false, error: "ไม่พบผู้ใช้" },
                { status: 404 }
            );
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return NextResponse.json(
                { success: false, error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" },
                { status: 400 }
            );
        }

        // Hash new password and update
        const hashedPassword = await hashPassword(newPassword);
        user.password = hashedPassword;
        await user.save();

        return NextResponse.json(
            { success: true, message: "เปลี่ยนรหัสผ่านสำเร็จ" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error changing password:", error);
        return NextResponse.json(
            { success: false, error: "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน" },
            { status: 500 }
        );
    }
}
