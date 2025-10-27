import { AnswerQuestionScreeningDataModel } from "@/app/models/answer-question-screening";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const baseUrl = "/api/admin/dashboard/applicant";
const entity = "applicant";
const queryKey = "applicants";

export const useAnswerScreening = ({ id }: { id?: string }) => {
  const queryClient = useQueryClient();

  const { data, isLoading: fetchLoading } = useQuery({
    queryKey: [entity, id],
    queryFn: async () => {
      const result = await axios.get(`${baseUrl}/${id}`);
      return result.data.result as AnswerQuestionScreeningDataModel;
    },
    enabled: Boolean(id),
  });

  const { mutateAsync: onUpdateStatus, isPending: onUpdateStatusLoading } =
    useMutation({
      mutationFn: async ({
        id,
        stage,
      }: {
        id: string;
        stage: RecruitmentStage;
      }) => {
        return axios.patch(`${baseUrl}/${id}`, { stage });
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
        queryClient.invalidateQueries({ queryKey: [entity, variables.id] });
        MainNotification({
          type: "success",
          entity,
          action: "updated status",
        });
      },
      onError: () => {
        MainNotification({ type: "error", entity, action: "updated status" });
      },
    });

  return {
    onUpdateStatus,
    onUpdateStatusLoading,
    data,
    fetchLoading,
  };
};
