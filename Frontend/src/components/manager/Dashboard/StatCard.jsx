import React from "react";
import {
  Wallet,
  Users,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const ICON_MAP = {
  wallet: Wallet,
  users: Users,
  bag: ShoppingBag,
  trendingUp: TrendingUp,
  trendingDown: TrendingDown,
};

const Sparkline = ({ type, data }) => {
  const w = 82;
  const h = 44;

  if (type === "bars") {
    const barW = 3.2;
    const gap = (w - data.length * barW) / (data.length - 1);
    return (
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%">
        {data.map((val, idx) => {
          const barH = (val / 100) * (h - 4);
          return (
            <rect
              key={idx}
              x={idx * (barW + gap)}
              y={h - barH}
              width={barW}
              height={barH}
              rx="1"
              fill="#783C20"
            />
          );
        })}
      </svg>
    );
  }

  if (type === "floatingBars") {
    const barW = 2.4;
    const gap = (w - data.length * barW) / (data.length - 1);
    return (
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%">
        {data.map(([low, high], idx) => {
          const yTop = h - (high / 100) * h;
          const barH = Math.max(6, ((high - low) / 100) * h);
          return (
            <rect
              key={idx}
              x={idx * (barW + gap)}
              y={yTop}
              width={barW}
              height={barH}
              rx="1.2"
              fill={idx % 2 === 0 ? "#A65F3D" : "#783C20"}
            />
          );
        })}
      </svg>
    );
  }

  const stepX = w / (data.length - 1);
  const pts = data.map((val, idx) => ({
    x: idx * stepX,
    y: h - 4 - (val / 100) * (h - 8),
  }));

  const pathD = pts.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
    const prev = arr[i - 1];
    const cx = ((prev.x + pt.x) / 2).toFixed(1);
    return `${acc} C ${cx} ${prev.y.toFixed(1)}, ${cx} ${pt.y.toFixed(1)}, ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }, "");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%">
      <path
        d={pathD}
        fill="none"
        stroke="#783C20"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
};

const StatCard = ({
  label,
  value,
  trend,
  isPositive,
  iconName,
  chartType,
  sparkData,
}) => {
  const IconComponent = ICON_MAP[iconName] || Wallet;

  return (
    <article className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-[#FFF7F1] rounded-2xl p-3.5 md:px-5 md:py-4 min-h-[100px]">
      <div className="flex flex-col justify-between gap-2 min-w-0">
        <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-[#8B7569]">
          <IconComponent
            size={14}
            strokeWidth={2}
            className="text-[#A65F3D] shrink-0"
          />
          <span className="truncate">{label}</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-[15.5px] md:text-[18px] font-bold leading-tight text-[#39251B] whitespace-nowrap">
            {value}
          </span>
          {trend && (
            <span
              className={`text-[11px] font-semibold ${
                isPositive ? "text-[#2E7D32]" : "text-[#C62828]"
              }`}
            >
              {trend} so với kỳ trước
            </span>
          )}
        </div>
      </div>

      <div className="w-full md:w-[82px] h-9 md:h-[46px] shrink-0 flex items-end justify-end">
        <Sparkline type={chartType} data={sparkData} />
      </div>
    </article>
  );
};

export default StatCard;
