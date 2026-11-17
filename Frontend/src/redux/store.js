import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import productReducer from "./slices/productSlice";
import reviewReducer from "./slices/reviewSlice";
import cartReducer from "./slices/cartSlice";
import managerProductReducer from "./slices/managerProductSlice";
import managerRoleReducer from "./slices/managerRoleSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    reviews: reviewReducer,
    cart: cartReducer,
    managerProducts: managerProductReducer,
    managerRoles: managerRoleReducer,
  },
});

export default store;
