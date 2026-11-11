import React from "react";
import styles from "./Account.module.css";
import { NavLink, Outlet } from "react-router-dom";
import AccountBreadcrumb from "../../components/Breadcrumb/AccountBreadcrumb";

const AccountLayout = () => {
  return (
    <div>
      <div className={styles.heroAccount}>
        <div className="container">
          <h1>TÀI KHOẢN</h1>

          <AccountBreadcrumb />
        </div>
      </div>

      <div className="container py-5">
        <div className={styles.wrapper}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarInner}>
              <NavLink
                to="/account"
                end
                className={({ isActive }) => (isActive ? styles.active : "")}
              >
                Trang tài khoản
              </NavLink>

              <NavLink
                to="/account/orders"
                className={({ isActive }) => (isActive ? styles.active : "")}
              >
                Đơn hàng
              </NavLink>

              <NavLink
                to="/account/profile"
                className={({ isActive }) => (isActive ? styles.active : "")}
              >
                Thông tin tài khoản
              </NavLink>
            </div>
          </aside>

          <main className={styles.content}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AccountLayout;
