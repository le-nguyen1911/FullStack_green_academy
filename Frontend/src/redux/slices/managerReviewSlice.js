import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getError } from "../../util/axios";

const run =
  (fn) =>
  async (arg, { rejectWithValue }) => {
    try {
      return await fn(arg);
    } catch (e) {
      return rejectWithValue(getError(e));
    }
  };

export const fetchAdminReviews = createAsyncThunk(
  "managerReviews/fetch",
  run(async (params) => (await api.get("/manager/reviews", { params })).data),
);

export const setReviewStatus = createAsyncThunk(
  "managerReviews/setStatus",
  run(
    async ({ id, status }) =>
      (await api.patch(`/manager/reviews/${id}/status`, { status })).data,
  ),
);

export const deleteAdminReview = createAsyncThunk(
  "managerReviews/delete",
  run(async (id) => {
    await api.delete(`/manager/reviews/${id}`);
    return id;
  }),
);

const slice = createSlice({
  name: "managerReviews",
  initialState: {
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    status: "idle",
    error: "",
    requestId: null,
  },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchAdminReviews.pending, (s, a) => {
      s.status = "loading";
      s.error = "";
      s.requestId = a.meta.requestId;
    })
      .addCase(fetchAdminReviews.fulfilled, (s, a) => {
        if (s.requestId !== a.meta.requestId) return;
        const { items, total, page, limit, totalPages } = a.payload;
        Object.assign(s, {
          items,
          total,
          page,
          limit,
          totalPages,
          status: "succeeded",
        });
      })
      .addCase(fetchAdminReviews.rejected, (s, a) => {
        if (s.requestId !== a.meta.requestId) return;
        s.status = "failed";
        s.error = a.payload || a.error.message;
      });
  },
});

export default slice.reducer;
