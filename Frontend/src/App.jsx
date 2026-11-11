import { Route, Routes } from "react-router-dom";
import axios from "axios";
import LayoutMain from "./layouts/main/LayoutMain.jsx";
import "primeicons/primeicons.css";
import { PrimeReactProvider } from "@primereact/core";
import Aura from "@primeuix/themes/aura";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import Register from "./pages/Register.jsx";

const primereact = {
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
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </PrimeReactProvider>
  );
};

export default App;
