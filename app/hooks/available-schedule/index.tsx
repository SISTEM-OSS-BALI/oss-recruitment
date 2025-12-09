import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const baseUrl = "/api/admin/dashboard/schedule-evaluator/schedule-available";
const queryKey = "schedule-evaluators";

export type AvailableScheduleSlot = {
  start: string;
  end: string;
};

export type AvailableScheduleDay = {
  day: string;
  slots: AvailableScheduleSlot[];
};

export type AvailableScheduleResponse = {
  schedule_id: string;
  evaluator_id: string;
  available: AvailableScheduleDay[];
  meta?: {
    tz: string;
    forDateLocal: string;
    interviewSlotMinutes: number;
  };
};

type UseAvailableSchedulesArgs = {
  schedule_id: string;
  selected_date?: Date | string | null;
};

const toIsoDate = (value?: Date | string | null) => {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const buildUrl = (scheduleId: string, isoDate?: string) => {
  const params = new URLSearchParams({ schedule_id: scheduleId });
  if (isoDate) params.set("selected_date", isoDate);
  return `${baseUrl}?${params.toString()}`;
};

export const useAvailableSchedules = ({
  schedule_id,
  selected_date,
}: UseAvailableSchedulesArgs) => {
  const scheduleId = schedule_id?.trim();
  const selectedDateIso = toIsoDate(selected_date);
  const enabled = Boolean(scheduleId);

  const { data, isLoading: fetchLoading } = useQuery({
    queryKey: [queryKey, scheduleId, selectedDateIso],
    enabled,
    queryFn: async () => {
      const url = buildUrl(scheduleId!, selectedDateIso);
      const result = await axios.get(url);
      return result.data.result as AvailableScheduleResponse;
    },
  });

  return {
    data,
    fetchLoading,
  };
};
