// src/components/dashboard/StatCard.tsx
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'primary' | 'success' | 'info' | 'warning';
  trend?: {
    text: string;
    isPositive: boolean;
  };
  footer?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  color,
  trend,
  footer,
}: StatCardProps) {
  return (
    <div className="card card-stat border-0 shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h6 className="text-muted mb-1">{title}</h6>
            <h3 className="mb-0">{value}</h3>
          </div>
          <div className={`bg-${color} bg-opacity-10 p-3 rounded`}>
            <i className={`fas ${icon} fa-2x text-${color}`}></i>
          </div>
        </div>

        {trend && (
          <small className={`mt-3 d-block ${trend.isPositive ? 'text-success' : 'text-danger'}`}>
            <i className={`fas fa-arrow-${trend.isPositive ? 'up' : 'down'} me-1`}></i>
            {trend.text}
          </small>
        )}

        {footer && (
          <small className="text-muted mt-3 d-block">{footer}</small>
        )}
      </div>
    </div>
  );
}