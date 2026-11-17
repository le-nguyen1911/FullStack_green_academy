import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getError } from "../../util/axios";

export const fetchRoles = createAsyncThunk(
  "managerRoles/fetchList",
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/roles", { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(getError(err, "Không thể tải danh sách vai trò"));
    }
  },
);

export const fetchRoleDetail = createAsyncThunk(
  "managerRoles/fetchDetail",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/roles/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(getError(err, "Không thể tải chi tiết vai trò"));
    }
  },
);

export const createRole = createAsyncThunk(
  "managerRoles/create",
  async (body, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post("/admin/roles", body);
      return response.data;
    } catch (err) {
      return rejectWithValue(getError(err, "Không thể tạo vai trò"));
    }
  },
);

export const updateRole = createAsyncThunk(
  "managerRoles/update",
  async ({ id, body }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/admin/roles/${id}`, body);
      return { id, message: response.data.message };
    } catch (err) {
      return rejectWithValue(getError(err, "Không thể cập nhật vai trò"));
    }
  },
);

export const deleteRole = createAsyncThunk(
  "managerRoles/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/admin/roles/${id}`);
      return { id, message: response.data.message };
    } catch (err) {
      return rejectWithValue(getError(err, "Không thể xóa vai trò"));
    }
  },
);

export const fetchPermissions = createAsyncThunk(
  "managerRoles/fetchPermissions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/permissions");
      return response.data;
    } catch (err) {
      return rejectWithValue(getError(err, "Không thể tải danh sách quyền"));
    }
  },
);

const initialState = {
  list: {
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    status: "idle",
    error: null,
  },
  detail: {
    data: null,
    status: "idle",
    error: null,
  },
  permissions: {
    items: [],
    status: "idle",
    error: null,
  },
  mutation: {
    status: "idle",
    error: null,
    successMessage: null,
  },
};

const managerRoleSlice = createSlice({
  name: "managerRoles",
  initialState,
  reducers: {
    clearDetail(state) {
      state.detail = { data: null, status: "idle", error: null };
    },
    clearMutation(state) {
      state.mutation = { status: "idle", error: null, successMessage: null };
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchRoles
      .addCase(fetchRoles.pending, (state) => {
        state.list.status = "loading";
        state.list.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.list.status = "succeeded";
        if (action.payload && Array.isArray(action.payload.items)) {
          state.list.items = action.payload.items;
          state.list.total = action.payload.total;
          state.list.page = action.payload.page;
          state.list.limit = action.payload.limit;
          state.list.totalPages = action.payload.totalPages;
        } else if (Array.isArray(action.payload)) {
          state.list.items = action.payload;
          state.list.total = action.payload.length;
          state.list.page = 1;
          state.list.limit = action.payload.length || 10;
          state.list.totalPages = 1;
        }
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.list.status = "failed";
        state.list.error = action.payload || "Lỗi tải danh sách vai trò";
      })

      // fetchRoleDetail
      .addCase(fetchRoleDetail.pending, (state) => {
        state.detail.status = "loading";
        state.detail.error = null;
      })
      .addCase(fetchRoleDetail.fulfilled, (state, action) => {
        state.detail.status = "succeeded";
        state.detail.data = action.payload;
      })
      .addCase(fetchRoleDetail.rejected, (state, action) => {
        state.detail.status = "failed";
        state.detail.error = action.payload || "Lỗi tải chi tiết vai trò";
      })

      // createRole
      .addCase(createRole.pending, (state) => {
        state.mutation.status = "loading";
        state.mutation.error = null;
        state.mutation.successMessage = null;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.mutation.status = "succeeded";
        state.mutation.successMessage = "Tạo vai trò mới thành công";
      })
      .addCase(createRole.rejected, (state, action) => {
        state.mutation.status = "failed";
        state.mutation.error = action.payload || "Tạo vai trò thất bại";
      })

      // updateRole
      .addCase(updateRole.pending, (state) => {
        state.mutation.status = "loading";
        state.mutation.error = null;
        state.mutation.successMessage = null;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.mutation.status = "succeeded";
        state.mutation.successMessage = action.payload.message || "Cập nhật vai trò thành công";
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.mutation.status = "failed";
        state.mutation.error = action.payload || "Cập nhật vai trò thất bại";
      })

      // deleteRole
      .addCase(deleteRole.pending, (state) => {
        state.mutation.status = "loading";
        state.mutation.error = null;
        state.mutation.successMessage = null;
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.mutation.status = "succeeded";
        state.mutation.successMessage = action.payload.message || "Đã xóa vai trò";
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.mutation.status = "failed";
        state.mutation.error = action.payload || "Xóa vai trò thất bại";
      })

      // fetchPermissions — API trả grouped [{module, permissions:[{id,code,name}]}]
      // Normalize về flat array [{id, code, name, module}] để dùng trong PermissionCheckboxes
      .addCase(fetchPermissions.pending, (state) => {
        state.permissions.status = "loading";
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.permissions.status = "succeeded";
        const payload = action.payload;
        if (Array.isArray(payload) && payload.length > 0 && payload[0]?.module !== undefined && payload[0]?.permissions !== undefined) {
          // Grouped format: [{module, permissions:[{id,code,name}]}]
          const flat = [];
          for (const group of payload) {
            for (const p of group.permissions) {
              flat.push({ id: p.id, code: p.code, name: p.name, module: group.module });
            }
          }
          state.permissions.items = flat;
        } else if (Array.isArray(payload)) {
          // Already flat format [{id, code, name, module}]
          state.permissions.items = payload;
        } else {
          state.permissions.items = [];
        }
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.permissions.status = "failed";
        state.permissions.error = action.payload;
      });
  },
});

export const { clearDetail, clearMutation } = managerRoleSlice.actions;
export default managerRoleSlice.reducer;
