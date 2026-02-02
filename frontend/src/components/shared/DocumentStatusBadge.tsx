import React from 'react';
import { Check, X, Clock, AlertCircle, FileX, FileEdit } from 'lucide-react';

type DocumentStatus = 'approved' | 'submitted' | 'rejected' | 'expired' | 'missing' | 'draft';

interface DocumentStatusBadgeProps {
  status: DocumentStatus;
  className?: string;
}

export function DocumentStatusBadge({ status, className = '' }: DocumentStatusBadgeProps) {
  const configs = {
    approved: {
      icon: Check,
      label: 'Validé',
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      iconColor: 'text-green-600',
    },
    submitted: {
      icon: Clock,
      label: 'En attente',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-700',
      iconColor: 'text-orange-600',
    },
    rejected: {
      icon: X,
      label: 'Refusé',
      bgColor: 'bg-red-100',
      textColor: 'text-red-700',
      iconColor: 'text-red-600',
    },
    expired: {
      icon: AlertCircle,
      label: 'Expiré',
      bgColor: 'bg-red-100',
      textColor: 'text-red-700',
      iconColor: 'text-red-600',
    },
    missing: {
      icon: FileX,
      label: 'Manquant',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-700',
      iconColor: 'text-gray-600',
    },
    draft: {
      icon: FileEdit,
      label: 'Brouillon',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-700',
      iconColor: 'text-gray-600',
    },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${config.bgColor} ${config.textColor} ${className}`}
    >
      <Icon className={`w-4 h-4 ${config.iconColor}`} />
      <span className="text-sm">{config.label}</span>
    </div>
  );
}
