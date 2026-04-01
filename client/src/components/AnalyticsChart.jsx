import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
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
  Legend
);

const AnalyticsChart = ({ data }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#ffffff' }
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: { ticks: { color: '#888888' }, grid: { color: '#333333' } },
      y: { ticks: { color: '#888888' }, grid: { color: '#333333' } }
    }
  };

  const chartData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'Efficiency Score',
        data: data.map(d => d.score),
        borderColor: '#ffffff',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        tension: 0.4
      },
    ],
  };

  return <Line options={options} data={chartData} />;
};

export default AnalyticsChart;
