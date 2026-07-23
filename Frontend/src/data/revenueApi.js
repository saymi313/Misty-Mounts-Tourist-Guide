import api from "./api";

// Public — accounts the traveller pays into at checkout.
export const getPaymentAccounts = async () => (await api.get("/payment/accounts")).data.paymentAccounts;

// Admin — payments (bookings) verification.
export const listPayments = async () => (await api.get("/payment")).data.payments;
export const verifyPayment = async (id, approved) =>
  (await api.patch(`/payment/${id}/verify`, { approved })).data.booking;

// Admin — payout requests + guide earnings credits.
export const listPayouts = async () => (await api.get("/payment/payouts")).data.payouts;
export const verifyPayout = async (id, approved) =>
  (await api.patch(`/payment/payouts/${id}/verify`, { approved })).data.payout;
export const creditGuide = async (b) => (await api.post("/payment/earnings", b)).data.earning;

// Partner (hotel / local guide) — balance, requests, credits received.
export const getBalance = async () => (await api.get("/payment/balance")).data;
export const requestPayout = async (b) => (await api.post("/payment/payouts/request", b)).data.payout;
export const listMyPayouts = async () => (await api.get("/payment/payouts/me")).data.payouts;
export const listMyEarnings = async () => (await api.get("/payment/earnings/me")).data.earnings;
