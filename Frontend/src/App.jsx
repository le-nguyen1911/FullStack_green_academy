import { Route, Routes } from "react-router-dom";
import axios from "axios";

import LayoutMain from "./layouts/main/LayoutMain.jsx";
import AccountLayout from "./layouts/accountlayout/AccountLayout.jsx";

import { PrimeReactProvider } from "@primereact/core";
import Aura from "@primeuix/themes/aura";
import "primeicons/primeicons.css";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";

import Profile from "./pages/Account/Profile.jsx";
import InformationPesonal from "./pages/Account/InformationPesonal.jsx";
import Order from "./pages/Account/Order.jsx";
import ChangePassword from "./pages/Account/ChangePassword.jsx";

import ProductList from "./pages/ProductList.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";

import Cart from "./pages/Cart.jsx";
import Homepage from "./pages/homepage/Homepage.jsx";
import Introduce from "./pages/Introduce/introduce.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";

const primereact = {
  license: import.meta.env.VITE_PRIMEUI_LICENSE,
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: false,
    },
  },
};

axios.defaults.baseURL = "http://localhost:3000/api";

const App = () => {
  return (
    <PrimeReactProvider {...primereact}>
      <Routes>
        <Route element={<LayoutMain />}>
          <Route path="/" element={<Homepage />} />
          <Route path="introduce" element={<Introduce />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/:id" element={<ProductDetail />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="cart" element={<Cart />} />

            <Route path="account" element={<AccountLayout />}>
              <Route index element={<Profile />} />
              <Route path="orders" element={<Order />} />
              <Route path="profile" element={<InformationPesonal />} />
              <Route path="change-password" element={<ChangePassword />} />
            </Route>
          </Route>
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </PrimeReactProvider>
  );
};

export default App;
