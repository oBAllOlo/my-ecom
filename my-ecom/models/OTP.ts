import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOTP extends Document {
    email: string;
    otp: string;
    createdAt: Date;
}

const OTPSchema = new Schema<IOTP>(
    {
        email: { type: String, required: true, index: true },
        otp: { type: String, required: true },
        createdAt: { type: Date, default: Date.now, expires: 300 }, // expires in 5 minutes
    },
);

// Delete cached model to avoid stale hooks in development
if (mongoose.models.OTP) {
    delete mongoose.models.OTP;
}

const OTP: Model<IOTP> = mongoose.model<IOTP>("OTP", OTPSchema);

export default OTP;
