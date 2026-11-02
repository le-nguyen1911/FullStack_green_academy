import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LogoutButton from '../components/LogoutButton';

const Home = () => {
	const { user, isAuthenticated, isAdmin } = useAuth();

	if (!isAuthenticated) {
		return (
			<>
				<h1>Homepage</h1>

				<h3>You are not logged in</h3>

				<p>
					<Link to='login'>Login now</Link>
				</p>
			</>
		);
	}

	return (
		<>
			<h1>Homepage</h1>

			<h3>Hello {user.name}</h3>

			<p>Email: {user.email}</p>
			<p>Role: {user.role}</p>

			<p>{isAdmin && <Link to='admin'>Admin Dashboard</Link>}</p>

			<LogoutButton />
		</>
	);
};

export default Home;
