import FormScreeningQuestion from "@/app/components/common/form/user/screening-question";
import { useAuth } from "@/app/utils/useAuth";
import { useParams } from "next/navigation";

export default function Content() {
  const { id } = useParams() as { id: string };
  const { user_id } = useAuth();

  return (
    <div>
      <FormScreeningQuestion job_id={id} user_id={user_id!} />
    </div>
  );
}
