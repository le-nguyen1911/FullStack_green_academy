export const MANAGER_ROLES = ["ADMIN", "MANAGER", "STAFF_SALE"];
export const isManagerRole = (role) => MANAGER_ROLES.includes(role);

export const getHomePath = () => "/";


export const getRedirectAfterLogin = (user, from) => {
  const guestOnly = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ];
  if (from && !guestOnly.some((p) => from.startsWith(p))) {
    const fromIsManager = from.startsWith("/manager");
    if (fromIsManager === isManagerRole(user.role) || !fromIsManager)
      return from;
  }
  return getHomePath();
};
