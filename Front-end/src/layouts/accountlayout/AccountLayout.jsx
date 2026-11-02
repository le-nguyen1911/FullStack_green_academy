import React from 'react'
import styles from "./Account.module.css";
import { NavLink, Outlet } from 'react-router-dom';
import AccountBreadcrumb from '../../components/Breadcrumb/AccountBreadcrumb';


const AccountLayout = () => {
    return (
        <>
            <div className={styles.heroAccount}>

                <div className="container">

                    <h1>TÀI KHOẢN</h1>

                    <AccountBreadcrumb />

                </div>

            </div>
            <div className="container py-5">

                <div className={styles.wrapper}>

                    <div className={styles.sidebar}>

                        <NavLink end to="/account" end
                            to="/account"
                            className={({ isActive }) =>
                                `${isActive ? styles.active : ""}`
                            }>
                            Trang tài khoản
                        </NavLink>

                        <NavLink to="/account/orders" end
                            className={({ isActive }) =>
                                `${isActive ? styles.active : ""}`
                            }>
                            Đơn hàng
                        </NavLink>

                        <NavLink to="/account/address" className={({ isActive }) =>
                            `${isActive ? styles.active : ""}`
                        }>

                            Địa chỉ
                        </NavLink>

                        <NavLink to="/account/profile" className={({ isActive }) =>
                            `${isActive ? styles.active : ""}`
                        }>
                            Thông tin tài khoản
                        </NavLink>

                        <NavLink to="/account/password" className={({ isActive }) =>
                            `${isActive ? styles.active : ""}`
                        }>
                            Đổi mật khẩu
                        </NavLink>

                    </div>

                    <div className={styles.content}>

                        <Outlet />

                    </div>

                </div>

            </div>
        </>
    )
}

export default AccountLayout