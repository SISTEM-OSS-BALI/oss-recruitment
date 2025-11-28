import { NextResponse } from "next/server";
import { recommendJobRoles } from "@/app/vendor/recomended-job-role";

export async function POST(req: Request) {
  const { jobTitle } = await req.json();
  const result = await recommendJobRoles(jobTitle);
  return NextResponse.json(result);
}
