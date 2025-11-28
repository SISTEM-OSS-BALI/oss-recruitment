import { NextRequest, NextResponse } from "next/server";

import { recommendCandidates } from "@/app/utils/recommended-candidate";
import db from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const jobId = searchParams.get("jobId");
  const minScoreParam = searchParams.get("minScore");
  const limitParam = searchParams.get("limit");

  if (!jobId) {
    return NextResponse.json(
      { success: false, message: "jobId query parameter is required" },
      { status: 400 }
    );
  }

  const minScore = Number.isFinite(Number(minScoreParam))
    ? Number(minScoreParam)
    : 2;
  const limit = Number.isFinite(Number(limitParam)) ? Number(limitParam) : 50;

  try {
    const job = await db.job.findUnique({
      where: { id: jobId },
      select: { job_title: true, description: true },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job not found" },
        { status: 404 }
      );
    }

    const candidates = await db.user.findMany({
      where: { role: "CANDIDATE" },
      select: {
        id: true,
        name: true,
        interestTags: { select: { interest: true } },
      },
    });

    const result = recommendCandidates(
      { job_title: job.job_title, description: job.description },
      candidates.map((candidate) => ({
        ...candidate,
        interestTags: candidate.interestTags.map((tag) => ({
          name: tag.interest,
        })),
      })),
      { minScore, limit }
    );

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Failed to fetch recommended candidates:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch recommended candidates",
      },
      { status: 500 }
    );
  }
}
