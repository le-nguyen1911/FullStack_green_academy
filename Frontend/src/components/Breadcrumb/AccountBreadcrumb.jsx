import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "../Breadcrumb/style/AccountBreadcrumb.module.css";
import { useAuth } from "@/hooks/useAuth";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
const breadcrumbMap = {
  "/account": "Tài khoản",
  "/account/orders": "Đơn hàng",
  "/account/profile": "Thông tin tài khoản",
};

const AccountBreadcrumb = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const current = breadcrumbMap[location.pathname];
  return (
    <div className={styles.breadcrumb}>
      <div className="pathaaction">
        <Link to="/">Trang chủ</Link>

        <span>/</span>

        <Link to="/account">Tài khoản</Link>

        {location.pathname !== "/account" && (
          <>
            <span>/</span>

            <span className={styles.active}>{current}</span>
          </>
        )}
      </div>

      <div
        className={styles.logout}
        onClick={() => dispatch(logout(), navigate("/login"))}
      >
        Đăng xuất
      </div>
    </div>
  );
};

export default AccountBreadcrumb;
