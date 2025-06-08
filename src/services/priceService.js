import axiosConfig from "./axiosConfig";

export const getPriceByShowIdSeatTypeDate = async (showId, seatType, date) => {
  const res = await axiosConfig.get(
    `/prices/valid-price?showId=${showId}&seatType=${seatType}&date=${date}`
  );
  return res.data?.data?.amount || 0;
};
