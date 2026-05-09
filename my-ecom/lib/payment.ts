import crypto from "crypto";

export function toOmiseAmount(amount: number) {
  return Math.round(amount * 100);
}

export function verifyOmiseSignature(
  payload: string,
  signature: string,
  secret: string
) {
  if (!signature || !secret) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  if (signature.length !== expectedSignature.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
