import axiosConfig from "./axiosConfig";

export const createBooking = async (bookingRequest) => {
  const response = await axiosConfig.post("/bookings/book", bookingRequest);
  return response.data;
};

export const checkVnpayPaymentResult = async (queryParams) => {
  const queryString = new URLSearchParams(queryParams).toString();
  const response = await axiosConfig.get(
    `/bookings/payment-return/vnpay-payment?${queryString}`
  );
  return response.data;
};
