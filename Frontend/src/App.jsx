import { Route, Routes } from "react-router-dom";
import axios from "axios";
import LayoutMain from "./layouts/LayoutMain.jsx";
import "primeicons/primeicons.css";
import ProtectedRoute from "./components/ProtectedRoute";
import { PrimeReactProvider } from "@primereact/core";
import Aura from "@primeuix/themes/aura";
import Login from "./pages/Login.jsx";

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
        
        </Route>
        <Route path="/login" element={<Login />} />
      </Routes>
    </PrimeReactProvider>
  );
};

export default App;
