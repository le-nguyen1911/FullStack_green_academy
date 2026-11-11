import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, {
  getError,
  refreshAccessToken,
  setAccessToken,
} from "../../util/axios";

const normalizeUser = (u) => ({
  ...u,
  role: u.role ?? u.role_name,
  permissions: u.permissions ?? [],
});

export const restoreSession = createAsyncThunk(
  "auth/restore",
  async (_, { rejectWithValue }) => {
    try {
      await refreshAccessToken();
      const { data } = await api.get("/auth/me");
      return normalizeUser(data.user);
    } catch (e) {
      // Chỉ xóa cờ khi server xác nhận phiên không còn hợp lệ (401).
      // Lỗi mạng thì giữ cờ để lần tải lại sau còn thử khôi phục được
      if (e.response?.status === 401) localStorage.removeItem("hasSession");
      return rejectWithValue(null);
    }
  },
);

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setAccessToken(data.accessToken);
      localStorage.setItem("hasSession", "1"); 
      return normalizeUser(data.user);
    } catch (e) {
      return rejectWithValue(getError(e));
    }
  },
);

export const register = createAsyncThunk(
  "auth/register",
  async (
    { full_name, email, password, address, phone },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.post("/auth/register", {
        full_name,
        email,
        password,
        address,
        phone,
      });
      return data;
    } catch (error) {
      return rejectWithValue(getError(error));
    }
  },
);

export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await api.post("/auth/logout");
  } catch {}
  setAccessToken(null);
  localStorage.removeItem("hasSession");
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    initializing: Boolean(localStorage.getItem("hasSession")),
    loginStatus: "idle",
    loginError: "",
    registerStatus: "idle",
    registerError: "",
    registerResult: null,
  },
  reducers: {
    forceLogout(state) {
      state.user = null;
      state.initializing = false;
    },
    updateUser(state, action) {
      if (state.user) state.user = { ...state.user, ...action.payload };
    },
    resetRegister(state) {
      state.registerStatus = "idle";
      state.registerError = "";
      state.registerResult = null;
    },
    clearLoginError(state) {
      state.loginError = "";
    },
  },
  extraReducers: (b) => {
    b.addCase(restoreSession.fulfilled, (s, a) => {
      s.user = a.payload;
      s.initializing = false;
    })
      .addCase(restoreSession.rejected, (s) => {
        s.user = null;
        s.initializing = false;
      })
      .addCase(login.pending, (s) => {
        s.loginStatus = "loading";
        s.loginError = "";
      })
      .addCase(login.fulfilled, (s, a) => {
        s.user = a.payload;
        s.loginStatus = "idle";
        s.loginError = "";
      })
      .addCase(login.rejected, (s, a) => {
        s.loginStatus = "idle";
        s.loginError = a.payload || "Đăng nhập thất bại";
      })
      .addCase(logout.fulfilled, (s) => {
        s.user = null;
        s.loginError = "";
      })
      .addCase(register.pending, (s) => {
        s.registerStatus = "loading";
        s.registerError = "";
      })
      .addCase(register.fulfilled, (s, a) => {
        s.registerStatus = "succeeded";
        s.registerResult = a.payload;
      })
      .addCase(register.rejected, (s, a) => {
        s.registerStatus = "failed";
        s.registerError = a.payload || "Đăng ký thất bại";
      });
  },
});

export const { forceLogout, updateUser, resetRegister, clearLoginError   } = authSlice.actions;
export default authSlice.reducer;
