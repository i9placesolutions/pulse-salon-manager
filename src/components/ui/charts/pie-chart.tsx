"use client";

import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

// Registra todos os controladores, elementos, escalas e plugins do Chart.js
Chart.register(...registerables);

interface PieChartProps {
  data: {
    labels: string[];
    datasets: {
      data: number[];
      backgroundColor: string[];
      borderColor?: string[];
      borderWidth?: number;
    }[];
  };
}

export function PieChart({ data }: PieChartProps) {
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
      type: "pie",
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw;
                const total = context.chart.data.datasets[0].data.reduce((a, b) => a + (b as number), 0);
                const percentage = Math.round(value as number / total * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
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
