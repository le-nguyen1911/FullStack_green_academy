const router = require("express").Router();
const {
  authenticate,
  authorize,
  requireRole,
} = require("../middleware/auth.middleware");

const { P } = require("../constants/permission");
const role = require("../controller/role.controller");

router.use(authenticate);

router.use(
  authorize(P.ROLE_MANAGE, P.PERMISSION_MANAGE),
  requireRole("SUPER_ADMIN"),
);

router.get("/permissions", role.listPermissions);

router.get("/roles", role.listRoles);
router.post("/roles", role.createRole);
router.get("/roles/:id", role.getRole);
router.patch("/roles/:id", role.updateRole);
router.delete("/roles/:id", role.deleteRole);
router.put("/roles/:id/permissions", role.setRolePermissions);

router.patch("/users/:id/role", role.assignUserRole);

module.exports = router;
