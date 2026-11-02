import { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../utils/axiosClient';

const ProductCreate = () => {
	const [categories, setCategories] = useState([]);

	const [product, setProduct] = useState({});

	const navigate = useNavigate();

	useEffect(() => {
		axiosClient.get('categories').then(res => setCategories(res.data.data));
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
			.post('products', product)
			.then(res => navigate('/products'));
	};

	return (
		<>
			<h1>Create product</h1>

			<Form className='col-md-3' onSubmit={handleSubmit}>
				<Form.Group className='mb-3'>
					<Form.Label>Name:</Form.Label>
					<Form.Control
						type='text'
						name='name'
						onChange={handleChange}
					/>
				</Form.Group>
				<Form.Group className='mb-3'>
					<Form.Label>Price:</Form.Label>
					<Form.Control
						type='text'
						name='price'
						onChange={handleChange}
					/>
				</Form.Group>
				<Form.Group className='mb-3'>
					<Form.Label>Stock:</Form.Label>
					<Form.Control
						type='text'
						name='stock'
						onChange={handleChange}
					/>
				</Form.Group>
				<Form.Group className='mb-3'>
					<Form.Label>Category:</Form.Label>
					<Form.Select name='category_id' onChange={handleChange}>
						{categories.map(c => (
							<option key={c.id} value={c.id}>
								{c.name}
							</option>
						))}
					</Form.Select>
				</Form.Group>
				<Button type='submit' variant='primary'>
					Add
				</Button>
			</Form>
		</>
	);
};

export default ProductCreate;
