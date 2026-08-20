import api from "./api";

/** Is online (gateway) checkout configured on the server? */
export const getPayConfig = async () => {
  try {
    return (await api.get("/pay/config")).data; // { enabled, provider }
  } catch {
    return { enabled: false };
  }
};

/** Start a hosted-checkout session for a pending booking; returns { url }. */
export const startCheckout = async (type, ref) =>
  (await api.post("/pay/checkout", { type, ref })).data;
