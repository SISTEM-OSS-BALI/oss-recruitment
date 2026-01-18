import crypto from "crypto";
import { NextResponse } from "next/server";

import db from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/app/vendor/send-email";

const RESET_TOKEN_TTL_MINUTES = 60;

export const POST = async (req: Request) => {
  try {
    const body = await req.json().catch(() => ({}));
    const email =
      typeof body?.email === "string" ? body.email.trim() : undefined;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required." },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        {
          success: true,
          message:
            "If an account exists for this email, a reset link has been sent.",
        },
        { status: 200 }
      );
    }

    await db.passwordResetToken.deleteMany({ where: { user_id: user.id } });

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(
      Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000
    );

    await db.passwordResetToken.create({
      data: {
        user_id: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(
      user.email
    )}`;

    try {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetUrl,
        expiresInMinutes: RESET_TOKEN_TTL_MINUTES,
      });
    } catch (error) {
      await db.passwordResetToken.deleteMany({ where: { user_id: user.id } });
      throw error;
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "If an account exists for this email, a reset link has been sent.",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process reset request.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
};
