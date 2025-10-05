import { useCandidateByJobId } from "@/app/hooks/applicant";
import { useSearchParams } from "next/navigation";

export default function Content() {
  const params = useSearchParams();
  const jobId = params.get("job_id");
  const { data } = useCandidateByJobId({ id: jobId ?? "" });
  console.log(data);
  return <div>Manage Candidate</div>;
}
