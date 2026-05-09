import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User, { IUser, UserRole } from "@/models/User";
import { createSessionToken, verifySessionToken } from "@/lib/auth-session";

const SESSION_COOKIE_NAME = "session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export interface AuthenticatedUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
}

function toAuthenticatedUser(user: IUser): AuthenticatedUser {
  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
  };
}

export function setSessionCookie(response: NextResponse, user: Pick<IUser, "_id" | "role">) {
  const token = createSessionToken(
    {
      userId: user._id.toString(),
      role: user.role,
    },
    undefined,
    Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  );

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = verifySessionToken(token);
  if (!payload) {
    return null;
  }

  await dbConnect();

  const user = await User.findById(payload.userId).select(
    "name email role isVerified"
  );

  if (!user || !user.isVerified) {
    return null;
  }

  return toAuthenticatedUser(user);
}

export async function requireAuth() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  return { user, response: null };
}

export async function requireAdmin() {
  const auth = await requireAuth();

  if (auth.response) {
    return auth;
  }

  if (auth.user?.role !== "admin") {
    return {
      user: null,
      response: NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      ),
    };
  }

  return auth;
}
