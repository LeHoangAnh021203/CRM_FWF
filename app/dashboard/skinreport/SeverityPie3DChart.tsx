"use client";

import React, { useEffect, useMemo, useRef } from "react";
import Chart from "chart.js/auto";

type Segment = {
  label: string;
  value: number;
  color: string;
};

interface SeverityPie3DChartProps {
  segments: Segment[];
}

const toDarkerShade = (hex: string, factor = 0.75) => {
  const sanitized = hex.replace("#", "");
  const full = sanitized.length === 3
    ? sanitized
        .split("")
        .map((c) => c + c)
        .join("")
    : sanitized;
  const num = parseInt(full, 16);
  const r = Math.max(0, Math.floor(((num >> 16) & 0xff) * factor));
  const g = Math.max(0, Math.floor(((num >> 8) & 0xff) * factor));
  const b = Math.max(0, Math.floor((num & 0xff) * factor));
  return `rgb(${r}, ${g}, ${b})`;
};

export function SeverityPie3DChart({ segments }: SeverityPie3DChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  const data = useMemo(() => {
    const filtered = segments.filter((segment) => segment.value > 0);
    return {
      labels: filtered.map((segment) => segment.label),
      values: filtered.map((segment) => segment.value),
      colors: filtered.map((segment) => segment.color),
    };
  }, [segments]);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    if (data.values.length === 0) return;

    const depth = 12;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    chartRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: data.labels,
        datasets: [
          {
            data: data.values,
            backgroundColor: data.colors,
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "0%",
        rotation: 0,
        layout: {
          padding: { top: 2, bottom: depth, left: 2, right: 2 },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) =>
                `${context.label}: ${context.parsed.toFixed(1)}%`,
            },
          },
        },
      },
      plugins: [
        {
          id: "pie3d",
          beforeDatasetsDraw: (chart) => {
            const meta = chart.getDatasetMeta(0);
            const dataset = chart.data.datasets[0];
            if (!meta || !dataset) return;
            const arcElements = meta.data;
            ctx.save();
            arcElements.forEach((arc, index) => {
              const props = arc.getProps(
                ["startAngle", "endAngle", "innerRadius", "outerRadius", "x", "y"],
                true
              );
              const startAngle = props.startAngle;
              const endAngle = props.endAngle;
              const outerRadius = props.outerRadius;
              const innerRadius = props.innerRadius;
              const centerX = props.x;
              const centerY = props.y + depth * 0.6;
              const baseColor = Array.isArray(dataset.backgroundColor)
                ? dataset.backgroundColor[index] as string
                : "#cbd5f5";

              ctx.fillStyle = toDarkerShade(baseColor);
              ctx.beginPath();
              ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
              ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
              ctx.closePath();
              ctx.fill();
            });
            ctx.restore();
          },
        },
      ],
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [data]);

  if (data.values.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-xs text-gray-400">
        Chưa có dữ liệu.
      </div>
    );
  }

  return (
    <div className="h-40 w-40">
      <canvas ref={canvasRef} />
    </div>
  );
}
