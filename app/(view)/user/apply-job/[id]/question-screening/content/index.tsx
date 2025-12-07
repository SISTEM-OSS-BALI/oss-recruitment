import FormScreeningQuestion from "@/app/components/common/form/user/screening-question";
import { useJob } from "@/app/hooks/job";
import { useAuth } from "@/app/utils/useAuth";
import { TypeJob } from "@prisma/client";
import { Empty, Skeleton } from "antd";
import { useParams } from "next/navigation";
import { useMobile } from "@/app/hooks/use-mobile";

export default function Content() {
  const { id } = useParams() as { id: string };
  const { user_id } = useAuth();
  const { data: job, fetchLoading } = useJob({ id });
  const isMobile = useMobile();

  if (fetchLoading) {
    return (
      <div style={{ padding: isMobile ? 16 : 24 }}>
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  if (!job) {
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
        job_id={id}
        user_id={user_id!}
        job_type={job.type_job as TypeJob}
      />
    </div>
  );
}
