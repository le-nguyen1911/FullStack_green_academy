const router = require("express").Router();
const { authenticate, authorize, requireRole } = require("../middleware/auth.middleware");
const { P } = require("../constants/permission");
const role = require("../controller/role.controller");

router.use(authenticate, authorize(P.USER_MANAGE));

// Danh sách quyền (dùng để chọn khi tạo/gán quyền cho role)
router.get("/permissions", role.listPermissions);

// Cụm API Quản lý Role - Chỉ duy nhất ADMIN mới có quyền truy cập
router.use("/roles", requireRole("ADMIN"));
router.get("/roles", role.listRoles);
router.post("/roles", role.createRole);
router.get("/roles/:id", role.getRole);
router.patch("/roles/:id", role.updateRole);
router.delete("/roles/:id", role.deleteRole);
router.put("/roles/:id/permissions", role.setRolePermissions);

router.patch("/users/:id/role", requireRole("ADMIN"), role.assignUserRole);

module.exports = router;
