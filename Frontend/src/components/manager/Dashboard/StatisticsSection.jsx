import React from "react";
import StatCard from "./StatCard";

const StatisticsSection = ({ kpis = [] }) => {
  return (
    <section
      aria-label="Thống kê tổng quan"
      className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-[22px]"
    >
      {kpis.map((kpi) => (
        <StatCard key={kpi.id} {...kpi} />
      ))}
    </section>
  );
};

export default StatisticsSection;
