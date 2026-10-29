import React, { useState, useMemo } from 'react';
import { Search, Plus, Check, X, BookOpen, Layers, Star } from 'lucide-react';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import type { Skill, OfferedSkillInput, WantedSkillInput, SkillProficiency } from '../../types/database';

export interface SkillMultiSelectProps {
  catalog: Skill[];
  offeredSkills: OfferedSkillInput[];
  wantedSkills: WantedSkillInput[];
  onOfferedSkillsChange: (skills: OfferedSkillInput[]) => void;
  onWantedSkillsChange: (skills: WantedSkillInput[]) => void;
  error?: string;
}

const PROFICIENCY_LEVELS: { id: SkillProficiency; label: string; desc: string }[] = [
  { id: 'beginner', label: 'Beginner', desc: 'Fundamental basics' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Practical comfort' },
  { id: 'advanced', label: 'Advanced', desc: 'Thorough mastery' },
  { id: 'expert', label: 'Expert', desc: 'High specialization' },
];

export const SkillMultiSelect: React.FC<SkillMultiSelectProps> = ({
  catalog,
  offeredSkills,
  wantedSkills,
  onOfferedSkillsChange,
  onWantedSkillsChange,
  error,
}) => {
  const [activeTab, setActiveTab] = useState<'offer' | 'want'>('offer');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Currently editing skill details in offered drawer
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [editingProficiency, setEditingProficiency] = useState<SkillProficiency>('intermediate');
  const [editingNotes, setEditingNotes] = useState('');

  const categories = useMemo(() => {
    const set = new Set(catalog.map((s) => s.category));
    return ['all', ...Array.from(set)];
  }, [catalog]);

  const filteredCatalog = useMemo(() => {
    return catalog.filter((skill) => {
      const matchesSearch =
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (skill.description && skill.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [catalog, searchQuery, selectedCategory]);

  const isOffered = (skillId: string) => offeredSkills.some((s) => s.skill_id === skillId);
  const isWanted = (skillId: string) => wantedSkills.some((s) => s.skill_id === skillId);

  const handleToggleSkill = (skill: Skill) => {
    if (activeTab === 'offer') {
      if (isOffered(skill.id)) {
        onOfferedSkillsChange(offeredSkills.filter((s) => s.skill_id !== skill.id));
      } else {
        // Open proficiency selector
        setEditingSkillId(skill.id);
        setEditingProficiency('intermediate');
        setEditingNotes('');
      }
    } else {
      if (isWanted(skill.id)) {
        onWantedSkillsChange(wantedSkills.filter((s) => s.skill_id !== skill.id));
      } else {
        onWantedSkillsChange([...wantedSkills, { skill_id: skill.id, notes: '' }]);
      }
    }
  };

  const handleSaveOfferedSkill = () => {
    if (!editingSkillId) return;
    const existingIndex = offeredSkills.findIndex((s) => s.skill_id === editingSkillId);
    const newEntry: OfferedSkillInput = {
      skill_id: editingSkillId,
      proficiency: editingProficiency,
      notes: editingNotes.trim() || undefined,
    };

    if (existingIndex >= 0) {
      const updated = [...offeredSkills];
      updated[existingIndex] = newEntry;
      onOfferedSkillsChange(updated);
    } else {
      onOfferedSkillsChange([...offeredSkills, newEntry]);
    }
    setEditingSkillId(null);
  };

  const removeOfferedSkill = (skillId: string) => {
    onOfferedSkillsChange(offeredSkills.filter((s) => s.skill_id !== skillId));
  };

  const removeWantedSkill = (skillId: string) => {
    onWantedSkillsChange(wantedSkills.filter((s) => s.skill_id !== skillId));
  };

  const getSkillName = (id: string) => catalog.find((s) => s.id === id)?.name || 'Unknown Skill';

  return (
    <div className="space-y-6">
      {/* Direction Segmented Tabs */}
      <div className="flex rounded-xl bg-[#F1F5F9] p-1.5 border border-[#E2E8F0]">
        <button
          type="button"
          onClick={() => setActiveTab('offer')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
            activeTab === 'offer'
              ? 'bg-white text-[#4B3F72] shadow-xs'
              : 'text-[#64748B] hover:text-[#1F2937]'
          )}
        >
          <BookOpen className="w-4 h-4 text-[#10B981]" />
          <span>Skills I Can Teach / Offer ({offeredSkills.length})</span>
          {offeredSkills.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('want')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
            activeTab === 'want'
              ? 'bg-white text-[#4B3F72] shadow-xs'
              : 'text-[#64748B] hover:text-[#1F2937]'
          )}
        >
          <Layers className="w-4 h-4 text-[#A78BFA]" />
          <span>Skills I Want to Learn ({wantedSkills.length})</span>
          {wantedSkills.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-[#A78BFA]" />
          )}
        </button>
      </div>

      {/* Active Selection Summary Chips */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-[#1F2937]">
          <span>
            {activeTab === 'offer' ? 'Your Selected Offerings:' : 'Your Selected Learning Goals:'}
          </span>
          <span className="text-[#64748B] text-[11px]">
            {activeTab === 'offer'
              ? `${offeredSkills.length} selected (Min: 1)`
              : `${wantedSkills.length} selected (Min: 1)`}
          </span>
        </div>

        {activeTab === 'offer' ? (
          offeredSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              {offeredSkills.map((item) => (
                <div
                  key={item.skill_id}
                  className="flex items-center gap-2 rounded-lg bg-white border border-[#CBD5E1] px-3 py-1.5 text-xs shadow-2xs"
                >
                  <span className="font-bold text-[#1F2937]">{getSkillName(item.skill_id)}</span>
                  <span className="text-[10px] uppercase font-bold text-[#4B3F72] bg-[#E0E7FF] px-1.5 py-0.2 rounded">
                    {item.proficiency}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeOfferedSkill(item.skill_id)}
                    className="text-[#94A3B8] hover:text-[#EF4444] transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#94A3B8] italic p-3 rounded-xl border border-dashed border-[#CBD5E1]">
              No offered skills selected yet. Select from the catalog below.
            </p>
          )
        ) : (
          wantedSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              {wantedSkills.map((item) => (
                <div
                  key={item.skill_id}
                  className="flex items-center gap-2 rounded-lg bg-white border border-[#CBD5E1] px-3 py-1.5 text-xs shadow-2xs"
                >
                  <span className="font-bold text-[#1F2937]">{getSkillName(item.skill_id)}</span>
                  <button
                    type="button"
                    onClick={() => removeWantedSkill(item.skill_id)}
                    className="text-[#94A3B8] hover:text-[#EF4444] transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#94A3B8] italic p-3 rounded-xl border border-dashed border-[#CBD5E1]">
              No wanted skills selected yet. Select what you would love to learn.
            </p>
          )
        )}
      </div>

      {/* Catalog Search & Category Filter */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search catalog (e.g. Graphic Design, Programming, English)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'text-[11px] font-semibold px-2.5 py-1 rounded-md whitespace-nowrap transition-colors cursor-pointer',
                selectedCategory === cat
                  ? 'bg-[#4B3F72] text-white shadow-2xs'
                  : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
              )}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1">
        {filteredCatalog.map((skill) => {
          const selected = activeTab === 'offer' ? isOffered(skill.id) : isWanted(skill.id);
          return (
            <button
              key={skill.id}
              type="button"
              onClick={() => handleToggleSkill(skill)}
              className={cn(
                'flex items-start justify-between p-3 rounded-xl border text-left transition-all cursor-pointer',
                selected
                  ? activeTab === 'offer'
                    ? 'border-[#10B981] bg-[#A7F3D0]/20'
                    : 'border-[#A78BFA] bg-[#A78BFA]/15'
                  : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
              )}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#1F2937]">{skill.name}</span>
                  <span className="text-[10px] text-[#64748B] font-mono">· {skill.category}</span>
                </div>
                {skill.description && (
                  <p className="text-[11px] text-[#64748B] line-clamp-1">{skill.description}</p>
                )}
              </div>

              <div
                className={cn(
                  'flex items-center justify-center w-6 h-6 rounded-full shrink-0 border ml-2',
                  selected
                    ? activeTab === 'offer'
                      ? 'bg-[#10B981] text-white border-[#10B981]'
                      : 'bg-[#4B3F72] text-white border-[#4B3F72]'
                    : 'border-[#CBD5E1] text-[#94A3B8]'
                )}
              >
                {selected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Proficiency & Notes Drawer for Offered Skill */}
      {editingSkillId && (
        <div className="p-4 rounded-2xl bg-[#F8FAFC] border-2 border-[#4B3F72] space-y-3 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#1F2937] flex items-center gap-1.5">
              <Star className="w-4 h-4 text-[#4B3F72]" />
              Set Proficiency for: <span className="text-[#4B3F72]">{getSkillName(editingSkillId)}</span>
            </h4>
            <button
              type="button"
              onClick={() => setEditingSkillId(null)}
              className="text-[#94A3B8] hover:text-[#1F2937]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PROFICIENCY_LEVELS.map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setEditingProficiency(lvl.id)}
                className={cn(
                  'p-2.5 rounded-xl border text-left transition-all cursor-pointer',
                  editingProficiency === lvl.id
                    ? 'border-[#4B3F72] bg-white ring-1 ring-[#4B3F72] shadow-xs'
                    : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
                )}
              >
                <span className="block text-xs font-bold text-[#1F2937]">{lvl.label}</span>
                <span className="block text-[10px] text-[#64748B]">{lvl.desc}</span>
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#1F2937]">Optional Notes for Learners</label>
            <input
              type="text"
              placeholder="e.g. Focus on Figma design systems, vectors, or Adobe Illustrator"
              value={editingNotes}
              onChange={(e) => setEditingNotes(e.target.value)}
              className="w-full text-xs rounded-xl border border-[#E2E8F0] bg-white px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#4B3F72]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setEditingSkillId(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSaveOfferedSkill}
            >
              Add to Offered Skills
            </Button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-[#EF4444] font-medium">{error}</p>}
    </div>
  );
};
