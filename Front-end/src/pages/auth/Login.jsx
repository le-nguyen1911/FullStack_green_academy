import axios from 'axios';
import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
	const [formData, setFormData] = useState({});

	const { login } = useAuth();

	const navigate = useNavigate();

	const handleChange = e => {
		setFormData(prev => ({
			...prev,
			[e.target.name]: e.target.value
		}));
	};

	const handleSubmit = async e => {
		e.preventDefault();
		try {
			await login(formData.email, formData.password);
			navigate('/');
		} catch (error) {
			console.log('Login failed');
		}
	};

	return (
		<>
			<h1>Login</h1>

			<Form className='col-md-3' onSubmit={handleSubmit}>
				<Form.Group className='mb-3'>
					<Form.Label>Email address:</Form.Label>
					<Form.Control
						type='email'
						name='email'
						onChange={handleChange}
					/>
				</Form.Group>
				<Form.Group className='mb-3'>
					<Form.Label>Password:</Form.Label>
					<Form.Control
						type='password'
						name='password'
						onChange={handleChange}
					/>
				</Form.Group>
				<Button type='submit' variant='primary'>
					Login
				</Button>
			</Form>
		</>
	);
};

export default Login;
