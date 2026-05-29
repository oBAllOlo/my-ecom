import mongoose, { Schema, Document, Model } from "mongoose";

export type OTPPurpose = "verify" | "reset";

// Max wrong guesses allowed per OTP before it is invalidated (brute-force guard).
export const MAX_OTP_ATTEMPTS = 5;

// Minimum seconds between OTP requests for the same email (anti email-bombing).
export const OTP_RESEND_COOLDOWN_SECONDS = 60;

export interface IOTP extends Document {
    email: string;
    otp: string;
    purpose: OTPPurpose;
    attempts: number;
    createdAt: Date;
}

const OTPSchema = new Schema<IOTP>(
    {
        email: { type: String, required: true, index: true },
        otp: { type: String, required: true },
        // "verify" = email verification on signup, "reset" = forgot-password flow.
        purpose: { type: String, enum: ["verify", "reset"], default: "verify" },
        // Number of failed verification attempts against this OTP.
        attempts: { type: Number, default: 0 },
        createdAt: { type: Date, default: Date.now, expires: 300 }, // expires in 5 minutes
    },
);

// Delete cached model to avoid stale hooks in development
if (mongoose.models.OTP) {
    delete mongoose.models.OTP;
}

const OTP: Model<IOTP> = mongoose.model<IOTP>("OTP", OTPSchema);

export default OTP;
