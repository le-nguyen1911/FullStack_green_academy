import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardData } from "./dashboardService";
import RevenueChart from "@/components/manager/Dashboard/RevenueChart";
import TopSellingItems from "@/components/manager/Dashboard/TopSellingItems";
import StatisticsSection from "@/components/manager/Dashboard/StatisticsSection";
import TopSellingLocation from "@/components/manager/Dashboard/TopSellingLocation";
import SalesOverview from "@/components/manager/Dashboard/SalesOverview";


const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    getDashboardData().then((res) => {
      if (isMounted) setDashboardData(res);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col w-full gap-4 md:gap-[22px] text-[#39251B]">
      <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_1fr] gap-[22px] items-stretch">
        <RevenueChart data={dashboardData?.revenueSeries} />
        <TopSellingItems
          items={dashboardData?.topSellingItems}
          onViewAll={() => navigate("/manager/products")}
        />
      </div>

      <StatisticsSection kpis={dashboardData?.kpiCards} />

      <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_1fr] gap-[22px] items-stretch">
        <TopSellingLocation locations={dashboardData?.topLocations} />
        <SalesOverview data={dashboardData?.salesOverview} />
      </div>
    </div>
  );
};

export default Dashboard;
