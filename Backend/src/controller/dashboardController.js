const dashboardModel = require("../models/dashboardModel");

const calcGrowthPercent = (current, previous) => {
  const curr = Number(current) || 0;
  const prev = Number(previous) || 0;
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Number((((curr - prev) / prev) * 100).toFixed(1));
};

const getDashboard = async (req, res, next) => {
  try {
    const { date } = req.query; 
    const raw = await dashboardModel.getDashboardStats(date);

    const {
      orderStats,
      userStats,
      dailyRevenueRows,
      monthlyOverviewRows,
      topItems,
      locationRows,
    } = raw;

    const revenueGrowth = calcGrowthPercent(
      orderStats.current_month_revenue,
      orderStats.prev_month_revenue,
    );
    const orderGrowth = calcGrowthPercent(
      orderStats.current_month_orders,
      orderStats.prev_month_orders,
    );
    const userGrowth = calcGrowthPercent(
      userStats.current_month_users,
      userStats.prev_month_users,
    );

    const monthLabels = [
      ...new Set(dailyRevenueRows.map((r) => r.month_label)),
    ].slice(-4);

    const totalLocOrders = locationRows.reduce(
      (sum, r) => sum + Number(r.order_count),
      0,
    );
    const topLocations = locationRows.map((r, idx) => ({
      id: `loc-${idx + 1}`,
      name: r.location_name || "Khác",
      orderCount: Number(r.order_count),
      revenue: Number(r.revenue),
      percentage:
        totalLocOrders > 0
          ? Math.round((Number(r.order_count) / totalLocOrders) * 100)
          : 0,
    }));

    return res.status(200).json({
      success: true,
      data: {
        revenueChart: {
          labels: monthLabels.length
            ? monthLabels
            : ["Jun", "Jul", "Aug", "Sep"],
          values: dailyRevenueRows.map((r) => Number(r.daily_revenue)),
        },
        topSellingItems: topItems.map((item, idx) => ({
          id: `item-${idx + 1}`,
          name: item.name,
          soldCount: Number(item.sold_count),
          unit: "sản phẩm",
          revenue: Number(item.revenue),
        })),
        kpis: {
          totalRevenue: {
            value: Number(orderStats.total_revenue),
            growthPercent: revenueGrowth,
            sparkline: monthlyOverviewRows.map((r) => Number(r.revenue)),
          },
          totalUsers: {
            value: Number(userStats.total_users),
            growthPercent: userGrowth,
            sparkline: dailyRevenueRows
              .slice(-10)
              .map((r) => Number(r.daily_orders)),
          },
          totalOrders: {
            value: Number(orderStats.total_orders),
            growthPercent: orderGrowth,
            sparkline: dailyRevenueRows
              .slice(-10)
              .map((r) => Number(r.daily_orders)),
          },
          monthlyGrowth: {
            value: revenueGrowth,
            growthPercent: revenueGrowth,
            sparkline: monthlyOverviewRows.map((r) => Number(r.revenue)),
          },
        },
        topLocations,
        salesOverview: {
          labels: monthlyOverviewRows.map((r) => r.label),
          values: monthlyOverviewRows.map((r) => Number(r.revenue)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
};
