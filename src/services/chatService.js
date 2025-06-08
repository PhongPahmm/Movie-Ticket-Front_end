import axiosConfig from "./axiosConfig";

export const sendChatRequest = async (question) => {
  const response = await axiosConfig.post("/chat", { question });
  return response.data;
};
