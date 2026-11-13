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
  "manager/fetchList",
  run(async (params) => (await api.get("/manager/products", { params })).data),
);

export const fetchManagerProduct = createAsyncThunk(
  "manager/fetchOne",
  run(async (id) => (await api.get(`/manager/products/${id}`)).data),
);

export const createProduct = createAsyncThunk(
  "manager/create",
  run(async (body) => (await api.post("/manager/products", body)).data), // { id }
);

export const updateProduct = createAsyncThunk(
  "manager/update",
  run(async ({ id, body }) => {
    await api.patch(`/manager/products/${id}`, body);
    return id;
  }),
);

export const setProductStatus = createAsyncThunk(
  "manager/setStatus",
  run(async ({ id, status }) => {
    if (status) await api.patch(`/manager/products/${id}`, { status: true });
    else await api.delete(`/manager/products/${id}`);
    return { id, status };
  }),
);

export const addVariant = createAsyncThunk(
  "manager/addVariant",
  run(
    async ({ productId, body }) =>
      (await api.post(`/manager/products/${productId}/variants`, body)).data,
  ),
);

export const updateVariant = createAsyncThunk(
  "manager/updateVariant",
  run(async ({ variantId, body }) => {
    await api.patch(`/manager/variants/${variantId}`, body);
    return variantId;
  }),
);

export const setVariantStatus = createAsyncThunk(
  "manager/setVariantStatus",
  run(async ({ variantId, status }) => {
    if (status)
      await api.patch(`/manager/variants/${variantId}`, { status: true });
    else await api.delete(`/manager/variants/${variantId}`);
    return { variantId, status };
  }),
);

export const adjustStock = createAsyncThunk(
  "manager/adjustStock",
  run(
    async ({ variantId, delta }) =>
      (await api.patch(`/manager/variants/${variantId}/stock`, { delta })).data,
  ), // { variantId, delta, quantity }
);

const managerProductSlice = createSlice({
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
    detail: { data: null, status: "idle", error: "" },
  },
  reducers: {
    clearManagerDetail(state) {
      state.detail = { data: null, status: "idle", error: "" };
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
      });
  },
});

export const { clearManagerDetail } = managerProductSlice.actions;
export default managerProductSlice.reducer;
