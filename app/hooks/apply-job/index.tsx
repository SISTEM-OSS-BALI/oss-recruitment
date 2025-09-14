import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import MainNotification from "../../components/common/notifications";
import {
  CandidatePayloadCreateModel,
} from "@/app/models/apply-job";

const baseUrl = "/api/user/apply-job";
const entity = "apply-job";
const queryKey = "apply-jobs";

export const useApplyJobs = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: onCreate, isPending: onCreateLoading } = useMutation({
    mutationFn: async (payload: CandidatePayloadCreateModel) =>
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

// export const useJob = ({ id }: { id: string }) => {
//   const queryClient = useQueryClient();

//   // Query data berdasarkan ID
//   const { data, isLoading: fetchLoading } = useQuery({
//     queryKey: [entity, id],
//     queryFn: async () => {
//       const result = await axios.get(`${baseUrl}/${id}`);
//       return result.data.result as JobDataModel;
//     },
//     enabled: Boolean(id),
//   });

//   // Mutasi untuk update
//   const { mutateAsync: onUpdate, isPending: onUpdateLoading } = useMutation({
//     mutationFn: async ({
//       id,
//       payload,
//     }: {
//       id: string;
//       payload: JobPayloadUpdateModel;
//     }) => axios.put(`${baseUrl}/${id}`, payload),
//     onSuccess: (_, variables) => {
//       queryClient.invalidateQueries({ queryKey: [queryKey] });
//       queryClient.invalidateQueries({ queryKey: [entity, variables.id] });
//       MainNotification({ type: "success", entity, action: "updated" });
//     },
//     onError: () => {
//       MainNotification({ type: "error", entity, action: "updated" });
//     },
//   });

//   return {
//     data,
//     fetchLoading,
//     onUpdate,
//     onUpdateLoading,
//   };
// };
