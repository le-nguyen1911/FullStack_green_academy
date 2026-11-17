import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchRoles,
  fetchRoleDetail,
  createRole,
  updateRole,
  deleteRole,
  fetchPermissions,
  clearDetail,
  clearMutation,
} from "../../redux/slices/managerRoleSlice";

import Toast from "../../components/Toast";
import useToast from "../../hooks/useToast";
import useDebounce from "../../hooks/useDebounce";

import RoleHeader from "@/components/manager/RoleHeader";
import RoleSearch from "@/components/manager/RoleSearch";
import RolePagination from "@/components/manager/RolePagination";
import RoleTable from "@/components/manager/RoleTable";
import RoleFormModal from "@/components/manager/RoleFormModal";
import RoleDetailModal from "@/components/manager/RoleDetailModal";
import RoleDeleteModal from "@/components/manager/RoleDeleteModal";

const SYSTEM_ROLES = ["ADMIN", "MANAGER", "STAFF_SALE", "CUSTOMER"];

export default function ManagerRole() {
  const dispatch = useDispatch();

  const { toasts, push, remove } = useToast();

  const { list, permissions, mutation, detail } = useSelector(
    (s) => s.managerRoles,
  );

  const roles = list.items || [];
  const loading = list.status === "loading";

  const [searchInput, setSearchInput] = useState("");
  const debouncedQ = useDebounce(searchInput, 400);

  const [currentPage, setCurrentPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPerms, setFormPerms] = useState([]);

  useEffect(() => {
    dispatch(fetchRoles({ q: debouncedQ, page: currentPage, limit: 10 }));
  }, [dispatch, debouncedQ, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQ]);

  useEffect(() => {
    if (permissions.status === "idle") {
      dispatch(fetchPermissions());
    }
  }, [dispatch, permissions.status]);

  useEffect(() => {
    if (mutation.status === "succeeded" && mutation.successMessage) {
      push(mutation.successMessage, "success");
      dispatch(clearMutation());
      setModal(null);
      setSelectedRole(null);
      dispatch(fetchRoles({ q: debouncedQ, page: currentPage, limit: 10 }));
    }

    if (mutation.status === "failed" && mutation.error) {
      push(mutation.error, "error");
      dispatch(clearMutation());
    }
  }, [mutation.status]);

  // Open modals
  const openCreate = () => {
    setFormName("");
    setFormDesc("");
    setFormPerms([]);
    setModal("create");
  };

  const openEdit = (role) => {
    setSelectedRole(role);
    setFormName(role.name || "");
    setFormDesc(role.description || "");
    setFormPerms([]);

    dispatch(fetchRoleDetail(role.id)).then((action) => {
      if (action.payload?.permissionIds) {
        setFormPerms(action.payload.permissionIds);
      } else if (action.payload?.permissions) {
        setFormPerms(action.payload.permissions.map((p) => p.id));
      }
    });

    setModal("edit");
  };

  const openDetail = (role) => {
    setSelectedRole(role);
    dispatch(fetchRoleDetail(role.id));
    setModal("detail");
  };

  const openDelete = (role) => {
    setSelectedRole(role);
    setModal("delete");
  };

  const closeModal = () => {
    setModal(null);
    setSelectedRole(null);
    dispatch(clearDetail());
    dispatch(clearMutation());
  };

  // CRUD
  const handleCreate = () => {
    if (!formName.trim()) {
      push("Tên vai trò không được để trống", "error");
      return;
    }

    dispatch(
      createRole({
        name: formName.trim().toUpperCase(),
        description: formDesc.trim(),
        permissionIds: formPerms,
      }),
    );
  };

  const handleUpdate = () => {
    if (!formName.trim()) {
      push("Tên vai trò không được để trống", "error");
      return;
    }

    dispatch(
      updateRole({
        id: selectedRole.id,
        body: {
          description: formDesc.trim(),
          permissionIds: formPerms,
        },
      }),
    );
  };

  const handleDelete = () => {
    dispatch(deleteRole(selectedRole.id));
  };

  const isSystemRole = (role) => SYSTEM_ROLES.includes(role?.name);
  const isMutating = mutation.status === "loading";

  return (
    <div className="min-h-full space-y-5">
      <Toast toasts={toasts} onRemove={remove} />

      <RoleHeader onCreate={openCreate} />

      <div className="w-full max-w-md">
        <RoleSearch value={searchInput} onChange={setSearchInput} />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <RoleTable
            roles={roles}
            loading={loading}
            onDetail={openDetail}
            onEdit={openEdit}
            onDelete={openDelete}
          />
        </div>

        {list.totalPages > 1 && (
          <div className="border-t border-gray-100">
            <RolePagination
              currentPage={currentPage}
              totalPages={list.totalPages || 1}
              total={list.total || 0}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {(modal === "create" || modal === "edit") && (
        <RoleFormModal
          mode={modal}
          selectedRole={selectedRole}
          formName={formName}
          setFormName={setFormName}
          formDesc={formDesc}
          setFormDesc={setFormDesc}
          formPerms={formPerms}
          setFormPerms={setFormPerms}
          permissions={permissions}
          isMutating={isMutating}
          isSystemRole={isSystemRole}
          onClose={closeModal}
          onSubmit={modal === "create" ? handleCreate : handleUpdate}
        />
      )}

      {modal === "detail" && selectedRole && (
        <RoleDetailModal
          role={selectedRole}
          detail={detail}
          allPermsState={permissions}
          onClose={closeModal}
        />
      )}

      {modal === "delete" && selectedRole && (
        <RoleDeleteModal
          role={selectedRole}
          isMutating={isMutating}
          onClose={closeModal}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
