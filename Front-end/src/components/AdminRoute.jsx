import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = ({ children }) => {
	const { loading, isAuthenticated, isAdmin } = useAuth();

	if (loading) {
		return <p>Loading...</p>;
	}

	if (!isAuthenticated) {
		return <Navigate to='/login' replace />;
	}

	if (!isAdmin) {
		return <Navigate to='/403' replace />;
	}

	return children;
};

export default AdminRoute;
