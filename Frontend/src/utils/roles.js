/** Where a signed-in account should land, based on its role. */
export const landingFor = (type) =>
  type === "local guide" ? "/local-guide" : type === "admin" ? "/admin/dashboard" : "/user";
