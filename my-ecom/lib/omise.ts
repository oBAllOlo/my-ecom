import Omise from "omise";

// Support both naming conventions for backward compatibility
const publicKey = process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY || process.env.OMISE_PUBLIC_KEY;
const secretKey = process.env.OMISE_SECRET_KEY;

if (!secretKey) {
  console.warn("⚠️ OMISE_SECRET_KEY is not set. Payment functionality will not work.");
}

if (!publicKey) {
  console.warn("⚠️ OMISE_PUBLIC_KEY or NEXT_PUBLIC_OMISE_PUBLIC_KEY is not set. Payment functionality may not work.");
}

const omise = Omise({
  publicKey: publicKey || "",
  secretKey: secretKey || "",
});

export default omise;
