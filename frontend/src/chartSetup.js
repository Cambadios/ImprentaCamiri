import {
  Chart as ChartJS,
  CategoryScale, LinearScale, TimeScale,
  BarElement, LineElement, PointElement, ArcElement,
  Tooltip, Legend, Title
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, TimeScale,
  BarElement, LineElement, PointElement, ArcElement,
  Tooltip, Legend, Title
);

// Opciones base reutilizables
export const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' },
    tooltip: { mode: 'index', intersect: false }
  },
  scales: {
    y: { beginAtZero: true }
  }
};
