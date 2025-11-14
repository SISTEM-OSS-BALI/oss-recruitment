import axios from "axios";

export async function sendWhatsAppMessage( message: string) {
  const apiKey = process.env.NEXT_PUBLIC_API_KEY_WATZAP;
  const numberKey = process.env.NEXT_PUBLIC_NUMBER_KEY_WATZAP;
  const numberGroupId = process.env.NEXT_PUBLIC_NUMBER_GROUP_ID_WATZAP;
  return axios.post("https://api.watzap.id/v1/send_message_group", {
    api_key: apiKey,
    number_key: numberKey,
    group_id: numberGroupId,
    message,
    wait_until_send: "1",
  });
}


