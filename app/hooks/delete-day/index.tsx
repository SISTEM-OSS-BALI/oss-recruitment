import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import MainNotification from "../../components/common/notifications";

const baseUrl = "/api/admin/dashboard/schedule-evaluator/delete-day";
const entity = "schedule-evaluator";
const queryKey = "schedule-evaluators";

export const useDeleteDay = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: onDelete, isPending: onDeleteLoading } = useMutation({
    mutationFn: async (id: string) => axios.delete(`${baseUrl}?dayId=${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      MainNotification({ type: "success", entity, action: "deleted" });
    },
    onError: () => {
      MainNotification({ type: "error", entity, action: "deleted" });
    },
  });

  return {
    onDelete,
    onDeleteLoading,
  };
};
