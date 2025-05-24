import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DashboardChartTable = ({ title, data }) => {
  // data es un array de objetos: [{ nombre, cantidad, descripcion }, ...]

  const chartData = {
    labels: data.map((item) => item.nombre),
    datasets: [
      {
        label: "Cantidad",
        data: data.map((item) => item.cantidad),
        backgroundColor: "rgba(33, 150, 243, 0.6)",
        borderColor: "rgba(33, 150, 243, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: title },
      tooltip: {
        callbacks: {
          label: (context) => `${context.raw} unidades`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <Bar data={chartData} options={options} />
      <table
        style={{
          width: "100%",
          marginTop: "20px",
          borderCollapse: "collapse",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#2196f3", color: "white" }}>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>Producto</th>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>Cantidad</th>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>
              Descripción
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr
              key={idx}
              style={{
                backgroundColor: idx % 2 === 0 ? "#f1f1f1" : "white",
              }}
            >
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                {item.nombre}
              </td>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                {item.cantidad}
              </td>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                {item.descripcion}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DashboardChartTable;
