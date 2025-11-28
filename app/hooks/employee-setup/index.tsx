import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import MainNotification from "../../components/common/notifications";
import {
  EmployeeSetupDataModel,
  EmployeeSetupPayloadCreateModel,
  EmployeeSetupPayloadUpdateModel,
} from "@/app/models/employee-setup";
import {
  ApplicantEmployeeSetupDataModel,
  AssignEmployeeSetupPayload,
} from "@/app/models/applicant-employee-setup";
import { EmployeeSetupAnswerUpdateRequest } from "@/app/models/employee-setup-answer";

const baseUrl = "/api/admin/dashboard/employee-setup";
const entity = "employee setups";
const queryKey = "employee-setup";
const assignmentBaseUrl =
  "/api/admin/dashboard/applicant-employee-setup";
const assignmentEntity = "employee setup assignment";
const assignmentQueryKey = "applicant-employee-setup";
const userAssignmentBaseUrl = "/api/user/applicant-employee-setup";
const userAnswerBaseUrl = "/api/user/employee-setup-answer";

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

export const useApplicantEmployeeSetups = ({
  applicantId,
}: {
  applicantId?: string;
}) => {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [assignmentQueryKey, applicantId],
    queryFn: async () => {
      const result = await axios.get(
        `${assignmentBaseUrl}?applicant_id=${applicantId}`
      );
      return result.data.result as ApplicantEmployeeSetupDataModel[];
    },
    enabled: Boolean(applicantId),
  });

  const { mutateAsync: onAssign, isPending: assignLoading } = useMutation({
    mutationFn: async (payload: AssignEmployeeSetupPayload) =>
      axios.post(assignmentBaseUrl, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [assignmentQueryKey, variables.applicantId],
      });
      MainNotification({
        type: "success",
        entity: assignmentEntity,
        action: "updated",
      });
    },
    onError: () => {
      MainNotification({
        type: "error",
        entity: assignmentEntity,
        action: "updated",
      });
    },
  });

  return {
    data,
    fetchLoading: isLoading || isFetching,
    onAssign,
    assignLoading,
  };
};

export const useApplicantEmployeeSetupsByApplicant = ({
  applicantId,
}: {
  applicantId?: string;
}) => {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: [assignmentQueryKey, "user", applicantId],
    queryFn: async () => {
      const result = await axios.get(
        `${userAssignmentBaseUrl}/${applicantId}`
      );
      return result.data.result as ApplicantEmployeeSetupDataModel[];
    },
    enabled: Boolean(applicantId),
  });

  return {
    data,
    fetchLoading: isLoading || isFetching,
  };
};

export const useUpdateEmployeeSetupAnswer = ({
  applicantId,
}: {
  applicantId?: string;
}) => {
  const queryClient = useQueryClient();

  const { mutateAsync: onUpdateAnswer, isPending: onUpdateAnswerLoading } =
    useMutation({
      mutationFn: async (
        payload: Omit<EmployeeSetupAnswerUpdateRequest, "applicantId">
      ) => {
        if (!applicantId) {
          throw new Error("Applicant is required to update answers");
        }
        return axios.patch(userAnswerBaseUrl, {
          ...payload,
          applicantId: applicantId ?? "",
        });
      },
      onSuccess: () => {
        if (!applicantId) return;
        queryClient.invalidateQueries({
          queryKey: [assignmentQueryKey, "user", applicantId],
        });
        queryClient.invalidateQueries({
          queryKey: [assignmentQueryKey, applicantId],
        });
      },
    });

  return {
    onUpdateAnswer,
    onUpdateAnswerLoading,
  };
};
