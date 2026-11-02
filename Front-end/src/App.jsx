import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import LayoutMain from './layouts/layoutmain/LayoutMain';
import Homepage from './pages/homepage/Homepage';
import "bootstrap/dist/css/bootstrap.min.css";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import Introduce from './pages/Utilities/Introduce';
import ProductsList from './pages/products/ProductsList';
import { UserProvider } from './hooks/UserContext';


axios.defaults.baseURL = 'http://localhost:3000/';

const App = () => {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<LayoutMain />}>
            <Route path="/" element={<Homepage />} />
            <Route path="/gioi-thieu" element={<Introduce />} />
            <Route path="/san-pham" element={<ProductsList />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
};

export default App;