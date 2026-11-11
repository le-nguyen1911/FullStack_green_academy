import { Route, Routes } from "react-router-dom";
import axios from "axios";
import LayoutMain from "./layouts/main/LayoutMain.jsx";
import "primeicons/primeicons.css";
import { PrimeReactProvider } from "@primereact/core";
import Aura from "@primeuix/themes/aura";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import Register from "./pages/Register.jsx";
import AccountLayout from "./layouts/accountlayout/AccountLayout.jsx";
import Profile from "./pages/Account/Profile.jsx";
import InformationPesonal from "./pages/Account/InformationPesonal.jsx";
import Order from "./pages/Account/Order.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";

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
          <Route path="/" element={<Home />} />
          <Route path="account" element={<AccountLayout />}>
            <Route index element={<Profile />} />
            <Route path="orders" element={<Order />} />
            <Route path="profile" element={<InformationPesonal />} />
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
