import React from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "../Breadcrumb/style/Breadcrumb.module.css";

const breadcrumbMap = {
  "/cart": "Giỏ hàng",
  "/wishlist": "Yêu thích",
  "/about": "Giới thiệu",
  "/product": "Sản phẩm",
  "/news": "Tin tức",
  "/contact": "Liên hệ",
  "/checkout": "Thanh toán",
};

const Breadcrumb = () => {
  const location = useLocation();
  const current = breadcrumbMap[location.pathname];

  return (
    <div className={styles.breadcrumb}>
      <Link to="/">Trang chủ</Link>

      {current && (
        <>
          <span>/</span>
          <span className={styles.active}>{current}</span>
        </>
      )}
    </div>
  );
};

export default Breadcrumb;
