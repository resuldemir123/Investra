
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ComparativeChartProps {
  scores: {
    market: number;
    team: number;
    product: number;
    finance: number;
  };
  industryAverage: {
    market: number;
    team: number;
    product: number;
    finance: number;
  };
}

const ComparativeChart: React.FC<ComparativeChartProps> = ({ scores, industryAverage }) => {
  const data = {
    labels: ['Pazar', 'Ekip', 'Ürün', 'Finans'],
    datasets: [
      {
        label: 'Girişim Skoru',
        data: [scores.market, scores.team, scores.product, scores.finance],
        backgroundColor: '#3b82f6',
        borderRadius: 8,
      },
      {
        label: 'Sektör Ortalaması',
        data: [industryAverage.market, industryAverage.team, industryAverage.product, industryAverage.finance],
        backgroundColor: 'rgba(148, 163, 184, 0.3)',
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: '#94a3b8',
          font: { size: 10, weight: 'bold' as const },
          usePointStyle: true,
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 12,
        titleFont: { size: 12, weight: 'bold' as const },
        bodyFont: { size: 12 },
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#64748b', font: { size: 10 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 11, weight: '600' as const } }
      }
    },
  };

  return <Bar data={data} options={options} />;
};

export default ComparativeChart;
