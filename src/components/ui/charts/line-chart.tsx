"use client";

import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

// Registra todos os controladores, elementos, escalas e plugins do Chart.js
Chart.register(...registerables);

interface LineChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor?: string;
      tension?: number;
      fill?: boolean;
    }[];
  };
}

export function LineChart({ data }: LineChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    // Limpa o gráfico anterior se existir
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Verifica se o canvas foi renderizado
    const canvas = chartRef.current;
    if (!canvas) return;

    // Cria um novo gráfico
    chartInstance.current = new Chart(canvas, {
      type: "line",
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
        scales: {
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45,
            },
          },
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    // Limpa o gráfico quando o componente for desmontado
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [data]);

  return <canvas ref={chartRef} />;
}
