import React, { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import "primeicons/primeicons.css";
import styles from "./LayoutMain.module.css";
import { BreadCrumb } from 'primereact/breadcrumb';
import { useBreadcrumb } from "../../hooks/UserContext";

const LayoutMain = () => {
    const [showMenu, setShowMenu] = useState(true);
    const lastScroll = useRef(0);
    const [transparent, setTransparent] = useState(true);

    const location = useLocation();
    const isHomePage = location.pathname === "/";

    const { breadcrumbs = [], setBreadcrumbs } = useBreadcrumb();

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

            if (currentScroll > lastScroll.current && currentScroll > 100) {
                setShowMenu(false);
            } else {
                setShowMenu(true);
            }

            lastScroll.current = currentScroll;
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <>
            <header
                className={`${styles.header} ${showMenu ? styles.show : styles.hide}`}
                style={{
                    backgroundColor: isHomePage && transparent ? "transparent" : "#fff",
                    transition: "all .3s ease",
                }}
            >
                <nav
                    className="container-fluid py-3"
                    style={{
                        backgroundColor: isHomePage && transparent ? "transparent" : "#fff",
                        borderBottom:
                            isHomePage && transparent
                                ? "none"
                                : "1px solid #dee2e6",
                        transition: "all .3s ease",
                    }}
                >
                    <div className="container">
                        <div className="row align-items-center">

                            {/* MENU */}
                            <div className="col-4">
                                <ul className="nav gap-4 fw-semibold">
                                    <li>
                                        <Link
                                            to="/gioi-thieu"
                                            className="nav-link p-0"
                                            style={{
                                                color: isHomePage && transparent ? "#fff" : "#000",
                                            }}
                                        >
                                            GIỚI THIỆU
                                        </Link>
                                    </li>

                                    <li>
                                        <Link
                                            to="/san-pham"
                                            className="nav-link p-0"
                                            style={{
                                                color: isHomePage && transparent ? "#fff" : "#000",
                                            }}
                                        >
                                            SẢN PHẨM
                                        </Link>
                                    </li>

                                    <li>
                                        <Link
                                            to="/tin-tuc"
                                            className="nav-link p-0"
                                            style={{
                                                color: isHomePage && transparent ? "#fff" : "#000",
                                            }}
                                        >
                                            TIN TỨC
                                        </Link>
                                    </li>

                                    <li>
                                        <Link
                                            to="/lien-he"
                                            className="nav-link p-0"
                                            style={{
                                                color: isHomePage && transparent ? "#fff" : "#000",
                                            }}
                                        >
                                            LIÊN HỆ
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            {/* LOGO */}
                            <div className="col-4 text-center">
                                <Link to="/">
                                    <img
                                        src="https://cafengon.monamedia.net/wp-content/uploads/2025/01/The-mona-logo-e1736923312403.png"
                                        className="img-fluid"
                                        style={{ width: "170px" }}
                                        alt="Logo"
                                    />
                                </Link>
                            </div>

                            {/* RIGHT */}
                            <div className="col-4">
                                <div className="d-flex justify-content-end align-items-center gap-4">
                                    <div
                                        className="d-flex align-items-center"
                                        style={{
                                            borderBottom: `1px solid ${isHomePage && transparent ? "#fff" : "#000"}`,
                                        }}
                                    >
                                        <input
                                            type="text"
                                            placeholder="Tìm kiếm"
                                            className="border-0 shadow-none"
                                            style={{
                                                background: "transparent",
                                                color: isHomePage && transparent ? "#fff" : "#000",
                                                outline: "none",
                                            }}
                                        />
                                        <i
                                            className="pi pi-search ms-2"
                                            style={{
                                                color: isHomePage && transparent ? "#fff" : "#000",
                                            }}
                                        ></i>
                                    </div>

                                    <Link
                                        to="/wishlist"
                                        style={{
                                            color: isHomePage && transparent ? "#fff" : "#000",
                                        }}
                                    >
                                        <i className="pi pi-heart fs-5"></i>
                                    </Link>

                                    <Link
                                        to="/account"
                                        style={{
                                            color: isHomePage && transparent ? "#fff" : "#000",
                                        }}
                                    >
                                        <i className="pi pi-user fs-5"></i>
                                    </Link>

                                    <span
                                        className="position-relative"
                                        style={{
                                            color: isHomePage && transparent ? "#fff" : "#000",
                                        }}
                                    >
                                        <i className="pi pi-shopping-cart fs-5"></i>
                                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark">
                                            0
                                        </span>
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>
                </nav>
            </header>

            {!isHomePage && (<main style={{ height: "90px" }} />)}

            {!isHomePage && (
                <div className="breadcrumb-container" style={{ margin: '10px 0' }}>
                    <BreadCrumb model={items} home={home} />
                </div>
            )}

            {/* FIX LỖI 2: Truyền setBreadcrumbs (hoặc setBreadcrumbItems) chuẩn vào Outlet */}
            <Outlet context={{ setBreadcrumbs }} />

            <footer className='bg-light'>
                <div className="footer">
                    <div className="footer-content row d-flex justify-content-center align-items-center border-bottom">
                        <div className="footer-col about col-lg-3 col-md-12 mb-12 mb-lg-0">
                            <img src="https://cafengon.monamedia.net/wp-content/uploads/2025/01/The-mona-logo-e1736923312403.png" className="logo" style={{ width: "200px", height: "auto" }} alt="Footer Logo" />
                            <p>
                                Cà phê nguyên chất được chế biến 100% nguyên chất,
                                không pha trộn với bất kỳ loại hạt cà phê nào khác.
                            </p>
                        </div>

                        <div className="footer-col col-lg-2 col-md-6 col-6 mb-3 mb-lg-0">
                            <h3>DANH MỤC</h3>
                            <ul>
                                <li>Trang chủ</li>
                                <li>Giới thiệu</li>
                                <li>Sản phẩm</li>
                                <li>Tin tức</li>
                                <li>Liên hệ</li>
                            </ul>
                        </div>

                        <div className="footer-col col-lg-2 col-md-6 col-6 mb-3 mb-lg-0">
                            <h3>HỖ TRỢ</h3>
                            <ul>
                                <li>Câu hỏi thường gặp</li>
                                <li>Dịch vụ khách hàng</li>
                                <li>Vị trí cửa hàng</li>
                                <li>Sản phẩm bán chạy</li>
                                <li>Manufactures</li>
                            </ul>
                        </div>

                        <div className="footer-col col-lg-2 col-md-12 col-12 mb-3 mb-lg-0">
                            <h3>CHÍNH SÁCH</h3>
                            <ul>
                                <li>Chính sách bảo mật</li>
                                <li>Chính sách giao hàng</li>
                                <li>Chính sách đổi trả</li>
                                <li>Chính sách bảo hành</li>
                                <li>Điều khoản & điều kiện</li>
                            </ul>
                        </div>

                        <div className="footer-col subscribe col-lg-2 col-md-12 mb-3 mb-lg-0">
                            <h3>ĐĂNG KÝ NHẬN TIN TỨC</h3>
                            <p>Đăng ký ngay để nhận các tin tức khuyến mãi mới nhất.</p>
                            <div className="newsletter">
                                <input type="email" placeholder="Nhập email" />
                                <button>ĐĂNG KÝ</button>
                            </div>
                            <div className="social">
                                <a href="#"><i className="fab fa-facebook-f"></i></a>
                                <a href="#"><i className="fab fa-instagram"></i></a>
                                <a href="#"><i className="fab fa-youtube"></i></a>
                            </div>
                        </div>
                    </div>

                    <div className="copyright d-flex justify-content-center">
                        © Thiết kế và lập trình bởi
                    </div>
                </div>
            </footer>
        </>
    );
};

export default LayoutMain;