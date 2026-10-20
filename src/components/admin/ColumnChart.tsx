"use client";

import { useState } from "react";

export interface ColumnDatum {
  label: string;
  value: number;
}

interface ColumnChartProps {
  title: string;
  subtitle: string;
  unit: string;
  data: ColumnDatum[];
}

// Validated against the white card surface (dataviz palette check: lightness, chroma, contrast all pass).
const BAR_COLOR = "#0f8f7c";
const HEIGHT = 160;
const AXIS_WIDTH = 28;
const MAX_BAR = 24;

function niceMax(value: number): number {
  if (value <= 4) return 4;
  const step = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / step) * step;
}

// Single-series column chart (one value per day): no legend, title names the series, hover tooltip per column.
export function ColumnChart({ title, subtitle, unit, data }: ColumnChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = niceMax(Math.max(0, ...data.map((d) => d.value)));
  const width = 600;
  const plotWidth = width - AXIS_WIDTH;
  const slot = plotWidth / Math.max(data.length, 1);
  const barWidth = Math.min(MAX_BAR, slot - 2);
  const ticks = [0, max / 2, max];
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const active = hovered === null ? null : data[hovered];

  return (
    <figure className="rounded-3xl border border-line bg-surface p-5">
      <figcaption>
        <p className="font-bold text-ink">{title}</p>
        <p className="text-sm text-muted">
          {subtitle} · {total.toLocaleString("en-US")} total
        </p>
      </figcaption>

      <div className="relative mt-4">
        <svg viewBox={`0 0 ${width} ${HEIGHT + 20}`} className="w-full" role="img" aria-label={`${title}: ${subtitle}`}>
          {ticks.map((t) => {
            const y = HEIGHT - (t / max) * HEIGHT;
            return (
              <g key={t}>
                <line x1={AXIS_WIDTH} x2={width} y1={y} y2={y} stroke="var(--color-line)" strokeWidth={1} />
                <text x={AXIS_WIDTH - 6} y={y + 4} textAnchor="end" fontSize={11} fill="var(--color-muted)">
                  {t}
                </text>
              </g>
            );
          })}
          {data.map((d, i) => {
            const h = (d.value / max) * HEIGHT;
            const x = AXIS_WIDTH + i * slot + (slot - barWidth) / 2;
            const r = Math.min(4, h / 2);
            return (
              <g key={d.label} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
                {/* Hit target: the whole column slot, larger than the bar. */}
                <rect x={AXIS_WIDTH + i * slot} y={0} width={slot} height={HEIGHT} fill="transparent" />
                {h > 0 && (
                  <path
                    d={`M${x},${HEIGHT} V${HEIGHT - h + r} Q${x},${HEIGHT - h} ${x + r},${HEIGHT - h} H${x + barWidth - r} Q${x + barWidth},${HEIGHT - h} ${x + barWidth},${HEIGHT - h + r} V${HEIGHT} Z`}
                    fill={BAR_COLOR}
                    opacity={hovered === null || hovered === i ? 1 : 0.45}
                  />
                )}
              </g>
            );
          })}
          {[0, Math.floor((data.length - 1) / 2), data.length - 1].map((i) =>
            data[i] ? (
              <text
                key={i}
                x={AXIS_WIDTH + i * slot + slot / 2}
                y={HEIGHT + 15}
                textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"}
                fontSize={11}
                fill="var(--color-muted)"
              >
                {data[i].label}
              </text>
            ) : null,
          )}
        </svg>

        {active && hovered !== null && (
          <div
            className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg bg-ink px-2.5 py-1.5 text-xs text-cream shadow-lg"
            style={{ left: `${((AXIS_WIDTH + hovered * slot + slot / 2) / width) * 100}%` }}
          >
            <p className="font-semibold">{active.label}</p>
            <p>
              {active.value} {unit}
            </p>
          </div>
        )}
      </div>

      <details className="mt-3 text-sm">
        <summary className="text-muted">Show table</summary>
        <table className="mt-2 w-full text-left">
          <tbody>
            {data.map((d) => (
              <tr key={d.label} className="border-t border-line">
                <td className="py-1 text-muted">{d.label}</td>
                <td className="py-1 text-right text-ink">{d.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
