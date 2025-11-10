import MainNotification from "@/app/components/common/notifications";
import {
  AnswerQuestionScreeningDataModel,
  AnswerQuestionScreeningPayloadCreateModel,
} from "@/app/models/answer-question-screening";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const baseUrl = "/api/admin/dashboard/answer-question-screening";
const entity = "answer-question-screening";
const queryKey = "answer-question-screenings";


type UseAnswerQuestionScreeningsParams = {
  queryString?: string;
  fetchEnabled?: boolean;
  showNotification?: boolean;
};

export const useAnswerQuestionScreenings = (
  params: UseAnswerQuestionScreeningsParams = {}
) => {
  const {
    queryString,
    fetchEnabled = true,
    showNotification = true,
  } = params;
  const queryClient = useQueryClient();

  const { data, isLoading: fetchLoading } = useQuery({
    queryKey: [queryKey, queryString],
    queryFn: async () => {
      const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
      const result = await axios.get(url);
      return result.data.result as AnswerQuestionScreeningDataModel[];
    },
    enabled: fetchEnabled,
  });

  const { mutateAsync: onCreate, isPending: onCreateLoading } = useMutation({
    mutationFn: async (payload: AnswerQuestionScreeningPayloadCreateModel) =>
      axios.post(baseUrl, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      if (showNotification) {
        MainNotification({ type: "success", entity, action: "created" });
      }
    },
    onError: () => {
      if (showNotification) {
        MainNotification({ type: "error", entity, action: "created" });
      }
    },
  });

  const { mutateAsync: onDelete, isPending: onDeleteLoading } = useMutation({
    mutationFn: async (id: string) => axios.delete(`${baseUrl}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      MainNotification({ type: "success", entity, action: "deleted" });
    },
    onError: () => {
      MainNotification({ type: "error", entity, action: "deleted" });
    },
  });

  return {
    data,
    fetchLoading,
    onCreate,
    onCreateLoading,
    onDelete,
    onDeleteLoading,
  };
};

export const useAnswerQuestionScreeningByApplicantId = ({
  applicantId,
  enabled = true,
}: {
  applicantId?: string;
  enabled?: boolean;
}) => {
  const shouldFetch = Boolean(applicantId) && enabled;

  const { data, isLoading: fetchLoading } = useQuery({
    queryKey: [queryKey, applicantId],
    queryFn: async () => {
      if (!applicantId) {
        throw new Error("applicantId is required");
      }
      const url = `${baseUrl}/by-candidate/${applicantId}`;
      const result = await axios.get(url);
      return result.data.result as AnswerQuestionScreeningDataModel[];
    },
    enabled: shouldFetch,
  });

  return {
    data: shouldFetch ? data : undefined,
    fetchLoading,
  };
};
