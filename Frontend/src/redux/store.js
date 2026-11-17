import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import productReducer from "./slices/productSlice";
import reviewReducer from "./slices/reviewSlice";
import cartReducer from "./slices/cartSlice";
import managerProductReducer from "./slices/managerProductSlice";
import managerReviewReducer from "./slices/managerReviewSlice";
import managerRoleReducer from "./slices/managerRoleSlice";
import managerUserReducer from "./slices/managerUserSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    reviews: reviewReducer,
    cart: cartReducer,
    managerProducts: managerProductReducer,
    managerRoles: managerRoleReducer,
    managerReviews: managerReviewReducer,
    managerUsers: managerUserReducer,
  },
});

export default store;
