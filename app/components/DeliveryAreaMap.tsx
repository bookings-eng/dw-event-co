const CITIES = [
  { name: "Southlake", x: 400, y: 145, labelX: 414, labelY: 149, anchor: "start" },
  { name: "Colleyville", x: 412, y: 258, labelX: 426, labelY: 262, anchor: "start" },
  { name: "Trophy Club", x: 205, y: 118, labelX: 191, labelY: 100, anchor: "end" },
  { name: "Fort Worth", x: 188, y: 352, labelX: 174, labelY: 372, anchor: "end" },
] as const;

export default function DeliveryAreaMap() {
  const cx = 300;
  const cy = 220;
  const r = 165;

  return (
    <section className="bg-background py-16">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          Delivery Area
        </h2>
        <p className="mt-2 text-3xl font-bold text-foreground">Where We Deliver</p>
      </div>

      <div className="mx-auto mt-8 max-w-xl rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <svg
          viewBox="0 0 600 440"
          className="mx-auto w-full max-w-lg"
          role="img"
          aria-label="Illustration of our roughly 15-mile delivery radius centered on Keller, Texas, covering Southlake, Colleyville, Trophy Club, and Fort Worth."
        >
          {/* soft fill for the delivery zone */}
          <circle cx={cx} cy={cy} r={r} fill="#209d50" fillOpacity={0.07} />
          {/* dashed boundary */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#209d50"
            strokeWidth={2}
            strokeDasharray="6 6"
          />

          {/* radius indicator */}
          <line
            x1={cx}
            y1={cy}
            x2={435}
            y2={126}
            stroke="#209d50"
            strokeWidth={1.5}
            strokeDasharray="3 4"
            strokeOpacity={0.6}
          />
          <text x={442} y={122} fontSize="13" fontWeight={600} fill="#209d50">
            ~15 mi
          </text>

          {/* city markers */}
          {CITIES.map((city) => (
            <g key={city.name}>
              <circle cx={city.x} cy={city.y} r={5} fill="#209d50" />
              <text
                x={city.labelX}
                y={city.labelY}
                fontSize="15"
                fontWeight={600}
                fill="#1a1a1a"
                textAnchor={city.anchor}
              >
                {city.name}
              </text>
            </g>
          ))}

          {/* center marker: Keller */}
          <circle cx={cx} cy={cy} r={12} fill="none" stroke="#14171a" strokeOpacity={0.25} strokeWidth={1.5} />
          <circle cx={cx} cy={cy} r={7} fill="#14171a" />
          <text
            x={cx}
            y={cy - 24}
            textAnchor="middle"
            fontSize="18"
            fontWeight={800}
            fill="#14171a"
          >
            Keller, TX
          </text>
          <text
            x={cx}
            y={cy + 30}
            textAnchor="middle"
            fontSize="11"
            fill="#14171a"
            fillOpacity={0.5}
          >
            Our home base
          </text>
        </svg>

        <p className="mt-6 text-center text-sm text-foreground/60">
          We deliver within 15 miles — serving Keller, Southlake, Colleyville, Trophy
          Club, Fort Worth, and surrounding areas. $25 flat delivery.
        </p>
      </div>
    </section>
  );
}
