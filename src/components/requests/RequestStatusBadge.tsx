import React from 'react';
import type { ConnectionRequestStatus } from '../../types/database';

interface RequestStatusBadgeProps {
  status: ConnectionRequestStatus;
  className?: string;
}

export const RequestStatusBadge: React.FC<RequestStatusBadgeProps> = ({ status, className = '' }) => {
  const configs: Record<ConnectionRequestStatus, { label: string; styles: string }> = {
    pending: {
      label: 'Pending',
      styles: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    accepted: {
      label: 'Accepted',
      styles: 'bg-[#A7F3D0]/50 text-[#065F46] border-[#A7F3D0]',
    },
    rejected: {
      label: 'Declined',
      styles: 'bg-red-50 text-red-700 border-red-200',
    },
    cancelled: {
      label: 'Cancelled',
      styles: 'bg-slate-100 text-slate-600 border-slate-200',
    },
  };

  const config = configs[status] || configs.pending;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${config.styles} ${className}`}
    >
      {config.label}
    </span>
  );
};
