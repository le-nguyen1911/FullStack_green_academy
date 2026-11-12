import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Homepage from './pages/homepage/Homepage';
import "bootstrap/dist/css/bootstrap.min.css";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import LayoutMain from './layouts/main/LayoutMain';
import Introduce from './pages/introduce/introduce';
import AlignmentDemo2 from './pages/Homepage/AlignmentDemo2';

const App = () => {
  return (

    <BrowserRouter>
      <Routes>
        <Route element={<LayoutMain />}>
          <Route path="/" element={<Homepage />} />
          <Route path="/gioi-thieu" element={<Introduce />} />
        </Route>
      </Routes>
    </BrowserRouter>

  );
};

export default App;