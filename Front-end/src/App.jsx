import { BrowserRouter, Route, Routes } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';

import Layout from './layouts/Layout';

import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import ProductList from './pages/products/ProductList';
import ProductCreate from './pages/products/ProductCreate';
import ProductDetails from './pages/products/ProductDetails';
import ProductEdit from './pages/products/ProductEdit';

import Login from './pages/auth/Login';
import Home from './pages/Home';
import ProductSearch from './pages/products/ProductSearch';

const App = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path='/' element={<Layout />}>
					<Route index element={<Home />} />

					<Route path='login' element={<Login />} />

					<Route path='products'>
						<Route index element={<ProductList />} />
						<Route
							path='create'
							element={
								<AdminRoute>
									<ProductCreate />
								</AdminRoute>
							}
						/>
						<Route path='search' element={<ProductSearch />} />
						<Route
							path=':id'
							element={
								<ProtectedRoute>
									<ProductDetails />
								</ProtectedRoute>
							}
						/>
						<Route path=':id/edit' element={<ProductEdit />} />
					</Route>

					<Route
						path='403'
						element={<h1>You do not have access to this page</h1>}
					/>
				</Route>
			</Routes>
		</BrowserRouter>
	);
};

export default App;
