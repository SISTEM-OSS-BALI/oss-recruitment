import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  console.log("Authorization Code:", code);

  if (!code) {
    return NextResponse.json(
      { error: "Authorization code not found" },
      { status: 400 }
    );
  }

  console.log(
    "Requesting Token with Redirect URI:",
    process.env.ZOOM_REDIRECT_URI
  );

  const tokenResponse = await fetch("https://zoom.us/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.ZOOM_REDIRECT_URI!,
    }).toString(),
  });

  console.log("Token Response Status:", tokenResponse.status);

  if (!tokenResponse.ok) {
    const errorData = await tokenResponse.json();
    return NextResponse.json(
      { error: errorData },
      { status: tokenResponse.status }
    );
  }

  const tokenData = await tokenResponse.json();
  console.log("Token Data:", tokenData);

  return NextResponse.json({ tokenData });
}
