// hooks/useRecommendedCandidates.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import MainNotification from "@/app/components/common/notifications";

export type ScoredCandidateModel = {
  id: string;
  name: string;
  score: number;
  matched: string[];
  interestTags?: { name?: string; tag?: string }[];
};

const baseUrl = "/api/admin/dashboard/recommendations-candidates";
const queryKey = "recommended-candidates";

export type RankedCandidateModel = ScoredCandidateModel & { rank: number };

export function useRecommendedCandidates({
  jobId,
  minScore = 2,
  limit = 50,
  enabled = true,
}: {
  jobId?: string;
  minScore?: number;
  limit?: number;
  enabled?: boolean;
}) {
  const qc = useQueryClient();

  const { data, isLoading, isFetching, refetch } = useQuery<RankedCandidateModel[]>({
    queryKey: [queryKey, { jobId, minScore, limit }],
    enabled: !!jobId && enabled,
    queryFn: async () => {
      const { data } = await axios.get(baseUrl, {
        params: { jobId, minScore, limit },
      });
      // pastikan API kamu mengirim { result: [...] }
      return (data?.result ?? []) as ScoredCandidateModel[];
    },
    keepPreviousData: true,
    staleTime: 30_000, // 30s
    select: (rows) =>
      rows
        .slice()
        .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
        .map((r, idx) => ({ ...r, rank: idx + 1 })), // opsional: tambahkan rank
  });

  // Contoh mutation opsional (mis. shortlist kandidat)
  const { mutateAsync: onShortlist, isPending: shortlistLoading } = useMutation(
    {
      mutationFn: async (candidateId: string) =>
        axios.post(`/api/admin/candidates/${candidateId}/shortlist`, {
          jobId,
        }),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [queryKey] });
        MainNotification({
          type: "success",
          entity: "candidate",
          action: "shortlisted",
        });
      },
      onError: () => {
        MainNotification({
          type: "error",
          entity: "candidate",
          action: "shortlisted",
        });
      },
    }
  );

  return {
    data, // ScoredCandidateModel[] + rank (hasil select)
    isLoading,
    isFetching,
    refetch,
    onShortlist, // opsional
    shortlistLoading, // opsional
  };
}
