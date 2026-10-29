import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

export interface DropdownMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  align?: 'left' | 'right';
  className?: string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  items,
  align = 'right',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-2 w-56 rounded-xl bg-white p-1.5 shadow-lg border border-[#E2E8F0] focus:outline-none animate-in fade-in zoom-in-95 duration-100',
            align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left',
            className
          )}
        >
          <div className="space-y-0.5">
            {items.map((item, idx) => (
              <button
                key={idx}
                disabled={item.disabled}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left',
                  item.destructive
                    ? 'text-[#EF4444] hover:bg-[#FEF2F2]'
                    : 'text-[#1F2937] hover:bg-[#F8FAFC]',
                  item.disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {item.icon && <span className="shrink-0 w-4 h-4 text-[#64748B]">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
