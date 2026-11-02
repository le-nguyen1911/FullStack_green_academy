import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import { Link } from 'react-router-dom';
import axiosClient from '../../utils/axiosClient';
import { useAuth } from '../../contexts/AuthContext';

const ProductList = () => {
	const [products, setProducts] = useState([]);

	const { isAdmin } = useAuth();

	useEffect(() => {
		axiosClient.get('products').then(res => setProducts(res.data.data));
	}, []);

	const handleDelete = ({ id, name }) => {
		if (confirm(`Are you sure to delete product ${name} (ID: ${id})?`)) {
			axiosClient.delete(`products/${id}`).then(res => {
				setProducts(prev => [...prev.filter(p => p.id != id)]);
			});
		}
	};

	return (
		<>
			<h1>Product List</h1>

			{isAdmin && (
				<Link to='create' className='btn btn-success mb-2'>
					Add new product
				</Link>
			)}

			<Table striped bordered hover>
				<thead className='table-dark'>
					<tr>
						<th>Name</th>
						<th>Price</th>
						<th>Stock</th>
						<th>Category</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{products.map(p => (
						<tr key={p.id}>
							<td>{p.name}</td>
							<td>{p.price.toLocaleString()}</td>
							<td>{p.stock}</td>
							<td>{p.category_name}</td>
							<td>
								<Link
									to={`${p.id}`}
									className='btn btn-outline-info btn-sm me-1'
								>
									Details
								</Link>
								<Link
									to={`${p.id}/edit`}
									className='btn btn-outline-warning btn-sm me-1'
								>
									Edit
								</Link>
								<Button
									variant='outline-danger'
									size='sm'
									onClick={() => handleDelete(p)}
								>
									Delete
								</Button>
							</td>
						</tr>
					))}
				</tbody>
			</Table>
		</>
	);
};

export default ProductList;
