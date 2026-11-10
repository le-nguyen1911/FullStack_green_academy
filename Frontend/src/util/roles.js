export const MANAGER_ROLES = ["ADMIN", "MANAGER", "STAFF_SALE"];
export const isManagerRole = (role) => MANAGER_ROLES.includes(role);

export const getHomePath = (user) =>
  isManagerRole(user.role) ? "/manager/dashboard" : "/products";

export const getRedirectAfterLogin = (user, from) => {
  if (from) {
    const fromIsManager = from.startsWith("/manager");
    if (fromIsManager === isManagerRole(user.role)) return from;
  }
  return getHomePath(user);
};
