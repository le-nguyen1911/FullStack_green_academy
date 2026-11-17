import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  RefreshCw,
  Users,
  ShieldCheck,
  UserCheck,
  UserX,
  Eye,
  Pencil,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import {
  fetchUsers,
  fetchUserDetail,
  updateUser,
  updateUserStatus,
  updateUserRole,
  clearUserDetail,
  clearUserMutation,
} from "../../redux/slices/managerUserSlice";

const ROLE_LABELS = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  MANAGER: "Quản lý",
  STAFF_SALE: "Nhân viên",
  CUSTOMER: "Khách hàng",
};

const STATUS_LABELS = {
  ACTIVE: "Hoạt động",
  LOCKED: "Đã khóa",
  DEACTIVATED: "Vô hiệu hóa",
};

const ROLE_COLORS = {
  SUPER_ADMIN: "bg-purple-100 text-purple-700",
  ADMIN: "bg-red-100 text-red-700",
  MANAGER: "bg-blue-100 text-blue-700",
  STAFF_SALE: "bg-amber-100 text-amber-700",
  CUSTOMER: "bg-gray-100 text-gray-700",
};

const STATUS_COLORS = {
  ACTIVE: "bg-green-100 text-green-700",
  LOCKED: "bg-red-100 text-red-700",
  DEACTIVATED: "bg-gray-100 text-gray-600",
};

