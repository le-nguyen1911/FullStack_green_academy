const db = require("../config/database");

const getDashboardStats = async (targetDate) => {
  const refDate = targetDate || new Date().toISOString().split("T")[0];

  const [[orderStats]] = await db.query(
    `SELECT
       COALESCE(SUM(CASE WHEN status <> 'CANCELLED' THEN total_amount ELSE 0 END), 0) AS total_revenue,
       COUNT(CASE WHEN status <> 'CANCELLED' THEN 1 END) AS total_orders,
       COALESCE(SUM(CASE WHEN status <> 'CANCELLED'
                          AND YEAR(order_date) = YEAR(?)
                          AND MONTH(order_date) = MONTH(?)
                         THEN total_amount ELSE 0 END), 0) AS current_month_revenue,
       COALESCE(SUM(CASE WHEN status <> 'CANCELLED'
                          AND YEAR(order_date) = YEAR(DATE_SUB(?, INTERVAL 1 MONTH))
                          AND MONTH(order_date) = MONTH(DATE_SUB(?, INTERVAL 1 MONTH))
                         THEN total_amount ELSE 0 END), 0) AS prev_month_revenue,
       COUNT(CASE WHEN status <> 'CANCELLED'
                   AND YEAR(order_date) = YEAR(?)
                   AND MONTH(order_date) = MONTH(?)
                  THEN 1 END) AS current_month_orders,
       COUNT(CASE WHEN status <> 'CANCELLED'
                   AND YEAR(order_date) = YEAR(DATE_SUB(?, INTERVAL 1 MONTH))
                   AND MONTH(order_date) = MONTH(DATE_SUB(?, INTERVAL 1 MONTH))
                  THEN 1 END) AS prev_month_orders
     FROM orders`,
    [refDate, refDate, refDate, refDate, refDate, refDate, refDate, refDate],
  );

  const [[userStats]] = await db.query(
    `SELECT
       COUNT(*) AS total_users,
       COUNT(CASE WHEN YEAR(created_at) = YEAR(?) AND MONTH(created_at) = MONTH(?) THEN 1 END) AS current_month_users,
       COUNT(CASE WHEN YEAR(created_at) = YEAR(DATE_SUB(?, INTERVAL 1 MONTH))
                   AND MONTH(created_at) = MONTH(DATE_SUB(?, INTERVAL 1 MONTH)) THEN 1 END) AS prev_month_users
     FROM users
     WHERE status = 'ACTIVE'`,
    [refDate, refDate, refDate, refDate],
  );

  const [dailyRevenueRows] = await db.query(
    `SELECT
       DATE_FORMAT(order_date, '%b') AS month_label,
       DATE(order_date) AS day_date,
       COALESCE(SUM(total_amount), 0) AS daily_revenue,
       COUNT(*) AS daily_orders
     FROM orders
     WHERE status <> 'CANCELLED'
       AND order_date >= DATE_SUB(?, INTERVAL 120 DAY)
       AND order_date <= DATE_ADD(?, INTERVAL 1 DAY)
     GROUP BY DATE(order_date), DATE_FORMAT(order_date, '%b')
     ORDER BY day_date ASC`,
    [refDate, refDate],
  );

  const [monthlyOverviewRows] = await db.query(
    `SELECT
       DATE_FORMAT(order_date, '%Y-%m') AS ym,
       DATE_FORMAT(order_date, '%b') AS label,
       COALESCE(SUM(total_amount), 0) AS revenue
     FROM orders
     WHERE status <> 'CANCELLED'
       AND order_date >= DATE_SUB(?, INTERVAL 11 MONTH)
     GROUP BY ym, label
     ORDER BY ym ASC`,
    [refDate],
  );

  const [topItems] = await db.query(
    `SELECT
       oi.product_name AS name,
       COALESCE(SUM(oi.quantity), 0) AS sold_count,
       COALESCE(SUM(oi.subtotal), 0) AS revenue
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     WHERE o.status <> 'CANCELLED'
     GROUP BY oi.product_name
     ORDER BY sold_count DESC, revenue DESC
     LIMIT 3`,
  );

  const [locationRows] = await db.query(
    `SELECT
       TRIM(SUBSTRING_INDEX(shipping_address, ',', -1)) AS location_name,
       COUNT(*) AS order_count,
       COALESCE(SUM(total_amount), 0) AS revenue
     FROM orders
     WHERE status <> 'CANCELLED'
       AND shipping_address IS NOT NULL
       AND TRIM(shipping_address) <> ''
     GROUP BY location_name
     ORDER BY order_count DESC
     LIMIT 3`,
  );

  return {
    orderStats,
    userStats,
    dailyRevenueRows,
    monthlyOverviewRows,
    topItems,
    locationRows,
  };
};

module.exports = {
  getDashboardStats,
};
