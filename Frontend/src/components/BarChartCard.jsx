import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

/**
 * Tarjeta con gráfica de barras reutilizable.
 * @param {string} title - Título de la gráfica
 * @param {Array} data - Array de objetos para la gráfica
 * @param {Array} dataKeys - Claves de datos a mostrar (ej: [{key:'count', name:'Total', color:'#0d6efd'}])
 * @param {string} xAxisKey - Clave para el eje X (default: 'date')
 */
export default function BarChartCard({ title, data = [], dataKeys = [], xAxisKey = "date" }) {
  if (!data.length) {
    return (
      <div className="card mb-4">
        <div className="card-body">
          <h6 className="card-title">{title}</h6>
          <p className="text-muted text-center py-4">Sin datos para mostrar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h6 className="card-title">{title}</h6>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {dataKeys.map((dk) => (
              <Bar key={dk.key} dataKey={dk.key} name={dk.name} fill={dk.color} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
