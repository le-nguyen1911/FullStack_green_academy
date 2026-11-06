const def = (code, name, module) => ({ code, name, module });

const PERMISSIONS = {
  // PRODUCT
  PRODUCT_READ: def("product:read", "Xem danh sách sản phẩm", "PRODUCT"),
  PRODUCT_CREATE: def("product:create", "Thêm sản phẩm mới", "PRODUCT"),
  PRODUCT_UPDATE: def("product:update", "Sửa thông tin sản phẩm", "PRODUCT"),
  PRODUCT_DELETE: def("product:delete", "Xóa sản phẩm", "PRODUCT"),
};


//convert [key, value] to object with key and value.code
const P = Object.fromEntries(
  Object.entries(PERMISSIONS).map(([k, v]) => [k, v.code]),
);
const ALL_CODES = Object.values(P);
//ole mặc định
const ROLES = [
  { name: "ADMIN", description: "Quản trị viên toàn quyền hệ thống", permissions: "*" },
  {
    name: "MANAGER",
    description: "Quản lý cửa hàng",
    permissions: ALL_CODES.filter((c) => c !== P.USER_MANAGE),  
  },
  {
    name: "STAFF_SALE",
    description: "Nhân viên bán hàng & xử lý đơn hàng",
    permissions: [P.PRODUCT_READ, P.PRODUCT_UPDATE, P.ORDER_READ, P.ORDER_UPDATE_STATUS, P.DASHBOARD_VIEW],
  },
  { name: "CUSTOMER", description: "Khách hàng mua sắm", permissions: [] },
];

module.exports = { PERMISSIONS, P, ALL_CODES, ROLES };