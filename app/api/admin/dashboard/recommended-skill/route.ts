import { recommendSkills } from "@/app/vendor/recommeded-skill";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { jobTitle, jobRole } = await req.json();
  const result = await recommendSkills(jobTitle, jobRole);
  return NextResponse.json(result);
}
