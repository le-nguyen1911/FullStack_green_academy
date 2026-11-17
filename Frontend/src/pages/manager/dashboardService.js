import axiosClient from "../../util/axios"; 

const ITEM_COLORS = ["#D99A78", "#A65F3D", "#783C20"];
const LOCATION_STYLES = [
  {
    color: "#783C20",
    outerRadius: 96,
    labelPos: { x: 250, y: 42, lineMidX: 210, anchorX: 162, anchorY: 42 },
  },
  {
    color: "#D99A78",
    outerRadius: 84,
    labelPos: { x: 14, y: 186, lineMidX: 82, anchorX: 120, anchorY: 186 },
  },
  {
    color: "#A65F3D",
    outerRadius: 72,
    labelPos: { x: 18, y: 98, lineMidX: 78, anchorX: 108, anchorY: 98 },
  },
];

export const formatVND = (amount = 0) => {
  return `${new Intl.NumberFormat("vi-VN").format(amount)} đ`;
};

const normalizeSeries = (values = [], fallback = [35, 50, 45, 65, 60, 75]) => {
  const arr = values.length >= 2 ? values : fallback;
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  if (min === max) return arr.map(() => 60);
  return arr.map((v) => Math.round(25 + ((v - min) / (max - min)) * 67));
};

const normalizeFloatingBars = (values = []) => {
  const norm = normalizeSeries(values, [30, 55, 45, 75, 60, 85, 70, 90]);
  return norm.map((high) => [Math.max(15, high - 32), high]);
};

const mapLocationsToDonut = (locations = []) => {
  if (!locations.length) return [];
  let currentAngle = -80;
  return locations.slice(0, 3).map((loc, idx) => {
    const pct =
      loc.percentage > 0 ? loc.percentage : Math.round(100 / locations.length);
    const sweepAngle = (pct / 100) * 360;
    const style = LOCATION_STYLES[idx] || LOCATION_STYLES[0];

    const slice = {
      id: loc.id || `loc-${idx}`,
      name: loc.name,
      percentage: loc.percentage,
      color: style.color,
      outerRadius: style.outerRadius,
      startAngle: currentAngle,
      endAngle: currentAngle + sweepAngle,
      labelPos: style.labelPos,
    };
    currentAngle += sweepAngle;
    return slice;
  });
};

export const getDashboardData = async (dateStr) => {
  const res = await axiosClient.get("/manager/dashboard", {
    params: dateStr ? { date: dateStr } : {},
  });

  const raw = res.data?.data || res.data;
  const formatTrend = (val) => `${val >= 0 ? "+" : ""}${val}%`;

  const revGrowth = raw.kpis?.totalRevenue?.growthPercent ?? 0;
  const userGrowth = raw.kpis?.totalUsers?.growthPercent ?? 0;
  const orderGrowth = raw.kpis?.totalOrders?.growthPercent ?? 0;
  const monthGrowth = raw.kpis?.monthlyGrowth?.value ?? 0;

  return {
    revenueSeries: {
      labels: raw.revenueChart?.labels || ["Jun", "Jul", "Aug", "Sep"],
      yTicks: [20, 40, 60, 80, 100],
      points: normalizeSeries(raw.revenueChart?.values),
    },

    topSellingItems: (raw.topSellingItems || []).map((item, idx) => ({
      id: item.id,
      name: item.name,
      soldCount: item.soldCount,
      unit: item.unit || "sản phẩm",
      revenue: item.revenue,
      badgeColor: ITEM_COLORS[idx % ITEM_COLORS.length],
    })),

    kpiCards: [
      {
        id: "revenue",
        label: "Doanh thu",
        value: formatVND(raw.kpis?.totalRevenue?.value || 0),
        trend: formatTrend(revGrowth),
        isPositive: revGrowth >= 0,
        iconName: "wallet",
        chartType: "bars",
        sparkData: normalizeSeries(raw.kpis?.totalRevenue?.sparkline),
      },
      {
        id: "users",
        label: "Người dùng",
        value: new Intl.NumberFormat("vi-VN").format(
          raw.kpis?.totalUsers?.value || 0,
        ),
        trend: formatTrend(userGrowth),
        isPositive: userGrowth >= 0,
        iconName: "users",
        chartType: "line",
        sparkData: normalizeSeries(raw.kpis?.totalUsers?.sparkline),
      },
      {
        id: "orders",
        label: "Đơn hàng",
        value: new Intl.NumberFormat("vi-VN").format(
          raw.kpis?.totalOrders?.value || 0,
        ),
        trend: formatTrend(orderGrowth),
        isPositive: orderGrowth >= 0,
        iconName: "bag",
        chartType: "floatingBars",
        sparkData: normalizeFloatingBars(raw.kpis?.totalOrders?.sparkline),
      },
      {
        id: "monthly-growth",
        label: "Tăng trưởng doanh thu tháng",
        value: `${monthGrowth >= 0 ? "+" : ""}${monthGrowth}%`,
        trend: formatTrend(monthGrowth),
        isPositive: monthGrowth >= 0,
        iconName: "trendingUp",
        chartType: "line",
        sparkData: normalizeSeries(raw.kpis?.monthlyGrowth?.sparkline),
      },
    ],

    topLocations: mapLocationsToDonut(raw.topLocations || []),

    salesOverview: {
      yTicks: [20, 40, 60, 80, 100],
      points: normalizeSeries(raw.salesOverview?.values),
    },
  };
};
