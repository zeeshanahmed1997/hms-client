// src/components/dashboard/RevenueChartPlaceholder.tsx
import React from 'react';

export default function RevenueChartPlaceholder() {
  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-info text-white">
        <h5 className="mb-0">Revenue Overview (Last 30 Days)</h5>
      </div>
      <div className="card-body">
        <div
          className="d-flex align-items-center justify-content-center bg-light rounded"
          style={{ height: '320px' }}
        >
          <div className="text-center text-muted">
            <i className="fas fa-chart-line fa-3x mb-3"></i>
            <p className="mb-0">Chart placeholder (Recharts / Chart.js can be added later)</p>
          </div>
        </div>
      </div>
    </div>
  );
}