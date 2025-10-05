import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import MainNotification from "../../components/common/notifications";
import {
  QuestionScreeningDataModel,
  // DTOs yang kita pakai di client
  QuestionScreeningCreateDTO,
  QuestionScreeningUpdateDTO,
} from "@/app/models/question-screening";

// ---------- Konstanta ----------
const baseUrl = "/api/admin/dashboard/question-screening";
const entity = "question-screening";
const queryKey = "question-screening";

// ---------- Utils kecil ----------

/**
 * Jangan kirim options: [] ke server — kembalikan undefined jika kosong.
 * (Server/provider akan mengubah array menjadi nested { create: [...] } ke Prisma.)
 */
function normalizeCreatePayload(
  payload: QuestionScreeningCreateDTO
): QuestionScreeningCreateDTO {
  const opts = payload.options;
  return {
    ...payload,
    options: Array.isArray(opts) && opts.length > 0 ? opts : undefined,
  };
}

// ========================= Collection hook =========================
export const useQuestionScreenings = ({
  queryString,
}: {
  queryString?: string;
}) => {
  const queryClient = useQueryClient();

  // GET list
  const {
    data,
    isLoading: fetchLoading,
    error,
  } = useQuery<QuestionScreeningDataModel[], Error>({
    queryKey: [queryKey, queryString ?? ""],
    queryFn: async () => {
      const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
      const res = await axios.get(url);
      // Sesuaikan shape responsemu di API
      return res.data.result as QuestionScreeningDataModel[];
    },
  });

  // CREATE
  const { mutateAsync: onCreate, isPending: onCreateLoading } = useMutation({
    mutationFn: async (payload: QuestionScreeningCreateDTO) => {
      const body = normalizeCreatePayload(payload);
      return axios.post(baseUrl, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      MainNotification({ type: "success", entity, action: "created" });
    },
    onError: () => {
      MainNotification({
        type: "error",
        entity,
        action: "created",
      });
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
      MainNotification({
        type: "error",
        entity,
        action: "deleted",
      });
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
export const useQuestionScreening = ({ id }: { id: string }) => {
  const queryClient = useQueryClient();

  // GET by id
  const {
    data,
    isLoading: fetchLoading,
    error,
  } = useQuery<QuestionScreeningDataModel, Error>({
    queryKey: [entity, id],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/${id}`);
      return res.data.result as QuestionScreeningDataModel;
    },
    enabled: Boolean(id),
  });

  // UPDATE by id
  const { mutateAsync: onUpdate, isPending: onUpdateLoading } = useMutation({
    mutationFn: async (payload: QuestionScreeningUpdateDTO) =>
      axios.put(`${baseUrl}/${id}`, payload),
    onSuccess: () => {
      // invalidasi list dan detail
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      queryClient.invalidateQueries({ queryKey: [entity, id] });
      MainNotification({ type: "success", entity, action: "updated" });
    },
    onError: () => {
      MainNotification({
        type: "error",
        entity,
        action: "updated",
      });
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
