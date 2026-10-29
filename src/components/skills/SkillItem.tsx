import React from 'react';
import { ListingTypeBadge } from '../listings/ListingTypeBadge';
import { Button } from '../ui/Button';
import { Edit2, Trash2, Star, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { UserSkill } from '../../types/database';

export interface SkillItemProps {
  userSkill: UserSkill;
  onEditProficiency?: (userSkill: UserSkill) => void;
  onRemove: (userSkill: UserSkill) => void;
  className?: string;
}

export const SkillItem: React.FC<SkillItemProps> = ({
  userSkill,
  onEditProficiency,
  onRemove,
  className,
}) => {
  const isOffer = userSkill.direction === 'offer';

  return (
    <div
      className={cn(
        'rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs hover:border-[#CBD5E1] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4',
        className
      )}
    >
      <div className="space-y-1.5 flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-sm font-bold text-[#1F2937] truncate">
            {userSkill.skill?.name || 'Skill'}
          </h4>
          <ListingTypeBadge direction={userSkill.direction} size="sm" />
          <span className="text-[10px] text-[#64748B] font-mono">
            · {userSkill.skill?.category}
          </span>
        </div>

        {isOffer && userSkill.proficiency && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[10px] uppercase font-bold text-[#4B3F72] bg-[#E0E7FF] px-2 py-0.5 rounded">
              Proficiency: {userSkill.proficiency}
            </span>
            {onEditProficiency && (
              <button
                type="button"
                onClick={() => onEditProficiency(userSkill)}
                className="text-xs text-[#4B3F72] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3 h-3" /> Change
              </button>
            )}
          </div>
        )}

        {userSkill.notes && (
          <p className="text-xs text-[#64748B] flex items-center gap-1.5 line-clamp-1 italic">
            <FileText className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
            <span>&ldquo;{userSkill.notes}&rdquo;</span>
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(userSkill)}
          className="text-[#EF4444] hover:bg-[#FEF2F2] hover:text-[#DC2626]"
          aria-label="Remove skill"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
