import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import MainNotification from "../../components/common/notifications";
import { CandidateDataModel } from "@/app/models/apply-job";
import { RecruitmentStage } from "@prisma/client";

const baseUrl = "/api/admin/dashboard/candidate";
const entity = "candidate";
const queryKey = "candidates";

export const useCandidates = ({ queryString }: { queryString?: string }) => {
  const queryClient = useQueryClient();

  const { data, isLoading: fetchLoading } = useQuery({
    queryKey: [queryKey, queryString],
    queryFn: async () => {
      const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
      const result = await axios.get(url);
      return result.data.result as CandidateDataModel[];
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

export const useCandidate = () => {
  const queryClient = useQueryClient();

 const { mutateAsync: onUpdateStatus, isPending: onUpdateStatusLoading } =
    useMutation({
      mutationFn: async ({ id, stage }: { id: string; stage: RecruitmentStage }) => {
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
  };
};
