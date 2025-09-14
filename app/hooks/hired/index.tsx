import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import MainNotification from "../../components/common/notifications";
import {
  ScheduleHiredDataModel,
  ScheduleHiredPayloadCreateModel,
} from "@/app/models/hired";

const baseUrl = "/api/admin/dashboard/schedule-hired";
const entity = "schedule-hired";
const queryKey = "schedule-hireds";

export const useScheduleHireds = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: onCreate, isPending: onCreateLoading } = useMutation({
    mutationFn: async (payload: ScheduleHiredPayloadCreateModel) =>
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

export const useScheduleHired = ({
  id,
  candidate_id,
}: {
  id: string;
  candidate_id?: string;
}) => {
  const queryClient = useQueryClient();

  // Query data berdasarkan ID
  const { data, isLoading: fetchLoading } = useQuery({
    queryKey: [entity, id],
    queryFn: async () => {
      const result = await axios.get(`${baseUrl}/${id}`);
      return result.data.result as ScheduleHiredDataModel;
    },
    enabled: Boolean(id),
  });

  // Mutasi untuk update
  const { mutateAsync: onUpdate, isPending: onUpdateLoading } = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: ScheduleHiredPayloadCreateModel;
    }) => axios.put(`${baseUrl}/${id}`, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      queryClient.invalidateQueries({ queryKey: [entity, variables.id] });
      MainNotification({ type: "success", entity, action: "updated" });
    },
    onError: () => {
      MainNotification({ type: "error", entity, action: "updated" });
    },
  });

  const {
    data: listData,
    isLoading: listLoading,
    refetch: refetchList,
  } = useQuery({
    queryKey: [queryKey, candidate_id],
    queryFn: async () => {
      const result = await axios.get(
        `${baseUrl}/by-candidate/${candidate_id || ""}`
      );
      return result.data.result as ScheduleHiredDataModel[];
    },
    enabled: Boolean(candidate_id),
  });

  return {
    data,
    listData,
    listLoading,
    refetchList,
    fetchLoading,
    onUpdate,
    onUpdateLoading,
  };
};
