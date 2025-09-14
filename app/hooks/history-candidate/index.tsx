import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import MainNotification from "../../components/common/notifications";
import { HistoryCandidateDataModel } from "@/app/models/history-candidate";

const baseUrl = "/api/admin/dashboard/history-candidate";
const entity = "history-candidate";
const queryKey = "history-candidates";

export const useHistoryCandidates = ({
  queryString,
}: {
  queryString?: string;
}) => {
  const queryClient = useQueryClient();

  const { data, isLoading: fetchLoading } = useQuery({
    queryKey: [queryKey, queryString],
    queryFn: async () => {
      const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
      const result = await axios.get(url);
      return result.data.result as HistoryCandidateDataModel[];
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
    onDelete,
    onDeleteLoading,
  };
};
