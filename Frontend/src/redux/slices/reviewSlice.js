import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getError } from "../../util/axios";

const run =
  (fn) =>
  async (arg, { rejectWithValue }) => {
    try {
      return await fn(arg);
    } catch (error) {
      return rejectWithValue(getError(error));
    }
  };

export const fetchReviews = createAsyncThunk(
  "reviews/fetchList",
  run(async ({ productId, page = 1, limit = 5 }) => {
    const response = await api.get(`/products/${productId}/reviews`, {
      params: { page, limit },
    });

    return {
      ...response.data,
      productId,
    };
  }),
);

export const fetchMyReview = createAsyncThunk(
  "reviews/fetchMine",
  run(async (productId) => {
    const response = await api.get(`/products/${productId}/reviews/me`);

    return {
      productId,
      review: response.data.review,
    };
  }),
);

export const saveMyReview = createAsyncThunk(
  "reviews/saveMine",
  run(async ({ productId, rating, comment }) => {
    const response = await api.put(`/products/${productId}/reviews/me`, {
      rating,
      comment,
    });

    return {
      productId,
      review: response.data.review,
    };
  }),
);

export const deleteMyReview = createAsyncThunk(
  "reviews/deleteMine",
  run(async (productId) => {
    await api.delete(`/products/${productId}/reviews/me`);

    return productId;
  }),
);

const emptyList = {
  items: [],
  total: 0,
  page: 1,
  limit: 5,
  totalPages: 0,
  status: "idle",
  error: "",
  requestId: null,
};

const emptySummary = {
  average: null,
  count: 0,
  distribution: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  },
};

const emptyMine = {
  data: null,
  status: "idle",
  error: "",
  requestId: null,
  productId: null,
};

const initialState = {
  forId: null,

  list: { ...emptyList },

  summary: {
    ...emptySummary,
    distribution: { ...emptySummary.distribution },
  },

  mine: { ...emptyMine },

  refreshNeeded: false,

  mutationStatus: "idle",
  mutationRequestId: null,
  mutationProductId: null,
};

const reviewSlice = createSlice({
  name: "reviews",

  initialState,

  reducers: {
    clearMine(state) {
      state.mine = { ...emptyMine };
    },

    clearReviews(state) {
      state.forId = null;

      state.list = { ...emptyList };

      state.summary = {
        ...emptySummary,
        distribution: { ...emptySummary.distribution },
      };

      state.mine = { ...emptyMine };

      state.refreshNeeded = false;

      state.mutationStatus = "idle";
      state.mutationRequestId = null;
      state.mutationProductId = null;
    },

    clearRefreshNeeded(state) {
      state.refreshNeeded = false;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(fetchReviews.pending, (state, action) => {
        const { productId } = action.meta.arg;

        if (String(state.forId) !== String(productId)) {
          state.forId = productId;

          state.list = { ...emptyList };

          state.summary = {
            ...emptySummary,
            distribution: { ...emptySummary.distribution },
          };
        }

        state.list.status = "loading";
        state.list.error = "";
        state.list.requestId = action.meta.requestId;
      })

      .addCase(fetchReviews.fulfilled, (state, action) => {
        const { productId, ...data } = action.payload;

        if (state.list.requestId !== action.meta.requestId) return;

        if (String(state.forId) !== String(productId)) return;

        const { items, page, limit, total, totalPages, summary } = data;

        Object.assign(state.list, {
          items,
          page,
          limit,
          total,
          totalPages,
          status: "succeeded",
          error: "",
          requestId: null,
        });

        state.summary = summary;

        state.refreshNeeded = false;
      })

      .addCase(fetchReviews.rejected, (state, action) => {
        if (state.list.requestId !== action.meta.requestId) return;

        state.list.status = "failed";

        state.list.error =
          action.payload ||
          action.error.message ||
          "Không thể tải danh sách đánh giá";

        state.list.requestId = null;
      })

      .addCase(fetchMyReview.pending, (state, action) => {
        state.mine = {
          data: null,
          status: "loading",
          error: "",
          requestId: action.meta.requestId,
          productId: action.meta.arg,
        };
      })

      .addCase(fetchMyReview.fulfilled, (state, action) => {
        if (state.mine.requestId !== action.meta.requestId) return;

        const { productId, review } = action.payload;

        if (String(state.mine.productId) !== String(productId)) return;

        state.mine.data = review;
        state.mine.status = "succeeded";
        state.mine.error = "";
        state.mine.requestId = null;
      })

      .addCase(fetchMyReview.rejected, (state, action) => {
        if (state.mine.requestId !== action.meta.requestId) return;

        state.mine.status = "failed";

        state.mine.error =
          action.payload ||
          action.error.message ||
          "Không thể tải đánh giá của bạn";

        state.mine.requestId = null;
      })

      .addCase(saveMyReview.pending, (state, action) => {
        state.mutationStatus = "loading";
        state.mutationRequestId = action.meta.requestId;
        state.mutationProductId = action.meta.arg.productId;

        if (
          String(state.mine.productId) === String(action.meta.arg.productId)
        ) {
          state.mine.error = "";
        }
      })

      .addCase(saveMyReview.fulfilled, (state, action) => {
        if (state.mutationRequestId !== action.meta.requestId) return;

        const { productId, review } = action.payload;

        if (
          String(state.mutationProductId) === String(productId) &&
          String(state.mine.productId) === String(productId)
        ) {
          state.mine.data = review;
          state.mine.status = "succeeded";
          state.mine.error = "";
        }

        if (String(state.forId) === String(productId)) {
          state.refreshNeeded = true;
        }

        state.mutationStatus = "succeeded";
        state.mutationRequestId = null;
      })

      .addCase(saveMyReview.rejected, (state, action) => {
        if (state.mutationRequestId !== action.meta.requestId) return;

        if (
          String(state.mine.productId) === String(action.meta.arg.productId)
        ) {
          state.mine.error =
            action.payload || action.error.message || "Không thể lưu đánh giá";
        }

        state.mutationStatus = "failed";
        state.mutationRequestId = null;
      })

      .addCase(deleteMyReview.pending, (state, action) => {
        state.mutationStatus = "loading";
        state.mutationRequestId = action.meta.requestId;
        state.mutationProductId = action.meta.arg;

        if (String(state.mine.productId) === String(action.meta.arg)) {
          state.mine.error = "";
        }
      })

      .addCase(deleteMyReview.fulfilled, (state, action) => {
        if (state.mutationRequestId !== action.meta.requestId) return;

        const productId = action.payload;

        if (
          String(state.mutationProductId) === String(productId) &&
          String(state.mine.productId) === String(productId)
        ) {
          state.mine.data = null;
          state.mine.status = "succeeded";
          state.mine.error = "";
        }

        if (String(state.forId) === String(productId)) {
          state.refreshNeeded = true;
        }

        state.mutationStatus = "succeeded";
        state.mutationRequestId = null;
      })

      .addCase(deleteMyReview.rejected, (state, action) => {
        if (state.mutationRequestId !== action.meta.requestId) return;

        if (String(state.mine.productId) === String(action.meta.arg)) {
          state.mine.error =
            action.payload || action.error.message || "Không thể xóa đánh giá";
        }

        state.mutationStatus = "failed";
        state.mutationRequestId = null;
      });
  },
});

export const { clearMine, clearReviews, clearRefreshNeeded } =
  reviewSlice.actions;

export default reviewSlice.reducer;
