import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getError } from "../../util/axios";

// GET /api/manager/users
export const fetchUsers = createAsyncThunk(
  "managerUsers/fetchList",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/manager/users", { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        getError(err, "Không thể tải danh sách người dùng"),
      );
    }
  },
);

// GET /api/manager/users/:id
export const fetchUserDetail = createAsyncThunk(
  "managerUsers/fetchDetail",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/manager/users/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        getError(err, "Không thể tải thông tin người dùng"),
      );
    }
  },
);

// PATCH /api/manager/users/:id
export const updateUser = createAsyncThunk(
  "managerUsers/update",
  async ({ id, body }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/manager/users/${id}`, body);
      return {
        id,
        message: response.data.message || "Cập nhật người dùng thành công",
      };
    } catch (err) {
      return rejectWithValue(getError(err, "Không thể cập nhật người dùng"));
    }
  },
);

// PATCH /api/manager/users/:id/status
export const updateUserStatus = createAsyncThunk(
  "managerUsers/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/manager/users/${id}/status`, {
        status,
      });
      return {
        id,
        status,
        message: response.data.message || "Cập nhật trạng thái thành công",
      };
    } catch (err) {
      return rejectWithValue(
        getError(err, "Không thể cập nhật trạng thái người dùng"),
      );
    }
  },
);

// PATCH /api/manager/users/:id/role
export const updateUserRole = createAsyncThunk(
  "managerUsers/updateRole",
  async ({ id, role_id }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/manager/users/${id}/role`, {
        role_id,
      });
      return {
        id,
        message: response.data.message || "Cập nhật vai trò thành công",
      };
    } catch (err) {
      return rejectWithValue(
        getError(err, "Không thể cập nhật vai trò người dùng"),
      );
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
  mutation: {
    status: "idle",
    error: null,
    successMessage: null,
  },
};

const managerUserSlice = createSlice({
  name: "managerUsers",
  initialState,
  reducers: {
    clearUserDetail(state) {
      state.detail = {
        data: null,
        status: "idle",
        error: null,
      };
    },
    clearUserMutation(state) {
      state.mutation = {
        status: "idle",
        error: null,
        successMessage: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch list
      .addCase(fetchUsers.pending, (state) => {
        state.list.status = "loading";
        state.list.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.list.status = "succeeded";

        const payload = action.payload;

        if (payload && Array.isArray(payload.items)) {
          state.list.items = payload.items;
          state.list.total = payload.total;
          state.list.page = payload.page;
          state.list.limit = payload.limit;
          state.list.totalPages = payload.totalPages;
        } else if (Array.isArray(payload)) {
          state.list.items = payload;
          state.list.total = payload.length;
          state.list.totalPages = 1;
        }
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.list.status = "failed";
        state.list.error =
          action.payload || "Không thể tải danh sách người dùng";
      })

      // Fetch detail
      .addCase(fetchUserDetail.pending, (state) => {
        state.detail.status = "loading";
        state.detail.error = null;
      })
      .addCase(fetchUserDetail.fulfilled, (state, action) => {
        state.detail.status = "succeeded";
        state.detail.data = action.payload;
      })
      .addCase(fetchUserDetail.rejected, (state, action) => {
        state.detail.status = "failed";
        state.detail.error =
          action.payload || "Không thể tải thông tin người dùng";
      })

      // Update user
      .addCase(updateUser.pending, (state) => {
        state.mutation.status = "loading";
        state.mutation.error = null;
        state.mutation.successMessage = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.mutation.status = "succeeded";
        state.mutation.successMessage = action.payload.message;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.mutation.status = "failed";
        state.mutation.error = action.payload;
      })

      // Update status
      .addCase(updateUserStatus.pending, (state) => {
        state.mutation.status = "loading";
        state.mutation.error = null;
        state.mutation.successMessage = null;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.mutation.status = "succeeded";
        state.mutation.successMessage = action.payload.message;
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.mutation.status = "failed";
        state.mutation.error = action.payload;
      })

      // Update role
      .addCase(updateUserRole.pending, (state) => {
        state.mutation.status = "loading";
        state.mutation.error = null;
        state.mutation.successMessage = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.mutation.status = "succeeded";
        state.mutation.successMessage = action.payload.message;
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.mutation.status = "failed";
        state.mutation.error = action.payload;
      });
  },
});

export const { clearUserDetail, clearUserMutation } = managerUserSlice.actions;

export default managerUserSlice.reducer;
