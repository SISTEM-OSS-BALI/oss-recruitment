// src/app/hooks/question-matriks.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import MainNotification from "../../components/common/notifications";

import type {
  MatriksQuestionDataModel,
  MatriksQuestionUpdateDTO,
} from "@/app/models/question-matriks";

// ---------- Konstanta ----------
const baseUrl = "/api/admin/dashboard/question-matriks";
const entity = "question-matriks";
const queryKey = "question-matriks";

// Payload create untuk row matriks via endpoint single-row (perlu baseId)
export type MatriksQuestionCreatePayload = {
  baseId: string;
  text: string;
  inputType: string; // atau QuestionMatriksType jika kamu export enum-nya
  required?: boolean;
  order?: number;
  helpText?: string | null;
  placeholder?: string | null;
};

// ========================= Collection hook =========================
export const useQuestionMatriks = ({
  queryString,
}: {
  queryString?: string;
}) => {
  const queryClient = useQueryClient();

  // GET list (gunakan ?base_id=xxx)
  const {
    data,
    isLoading: fetchLoading,
    error,
  } = useQuery<MatriksQuestionDataModel[], Error>({
    queryKey: [queryKey, queryString ?? ""],
    queryFn: async () => {
      const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
      const res = await axios.get(url);
      return res.data.result as MatriksQuestionDataModel[];
    },
  });

  // CREATE (perlu baseId di body, jangan kirim options)
  const { mutateAsync: onCreate, isPending: onCreateLoading } = useMutation({
    mutationFn: async (payload: MatriksQuestionCreatePayload) => {
      return axios.post(baseUrl, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      MainNotification({ type: "success", entity, action: "created" });
    },
    onError: () => {
      MainNotification({ type: "error", entity, action: "created" });
    },
  });

  // DELETE
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
    error,
    onCreate,
    onCreateLoading,
    onDelete,
    onDeleteLoading,
  };
};

// ========================= Detail hook =========================
export const useQuestionMatriksById = ({ id }: { id: string }) => {
  const queryClient = useQueryClient();

  // GET by id
  const {
    data,
    isLoading: fetchLoading,
    error,
  } = useQuery<MatriksQuestionDataModel, Error>({
    queryKey: [entity, id],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/${id}`);
      return res.data.result as MatriksQuestionDataModel;
    },
    enabled: Boolean(id),
  });

  // UPDATE by id
  const { mutateAsync: onUpdate, isPending: onUpdateLoading } = useMutation({
    mutationFn: async (payload: MatriksQuestionUpdateDTO) =>
      axios.put(`${baseUrl}/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      queryClient.invalidateQueries({ queryKey: [entity, id] });
      MainNotification({ type: "success", entity, action: "updated" });
    },
    onError: () => {
      MainNotification({ type: "error", entity, action: "updated" });
    },
  });

  return {
    data,
    fetchLoading,
    error,
    onUpdate,
    onUpdateLoading,
  };
};
