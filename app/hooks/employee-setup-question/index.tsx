import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import MainNotification from "../../components/common/notifications";
import {
  EmployeeSetupPayloadQuestionUpdateModel,
  EmployeeSetupQuestionPayloadCreateModel,
} from "@/app/models/employee-setup-question";

const baseUrl = "/api/admin/dashboard/employee-setup-question";
const entity = "employee-setup-questions";
const queryKey = "employee-setup-question";

export const useEmployeeSetupQuestions = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: onCreate, isPending: onCreateLoading } = useMutation({
    mutationFn: async (payload: EmployeeSetupQuestionPayloadCreateModel) =>
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

export const useEmployeeSetupQuestion = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: onUpdate, isPending: onUpdateLoading } = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: EmployeeSetupPayloadQuestionUpdateModel;
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

  return {
    onUpdate,
    onUpdateLoading,
  };
};
