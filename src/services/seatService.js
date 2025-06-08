import axiosConfig from "./axiosConfig";

export const getSeatsByShowId = async (showId) => {
  try {
    const response = await axiosConfig.get(`/seats/show/${showId}`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
