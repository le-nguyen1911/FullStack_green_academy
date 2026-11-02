import { createContext, useContext, useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	const login = async (email, password) => {
		const res = await axiosClient.post('auth/login', { email, password });

		const { token, user } = res.data;
		localStorage.setItem('token', token);
		setUser(user);

		return user;
	};

	const logout = () => {
		localStorage.removeItem('token');
		setUser(null);
	};

	const getCurrentUser = async () => {
		const token = localStorage.getItem('token');

		if (!token) {
			setLoading(false);
			return;
		}

		try {
			const res = await axiosClient.get('auth/me');

			setUser(res.data.user);
		} catch (error) {
			localStorage.removeItem('token');
			setUser(null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getCurrentUser();
	}, []);

	return (
		<AuthContext.Provider
			value={{
				user,
				loading,
				login,
				logout,
				getCurrentUser,
				isAuthenticated: !!user,
				isAdmin: user?.role == 'admin'
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };
