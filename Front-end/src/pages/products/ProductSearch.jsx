import { useState } from 'react';
import { Button, Form, Table } from 'react-bootstrap';
import axiosClient from '../../utils/axiosClient';

const ProductSearch = () => {
	const [q, setQ] = useState('');
	const [products, setProducts] = useState([]);

	const handleChange = e => {
		setQ(e.target.value);
	};

	const handleSubmit = e => {
		e.preventDefault();
		axiosClient
			.get(`products/search?q=${q}`)
			.then(res => setProducts(res.data.data));
	};

	return (
		<>
			<h1>Product Search</h1>

			<Form onSubmit={handleSubmit}>
				<Form.Group className='mb-3'>
					<Form.Label>Keyword:</Form.Label>
					<Form.Control
						type='text'
						name='q'
						placeholder='Enter product name to search'
						onChange={handleChange}
					/>
				</Form.Group>

				<Button type='submit' variant='primary'>
					Search
				</Button>
			</Form>

			<Table striped bordered hover>
				<thead className='table-dark'>
					<tr>
						<th>Name</th>
						<th>Price</th>
						<th>Stock</th>
						<th>Category</th>
					</tr>
				</thead>
				<tbody>
					{products.map(p => (
						<tr key={p.id}>
							<td>{p.name}</td>
							<td>{p.price.toLocaleString()}</td>
							<td>{p.stock}</td>
							<td>{p.category_name}</td>
						</tr>
					))}
				</tbody>
			</Table>
		</>
	);
};

export default ProductSearch;
