import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getError } from "../../util/axios";

export const fetchProducts = createAsyncThunk(
  "products/fetchList",
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/products", { params });
      return data;
    } catch (e) {
      return rejectWithValue(getError(e, "Không tải được sản phẩm"));
    }
  },
);

export const fetchProductDetail = createAsyncThunk(
  "products/fetchDetail",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/products/${id}`);
      return data;
    } catch (e) {
      return rejectWithValue(getError(e, "Không tải được sản phẩm"));
    }
  },
);

const loadOnce = (key) => ({
  condition: (_, { getState }) => {
    const s = getState().products[key].status;
    return s === "idle" || s === "failed";
  },
});

export const fetchCategories = createAsyncThunk(
  "products/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      return (await api.get("/categories")).data;
    } catch (e) {
      return rejectWithValue(getError(e));
    }
  },
  loadOnce("categories"),
);

export const fetchBrands = createAsyncThunk(
  "products/fetchBrands",
  async (_, { rejectWithValue }) => {
    try {
      return (await api.get("/brands")).data;
    } catch (e) {
      return rejectWithValue(getError(e));
    }
  },
  loadOnce("brands"),
);

export const fetchPriceRange = createAsyncThunk(
  "products/fetchPriceRange",
  async (_, { rejectWithValue }) => {
    try {
      return (await api.get("/products/price-range")).data;
    } catch (e) {
      return rejectWithValue(getError(e));
    }
  },
  loadOnce("priceRange"),
);
export const fetchRelated = createAsyncThunk(
  "products/fetchRelated",
  async (id, { rejectWithValue }) => {
    try {
      return (await api.get(`/products/${id}/related`)).data;
    } catch (e) {
      return rejectWithValue(getError(e));
    }
  },
);
const emptyDetail = { data: null, status: "idle", error: "", requestId: null };

const productSlice = createSlice({
  name: "products",
  initialState: {
    list: {
      items: [],
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 0,
      status: "idle",
      error: "",
      requestId: null,
    },
    detail: { ...emptyDetail },
    related: { items: [], status: "idle", requestId: null },
    categories: { items: [], status: "idle" },
    brands: { items: [], status: "idle" },
    priceRange: { min: 0, max: 0, status: "idle" },
  },
  reducers: {
    clearDetail(state) {
      state.detail = { ...emptyDetail };
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchProducts.pending, (s, a) => {
      s.list.status = "loading";
      s.list.error = "";
      s.list.requestId = a.meta.requestId;
    })
      .addCase(fetchProducts.fulfilled, (s, a) => {
        if (s.list.requestId !== a.meta.requestId) return;
        const { items, total, page, limit, totalPages } = a.payload;
        Object.assign(s.list, {
          items,
          total,
          page,
          limit,
          totalPages,
          status: "succeeded",
        });
      })
      .addCase(fetchProducts.rejected, (s, a) => {
        if (s.list.requestId !== a.meta.requestId) return;
        s.list.status = "failed";
        s.list.error = a.payload || a.error.message;
      })

      .addCase(fetchProductDetail.pending, (s, a) => {
        s.detail = {
          data: null,
          status: "loading",
          error: "",
          requestId: a.meta.requestId,
        };
      })
      .addCase(fetchProductDetail.fulfilled, (s, a) => {
        if (s.detail.requestId !== a.meta.requestId) return;
        s.detail.data = a.payload;
        s.detail.status = "succeeded";
      })
      .addCase(fetchProductDetail.rejected, (s, a) => {
        if (s.detail.requestId !== a.meta.requestId) return;
        s.detail.status = "failed";
        s.detail.error = a.payload || a.error.message;
      })

      .addCase(fetchCategories.pending, (s) => {
        s.categories.status = "loading";
      })
      .addCase(fetchCategories.fulfilled, (s, a) => {
        s.categories = { items: a.payload, status: "succeeded" };
      })
      .addCase(fetchCategories.rejected, (s) => {
        s.categories.status = "failed";
      })
      .addCase(fetchBrands.pending, (s) => {
        s.brands.status = "loading";
      })
      .addCase(fetchBrands.fulfilled, (s, a) => {
        s.brands = { items: a.payload, status: "succeeded" };
      })
      .addCase(fetchBrands.rejected, (s) => {
        s.brands.status = "failed";
      })
      .addCase(fetchPriceRange.pending, (s) => {
        s.priceRange.status = "loading";
      })
      .addCase(fetchPriceRange.fulfilled, (s, a) => {
        s.priceRange = {
          min: a.payload.min_price,
          max: a.payload.max_price,
          status: "succeeded",
        };
      })
      .addCase(fetchPriceRange.rejected, (s) => {
        s.priceRange.status = "failed";
      })
      .addCase(fetchRelated.pending, (s, a) => {
        s.related = {
          items: [],
          status: "loading",
          requestId: a.meta.requestId,
        };
      })
      .addCase(fetchRelated.fulfilled, (s, a) => {
        if (s.related.requestId !== a.meta.requestId) return;
        s.related.items = a.payload;
        s.related.status = "succeeded";
      })
      .addCase(fetchRelated.rejected, (s, a) => {
        if (s.related.requestId !== a.meta.requestId) return;
        s.related.status = "failed";
      });
  },
});

export const { clearDetail } = productSlice.actions;
export default productSlice.reducer;
