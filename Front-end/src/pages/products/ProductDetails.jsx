import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axiosClient from '../../utils/axiosClient';

const ProductDetails = () => {
	const [product, setProduct] = useState({});

	const { id } = useParams();

	useEffect(() => {
		axiosClient
			.get(`products/${id}`)
			.then(res => setProduct(res.data.data));
	}, []);

	return (
		<>
			<h1>Product Details</h1>

			<dl className='mb-3'>
				<dt>Name:</dt>
				<dd>{product.name}</dd>

				<dt>Price:</dt>
				<dd>{product.price}</dd>

				<dt>Stock:</dt>
				<dd>{product.stock}</dd>

				<dt>Category:</dt>
				<dd>{product.category_name}</dd>
			</dl>

			<Link to='/products' className='btn btn-secondary btn-sm'>
				Back to list
			</Link>
		</>
	);
};

export default ProductDetails;
