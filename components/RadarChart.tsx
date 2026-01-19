
import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface RadarChartProps {
  scores: {
    market: number;
    team: number;
    product: number;
    finance: number;
  };
}

const RadarChart: React.FC<RadarChartProps> = ({ scores }) => {
  const wrapLabel = (label: string) => {
    if (label.length <= 16) return label;
    return label.match(/.{1,16}(\s|$)/g) || [label];
  };

  const data = {
    labels: [
      wrapLabel('PAZAR POTANSİYELİ'),
      wrapLabel('EKİP YETKİNLİĞİ'),
      wrapLabel('FİNANSAL GÜÇ'),
      wrapLabel('ÜRÜN OLGUNLUĞU')
    ],
    datasets: [{
      label: 'Skor',
      data: [scores.market, scores.team, scores.finance, scores.product],
      backgroundColor: 'rgba(59, 130, 246, 0.15)',
      borderColor: '#3b82f6',
      borderWidth: 3,
      pointBackgroundColor: '#3b82f6',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#3b82f6',
      pointRadius: 4,
      pointHoverRadius: 6,
    }]
  };

  const options = {
    scales: {
      r: {
        angleLines: { color: 'rgba(148, 163, 184, 0.15)' },
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        pointLabels: {
          color: '#94a3b8',
          font: { 
            size: 11, 
            weight: '700',
            family: "'Plus Jakarta Sans', sans-serif"
          },
          padding: 15
        },
        ticks: { display: false, stepSize: 20 },
        min: 0,
        max: 100,
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 8,
        displayColors: false
      }
    },
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: 'easeOutQuart'
    }
  };

  return (
    <div className="relative h-72 w-full flex items-center justify-center">
      <Radar data={data} options={options as any} />
    </div>
  );
};

export default RadarChart;
