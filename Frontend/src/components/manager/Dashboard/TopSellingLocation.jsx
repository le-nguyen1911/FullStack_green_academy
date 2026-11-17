import React from "react";

const polarToCartesian = (cx, cy, r, angleDeg) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
};

const createDonutSlicePath = (cx, cy, innerR, outerR, startAngle, endAngle) => {
  const startOuter = polarToCartesian(cx, cy, outerR, endAngle);
  const endOuter = polarToCartesian(cx, cy, outerR, startAngle);
  const startInner = polarToCartesian(cx, cy, innerR, endAngle);
  const endInner = polarToCartesian(cx, cy, innerR, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M",
    startOuter.x,
    startOuter.y,
    "A",
    outerR,
    outerR,
    0,
    largeArc,
    0,
    endOuter.x,
    endOuter.y,
    "L",
    endInner.x,
    endInner.y,
    "A",
    innerR,
    innerR,
    0,
    largeArc,
    1,
    startInner.x,
    startInner.y,
    "Z",
  ].join(" ");
};

const TopSellingLocation = ({ locations = [] }) => {
  const cx = 175;
  const cy = 115;
  const innerR = 26;

  return (
    <section
      aria-label="Khu vực bán chạy"
      className="flex flex-col justify-between bg-[#FFF7F1] rounded-[18px] px-6 py-5"
    >
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="m-0 text-[15px] font-semibold tracking-tight text-[#39251B]">
          Top-Selling Location
        </h2>
      </div>

      <div className="flex items-center justify-center w-full h-[225px]">
        <svg viewBox="0 0 350 225" width="100%" height="100%">
          {locations.map((loc) => (
            <path
              key={loc.id}
              d={createDonutSlicePath(
                cx,
                cy,
                innerR,
                loc.outerRadius,
                loc.startAngle,
                loc.endAngle,
              )}
              fill={loc.color}
            />
          ))}

          <circle cx={cx} cy={cy} r={innerR} fill="#FFF7F1" />

          {locations.map((loc) => (
            <g key={`${loc.id}-label`}>
              <polyline
                points={`${loc.labelPos.anchorX},${loc.labelPos.anchorY} ${loc.labelPos.lineMidX},${loc.labelPos.anchorY}`}
                fill="none"
                stroke="#8B7569"
                strokeWidth="1"
              />
              <text
                x={loc.labelPos.x}
                y={loc.labelPos.y + 4}
                fill="#39251B"
                fontSize="12"
                fontWeight="600"
              >
                {loc.name} ({loc.percentage}%)
              </text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
};

export default TopSellingLocation;
