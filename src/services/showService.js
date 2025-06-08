import axiosConfig from "./axiosConfig";

export const getShowByMovieAndDate = async (movieId, date) => {
  try {
    const response = await axiosConfig.get(`/shows/movie/${movieId}/by-date`, {
      params: {
        date,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const getShowById = async (showId) => {
  try {
    const response = await axiosConfig.get(`/shows/${showId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
