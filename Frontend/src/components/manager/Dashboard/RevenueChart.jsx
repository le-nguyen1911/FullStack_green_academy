import React from "react";

const RevenueChart = ({ data }) => {
  if (!data) return null;

  const { labels, yTicks, points } = data;
  const width = 460;
  const height = 195;
  const padLeft = 36;
  const padRight = 14;
  const padTop = 14;
  const padBottom = 26;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;
  const minVal = 20;
  const maxVal = 100;

  const getX = (idx) => padLeft + (idx / (points.length - 1)) * chartW;
  const getY = (val) =>
    padTop + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;

  const linePath = points
    .map(
      (val, idx) =>
        `${idx === 0 ? "M" : "L"} ${getX(idx).toFixed(1)} ${getY(val).toFixed(1)}`,
    )
    .join(" ");

  const areaPath = `${linePath} L ${getX(points.length - 1).toFixed(1)} ${(padTop + chartH).toFixed(1)} L ${padLeft} ${(padTop + chartH).toFixed(1)} Z`;

  return (
    <section
      aria-label="Biểu đồ doanh thu"
      className="flex flex-col justify-between bg-[#FFF7F1] rounded-[18px] px-6 py-5"
    >
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="m-0 text-[15px] font-semibold tracking-tight text-[#39251B]">
          Revenue
        </h2>
      </div>

      <div className="relative w-full h-[195px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height="100%"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="revenueAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A65F3D" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#FFF7F1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {yTicks.map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#EAE0D8"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="#B5A69B"
                  fontSize="11"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          <path d={areaPath} fill="url(#revenueAreaGrad)" />
          <path
            d={linePath}
            fill="none"
            stroke="#783C20"
            strokeWidth="1.75"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {labels.map((label, idx) => {
            const x = padLeft + ((idx + 0.35) / labels.length) * chartW;
            return (
              <text
                key={label}
                x={x}
                y={height - 4}
                textAnchor="middle"
                fill="#B5A69B"
                fontSize="11"
              >
                {label}
              </text>
            );
          })}
        </svg>
      </div>
    </section>
  );
};

export default RevenueChart;
