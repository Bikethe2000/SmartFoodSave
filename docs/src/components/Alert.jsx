import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';

export default function Alert({ type = 'info', title, children }) {
  const styles = {
    info: {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-900',
      icon: 'text-blue-600',
      Icon: Info,
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-200',
      text: 'text-yellow-900',
      icon: 'text-yellow-600',
      Icon: AlertTriangle,
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-900',
      icon: 'text-red-600',
      Icon: AlertCircle,
    },
    success: {
      bg: 'bg-green-50 border-green-200',
      text: 'text-green-900',
      icon: 'text-green-600',
      Icon: CheckCircle,
    },
  };

  const style = styles[type] || styles.info;
  const { Icon, bg, text, icon } = style;

  return (
    <div className={`${bg} border border-l-4 px-4 py-3 rounded my-4`}>
      <div className="flex gap-3">
        <Icon size={20} className={`${icon} flex-shrink-0 mt-0.5`} />
        <div>
          {title && <h4 className={`font-semibold ${text} mb-1`}>{title}</h4>}
          <div className={`text-sm ${text} opacity-90`}>{children}</div>
        </div>
      </div>
    </div>
  );
}
