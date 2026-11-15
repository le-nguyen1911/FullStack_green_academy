import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import api, { getError } from "../../util/axios";
import { forceLogout, logout } from "./authSlice";

export const fetchCart = createAsyncThunk(
  "cart/fetch",
  async (_, { rejectWithValue }) => {
    try {
      return (await api.get("/cart")).data;
    } catch (e) {
      return rejectWithValue(getError(e, "Không tải được giỏ hàng"));
    }
  },
);

const mutation = (type, request) =>
  createAsyncThunk(type, async (arg, { dispatch, rejectWithValue }) => {
    try {
      const result = await request(arg);
      await dispatch(fetchCart());
      return result;
    } catch (e) {
      return rejectWithValue(getError(e));
    }
  });

export const addToCart = mutation(
  "cart/add",
  async ({ variant_id, quantity = 1 }) =>
    (await api.post("/cart/items", { variant_id, quantity })).data,
);

export const updateCartItem = mutation(
  "cart/update",
  async ({ itemId, quantity }) =>
    (await api.patch(`/cart/items/${itemId}`, { quantity })).data,
);

export const removeCartItem = mutation("cart/remove", async ({ itemId }) => {
  await api.delete(`/cart/items/${itemId}`);
  return itemId;
});

export const clearCart = mutation("cart/clear", async () => {
  await api.delete("/cart");
  return true;
});

const initialState = {
  items: [],
  totalQuantity: 0,
  totalAmount: 0,
  hasIssues: false,
  status: "idle",
  error: "",
  requestId: null,
  busyIds: [],
  deselected: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    toggleSelect(state, action) {
      const id = action.payload;
      state.deselected = state.deselected.includes(id)
        ? state.deselected.filter((x) => x !== id)
        : [...state.deselected, id];
    },
    selectAll(state) {
      state.deselected = [];
    },
    deselectAll(state) {
      state.deselected = state.items
        .filter((i) => i.purchasable)
        .map((i) => i.id);
    },
  },
  extraReducers: (b) => {
    const markBusy = (s, a) => {
      if (!s.busyIds.includes(a.meta.arg.itemId))
        s.busyIds.push(a.meta.arg.itemId);
    };
    const unmarkBusy = (s, a) => {
      s.busyIds = s.busyIds.filter((x) => x !== a.meta.arg.itemId);
    };

    b.addCase(fetchCart.pending, (s, a) => {
      s.status = "loading";
      s.error = "";
      s.requestId = a.meta.requestId;
    })
      .addCase(fetchCart.fulfilled, (s, a) => {
        if (s.requestId !== a.meta.requestId) return;

        const d = a.payload;

        s.items = d.items;
        s.totalQuantity = d.total_quantity;
        s.totalAmount = d.total_amount;
        s.hasIssues = d.has_issues;
        s.status = "succeeded";

        const ids = new Set(d.items.map((i) => i.id));
        s.deselected = s.deselected.filter((id) => ids.has(id));
      })
      .addCase(fetchCart.rejected, (s, a) => {
        if (s.requestId !== a.meta.requestId) return;
        s.status = "failed";
        s.error = a.payload || a.error.message;
      })

      .addCase(updateCartItem.pending, markBusy)
      .addCase(updateCartItem.fulfilled, unmarkBusy)
      .addCase(updateCartItem.rejected, unmarkBusy)
      .addCase(removeCartItem.pending, markBusy)
      .addCase(removeCartItem.fulfilled, unmarkBusy)
      .addCase(removeCartItem.rejected, unmarkBusy)
      .addCase(logout.fulfilled, () => initialState)
      .addCase(forceLogout, () => initialState);
  },
});

export const { toggleSelect, selectAll, deselectAll } = cartSlice.actions;
export default cartSlice.reducer;

export const selectSelectedItems = createSelector(
  [(s) => s.cart.items, (s) => s.cart.deselected],
  (items, deselected) =>
    items.filter((i) => i.purchasable && !deselected.includes(i.id)),
);

export const selectSelectedTotal = createSelector(
  [selectSelectedItems],
  (items) => items.reduce((sum, i) => sum + i.line_total, 0),
);
