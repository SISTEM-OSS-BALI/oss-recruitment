import FormScreeningQuestion from "@/app/components/common/form/user/screening-question";
import { useJob, useReferralJob } from "@/app/hooks/job";
import { useUser } from "@/app/hooks/user";
import { TypeJob } from "@prisma/client";
import { Button, Empty, Result, Skeleton, Typography } from "antd";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useMobile } from "@/app/hooks/use-mobile";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

const { Text } = Typography;

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
  const userId = session?.user?.id ?? "";
  const { data: user, fetchLoading: fetchUserLoading } = useUser({
    id: userId,
  });
  const isUserLoading = Boolean(userId) && fetchUserLoading;

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      const target = pathname
        ? `?callbackUrl=${encodeURIComponent(pathname)}`
        : "";
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

  if (isUserLoading) {
    return (
      <div style={{ padding: isMobile ? 16 : 24 }}>
        <Skeleton active paragraph={{ rows: 3 }} />
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

  const requiresDocuments = jobData.type_job === TypeJob.TEAM_MEMBER;
  const missingDocuments: string[] = [];
  if (requiresDocuments) {
    if (!user?.curiculum_vitae_url) missingDocuments.push("CV");
    if (!user?.photo_url) missingDocuments.push("foto");
  }

  if (requiresDocuments && missingDocuments.length > 0) {
    return (
      <div style={{ padding: isMobile ? 16 : 24 }}>
        <Result
          status="warning"
          title="Complete your documents before starting screening"
          subTitle={
            <div>
              <Text>
                Before starting the screening, you must upload your CV and photo
                first.
              </Text>
              <br />
              <Text type="secondary">
                Missing documents: {missingDocuments.join(" and ")}.
              </Text>
            </div>
          }
          extra={[
            <Button
              key="profile"
              type="primary"
              onClick={() => router.push("/user/home/profile")}
            >
              Open Profile
            </Button>,
            <Button
              key="applications"
              onClick={() => router.push("/user/home/apply-job")}
            >
              Back to applications
            </Button>,
          ]}
        />
      </div>
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
