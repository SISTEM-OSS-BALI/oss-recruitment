import FormScreeningQuestion from "@/app/components/common/form/user/screening-question";
import { useJob, useReferralJob } from "@/app/hooks/job";
import { TypeJob } from "@prisma/client";
import { Empty, Skeleton } from "antd";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useMobile } from "@/app/hooks/use-mobile";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function Content() {
  const { id, code } = useParams() as { id?: string; code?: string };
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { data: job, fetchLoading: fetchJobLoading } = useJob({
    id: id ?? "",
  });
  const { data: referralData, fetchLoading: fetchReferralLoading } =
    useReferralJob({ code: code ?? "" });
  const isMobile = useMobile();
  const jobData = code ? referralData?.job : job;
  const jobId = id ?? referralData?.job?.id;
  const fetchLoading = fetchJobLoading || (code ? fetchReferralLoading : false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      const target = pathname ? `?callbackUrl=${encodeURIComponent(pathname)}` : "";
      router.push(`/login${target}`);
    }
  }, [status, session, router, pathname]);

  if (fetchLoading || status === "loading") {
    return (
      <div style={{ padding: isMobile ? 16 : 24 }}>
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (!jobData || !jobId) {
    return (
      <Empty
        style={{ padding: isMobile ? 32 : 48 }}
        description="Job information is unavailable. Please try again later."
      />
    );
  }

  return (
    <div style={{ padding: isMobile ? 16 : 24 }}>
      <FormScreeningQuestion
        job_id={jobId}
        user_id={session?.user?.id ?? ""}
        job_type={jobData.type_job as TypeJob}
      />
    </div>
  );
}
