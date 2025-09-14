import dayjs from "dayjs";

import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

function formatDate(d?: string | Date | null) {
  if (!d) return "-";
  const dateObj = dayjs(d).tz("Asia/Makassar");
  return dateObj.format("DD MMMM YYYY");
}

function formatDateTime(d?: string | Date | null) {
  if (!d) return "-";
  const dateObj = dayjs(d).tz("Asia/Makassar");
  return dateObj.format("DD MMMM YYYY, HH:mm");
}

function formatTime(d?: string | Date | null) {
  try {
    if (!d) return "-";
    const dateObj = dayjs(d);
    return dateObj.format("HH:mm");
  } catch {
    return "-";
  }
}

export { formatDate, formatDateTime, formatTime };
