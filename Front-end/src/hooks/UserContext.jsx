import { createContext, useContext, useState } from 'react';

const UserContext = createContext(null);
const BreadcrumbContext = createContext(null);

const UserProvider = ({ children }) => {
    const [breadcrumbs, setBreadcrumbs] = useState([]);

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const isAuthenticated = user !== null;

    const login = userData => {
        const loggedInUser = {
            fullName: userData.fullName,
            email: userData.email,
            role: userData.role
        };
        setUser(loggedInUser);
        localStorage.setItem('user', JSON.stringify(loggedInUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const changeEmail = newEmail => {
        const updatedUser = {
            ...user,
            email: newEmail
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    return (
        <UserContext.Provider value={{ user, isAuthenticated, login, logout, changeEmail }}>
            {/* ✅ FIX LỖI: Thêm BreadcrumbContext.Provider ở đây */}
            <BreadcrumbContext.Provider value={{ breadcrumbs, setBreadcrumbs }}>
                {children}
            </BreadcrumbContext.Provider>
        </UserContext.Provider>
    );
};

const useUser = () => useContext(UserContext);

const useBreadcrumb = () => {
    const context = useContext(BreadcrumbContext);
    if (!context) {
        return { breadcrumbs: [], setBreadcrumbs: () => { } };
    }
    return context;
};

export { UserProvider, useUser, useBreadcrumb };