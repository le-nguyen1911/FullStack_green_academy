import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

import logo from "../../assets/logo.png";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import styles from "./LayoutMain.module.css";

const heroTitleMap = {
  "/cart": "GIỎ HÀNG",
  "/wishlist": "YÊU THÍCH",
  "/about": "GIỚI THIỆU",
  "/products": "SẢN PHẨM",
  "/new": "TIN TỨC",
  "/contact": "LIÊN HỆ",
};

const navLinks = [
  { to: "/about", label: "GIỚI THIỆU" },
  { to: "/products", label: "SẢN PHẨM" },
  { to: "/new", label: "TIN TỨC" },
  { to: "/contact", label: "LIÊN HỆ" },
];

const LayoutMain = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [carts] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [keyword, setKeyword] = useState("");

  const hideHero =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname.startsWith("/account");

  const heroTitle = heroTitleMap[location.pathname] || "";

  const closeMenu = () => setMenuOpen(false);

  const handleSearch = (e) => {
    e.preventDefault();

    const search = keyword.trim();

    if (!search) return;

    navigate(`/products?q=${encodeURIComponent(search)}`);

    closeMenu();
  };

  return (
    <>
      <nav className="w-full border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4">
          <div className="hidden lg:grid lg:grid-cols-3 lg:items-center lg:py-4">
            <ul className="flex items-center gap-5 xl:gap-7 text-black">
              {navLinks.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="whitespace-nowrap text-sm font-bold text-gray-800! transition-colors hover:text-[#6f4e37]! no-underline!"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="/" className="flex justify-center">
              <img
                src={logo}
                alt="Logo"
                className="h-auto w-[150px] xl:w-[170px]"
              />
            </Link>
            <div className="flex items-center justify-end gap-5">
              <form
                onSubmit={handleSearch}
                className="flex justify-between min-w-0 items-center border border-gray-300 px-3 py-2 rounded-3xl w-[250px]"
              >
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full min-w-0 border-0 bg-transparent text-sm outline-none"
                />

                <button type="submit" aria-label="Tìm kiếm sản phẩm">
                  <i className="pi pi-search text-[#6f4e37]! text-xl!" />
                </button>
              </form>
              <Link
                to="/wishlist"
                className="text-gray-800! transition-colors hover:text-[#6f4e37]!"
              >
                <i className="pi pi-heart text-xl!" />
              </Link>
              <Link
                to="/account"
                className="text-gray-800! transition-colors hover:text-[#6f4e37]"
              >
                <i className="pi pi-user text-xl!" />
              </Link>
              <Link
                to="/cart"
                className="relative text-gray-800! transition-colors hover:text-[#6f4e37] no-underline!"
              >
                <i className="pi pi-shopping-cart text-xl! " />

                <span className="absolute -right-3 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#6f4e37] px-1 text-xs text-white">
                  {carts.length}
                </span>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-between py-3 lg:hidden">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-md text-gray-800 hover:bg-gray-100"
            >
              <i
                className={`pi ${menuOpen ? "pi-times" : "pi-bars"} text-xl`}
              />
            </button>
            <Link to="/" onClick={closeMenu}>
              <img
                src={logo}
                alt="Logo"
                className="h-auto w-[130px] sm:w-[150px]"
              />
            </Link>
            <Link
              to="/cart"
              className="relative flex h-10 w-10 items-center justify-center text-gray-800! no-underline!"
            >
              <i className="pi pi-shopping-cart text-xl" />

              <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#6f4e37] px-1 text-xs text-white">
                {carts.length}
              </span>
            </Link>
          </div>
          <div
            className={`grid transition-all duration-300 lg:hidden ${
              menuOpen
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="border-t border-gray-100 py-3">
                <ul className="flex flex-col">
                  {navLinks.map((item) => (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        onClick={closeMenu}
                        className="block border-b border-gray-100 px-3 py-3 text-sm font-semibold text-gray-800! hover:bg-gray-50 hover:text-[#6f4e37] no-underline! "
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <form
                  onSubmit={handleSearch}
                  className="mt-4 flex items-center gap-2 px-3"
                >
                  <div className="flex flex-1 min-w-0 items-center rounded-md border border-gray-300 px-3 py-2">
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="Tìm kiếm sản phẩm..."
                      className="w-full min-w-0 bg-transparent text-sm outline-none"
                    />

                    <button type="submit" aria-label="Tìm kiếm sản phẩm">
                      <i className="pi pi-search text-gray-500" />
                    </button>
                  </div>
                </form>
                <div className="mt-4 flex items-center gap-6 px-3">
                  <Link
                    to="/wishlist"
                    onClick={closeMenu}
                    className="text-gray-800! hover:text-[#6f4e37]"
                  >
                    <i className="pi pi-heart text-xl" />
                  </Link>

                  <Link
                    to="/account"
                    onClick={closeMenu}
                    className="text-gray-800! hover:text-[#6f4e37]"
                  >
                    <i className="pi pi-user text-xl" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      {!hideHero && (
        <div className={styles.hero}>
          <div className="container mx-auto px-4">
            {heroTitle && (
              <h1 className="text-center text-2xl font-bold sm:text-3xl lg:text-4xl">
                {heroTitle}
              </h1>
            )}

            <div className="mt-2 text-center text-sm sm:text-base">
              <Breadcrumb />
            </div>
          </div>
        </div>
      )}
      <main className="min-h-[50vh] w-full">
        <Outlet />
      </main>
      <footer className="bg-[#f8f8f8]">
        <div className="container mx-auto px-4 py-10 lg:py-14">
          <div className="grid grid-cols-1 gap-8 border-b border-gray-300 pb-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
            <div className="sm:col-span-2 lg:col-span-1">
              <img
                src={logo}
                alt="Logo"
                className="mb-4 h-auto w-[160px] sm:w-[180px]"
              />

              <p className="text-sm leading-7 text-gray-600">
                Cà phê nguyên chất được chế biến 100% nguyên chất, không pha
                trộn với bất kỳ loại hạt cà phê nào khác.
              </p>
            </div>

            <div>
              <h3 className="mb-4 text-base font-bold text-gray-900">
                DANH MỤC
              </h3>

              <ul className="space-y-3 text-sm text-gray-600">
                <li>
                  <Link to="/" className="hover:text-[#6f4e37]">
                    Trang chủ
                  </Link>
                </li>

                <li>
                  <Link to="/about" className="hover:text-[#6f4e37]">
                    Giới thiệu
                  </Link>
                </li>

                <li>
                  <Link to="/products" className="hover:text-[#6f4e37]">
                    Sản phẩm
                  </Link>
                </li>

                <li>
                  <Link to="/new" className="hover:text-[#6f4e37]">
                    Tin tức
                  </Link>
                </li>

                <li>
                  <Link to="/contact" className="hover:text-[#6f4e37]">
                    Liên hệ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-base font-bold text-gray-900">HỖ TRỢ</h3>

              <ul className="space-y-3 text-sm text-gray-600">
                <li>Câu hỏi thường gặp</li>
                <li>Dịch vụ khách hàng</li>
                <li>Vị trí cửa hàng</li>
                <li>Sản phẩm bán chạy</li>
                <li>Manufactures</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-base font-bold text-gray-900">
                CHÍNH SÁCH
              </h3>

              <ul className="space-y-3 text-sm text-gray-600">
                <li>Chính sách bảo mật</li>
                <li>Chính sách giao hàng</li>
                <li>Chính sách đổi trả</li>
                <li>Chính sách bảo hành</li>
                <li>Điều khoản & điều kiện</li>
              </ul>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="mb-4 text-base font-bold text-gray-900">
                ĐĂNG KÝ NHẬN TIN TỨC
              </h3>

              <p className="mb-4 text-sm leading-6 text-gray-600">
                Đăng ký ngay để nhận các tin tức khuyến mãi mới nhất.
              </p>

              <div className="flex w-full overflow-hidden rounded-md border border-gray-300 bg-white">
                <input
                  type="email"
                  placeholder="Nhập email"
                  className="min-w-0 flex-1 px-3 py-3 text-sm outline-none"
                />

                <button
                  type="button"
                  className="shrink-0 bg-[#6f4e37] px-3 text-xs font-semibold text-white transition hover:bg-[#513824] sm:px-4"
                >
                  ĐĂNG KÝ
                </button>
              </div>
              <div className="mt-5 flex items-center gap-5 text-gray-600">
                <a
                  href="#"
                  aria-label="Facebook"
                  className="hover:text-[#6f4e37]"
                >
                  <i className="fab fa-facebook-f text-lg" />
                </a>

                <a
                  href="#"
                  aria-label="Instagram"
                  className="hover:text-[#6f4e37]"
                >
                  <i className="fab fa-instagram text-lg" />
                </a>

                <a
                  href="#"
                  aria-label="Youtube"
                  className="hover:text-[#6f4e37]"
                >
                  <i className="fab fa-youtube text-lg" />
                </a>
              </div>
            </div>
          </div>

          <div className="pt-6 text-center text-xs text-gray-500 sm:text-sm">
            © Thiết kế và lập trình bởi MONA.Media
          </div>
        </div>
      </footer>
    </>
  );
};

export default LayoutMain;
