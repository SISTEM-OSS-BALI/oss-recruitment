import FormScreeningQuestion from "@/app/components/common/form/user/screening-question";
import { useJob } from "@/app/hooks/job";
import { useAuth } from "@/app/utils/useAuth";
import { TypeJob } from "@prisma/client";
import { Empty, Skeleton } from "antd";
import { useParams } from "next/navigation";

export default function Content() {
  const { id } = useParams() as { id: string };
  const { user_id } = useAuth();
  const { data: job, fetchLoading } = useJob({ id });

  if (fetchLoading) {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  if (!job) {
    return (
      <Empty
        style={{ padding: 48 }}
        description="Job information is unavailable. Please try again later."
      />
    );
  }

  return (
    <div>
      <FormScreeningQuestion
        job_id={id}
        user_id={user_id!}
        job_type={job.type_job as TypeJob}
      />
    </div>
  );
}
