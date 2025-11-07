import axios from "axios";

export function formatPhoneNumber(phone: string): string {
  const digitsOnly = phone.replace(/[^\d]/g, "");
  if (!digitsOnly) return "";

  if (digitsOnly.startsWith("62")) return digitsOnly;
  if (digitsOnly.startsWith("0")) return `62${digitsOnly.slice(1)}`;
  if (digitsOnly.startsWith("8")) return `62${digitsOnly}`;

  return digitsOnly;
}

export async function sendWhatsAppMessage(phoneNo: string, message: string) {
  const apiKey = process.env.NEXT_PUBLIC_API_KEY_WATZAP;
  const numberKey = process.env.NEXT_PUBLIC_NUMBER_KEY_WATZAP;

  if (!apiKey || !numberKey) {
    throw new Error("Missing WhatsApp credentials");
  }

  const normalizedPhone = formatPhoneNumber(phoneNo);
  if (!normalizedPhone) {
    throw new Error("Invalid phone number");
  }

  return axios.post("https://api.watzap.id/v1/send_message", {
    api_key: apiKey,
    number_key: numberKey,
    phone_no: normalizedPhone,
    message,
    wait_until_send: "1",
  });
}
