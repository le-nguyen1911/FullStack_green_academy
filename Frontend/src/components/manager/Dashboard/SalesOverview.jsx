import React from "react";

const SalesOverview = ({ data }) => {
  if (!data) return null;

  const { yTicks, points } = data;
  const width = 440;
  const height = 210;
  const padLeft = 36;
  const padRight = 14;
  const padTop = 14;
  const padBottom = 18;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;
  const minVal = 20;
  const maxVal = 100;

  const pts = points.map((val, idx) => ({
    x: padLeft + (idx / (points.length - 1)) * chartW,
    y: padTop + chartH - ((val - minVal) / (maxVal - minVal)) * chartH,
  }));

  const smoothPath = pts.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
    const prev = arr[i - 1];
    const cx = ((prev.x + pt.x) / 2).toFixed(1);
    return `${acc} C ${cx} ${prev.y.toFixed(1)}, ${cx} ${pt.y.toFixed(1)}, ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }, "");

  return (
    <section
      aria-label="Tổng quan bán hàng"
      className="flex flex-col justify-between bg-[#FFF7F1] rounded-[18px] px-6 py-5"
    >
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="m-0 text-[15px] font-semibold tracking-tight text-[#39251B]">
          Sales Overview
        </h2>
      </div>

      <div className="flex items-center justify-center w-full h-[225px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height="100%"
          preserveAspectRatio="none"
        >
          {yTicks.map((tick) => {
            const y =
              padTop + chartH - ((tick - minVal) / (maxVal - minVal)) * chartH;
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

          <path
            d={smoothPath}
            fill="none"
            stroke="#783C20"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </section>
  );
};

export default SalesOverview;
