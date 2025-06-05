import axiosConfig from "./axiosConfig";

export const getGenres = async () => {
  try {
    const response = await axiosConfig.get("/genres");
    return response.data.data || [];
  } catch (error) {
    console.error("Get genres API error:", error);
    throw error;
  }
};
