const permissionModel = require("../models/permission.model");

const TTL_MS = 60 * 1000; 
const cache = new Map(); 

const getUserPermissions = async (userId) => {
  const hit = cache.get(userId);
  if (hit && hit.expires > Date.now()) return hit.codes;

  const codes = new Set(await permissionModel.findCodesByUser(userId));
  cache.set(userId, { codes, expires: Date.now() + TTL_MS });
  return codes;
};

const clearPermissionCache = (userId) =>
  userId ? cache.delete(userId) : cache.clear();

module.exports = { getUserPermissions, clearPermissionCache };