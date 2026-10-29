import React, { useState, useMemo } from 'react';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { FormError } from '../auth/FormError';
import { Search, Plus, Check, Star, BookOpen, Layers } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Skill, UserSkill, SkillProficiency } from '../../types/database';

export interface AddSkillDialogProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: Skill[];
  existingUserSkills: UserSkill[];
  onAddSkill: (params: {
    skillId: string;
    direction: 'offer' | 'want';
    proficiency?: SkillProficiency;
    notes?: string;
  }) => Promise<void>;
}

const PROFICIENCIES: { id: SkillProficiency; label: string; desc: string }[] = [
  { id: 'beginner', label: 'Beginner', desc: 'Core fundamentals' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Practical experience' },
  { id: 'advanced', label: 'Advanced', desc: 'Deep mastery' },
  { id: 'expert', label: 'Expert', desc: 'Specialized authority' },
];

export const AddSkillDialog: React.FC<AddSkillDialogProps> = ({
  isOpen,
  onClose,
  catalog,
  existingUserSkills,
  onAddSkill,
}) => {
  const [direction, setDirection] = useState<'offer' | 'want'>('offer');
  const [selectedSkillId, setSelectedSkillId] = useState<string>('');
  const [proficiency, setProficiency] = useState<SkillProficiency>('intermediate');
  const [notes, setNotes] = useState('');
  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredCatalog = useMemo(() => {
    return catalog.filter((skill) => {
      const matchesSearch =
        skill.name.toLowerCase().includes(search.toLowerCase()) ||
        (skill.description && skill.description.toLowerCase().includes(search.toLowerCase()));

      // A user cannot add the same skill twice in the same direction
      const alreadyHasDirection = existingUserSkills.some(
        (us) => us.skill_id === skill.id && us.direction === direction
      );

      return matchesSearch && !alreadyHasDirection;
    });
  }, [catalog, search, direction, existingUserSkills]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkillId) {
      setError('Please select a skill from the list');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onAddSkill({
        skillId: selectedSkillId,
        direction,
        proficiency: direction === 'offer' ? proficiency : undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
      // Reset form
      setSelectedSkillId('');
      setNotes('');
      setSearch('');
    } catch (err) {
      setError((err as Error).message || 'Failed to add skill');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Add a Skill to Your Profile"
      description="Choose whether you want to teach this skill or learn it from peers."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5 pt-2">
        <FormError message={error} />

        {/* Direction Switcher */}
        <div className="flex rounded-xl bg-[#F1F5F9] p-1.5 border border-[#E2E8F0]">
          <button
            type="button"
            onClick={() => {
              setDirection('offer');
              setSelectedSkillId('');
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer',
              direction === 'offer'
                ? 'bg-white text-[#4B3F72] shadow-2xs'
                : 'text-[#64748B] hover:text-[#1F2937]'
            )}
          >
            <BookOpen className="w-4 h-4 text-[#10B981]" />
            <span>I Can Teach / Offer</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setDirection('want');
              setSelectedSkillId('');
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer',
              direction === 'want'
                ? 'bg-white text-[#4B3F72] shadow-2xs'
                : 'text-[#64748B] hover:text-[#1F2937]'
            )}
          >
            <Layers className="w-4 h-4 text-[#A78BFA]" />
            <span>I Want to Learn</span>
          </button>
        </div>

        {/* Search Catalog */}
        <div className="space-y-1.5">
          <Input
            placeholder="Search catalog skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        {/* Skill Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border rounded-xl border-[#E2E8F0]">
          {filteredCatalog.length > 0 ? (
            filteredCatalog.map((skill) => {
              const isSelected = selectedSkillId === skill.id;
              return (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => setSelectedSkillId(skill.id)}
                  className={cn(
                    'flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer',
                    isSelected
                      ? 'border-[#4B3F72] bg-[#4B3F72]/10 font-bold text-[#4B3F72]'
                      : 'border-transparent hover:bg-[#F8FAFC] text-[#1F2937]'
                  )}
                >
                  <div>
                    <span>{skill.name}</span>
                    <span className="block text-[10px] text-[#64748B] font-mono">
                      {skill.category}
                    </span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#4B3F72]" />}
                </button>
              );
            })
          ) : (
            <div className="col-span-2 p-4 text-center text-xs text-[#94A3B8]">
              No available skills found for this direction.
            </div>
          )}
        </div>

        {/* Proficiency (for offers) */}
        {direction === 'offer' && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1F2937]">Your Proficiency Level</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PROFICIENCIES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProficiency(p.id)}
                  className={cn(
                    'p-2.5 rounded-xl border text-left cursor-pointer transition-all',
                    proficiency === p.id
                      ? 'border-[#4B3F72] bg-[#4B3F72]/5 ring-1 ring-[#4B3F72]'
                      : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
                  )}
                >
                  <span className="block text-xs font-bold text-[#1F2937]">{p.label}</span>
                  <span className="block text-[10px] text-[#64748B]">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#1F2937]" htmlFor="skill-notes">
            Optional Notes
          </label>
          <Input
            id="skill-notes"
            placeholder={
              direction === 'offer'
                ? 'e.g. Can teach Figma variants, vector tools, and typography'
                : 'e.g. Focus on academic essays or research citations'
            }
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-[#F1F5F9]">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            disabled={!selectedSkillId}
            rightIcon={<Plus className="w-4 h-4" />}
          >
            Add Skill
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
