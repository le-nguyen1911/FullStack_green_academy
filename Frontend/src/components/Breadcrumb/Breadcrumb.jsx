import React from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "../Breadcrumb/style/Breadcrumb.module.css";

const breadcrumbMap = {
  "/cart": "Giỏ hàng",
  "/wishlist": "Yêu thích",
  "/gioi-thieu": "Giới thiệu",
  "/san-pham": "Sản phẩm",
  "/tin-tuc": "Tin tức",
  "/lien-he": "Liên hệ", 
  "/checkout" : "Thanh toán"

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
