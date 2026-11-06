const router = require("express").Router();
const { authenticate, authorize } = require("../middleware/auth.middleware");
const { P } = require("../constants/permission");
const role = require("../controller/role.controller");

// Cả khu admin: phải đăng nhập và có quyền user:manage
router.use(authenticate, authorize(P.USER_MANAGE));

// Permission chỉ ĐỌC. Không có route tạo/xóa: quyền do lập trình viên khai báo trong code
router.get("/permissions", role.listPermissions);

router.get("/roles", role.listRoles);
router.post("/roles", role.createRole);
router.get("/roles/:id", role.getRole);
router.patch("/roles/:id", role.updateRole);
router.delete("/roles/:id", role.deleteRole);
router.put("/roles/:id/permissions", role.setRolePermissions);

router.patch("/users/:id/role", role.assignUserRole);

module.exports = router;
