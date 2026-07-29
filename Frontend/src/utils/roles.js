/** Where a signed-in account should land, based on its role. */
export const landingFor = (type) =>
  type === "local guide"
    ? "/local-guide"
    : type === "hotel"
    ? "/hotel"
    : type === "travel agency"
    ? "/travel-agency"
    : type === "admin"
    ? "/admin/dashboard"
    : "/user";
