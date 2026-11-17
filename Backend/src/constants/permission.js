const def = (code, name, module) => ({ code, name, module });

const PERMISSIONS = {
  // PRODUCT
  PRODUCT_READ: def("product:read", "Xem danh sách sản phẩm", "PRODUCT"),
  PRODUCT_CREATE: def("product:create", "Thêm sản phẩm mới", "PRODUCT"),
  PRODUCT_UPDATE: def("product:update", "Sửa thông tin sản phẩm", "PRODUCT"),
  PRODUCT_DELETE: def("product:delete", "Xóa sản phẩm", "PRODUCT"),
  PRODUCT_STOCK: def("product:stock", "Điều chỉnh tồn kho", "PRODUCT"),

  // ORDER
  ORDER_READ: def("order:read", "Xem danh sách đơn hàng", "ORDER"),
  ORDER_UPDATE_STATUS: def(
    "order:update_status",
    "Cập nhật trạng thái đơn hàng",
    "ORDER",
  ),

  // USER
  USER_READ: def("user:read", "Xem danh sách người dùng", "USER"),
  USER_MANAGE: def("user:manage", "Quản lý tài khoản người dùng", "USER"),

  // ROLE & PERMISSION
  ROLE_MANAGE: def("role:manage", "Quản lý vai trò", "ROLE"),
  PERMISSION_MANAGE: def(
    "permission:manage",
    "Quản lý quyền hệ thống",
    "PERMISSION",
  ),

  // OTHER
  DASHBOARD_VIEW: def("dashboard:view", "Xem thống kê", "DASHBOARD"),
  CATEGORY_MANAGE: def("category:manage", "Quản lý danh mục", "CATEGORY"),
  BRAND_MANAGE: def("brand:manage", "Quản lý thương hiệu", "BRAND"),
  REVIEW_MANAGE: def("review:manage", "Kiểm duyệt đánh giá", "REVIEW"),
};

const P = Object.fromEntries(
  Object.entries(PERMISSIONS).map(([key, value]) => [key, value.code]),
);

const ALL_CODES = Object.values(P);

// Quyền quản lý cấu trúc phân quyền chỉ dành cho SUPER_ADMIN
const SYSTEM_CODES = [P.ROLE_MANAGE, P.PERMISSION_MANAGE];

const ADMIN_PERMISSIONS = ALL_CODES.filter(
  (code) => !SYSTEM_CODES.includes(code),
);

const MANAGER_PERMISSIONS = ALL_CODES.filter(
  (code) => code !== P.USER_MANAGE && !SYSTEM_CODES.includes(code),
);

const ROLES = [
  {
    name: "SUPER_ADMIN",
    description: "Quản trị viên cấp cao nhất, toàn quyền hệ thống",
    permissions: "*",
  },
  {
    name: "ADMIN",
    description: "Quản trị viên hệ thống",
    permissions: ADMIN_PERMISSIONS,
  },
  {
    name: "MANAGER",
    description: "Quản lý cửa hàng",
    permissions: MANAGER_PERMISSIONS,
  },
  {
    name: "STAFF_SALE",
    description: "Nhân viên bán hàng và xử lý đơn hàng",
    permissions: [
      P.PRODUCT_READ,
      P.PRODUCT_UPDATE,
      P.PRODUCT_STOCK,
      P.ORDER_READ,
      P.ORDER_UPDATE_STATUS,
      P.DASHBOARD_VIEW,
    ],
  },
  {
    name: "CUSTOMER",
    description: "Khách hàng mua sắm",
    permissions: [],
  },
];

module.exports = {
  PERMISSIONS,
  P,
  ALL_CODES,
  SYSTEM_CODES,
  ROLES,
};
