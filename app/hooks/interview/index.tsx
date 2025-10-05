import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import MainNotification from "../../components/common/notifications";
import {
  ScheduleInterviewDataModel,
  ScheduleInterviewPayloadCreateModel,
} from "@/app/models/interview";

const baseUrl = "/api/admin/dashboard/schedule-interview";
const entity = "schedule-interview";
const queryKey = "schedule-interviews";

export const useScheduleInterviews = () => {
  const queryClient = useQueryClient();

  const { data, isLoading: fetchLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const result = await axios.get(baseUrl);
      return result.data.result as ScheduleInterviewDataModel[];
    },
  });

  const { mutateAsync: onCreate, isPending: onCreateLoading } = useMutation({
    mutationFn: async (payload: ScheduleInterviewPayloadCreateModel) =>
      axios.post(baseUrl, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      queryClient.invalidateQueries({ queryKey: ["schedule-evaluators"] });
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
    data,
    fetchLoading,
    onCreate,
    onCreateLoading,
    onDelete,
    onDeleteLoading,
  };
};

export const useScheduleInterview = ({
  id,
  applicant_id,
}: {
  id: string;
  applicant_id?: string;
}) => {
  const queryClient = useQueryClient();

  const { data, isLoading: fetchLoading } = useQuery({
    queryKey: [entity, id],
    queryFn: async () => {
      const result = await axios.get(`${baseUrl}/${id}`);
      return result.data.result as ScheduleInterviewDataModel;
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
      payload: ScheduleInterviewPayloadCreateModel;
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
    queryKey: [queryKey, applicant_id],
    queryFn: async () => {
      const result = await axios.get(
        `${baseUrl}/by-candidate/${applicant_id || ""}`
      );
      return result.data.result as ScheduleInterviewDataModel[];
    },
    enabled: Boolean(applicant_id),
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
