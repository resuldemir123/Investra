
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

interface TrendChartProps {
  projections: {
    year: string;
    marketSize: string;
  }[];
}

const TrendChart: React.FC<TrendChartProps> = ({ projections }) => {
  // Helper to extract numeric values for chart
  const extractValue = (str: string) => {
    const match = str.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  };

  const data = {
    labels: projections.map(p => p.year),
    datasets: [
      {
        fill: true,
        label: 'Pazar Hacmi Projeksiyonu',
        data: projections.map(p => extractValue(p.marketSize)),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        pointBackgroundColor: '#6366f1',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 12,
        callbacks: {
          label: (context: any) => `Tahmin: ${projections[context.dataIndex].marketSize}`
        }
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.05)' },
        ticks: { display: false }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 10, weight: 'bold' as const } }
      }
    },
  };

  return <Line data={data} options={options} />;
};

export default TrendChart;
