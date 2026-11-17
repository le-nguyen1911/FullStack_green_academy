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

export const fetchManagerProducts = createAsyncThunk(
  "managerProducts/fetchList",
  run(async (params) => (await api.get("/manager/products", { params })).data),
);

export const fetchManagerProduct = createAsyncThunk(
  "managerProducts/fetchOne",
  run(async (id) => (await api.get(`/manager/products/${id}`)).data),
);

export const fetchOptions = createAsyncThunk(
  "managerProducts/fetchOptions",
  run(async () => {
    const [c, b] = await Promise.all([
      api.get("/categories"),
      api.get("/brands"),
    ]);
    return { categories: c.data, brands: b.data };
  }),
);

export const createProduct = createAsyncThunk(
  "managerProducts/create",
  run(async (body) => (await api.post("/manager/products", body)).data),
);

export const updateProduct = createAsyncThunk(
  "managerProducts/update",
  run(async ({ id, body }) => {
    await api.patch(`/manager/products/${id}`, body);
    return id;
  }),
);

export const setProductStatus = createAsyncThunk(
  "managerProducts/setStatus",
  run(async ({ id, status }) => {
    if (status) await api.patch(`/manager/products/${id}`, { status: true });
    else await api.delete(`/manager/products/${id}`);
    return { id, status };
  }),
);

export const addVariant = createAsyncThunk(
  "managerProducts/addVariant",
  run(
    async ({ productId, body }) =>
      (await api.post(`/manager/products/${productId}/variants`, body)).data,
  ),
);

export const updateVariant = createAsyncThunk(
  "managerProducts/updateVariant",
  run(async ({ variantId, body }) => {
    await api.patch(`/manager/variants/${variantId}`, body);
    return variantId;
  }),
);

export const setVariantStatus = createAsyncThunk(
  "managerProducts/setVariantStatus",
  run(async ({ variantId, status }) => {
    if (status)
      await api.patch(`/manager/variants/${variantId}`, { status: true });
    else await api.delete(`/manager/variants/${variantId}`);
    return { variantId, status };
  }),
);

export const adjustStock = createAsyncThunk(
  "managerProducts/adjustStock",
  run(
    async ({ variantId, delta }) =>
      (await api.patch(`/manager/variants/${variantId}/stock`, { delta })).data,
  ),
);

const emptyDetail = { data: null, status: "idle", error: "" };

const slice = createSlice({
  name: "managerProducts",
  initialState: {
    list: {
      items: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
      status: "idle",
      error: "",
      requestId: null,
    },
    detail: { ...emptyDetail },
    options: { categories: [], brands: [] },
  },
  reducers: {
    clearManagerDetail(state) {
      state.detail = { ...emptyDetail };
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchManagerProducts.pending, (s, a) => {
      s.list.status = "loading";
      s.list.error = "";
      s.list.requestId = a.meta.requestId;
    })
      .addCase(fetchManagerProducts.fulfilled, (s, a) => {
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
      .addCase(fetchManagerProducts.rejected, (s, a) => {
        if (s.list.requestId !== a.meta.requestId) return;
        s.list.status = "failed";
        s.list.error = a.payload || a.error.message;
      })

      // Tải lại CÙNG sản phẩm thì giữ dữ liệu cũ (form không chớp), sản phẩm khác thì xóa
      .addCase(fetchManagerProduct.pending, (s, a) => {
        if (s.detail.data?.id !== a.meta.arg) s.detail.data = null;
        s.detail.status = "loading";
        s.detail.error = "";
      })
      .addCase(fetchManagerProduct.fulfilled, (s, a) => {
        s.detail.data = a.payload;
        s.detail.status = "succeeded";
      })
      .addCase(fetchManagerProduct.rejected, (s, a) => {
        s.detail.status = "failed";
        s.detail.error = a.payload || a.error.message;
      })

      .addCase(fetchOptions.fulfilled, (s, a) => {
        s.options = a.payload;
      });
  },
});

export const { clearManagerDetail } = slice.actions;
export default slice.reducer;
