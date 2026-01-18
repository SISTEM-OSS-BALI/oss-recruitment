import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import MainNotification from "../../components/common/notifications";

import {
  OfferingContractDataModel,
  OfferingContractDecisionPayload,
  DirectorSignatureRequestPayload,
  DirectorSignatureUploadPayload,
  OfferingContractPayloadCreateModel,
  OfferingContractPayloadUpdateModel,
} from "@/app/models/offering-contract";

const baseUrl = "/api/admin/dashboard/offering-contract";
const entity = "offering-contract";
const queryKey = "offering-contracts";

export interface OfferingContractCountByJobType {
  jobType: string;
  count: number;
}

export const useOfferingContracts = (params?: { queryString?: string }) => {
  const queryString = params?.queryString;
  const queryClient = useQueryClient();

  const { data, isLoading: fetchLoading } = useQuery({
    queryKey: [queryKey, queryString],
    queryFn: async () => {
      const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
      const result = await axios.get(url);
      return result.data.result as OfferingContractDataModel[];
    },
  });

  const { mutateAsync: onCreate, isPending: onCreateLoading } = useMutation({
    mutationFn: async (payload: OfferingContractPayloadCreateModel) =>
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

export const useOfferingContract = ({ id }: { id: string }) => {
  const queryClient = useQueryClient();

  // Query data berdasarkan ID
  const { data, isLoading: fetchLoading } = useQuery({
    queryKey: [entity, id],
    queryFn: async () => {
      const result = await axios.get(`${baseUrl}/${id}`);
      return result.data.result as OfferingContractDataModel;
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
      payload: OfferingContractPayloadUpdateModel;
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
    fetchLoading,
    onUpdate,
    onUpdateLoading,
  };
};

export const useOfferingContractByApplicantId = ({
  applicant_id,
}: {
  applicant_id: string;
}) => {
  const queryClient = useQueryClient();

  // Query data berdasarkan ID
  const { data, isLoading: fetchLoading } = useQuery({
    queryKey: [entity, applicant_id],
    queryFn: async () => {
      const result = await axios.get(`${baseUrl}/by-candidate/${applicant_id}`);
      return result.data.result as OfferingContractDataModel;
    },
    enabled: Boolean(applicant_id),
  });

  const { mutateAsync: onSubmitDecision, isPending: onSubmitDecisionLoading } =
    useMutation({
      mutationFn: async (payload: OfferingContractDecisionPayload) =>
        axios.patch(`${baseUrl}/by-candidate/${applicant_id}`, payload),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [entity, applicant_id] });
        MainNotification({
          type: "success",
          entity: "candidate decision",
          action: "updated",
        });
      },
      onError: () => {
        MainNotification({
          type: "error",
          entity: "candidate decision",
          action: "updated",
        });
      },
    });

  const { mutateAsync: onRequestDirectorSignature, isPending: onRequestDirectorSignatureLoading } =
    useMutation({
      mutationFn: async (payload: DirectorSignatureRequestPayload) => {
        const { contractId, ...rest } = payload;
        return axios.post(
          `${baseUrl}/${contractId}/request-signature`,
          rest ?? {}
        );
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [entity, applicant_id] });
        MainNotification({
          type: "success",
          entity: "director signature request",
          action: "sent",
        });
      },
      onError: () => {
        MainNotification({
          type: "error",
          entity: "director signature request",
          action: "sent",
        });
      },
    });

  const { mutateAsync: onUploadDirectorSignature, isPending: onUploadDirectorSignatureLoading } =
    useMutation({
      mutationFn: async (payload: DirectorSignatureUploadPayload) => {
        const { contractId, ...rest } = payload;
        return axios.patch(`${baseUrl}/${contractId}/director-signature`, rest);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [entity, applicant_id] });
        MainNotification({
          type: "success",
          entity: "director signature",
          action: "updated",
        });
      },
      onError: () => {
        MainNotification({
          type: "error",
          entity: "director signature",
          action: "updated",
        });
      },
    });

    const {
      mutateAsync: onApplyCandidateSignature,
      isPending: onApplyCandidateSignatureLoading,
    } = useMutation({
      mutationFn: ({ contractId }: { contractId: string }) =>
        axios.post(`${baseUrl}/${contractId}/apply-candidate-signature`),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [entity, applicant_id] });
        MainNotification({
          type: "success",
          entity: "candidate signature",
          action: "stamped",
        });
      },
      onError: () => {
        MainNotification({
          type: "error",
          entity: "candidate signature",
          action: "stamped",
        });
      },
    });

    const {
      mutateAsync: onSendFinalEmail,
      isPending: onSendFinalEmailLoading,
    } = useMutation({
      mutationFn: ({ contractId }: { contractId: string }) =>
        axios.post(`${baseUrl}/${contractId}/send-final-email`),
      onSuccess: () =>
        MainNotification({ type: "success", entity: "email", action: "sent" }),
      onError: () =>
        MainNotification({ type: "error", entity: "email", action: "sent" }),
    });

  return {
    data,
    fetchLoading,
    onSubmitDecision,
    onSubmitDecisionLoading,
    onRequestDirectorSignature,
    onRequestDirectorSignatureLoading,
    onUploadDirectorSignature,
    onUploadDirectorSignatureLoading,
    onApplyCandidateSignature,
    onApplyCandidateSignatureLoading,
    onSendFinalEmail,
    onSendFinalEmailLoading
  };
};

export const useOfferingContractCountByJobType = (): {
  data: OfferingContractCountByJobType[] | undefined;
  fetchLoading: boolean;
} => {
  const { data, isLoading: fetchLoading } = useQuery({
    queryKey: [entity, "count-by-job-type"],
    queryFn: async () => {
      const result = await axios.get(
        `${baseUrl}/count-by-job-type`
      );
      return result.data.result as OfferingContractCountByJobType[];
    },
  });

  return {
    data,
    fetchLoading,
  };
};


