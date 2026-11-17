const permissionModel = require("../models/permission.model");
const { ALL_CODES } = require("../constants/permission");

const TTL_MS = 60 * 1000;
const cache = new Map();

const getUserPermissions = async (userId, roleName = null) => {
  // SUPER_ADMIN luôn có toàn bộ quyền, không phụ thuộc cache cũ
  if (roleName === "SUPER_ADMIN") {
    const codes = new Set(ALL_CODES);

    cache.set(userId, {
      codes,
      expires: Date.now() + TTL_MS,
    });

    return codes;
  }

  const hit = cache.get(userId);

  if (hit && hit.expires > Date.now()) {
    return hit.codes;
  }

  const codes = new Set(await permissionModel.findCodesByUser(userId));

  cache.set(userId, {
    codes,
    expires: Date.now() + TTL_MS,
  });

  return codes;
};

const clearPermissionCache = (userId) =>
  userId ? cache.delete(userId) : cache.clear();

module.exports = {
  getUserPermissions,
  clearPermissionCache,
};
