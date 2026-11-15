import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import productReducer from "./slices/productSlice";
import reviewReducer from "./slices/reviewSlice";
import cartReducer from "./slices/cartSlice";
const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    reviews: reviewReducer,
    cart: cartReducer,
  },
});

export default store;
