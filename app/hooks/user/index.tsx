import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import MainNotification from "../../components/common/notifications";
import {
  UserDataModel,
  UserPayloadCreateModel,
  UserPayloadUpdateModel,
} from "@/app/models/user";

const baseUrl = "/api/user";
const entity = "user";
const queryKey = "users";

export const useUsers = ({ queryString }: { queryString?: string }) => {
  const queryClient = useQueryClient();

  const { data, isLoading: fetchLoading } = useQuery({
    queryKey: [queryKey, queryString],
    queryFn: async () => {
      const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
      const result = await axios.get(url);
      return result.data.result as UserDataModel[];
    },
  });

  const { mutateAsync: onCreate, isPending: onCreateLoading } = useMutation({
    mutationFn: async (payload: UserPayloadCreateModel) =>
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

export const useUser = ({ id }: { id: string }) => {
  const queryClient = useQueryClient();

  const { data, isLoading: fetchLoading } = useQuery({
    queryKey: [entity, id],
    queryFn: async () => {
      const result = await axios.get(`${baseUrl}/${id}`);
      return result.data.result as UserDataModel;
    },
    enabled: Boolean(id),
  });

  const { mutateAsync: onUpdate, isPending: onUpdateLoading } = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UserPayloadUpdateModel;
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

  const { mutateAsync: onPatchDocument, isPending: onPatchDocumentLoading } =
    useMutation({
      mutationFn: async ({
        id,
        payload,
      }: {
        id: string;
        payload: UserPayloadUpdateModel;
      }) => {
        return axios.patch(`${baseUrl}/${id}`, {
          no_identity: payload.no_identity,
          no_identity_url: payload.no_identity_url,
        });
      },
      onSuccess: (_, variables) => {
        // segarkan list & detail
        queryClient.invalidateQueries({ queryKey: [queryKey] });
        queryClient.invalidateQueries({ queryKey: [entity, variables.id] });
        MainNotification({
          type: "success",
          entity,
          action: "document updated",
        });
      },
      onError: () => {
        MainNotification({ type: "error", entity, action: "document updated" });
      },
    });

  const { mutateAsync: onPatchCodeUnique, isPending: onPatchCodeUniqueLoading } =
    useMutation({
      mutationFn: async ({
        id,
        payload,
      }: {
        id: string;
        payload: UserPayloadUpdateModel;
      }) => {
        return axios.patch(`${baseUrl}/${id}`, {
          no_unique : payload.no_unique,
        });
      },
      onSuccess: (_, variables) => {
        // segarkan list & detail
        queryClient.invalidateQueries({ queryKey: [queryKey] });
        queryClient.invalidateQueries({ queryKey: [entity, variables.id] });
        MainNotification({
          type: "success",
          entity,
          action: "document updated",
        });
      },
      onError: () => {
        MainNotification({
          type: "error",
          entity,
          action: "document updated",
        });
      },
    });

     const {
       mutateAsync: onPatchMemberCard,
       isPending: onPatchMemberCardLoading,
     } = useMutation({
       mutationFn: async ({
         id,
         payload,
       }: {
         id: string;
         payload: UserPayloadUpdateModel;
       }) => {
         return axios.patch(`${baseUrl}/${id}`, {
           no_unique: payload.no_unique,
         });
       },
       onSuccess: (_, variables) => {
         // segarkan list & detail
         queryClient.invalidateQueries({ queryKey: [queryKey] });
         queryClient.invalidateQueries({ queryKey: [entity, variables.id] });
         MainNotification({
           type: "success",
           entity,
           action: "document updated",
         });
       },
       onError: () => {
         MainNotification({
           type: "error",
           entity,
           action: "document updated",
         });
       },
     });

  return {
    data,
    fetchLoading,
    onUpdate,
    onUpdateLoading,
    onPatchDocument,
    onPatchDocumentLoading,
    onPatchCodeUnique,
    onPatchCodeUniqueLoading,
    onPatchMemberCard,
    onPatchMemberCardLoading
  };
};
