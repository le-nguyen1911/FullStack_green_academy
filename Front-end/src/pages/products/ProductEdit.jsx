import { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../../utils/axiosClient';

const ProductEdit = () => {
	const [categories, setCategories] = useState([]);

	const [product, setProduct] = useState({});

	const { id } = useParams();

	const navigate = useNavigate();

	useEffect(() => {
		axiosClient.get('categories').then(res => setCategories(res.data.data));
		axiosClient
			.get(`products/${id}`)
			.then(res => setProduct(res.data.data));
	}, []);

	const handleChange = e => {
		e.preventDefault();
		setProduct(prev => ({
			...prev,
			[e.target.name]: e.target.value
		}));
	};

	const handleSubmit = e => {
		e.preventDefault();
		axiosClient
			.put(`products/${id}`, product)
			.then(res => navigate('/products'));
	};

	return (
		<>
			<h1>Edit product</h1>

			<Form className='col-md-3' onSubmit={handleSubmit}>
				<Form.Group className='mb-3'>
					<Form.Label>Name:</Form.Label>
					<Form.Control
						type='text'
						name='name'
						value={product.name || ''}
						onChange={handleChange}
					/>
				</Form.Group>
				<Form.Group className='mb-3'>
					<Form.Label>Price:</Form.Label>
					<Form.Control
						type='text'
						name='price'
						value={product.price || 0}
						onChange={handleChange}
					/>
				</Form.Group>
				<Form.Group className='mb-3'>
					<Form.Label>Stock:</Form.Label>
					<Form.Control
						type='text'
						name='stock'
						value={product.stock || 0}
						onChange={handleChange}
					/>
				</Form.Group>
				<Form.Group className='mb-3'>
					<Form.Label>Category:</Form.Label>
					<Form.Select
						name='category_id'
						value={product.category_id}
						onChange={handleChange}
					>
						{categories.map(c => (
							<option key={c.id} value={c.id}>
								{c.name}
							</option>
						))}
					</Form.Select>
				</Form.Group>
				<Button type='submit' variant='primary'>
					Update
				</Button>
			</Form>
		</>
	);
};

export default ProductEdit;
