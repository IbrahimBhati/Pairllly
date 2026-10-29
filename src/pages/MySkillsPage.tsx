import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { SkillItem } from '../components/skills/SkillItem';
import { AddSkillDialog } from '../components/skills/AddSkillDialog';
import { RemoveSkillDialog } from '../components/skills/RemoveSkillDialog';
import { Dialog } from '../components/ui/Dialog';
import { Input } from '../components/ui/Input';
import { FormError } from '../components/auth/FormError';
import { SkillsService } from '../lib/services/skillsService';
import { useAuth } from '../context/AuthContext';
import { Plus, BookOpen, Layers, Sparkles } from 'lucide-react';
import type { UserSkill, Skill, SkillProficiency } from '../types/database';

export interface MySkillsPageProps {
  onNavigate: (path: string) => void;
}

const PROFICIENCIES: { id: SkillProficiency; label: string; desc: string }[] = [
  { id: 'beginner', label: 'Beginner', desc: 'Core fundamentals' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Practical experience' },
  { id: 'advanced', label: 'Advanced', desc: 'Deep mastery' },
  { id: 'expert', label: 'Expert', desc: 'Specialized authority' },
];

export const MySkillsPage: React.FC<MySkillsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [catalog, setCatalog] = useState<Skill[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialogs
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [skillToRemove, setSkillToRemove] = useState<UserSkill | null>(null);

  // Edit Proficiency Dialog
  const [skillToEdit, setSkillToEdit] = useState<UserSkill | null>(null);
  const [editProficiencyVal, setEditProficiencyVal] = useState<SkillProficiency>('intermediate');
  const [editNotesVal, setEditNotesVal] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [cat, skills] = await Promise.all([
        SkillsService.getCatalog(),
        SkillsService.getUserSkills(user.id),
      ]);
      setCatalog(cat);
      setUserSkills(skills);
    } catch (err) {
      console.error('Error loading skills data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const offeredSkills = userSkills.filter((s) => s.direction === 'offer');
  const wantedSkills = userSkills.filter((s) => s.direction === 'want');

  const handleAddSkill = async (params: {
    skillId: string;
    direction: 'offer' | 'want';
    proficiency?: SkillProficiency;
    notes?: string;
  }) => {
    if (!user) return;
    await SkillsService.addSkill({
      userId: user.id,
      ...params,
    });
    await loadData();
  };

  const handleRemoveConfirm = async (userSkillId: string) => {
    if (!user) return;
    await SkillsService.removeSkill(userSkillId, user.id);
    await loadData();
  };

  const handleOpenEditProficiency = (usk: UserSkill) => {
    setSkillToEdit(usk);
    setEditProficiencyVal(usk.proficiency || 'intermediate');
    setEditNotesVal(usk.notes || '');
    setUpdateError(null);
  };

  const handleSaveProficiency = async () => {
    if (!skillToEdit) return;
    setIsUpdating(true);
    setUpdateError(null);
    try {
      await SkillsService.updateSkill({
        userSkillId: skillToEdit.id,
        proficiency: editProficiencyVal,
        notes: editNotesVal.trim() || undefined,
      });
      setSkillToEdit(null);
      await loadData();
    } catch (err) {
      setUpdateError((err as Error).message || 'Failed to update skill proficiency');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <PageHeader
        title="My Skills"
        description="Manage the skills you offer to teach and the skills you want to learn. Your listings and reciprocal matching are calculated directly from this inventory."
        action={
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsAddOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Skill
          </Button>
        }
        breadcrumbs={[
          { label: 'Dashboard', onClick: () => onNavigate('/dashboard') },
          { label: 'My Skills' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Offered Skills Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#A7F3D0]/60 text-[#064E3B] flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-[#1F2937]">Skills I Can Teach (Offers)</h2>
            </div>
            <span className="text-xs font-bold text-[#064E3B] bg-[#A7F3D0]/60 px-2 py-0.5 rounded-md">
              {offeredSkills.length} Total
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <div className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
              <div className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
            </div>
          ) : offeredSkills.length > 0 ? (
            <div className="space-y-3">
              {offeredSkills.map((usk) => (
                <SkillItem
                  key={usk.id}
                  userSkill={usk}
                  onEditProficiency={handleOpenEditProficiency}
                  onRemove={(s) => setSkillToRemove(s)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#CBD5E1] p-8 text-center text-xs text-[#64748B] bg-white">
              <p>You have not added any skills you can teach yet.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddOpen(true)}
                className="mt-3"
              >
                Add Your First Offering
              </Button>
            </div>
          )}
        </div>

        {/* Wanted Skills Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#E0E7FF] text-[#4B3F72] flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-[#1F2937]">Skills I Want to Learn (Requests)</h2>
            </div>
            <span className="text-xs font-bold text-[#4B3F72] bg-[#E0E7FF] px-2 py-0.5 rounded-md">
              {wantedSkills.length} Total
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <div className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
              <div className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
            </div>
          ) : wantedSkills.length > 0 ? (
            <div className="space-y-3">
              {wantedSkills.map((usk) => (
                <SkillItem
                  key={usk.id}
                  userSkill={usk}
                  onRemove={(s) => setSkillToRemove(s)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#CBD5E1] p-8 text-center text-xs text-[#64748B] bg-white">
              <p>You have not listed any learning goals yet.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddOpen(true)}
                className="mt-3"
              >
                Add What You Want to Learn
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add Skill Dialog */}
      <AddSkillDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        catalog={catalog}
        existingUserSkills={userSkills}
        onAddSkill={handleAddSkill}
      />

      {/* Remove Skill Dialog with Listing Dependency Enforcement */}
      <RemoveSkillDialog
        isOpen={Boolean(skillToRemove)}
        onClose={() => setSkillToRemove(null)}
        userSkill={skillToRemove}
        onConfirmRemove={handleRemoveConfirm}
        onNavigateToListings={() => onNavigate('/my-listings')}
      />

      {/* Edit Proficiency Dialog */}
      <Dialog
        isOpen={Boolean(skillToEdit)}
        onClose={() => setSkillToEdit(null)}
        title="Update Skill Proficiency & Notes"
        description={`Adjust your declared proficiency and guidance notes for ${skillToEdit?.skill?.name}.`}
      >
        <div className="space-y-4 pt-2">
          <FormError message={updateError} />

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1F2937]">Proficiency Level</label>
            <div className="grid grid-cols-2 gap-2">
              {PROFICIENCIES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setEditProficiencyVal(p.id)}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    editProficiencyVal === p.id
                      ? 'border-[#4B3F72] bg-[#4B3F72]/5 ring-1 ring-[#4B3F72]'
                      : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
                  }`}
                >
                  <span className="block text-xs font-bold text-[#1F2937]">{p.label}</span>
                  <span className="block text-[10px] text-[#64748B]">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1F2937]" htmlFor="edit-skill-notes">
              Teaching Notes
            </label>
            <Input
              id="edit-skill-notes"
              value={editNotesVal}
              onChange={(e) => setEditNotesVal(e.target.value)}
              placeholder="e.g. Focus on practical projects and code architecture"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#F1F5F9]">
            <Button
              variant="outline"
              size="md"
              onClick={() => setSkillToEdit(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSaveProficiency}
              isLoading={isUpdating}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