const ManagerUser = () => {
  const dispatch = useDispatch();

  const { items, total, page, limit, totalPages, status, error } = useSelector(
    (state) => state.managerUsers.list,
  );

  const detail = useSelector((state) => state.managerUsers.detail);
  const mutation = useSelector((state) => state.managerUsers.mutation);

  const currentUser = useSelector((state) => state.auth?.user);
  const currentRole = currentUser?.role_name || currentUser?.role;

  const isSuperAdmin = currentRole === "SUPER_ADMIN";

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    phone: "",
  });

  const loadUsers = useCallback(
    (nextPage = 1) => {
      dispatch(
        fetchUsers({
          page: nextPage,
          limit,
          q: search.trim() || undefined,
          roleId: roleFilter || undefined,
          status: statusFilter || undefined,
        }),
      );
    },
    [dispatch, limit, search, roleFilter, statusFilter],
  );

  useEffect(() => {
    loadUsers(1);
  }, [loadUsers]);

  useEffect(() => {
    if (mutation.status === "succeeded") {
      loadUsers(page);
    }
  }, [mutation.status, loadUsers, page]);

  const openDetail = async (user) => {
    setSelectedUser(user);
    setShowDetail(true);
    dispatch(fetchUserDetail(user.id));
  };

  const openEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      full_name: user.full_name || "",
      phone: user.phone || "",
    });
    setShowEdit(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const result = await dispatch(
      updateUser({
        id: selectedUser.id,
        body: editForm,
      }),
    );

    if (updateUser.fulfilled.match(result)) {
      setShowEdit(false);
      loadUsers(page);
    }
  };

  const handleStatus = async (user) => {
    const nextStatus = user.status === "ACTIVE" ? "LOCKED" : "ACTIVE";

    if (
      !window.confirm(
        `Bạn có chắc muốn ${
          nextStatus === "LOCKED" ? "khóa" : "mở khóa"
        } tài khoản này?`,
      )
    ) {
      return;
    }

    await dispatch(
      updateUserStatus({
        id: user.id,
        status: nextStatus,
      }),
    );

    loadUsers(page);
  };

  const handleRoleChange = async (user, roleId) => {
    if (!roleId || !isSuperAdmin) return;

    if (!window.confirm("Bạn có chắc muốn thay đổi vai trò người dùng?")) {
      return;
    }

    const result = await dispatch(
      updateUserRole({
        id: user.id,
        role_id: roleId,
      }),
    );

    if (updateUserRole.fulfilled.match(result)) {
      loadUsers(page);
    }
  };

  const closeModals = () => {
    setShowDetail(false);
    setShowEdit(false);
    setSelectedUser(null);
    dispatch(clearUserDetail());
    dispatch(clearUserMutation());
  };

  const isLoading = status === "loading";

  return (
    <div className="min-h-screen space-y-6 bg-[#f8f6f3] p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-[#9a806b]">
            QUẢN LÝ HỆ THỐNG / NGƯỜI DÙNG
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[#3e2b22]">
            Quản lý người dùng
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý tài khoản và trạng thái người dùng trong hệ thống.
          </p>
        </div>

        <button
          onClick={() => loadUsers(page)}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#6f4e37] px-4 py-3 font-semibold text-white transition hover:bg-[#563b29] disabled:opacity-50"
        >
          <RefreshCw size={17} />
          Làm mới
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Tổng người dùng"
          value={total}
          icon={<Users size={22} />}
        />
        <StatCard
          title="Đang hoạt động"
          value={items.filter((u) => u.status === "ACTIVE").length}
          icon={<UserCheck size={22} />}
        />
        <StatCard
          title="Đã khóa"
          value={items.filter((u) => u.status === "LOCKED").length}
          icon={<UserX size={22} />}
        />
        <StatCard
          title="Quản trị viên"
          value={
            items.filter((u) => ["ADMIN", "SUPER_ADMIN"].includes(u.role_name))
              .length
          }
          icon={<ShieldCheck size={22} />}
        />
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-[#eee7df] bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadUsers(1)}
              placeholder="Tìm tên hoặc email..."
              className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none transition focus:border-[#8b654b] focus:ring-2 focus:ring-[#8b654b]/10"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#8b654b]"
          >
            <option value="">Tất cả vai trò</option>
            {Object.entries(ROLE_LABELS)
              .filter(([role]) => isSuperAdmin || role !== "SUPER_ADMIN")
              .map(([role, label]) => (
                <option key={role} value={role}>
                  {label}
                </option>
              ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#8b654b]"
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            onClick={() => {
              setSearch("");
              setRoleFilter("");
              setStatusFilter("");
            }}
            className="text-sm font-medium text-[#8b654b] hover:underline"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-[#eee7df] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="font-bold text-[#3e2b22]">Danh sách người dùng</h2>
          <span className="text-sm text-gray-500">{total} tài khoản</span>
        </div>

        {error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : isLoading ? (
          <div className="p-10 text-center text-gray-500">
            Đang tải danh sách...
          </div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            Không tìm thấy người dùng.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-[#faf8f5] text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-4">Người dùng</th>
                  <th className="px-5 py-4">Số điện thoại</th>
                  <th className="px-5 py-4">Vai trò</th>
                  <th className="px-5 py-4">Trạng thái</th>
                  <th className="px-5 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((user) => (
                  <tr key={user.id} className="transition hover:bg-[#fcfaf8]">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-800">
                        {user.full_name}
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {user.phone || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          ROLE_COLORS[user.role_name] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {ROLE_LABELS[user.role_name] || user.role_name}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          STATUS_COLORS[user.status] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {STATUS_LABELS[user.status] || user.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openDetail(user)}
                          title="Xem chi tiết"
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        >
                          <Eye size={17} />
                        </button>

                        {user.role_name !== "SUPER_ADMIN" && (
                          <>
                            <button
                              onClick={() => openEdit(user)}
                              title="Chỉnh sửa"
                              className="rounded-lg p-2 text-amber-600 hover:bg-amber-50"
                            >
                              <Pencil size={17} />
                            </button>

                            <button
                              onClick={() => handleStatus(user)}
                              title="Đổi trạng thái"
                              className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                            >
                              {user.status === "ACTIVE" ? (
                                <UserX size={17} />
                              ) : (
                                <UserCheck size={17} />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex flex-col justify-between gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center">
          <p className="text-sm text-gray-500">
            Trang {page} / {totalPages || 1}
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1 || isLoading}
              onClick={() => loadUsers(page - 1)}
              className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              disabled={page >= totalPages || isLoading}
              onClick={() => loadUsers(page + 1)}
              className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Detail modal */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#3e2b22]">
                Chi tiết người dùng
              </h3>
              <button onClick={closeModals}>
                <X />
              </button>
            </div>

            {detail.status === "loading" ? (
              <p className="py-6 text-center text-gray-500">Đang tải...</p>
            ) : detail.error ? (
              <p className="text-red-600">{detail.error}</p>
            ) : (
              <div className="space-y-3 text-sm">
                {Object.entries({
                  "Họ và tên":
                    detail.data?.user?.full_name || selectedUser?.full_name,
                  Email: detail.data?.user?.email || selectedUser?.email,
                  "Số điện thoại":
                    detail.data?.user?.phone || selectedUser?.phone,
                  "Vai trò":
                    ROLE_LABELS[
                      detail.data?.user?.role_name || selectedUser?.role_name
                    ],
                  "Trạng thái":
                    STATUS_LABELS[
                      detail.data?.user?.status || selectedUser?.status
                    ],
                }).map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between gap-4 border-b border-gray-100 py-2"
                  >
                    <span className="text-gray-500">{label}</span>
                    <span className="font-semibold text-gray-800">
                      {value || "—"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleUpdate}
            className="w-full max-w-lg space-y-5 rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#3e2b22]">
                Chỉnh sửa người dùng
              </h3>
              <button type="button" onClick={closeModals}>
                <X />
              </button>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Họ và tên
              </label>
              <input
                required
                maxLength={100}
                value={editForm.full_name}
                onChange={(e) =>
                  setEditForm({ ...editForm, full_name: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#8b654b]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Số điện thoại
              </label>
              <input
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({ ...editForm, phone: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#8b654b]"
              />
            </div>

            {mutation.error && (
              <p className="text-sm text-red-600">{mutation.error}</p>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModals}
                className="rounded-xl border border-gray-200 px-4 py-2 text-gray-600"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={mutation.status === "loading"}
                className="rounded-xl bg-[#6f4e37] px-5 py-2 font-semibold text-white hover:bg-[#563b29] disabled:opacity-50"
              >
                {mutation.status === "loading" ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon }) => (
  <div className="flex items-center gap-4 rounded-2xl border border-[#eee7df] bg-white p-5 shadow-sm">
    <div className="rounded-xl bg-[#f3ebe4] p-3 text-[#6f4e37]">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-1 text-2xl font-bold text-[#3e2b22]">{value ?? 0}</p>
    </div>
  </div>
);

export default ManagerUser;
