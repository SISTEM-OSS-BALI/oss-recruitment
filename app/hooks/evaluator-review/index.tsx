import MainNotification from "@/app/components/common/notifications";
import {
  EvaluatorReviewPayloadCreateModel,
} from "@/app/models/evaluator-review";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const baseUrl = "/api/admin/dashboard/evaluator-assignment/submit";
const entity = "evaluator-review";
const queryKey = "evaluator-reviews";

export const useEvalutorReviews = ({}) => {
  const queryClient = useQueryClient();

  const { mutateAsync: onCreate, isPending: onCreateLoading } = useMutation({
    mutationFn: async (payload: EvaluatorReviewPayloadCreateModel) =>
      axios.post(baseUrl, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      MainNotification({ type: "success", entity, action: "created" });
    },
    onError: () => {
      MainNotification({ type: "error", entity, action: "created" });
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
    onCreate,
    onCreateLoading,
    onDelete,
    onDeleteLoading,
  };
};
