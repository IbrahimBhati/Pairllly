import React from 'react';
import { cn } from '../../lib/utils';

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string; onClick?: () => void }[];
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
  actions,
  breadcrumbs,
  className,
}) => {
  const actionContent = actions || action;

  return (
    <div className={cn('mb-8 border-b border-[#E2E8F0] pb-6', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumbs" className="mb-2">
          <ol className="flex items-center gap-1.5 text-xs text-[#64748B]">
            {breadcrumbs.map((crumb, idx) => (
              <li key={idx} className="flex items-center gap-1.5">
                {idx > 0 && <span className="text-[#CBD5E1]">/</span>}
                {crumb.onClick ? (
                  <button
                    onClick={crumb.onClick}
                    className="hover:text-[#4B3F72] transition-colors font-medium"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className={idx === breadcrumbs.length - 1 ? 'font-semibold text-[#1F2937]' : ''}>
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 text-sm text-[#64748B] leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {actionContent && <div className="shrink-0">{actionContent}</div>}
      </div>
    </div>
  );
};
