import React, { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import "primeicons/primeicons.css";
import styles from "../main/LayoutMain.module.css";
import { BreadCrumb } from 'primereact/breadcrumb';
import { useBreadcrumb } from "../../hooks/UserContext";
import logoImg from "../../assets/logo.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram, faYoutube } from '@fortawesome/free-brands-svg-icons';

const LayoutMain = () => {
  const [showMenu, setShowMenu] = useState(true);
  const lastScroll = useRef(0);
  const [transparent, setTransparent] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const { breadcrumbs = [], setBreadcrumbs } = useBreadcrumb();

  const isTransparentHeader = isHomePage && transparent;
  const textColor = isTransparentHeader ? "#fff" : "#000";

  const items = (breadcrumbs || []).map((item) => ({
    label: item.label,
    template: () => (
      <Link to={item.url || "#"} className="p-menuitem-link">
        <span className="p-menuitem-text">{item.label}</span>
      </Link>
    )
  }));

  const home = {
    template: () => (
      <Link to="/" className="p-menuitem-link">
        <span className="pi pi-home"></span>
      </Link>
    )
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setTransparent(currentScroll < 600);
      setShowMenu(currentScroll <= lastScroll.current || currentScroll <= 100);
      lastScroll.current = currentScroll;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`${styles.header} ${showMenu ? styles.show : styles.hide}`}
        style={{
          backgroundColor: isTransparentHeader ? "transparent" : "#fff",
          transition: "all .3s ease",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 1000,
          boxShadow: isTransparentHeader ? "none" : "0 2px 4px rgba(0,0,0,0.05)"
        }}
      >
        <nav
          className="container-fluid py-3"
          style={{
            backgroundColor: isTransparentHeader ? "transparent" : "#fff",
            borderBottom: isTransparentHeader ? "none" : "1px solid #dee2e6",
            transition: "all .3s ease",
          }}
        >
          <div className="container">
            {/* Desktop Menu */}
            <div className="row align-items-center d-none d-lg-flex">
              <div className="col-4">
                <ul className="nav gap-4 fw-semibold">
                  {["gioi-thieu", "san-pham", "tin-tuc", "lien-he"].map((path, idx) => {
                    const labels = ["GIỚI THIỆU", "SẢN PHẨM", "TIN TỨC", "LIÊN HỆ"];
                    return (
                      <li key={path}>
                        <Link to={`/${path}`} className="nav-link p-0" style={{ color: textColor }}>
                          {labels[idx]}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Logo */}
              <div className="col-4 text-center">
                <Link to="/">
                  <img
                    src={logoImg}
                    className="img-fluid"
                    style={{
                      width: "170px",
                      filter: isTransparentHeader ? "brightness(0) invert(1)" : "none",
                      transition: "filter 0.3s ease",
                    }}
                    alt="Logo"
                  />
                </Link>
              </div>

              {/* Right Actions */}
              <div className="col-4">
                <div className="d-flex justify-content-end align-items-center gap-4">
                  <div className="d-flex align-items-center" style={{ borderBottom: `1px solid ${textColor}` }}>
                    <input
                      type="text"
                      placeholder="Tìm kiếm"
                      className="border-0 shadow-none"
                      style={{ background: "transparent", color: textColor, outline: "none" }}
                    />
                    <i className="pi pi-search ms-2" style={{ color: textColor }}></i>
                  </div>

                  <Link to="/wishlist" style={{ color: textColor }}><i className="pi pi-heart fs-5"></i></Link>
                  <Link to="/account" style={{ color: textColor }}><i className="pi pi-user fs-5"></i></Link>

                  <span className="position-relative" style={{ color: textColor }}>
                    <i className="pi pi-shopping-cart fs-5"></i>
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark">
                      0
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Header Top */}
            <div className="d-flex d-lg-none align-items-center justify-content-between py-1">
              <button
                type="button"
                onClick={() => { setMenuOpen(!menuOpen); setSearchOpen(false); }}
                className="btn border-0 d-flex h-10 w-10 align-items-center justify-content-center rounded p-0"
                style={{ color: textColor }}
              >
                <i className={`pi ${menuOpen ? "pi-times" : "pi-bars"} fs-4`} />
              </button>

              <Link to="/" onClick={() => { closeMenu(); setSearchOpen(false); }}>
                <img
                  src={logoImg}
                  className="img-fluid"
                  style={{
                    width: "130px",
                    filter: isTransparentHeader ? "brightness(0) invert(1)" : "none",
                    transition: "filter 0.3s ease",
                  }}
                  alt="Logo"
                />
              </Link>

              <Link
                to="/cart"
                className="position-relative text-decoration-none d-flex align-items-center justify-content-center"
                style={{ width: "40px", height: "40px", color: textColor }}
              >
                <i className="pi pi-shopping-cart fs-5" />
                <span className="position-absolute top-25 start-75 translate-middle badge rounded-pill bg-warning text-dark" style={{ fontSize: '10px' }}>
                  0
                </span>
              </Link>
            </div>

            {/* Mobile Dropdown Menu */}
            {menuOpen && (
              <div className="d-lg-none border-top mt-2 pt-3 pb-2 bg-white shadow-sm rounded px-2">
                <ul className="nav flex-column gap-2 fw-semibold">
                  {[
                    { to: "/gioi-thieu", label: "GIỚI THIỆU" },
                    { to: "/san-pham", label: "SẢN PHẨM" },
                    { to: "/tin-tuc", label: "TIN TỨC" },
                    { to: "/lien-he", label: "LIÊN HỆ" }
                  ].map((item, index, arr) => (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        onClick={closeMenu}
                        className={`nav-link text-dark py-2 ${index !== arr.length - 1 ? 'border-bottom' : ''}`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </nav>

        {/* POPUP TÌM KIẾM CHO MOBILE */}
        {searchOpen && (
          <div className="d-lg-none bg-white border-bottom shadow-sm p-3 position-relative animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-bold fs-5 mx-auto">Tìm kiếm sản phẩm</span>
              <button
                onClick={() => setSearchOpen(false)}
                className="btn btn-light border-0 p-2 rounded-circle"
                style={{ width: "35px", height: "35px" }}
              >
                <i className="pi pi-times"></i>
              </button>
            </div>

            <div className="input-group border rounded px-2 py-1 mb-2 bg-light align-items-center">
              <input
                type="text"
                placeholder="Nhập tìm kiếm..."
                className="form-control border-0 shadow-none bg-transparent"
              />
              <i className="pi pi-search text-muted me-2"></i>
            </div>

            <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '14px' }}>
              <span className="text-dark fw-semibold">Sản phẩm bán chạy</span>
              <Link to="/san-pham" onClick={() => setSearchOpen(false)} className="text-decoration-underline text-primary">Cà phê</Link>
              <Link to="/san-pham" onClick={() => setSearchOpen(false)} className="text-decoration-underline text-primary">Nguyên chất</Link>
              <Link to="/san-pham" onClick={() => setSearchOpen(false)} className="text-decoration-underline text-primary">Rang xay</Link>
            </div>
          </div>
        )}
      </header>

      {!isHomePage && <main style={{ height: "90px" }} />}

      {!isHomePage && (
        <div className="breadcrumb-container d-block d-lg-none" style={{ margin: '10px 0' }}>
          <div className="container">
            <BreadCrumb model={items} home={home} />
          </div>
        </div>
      )}

      <Outlet context={{ setBreadcrumbs }} />

      <footer className='text-white position-relative w-100' style={{
        background: "linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.85)), url('https://chapelyard.co.uk/wp-content/uploads/2025/02/cafe-dereham.png') center/cover no-repeat",
        margin: 0,
        paddingBottom: '20px'
      }}>
        <div className="footer pt-5 pb-3 container">
          <div className="footer-content row d-flex justify-content-between align-items-start border-bottom pb-4">

            <div className="footer-col about col-lg-3 col-md-12 mb-4 mb-lg-0 text-center text-lg-start">
              <img src={logoImg} className="logo mb-3" style={{ width: "160px", height: "auto", filter: "brightness(0) invert(1)" }} alt="Footer Logo" />
              <p className="mt-2 text-light opacity-75" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                Cà phê nguyên chất được chế biến 100% nguyên chất, không pha trộn với bất kỳ loại hạt cà phê nào khác.
              </p>
            </div>

            <div className="footer-col col-lg-2 col-md-4 col-6 mb-4 mb-lg-0">
              <h3 style={{ fontSize: '15px', fontWeight: '700', letterSpacing: '0.8px', marginBottom: '16px' }}>DANH MỤC</h3>
              <ul className="list-unstyled opacity-75" style={{ fontSize: '14px', lineHeight: '2' }}>
                {["Trang chủ", "Giới thiệu", "Sản phẩm", "Tin tức", "Liên hệ"].map(i => <li key={i}>{i}</li>)}
              </ul>
            </div>

            <div className="footer-col col-lg-2 col-md-4 col-6 mb-4 mb-lg-0">
              <h3 style={{ fontSize: '15px', fontWeight: '700', letterSpacing: '0.8px', marginBottom: '16px' }}>HỖ TRỢ</h3>
              <ul className="list-unstyled opacity-75" style={{ fontSize: '14px', lineHeight: '2' }}>
                {["Câu hỏi thường gặp", "Dịch vụ khách hàng", "Vị trí cửa hàng", "Sản phẩm bán chạy", "Manufactures"].map(i => <li key={i}>{i}</li>)}
              </ul>
            </div>

            <div className="footer-col col-lg-2 col-md-4 col-12 mb-4 mb-lg-0">
              <h3 style={{ fontSize: '15px', fontWeight: '700', letterSpacing: '0.8px', marginBottom: '16px' }}>CHÍNH SÁCH</h3>
              <ul className="list-unstyled opacity-75" style={{ fontSize: '14px', lineHeight: '2' }}>
                {["Chính sách bảo mật", "Chính sách giao hàng", "Chính sách đổi trả", "Chính sách bảo hành", "Điều khoản & điều kiện"].map(i => <li key={i}>{i}</li>)}
              </ul>
            </div>

            {/* Cột Đăng ký nhận tin */}
            <div className="footer-col subscribe col-lg-3 col-md-12 mb-4 mb-lg-0 text-center text-lg-start">
              <h3 style={{ fontSize: '15px', fontWeight: '700', letterSpacing: '0.8px', marginBottom: '16px' }}>ĐĂNG KÝ NHẬN TIN TỨC</h3>
              <p className="opacity-75" style={{ fontSize: '14px', lineHeight: '1.5' }}>Đăng ký ngay để nhận các tin tức khuyến mãi mới nhất.</p>
              <div className="newsletter input-group mb-3">
                <input type="email" className="form-control" placeholder="Nhập email" style={{ fontSize: '14px' }} />
                <button className="btn btn-dark" style={{ fontSize: '14px' }}>ĐĂNG KÝ</button>
              </div>
              <div className="social d-flex gap-3 justify-content-center justify-content-lg-start mt-3">
                <a href="#" className="text-white text-decoration-none bg-dark border border-secondary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                  <FontAwesomeIcon icon={faFacebookF} />
                </a>
                <a href="#" className="text-white text-decoration-none bg-dark border border-secondary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                  <FontAwesomeIcon icon={faInstagram} />
                </a>
                <a href="#" className="text-white text-decoration-none bg-dark border border-secondary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                  <FontAwesomeIcon icon={faYoutube} />
                </a>
              </div>
            </div>
          </div>

          <div className="copyright d-flex justify-content-center pt-3 text-light opacity-50" style={{ fontSize: '13px' }}>
            © Đồ Án FullStack_green_academy
          </div>
        </div>
      </footer>

      {/* Thanh điều hướng dưới cùng cho mobile */}
      <div
        className="d-block d-lg-none position-fixed bottom-0 start-0 w-100 bg-white border-top py-2 px-2 shadow"
        style={{ zIndex: 1050 }}
      >
        <div className="row text-center m-0">
          <div className="col p-0">
            <Link to="/" onClick={() => setSearchOpen(false)} className="text-dark text-decoration-none d-flex flex-column align-items-center">
              <i className="pi pi-home fs-5"></i>
              <span style={{ fontSize: '11px' }} className="mt-1">Trang chủ</span>
            </Link>
          </div>
          <div className="col p-0">
            <button
              onClick={() => { setSearchOpen(!searchOpen); setMenuOpen(false); }}
              className="btn border-0 bg-transparent text-dark w-100 p-0 d-flex flex-column align-items-center"
            >
              <i className="pi pi-search fs-5"></i>
              <span style={{ fontSize: '11px' }} className="mt-1">Tìm kiếm</span>
            </button>
          </div>
          <div className="col p-0">
            <Link to="/san-pham" onClick={() => setSearchOpen(false)} className="text-dark text-decoration-none d-flex flex-column align-items-center">
              <i className="pi pi-shopping-bag fs-5"></i>
              <span style={{ fontSize: '11px' }} className="mt-1">Sản phẩm</span>
            </Link>
          </div>
          <div className="col p-0">
            <Link to="/account" onClick={() => setSearchOpen(false)} className="text-dark text-decoration-none d-flex flex-column align-items-center">
              <i className="pi pi-user fs-5"></i>
              <span style={{ fontSize: '11px' }} className="mt-1">Tài khoản</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default LayoutMain;