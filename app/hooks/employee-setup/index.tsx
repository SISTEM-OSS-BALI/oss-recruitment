import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import MainNotification from "../../components/common/notifications";
import {
  EmployeeSetupDataModel,
  EmployeeSetupPayloadCreateModel,
  EmployeeSetupPayloadUpdateModel,
} from "@/app/models/employee-setup";

const baseUrl = "/api/admin/dashboard/employee-setup";
const entity = "employee-setups";
const queryKey = "employee-setup";

export const useEmployeeSetups = ({
  queryString,
}: {
  queryString?: string;
}) => {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading: fetchLoading,
  } = useQuery({
    queryKey: [queryKey, queryString],
    queryFn: async () => {
      const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
      const result = await axios.get(url);
      return result.data.result as EmployeeSetupDataModel[];
    },
  });

  const { mutateAsync: onCreate, isPending: onCreateLoading } = useMutation({
    mutationFn: async (payload: EmployeeSetupPayloadCreateModel) =>
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
    data,
    fetchLoading,
    onCreate,
    onCreateLoading,
    onDelete,
    onDeleteLoading,
  };
};

export const useEmployeeSetup = ({ id }: { id: string }) => {
  const queryClient = useQueryClient();

  // Query data berdasarkan ID
  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [entity, id],
    queryFn: async () => {
      const result = await axios.get(`${baseUrl}/${id}`);
      return result.data.result as EmployeeSetupDataModel;
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
      payload: EmployeeSetupPayloadUpdateModel;
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
    data,
    fetchLoading: isLoading || isFetching,
    onUpdate,
    onUpdateLoading,
    refetch,
  };
};
