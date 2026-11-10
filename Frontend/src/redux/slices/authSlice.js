import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { refreshAccessToken, setAccessToken } from "../../util/axios";

const normalizeUser = (u) => ({
  ...u,
  role: u.role ?? u.role_name,
  permissions: u.permissions ?? [],
});

export const restoreSession = createAsyncThunk("auth/restoreSession", async (_, { rejectWithValue }) => {
  try {
    await refreshAccessToken();
    const { data } = await api.get("/auth/me");
    return normalizeUser(data);
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, logout } = authSlice.actions;

export default authSlice.reducer;
