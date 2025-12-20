import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
    key: string;
    value: Record<string, unknown>;
    updatedAt: Date;
}

const SettingsSchema: Schema = new Schema({
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
}, {
    timestamps: true,
});

export default mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema);
