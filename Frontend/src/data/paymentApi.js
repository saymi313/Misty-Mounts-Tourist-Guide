import api from "./api";

/** Is online (gateway) checkout configured on the server? */
export const getPayConfig = async () => {
  try {
    return (await api.get("/pay/config")).data; // { enabled, provider, redirect }
  } catch {
    return { enabled: false };
  }
};

/** Start checkout for a pending booking; returns { url } or { form: {action, fields} }. */
export const startCheckout = async (type, ref) =>
  (await api.post("/pay/checkout", { type, ref })).data;

/** Send the traveller to the gateway: follow a redirect URL, or auto-submit the
 * provider's POST form (JazzCash/Easypaisa hosted checkout). */
export const submitCheckout = (result) => {
  if (result?.url) { window.location.href = result.url; return; }
  if (result?.form?.action) {
    const { action, fields = {} } = result.form;
    const form = document.createElement("form");
    form.method = "POST";
    form.action = action;
    Object.entries(fields).forEach(([k, v]) => {
      const input = document.createElement("input");
      input.type = "hidden"; input.name = k; input.value = v == null ? "" : String(v);
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
  }
};

// Traveller milestone: confirm service received → release escrow to the partner.
export const confirmStay = async (id) => (await api.patch(`/payment/${id}/confirm`)).data.booking;
export const confirmTour = async (id) => (await api.patch(`/payment/tour-payments/${id}/confirm`)).data.booking;
