import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Home,
  ReceiptText,
  Users,
  Star,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Bell,
  Calendar as CalendarIcon,
  Award,
  LayoutGrid,
  Coffee,
} from "lucide-react";
import { Calendar } from "primereact/calendar";
import { useAuth } from "../../hooks/useAuth";
import { logout } from "../../redux/slices/authSlice";
import styles from "./ManagerLayout.module.css";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/manager", icon: Home, end: true },
  { label: "Roles", to: "/manager/roles", icon: ShieldCheck },
  { label: "Customers", to: "/manager/users", icon: Users },
  { label: "Orders", to: "/manager/orders", icon: ReceiptText },
  { label: "Products", to: "/manager/products", icon: Coffee },
  { label: "Categories", to: "/manager/categories", icon: LayoutGrid },
  { label: "Brands", to: "/manager/brands", icon: Award },
  { label: "Reviews", to: "/manager/reviews", icon: Star },
];

const ROLE_LABELS = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  STAFF_SALE: "Nhân viên",
  CUSTOMER: "Khách hàng",
};

export default function ManagerLayout() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <div className={styles.layoutWrapper}>
      {open && (
        <div
          onClick={() => setOpen(false)}
          className={styles.backdrop}
          aria-hidden="true"
        />
      )}

      <aside
        className={`${styles.sidebar} ${open ? styles.sidebarOpen : ""}`}
        aria-label="Sidebar quản trị"
      >
        <div>
          <div className={styles.closeMobileBtn}>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => setOpen(false)}
              aria-label="Đóng menu"
            >
              <X size={20} />
            </button>
          </div>

          <nav className={styles.navList}>
            {NAV_ITEMS.map(({ label, to, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
                }
              >
                <Icon size={18} strokeWidth={1.9} />
                <span className={styles.navText}>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className={styles.sidebarFooter}>
          <NavLink to="/" className={styles.footerActionBtn}>
            <ChevronLeft size={18} />
            <span className={styles.navText}>Về trang bán hàng</span>
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            className={`${styles.footerActionBtn} ${styles.logoutBtn}`}
          >
            <LogOut size={17} />
            <span className={styles.navText}>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content nền trắng ngà #FFFCFA */}
      <div className={styles.mainArea}>
        <Topbar
          user={user}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onMenu={() => setOpen(!open)}
          roleLabels={ROLE_LABELS}
        />

        <main className={styles.contentOutlet}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Topbar({ user, selectedDate, onDateChange, onMenu, roleLabels }) {
  const displayName = user?.name || user?.email?.split("@")[0] || "Admin";

  return (
    <header className={styles.topbar}>
      <div className={styles.topbarLeft}>
        <button
          type="button"
          className={styles.mobileMenuBtn}
          onClick={onMenu}
          aria-label="Mở menu"
        >
          <Menu size={20} />
        </button>

        <h1 className={styles.greetingTitle}>Good Morning {displayName}!</h1>

        {user?.role && (
          <span className={styles.roleBadge}>
            {roleLabels[user.role] || user.role}
          </span>
        )}
      </div>

      <div className={styles.topbarRight}>
        <div className={styles.datePill}>
          <CalendarIcon size={15} strokeWidth={2} />
          <Calendar
            value={selectedDate}
            onChange={(e) => onDateChange(e.value)}
            dateFormat="dd M yy"
            className={styles.primeCalendar}
            aria-label="Chọn ngày"
          />
        </div>

        <button type="button" className={styles.iconBtn} aria-label="Thông báo">
          <Bell size={19} strokeWidth={1.9} />
        </button>
      </div>
    </header>
  );
}
