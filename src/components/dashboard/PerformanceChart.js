import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import styles from "./PerformanceChart.module.css";

const PerformanceChart = ({ isBrand = false }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext("2d");

      // Gradient setup
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(
        0,
        isBrand ? "rgba(59, 130, 246, 0.6)" : "rgba(139, 92, 246, 0.6)"
      );
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      const gradient2 = ctx.createLinearGradient(0, 0, 0, 300);
      gradient2.addColorStop(
        0,
        isBrand ? "rgba(6, 182, 212, 0.6)" : "rgba(236, 72, 153, 0.6)"
      );
      gradient2.addColorStop(1, "rgba(0, 0, 0, 0)");

      chartInstance.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [
            {
              label: "Engagement Rate",
              data: [4.2, 5.1, 6.7, 5.8, 7.2, 8.1],
              borderColor: isBrand ? "#3b82f6" : "#8b5cf6",
              backgroundColor: gradient,
              borderWidth: 3,
              pointBackgroundColor: isBrand ? "#3b82f6" : "#8b5cf6",
              pointBorderColor: "#fff",
              pointBorderWidth: 2,
              pointRadius: 6,
              pointHoverRadius: 8,
              fill: true,
              tension: 0.4,
            },
            {
              label: "Impressions (K)",
              data: [12, 19, 15, 24, 32, 41],
              borderColor: isBrand ? "#06b6d4" : "#ec4899",
              backgroundColor: gradient2,
              borderWidth: 3,
              pointBackgroundColor: isBrand ? "#06b6d4" : "#ec4899",
              pointBorderColor: "#fff",
              pointBorderWidth: 2,
              pointRadius: 6,
              pointHoverRadius: 8,
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
              labels: {
                color: "#e9d5ff",
                font: {
                  size: 13,
                  family: "'Inter', sans-serif",
                },
                usePointStyle: true,
                padding: 20,
              },
            },
            tooltip: {
              backgroundColor: "#1e293b",
              titleColor: "#e9d5ff",
              bodyColor: "#c7d2fe",
              borderColor: "#4c1d95",
              borderWidth: 1,
              padding: 12,
              usePointStyle: true,
              cornerRadius: 8,
              callbacks: {
                label: function (context) {
                  return `${context.dataset.label}: ${context.parsed.y}`;
                },
              },
            },
          },
          scales: {
            x: {
              grid: {
                color: "rgba(124, 58, 237, 0.1)",
              },
              ticks: {
                color: "#a78bfa",
                font: {
                  size: 12,
                },
              },
            },
            y: {
              grid: {
                color: "rgba(124, 58, 237, 0.1)",
              },
              ticks: {
                color: "#a78bfa",
                font: {
                  size: 12,
                },
              },
              beginAtZero: true,
            },
          },
          animation: {
            duration: 2000,
            easing: "easeOutQuart",
          },
        },
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [isBrand]);

  return (
    <div className={styles.chartContainer}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default PerformanceChart;
