import { useState } from "react";
import { formatCurrency } from "../utils/currency.js";

const colors = ["#6e7ef0", "#52b69a", "#f0a35e", "#d97686", "#8d72cf", "#4ca9cb", "#9aa7bb"];

function polarPoint(radius, angle) {
  const radians = (angle - 90) * (Math.PI / 180);
  return { x: 100 + radius * Math.cos(radians), y: 100 + radius * Math.sin(radians) };
}

function slicePath(startAngle, endAngle) {
  if (endAngle - startAngle >= 359.99) {
    return [
      "M 100 22",
      "A 78 78 0 1 1 100 178",
      "A 78 78 0 1 1 100 22",
      "M 100 47",
      "A 53 53 0 1 0 100 153",
      "A 53 53 0 1 0 100 47",
      "Z",
    ].join(" ");
  }
  const outerStart = polarPoint(78, startAngle);
  const outerEnd = polarPoint(78, endAngle);
  const innerEnd = polarPoint(53, endAngle);
  const innerStart = polarPoint(53, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A 78 78 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A 53 53 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

export default function CategoryDonut({ entries, onSelectCategory }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const total = entries.reduce((sum, entry) => sum + entry.amount, 0);
  let angle = 0;
  const slices = entries.map((entry, index) => {
    const startAngle = angle;
    const sweep = total > 0 ? (entry.amount / total) * 360 : 0;
    angle += sweep;
    return {
      ...entry,
      color: colors[index % colors.length],
      percentage: total > 0 ? (entry.amount / total) * 100 : 0,
      path: slicePath(startAngle, startAngle + sweep),
    };
  });
  const selected = slices.find((slice) => slice.category === selectedCategory);

  function chooseCategory(category) {
    const nextCategory = selectedCategory === category ? null : category;
    setSelectedCategory(nextCategory);
    onSelectCategory?.(nextCategory);
  }

  function activateSlice(category) {
    setSelectedCategory(category);
    onSelectCategory?.(category);
  }

  return (
    <section className="analytics-card card" aria-labelledby="category-chart-title">
      <div className="analytics-heading">
        <div>
          <span className="eyebrow">Αυτόν τον μήνα</span>
          <h2 id="category-chart-title">Κατανομή Εξόδων ανά Κατηγορία</h2>
        </div>
      </div>
      {total === 0 ? (
        <div className="chart-empty">
          <div className="donut-empty" aria-hidden="true"><span>€</span></div>
          <p>Οι κατηγορίες των εξόδων σου θα εμφανιστούν εδώ.</p>
        </div>
      ) : (
        <div className="chart-content">
          <div className="donut-wrap">
            <svg className="category-donut" viewBox="0 0 200 200" role="img" aria-label="Διαδραστικό γράφημα εξόδων ανά κατηγορία">
              <circle cx="100" cy="100" r="78" fill="none" stroke="var(--chart-track)" strokeWidth="25" />
              {slices.map((slice) => (
                <path
                  key={slice.category}
                  className={`donut-slice ${selectedCategory && selectedCategory !== slice.category ? "slice-muted" : ""}`}
                  d={slice.path}
                  fill={slice.color}
                  fillRule="evenodd"
                  role="button"
                  tabIndex={0}
                  aria-label={`${slice.category}: ${formatCurrency(slice.amount)}, ${Math.round(slice.percentage)}%`}
                  aria-pressed={selectedCategory === slice.category}
                  onMouseEnter={() => setSelectedCategory(slice.category)}
                  onMouseLeave={() => setSelectedCategory(null)}
                  onFocus={() => setSelectedCategory(slice.category)}
                  onBlur={() => setSelectedCategory(null)}
                  onClick={() => activateSlice(slice.category)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      activateSlice(slice.category);
                    }
                  }}
                />
              ))}
            </svg>
            <div className="donut-center" aria-live="polite">
              <span>{selected?.category ?? "Σύνολο"}</span>
              <strong>{formatCurrency(selected?.amount ?? total)}</strong>
            </div>
          </div>
          <div className="category-legend">
            {slices.map((slice) => (
              <button
                type="button"
                key={slice.category}
                className={`legend-row ${selectedCategory === slice.category ? "legend-active" : ""}`}
                onClick={() => chooseCategory(slice.category)}
                aria-pressed={selectedCategory === slice.category}
              >
                <span className="legend-name"><i style={{ backgroundColor: slice.color }} />{slice.category}</span>
                <span className="legend-value">{Math.round(slice.percentage)}% <small>{formatCurrency(slice.amount)}</small></span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
